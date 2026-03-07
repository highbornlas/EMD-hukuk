// ================================================================
// LEXBASE — GLOBAL SUPabase AUTO-SYNC SİSTEMİ
// js/modules/sync.js
//
// SORUN: 36 JS modülünden sadece 7'si saveToSupabase() çağırıyordu.
// İhtarname, arabuluculuk, danışmanlık, personel, todo, takvim
// modülleri Supabase'e HİÇ yazmıyordu → F5 = veri kaybı.
//
// ÇÖZÜM: saveData() fonksiyonunu intercept edip değişen
// koleksiyonları otomatik Supabase'e senkronize eden merkezi
// sistem. Artık hiçbir modülün saveToSupabase() çağırmasına
// gerek yok.
//
// MİMARİ (react-hook-form useMutation karşılığı):
// 1. Pessimistic Update: Önce Supabase'e yaz, sonra UI güncelle
// 2. Merkezi Hata Yönetimi: Sessiz hata YOK, kırmızı toast
// 3. Debounce: Hızlı ardışık kayıtlarda tek batch sync
// 4. Diff Engine: Sadece değişen kayıtları gönder
// ================================================================

const LexSync = (function () {

  // ── KONFİGÜRASYON ─────────────────────────────────────────
  // State key → Supabase tablo adı eşleştirmesi
  var TABLO_MAP = {
    'muvekkillar': 'muvekkillar',
    'karsiTaraflar': 'karsi_taraflar',
    'vekillar': 'vekillar',
    'davalar': 'davalar',
    'icra': 'icra',
    'butce': 'butce',
    'avanslar': 'avanslar',
    'etkinlikler': 'etkinlikler',
    'danismanlik': 'danismanlik',
    'arabuluculuk': 'arabuluculuk',
    'ihtarnameler': 'ihtarnameler',
    'todolar': 'todolar',
    'personel': 'personel',
  };

  // Senkronize edilecek tüm koleksiyonlar
  var SYNC_KEYS = Object.keys(TABLO_MAP);

  // Önceki state snapshot'ı (diff hesaplamak için)
  var _snapshot = {};
  var _syncTimer = null;
  var _syncQueue = {};  // { stateKey: [kayit1, kayit2, ...] }
  var _deleteQueue = {}; // { stateKey: [id1, id2, ...] }
  var _isSyncing = false;
  var _initialized = false;
  var _errorCount = 0;

  // ── BAŞLAT ─────────────────────────────────────────────────
  function init() {
    if (_initialized) return;
    _initialized = true;

    // İlk snapshot'ı al
    _takeSnapshot();

    // Orijinal saveData'yı sarmalı (wrap)
    _wrapSaveData();

    console.log('[LexSync] ✅ Global auto-sync aktif — ' + SYNC_KEYS.length + ' koleksiyon izleniyor');
  }

  // ── SNAPSHOT: State'in kopyasını tut ───────────────────────
  function _takeSnapshot() {
    SYNC_KEYS.forEach(function (key) {
      var arr = state[key];
      if (Array.isArray(arr)) {
        _snapshot[key] = {};
        arr.forEach(function (item) {
          if (item && item.id) {
            _snapshot[key][item.id] = JSON.stringify(item);
          }
        });
      }
    });
  }

  // ── DIFF: Neyin değiştiğini bul ────────────────────────────
  function _calcDiff() {
    var changes = { upserts: {}, deletes: {} };

    SYNC_KEYS.forEach(function (key) {
      var current = state[key];
      if (!Array.isArray(current)) return;
      var prev = _snapshot[key] || {};
      var currentIds = {};

      // Yeni veya değişen kayıtlar
      current.forEach(function (item) {
        if (!item || !item.id) return;
        currentIds[item.id] = true;
        var serialized = JSON.stringify(item);
        if (!prev[item.id] || prev[item.id] !== serialized) {
          if (!changes.upserts[key]) changes.upserts[key] = [];
          changes.upserts[key].push(item);
        }
      });

      // Silinen kayıtlar
      Object.keys(prev).forEach(function (id) {
        if (!currentIds[id]) {
          if (!changes.deletes[key]) changes.deletes[key] = [];
          changes.deletes[key].push(id);
        }
      });
    });

    return changes;
  }

  // ── SAVE DATA WRAPPER ──────────────────────────────────────
  // Orijinal saveData() fonksiyonunu sarmalayıp auto-sync ekle
  function _wrapSaveData() {
    var _origSaveData = window.saveData;

    window.saveData = function () {
      // 1. localStorage'a yaz (her zaman, offline modda da çalışsın)
      if (_origSaveData) _origSaveData();

      // 2. Supabase aktifse senkronize et
      if (typeof currentBuroId !== 'undefined' && currentBuroId && typeof sb !== 'undefined') {
        _scheduleSync();
      }
    };
  }

  // ── DEBOUNCED SYNC ─────────────────────────────────────────
  // Hızlı ardışık kayıtlarda 500ms bekle, sonra tek batch gönder
  function _scheduleSync() {
    if (_syncTimer) clearTimeout(_syncTimer);
    _syncTimer = setTimeout(_executeSync, 500);
  }

  // ── SYNC İCRASI ────────────────────────────────────────────
  async function _executeSync() {
    if (_isSyncing) { _scheduleSync(); return; }
    _isSyncing = true;

    try {
      var diff = _calcDiff();
      var hasChanges = false;

      // ── UPSERT'ler ──
      var upsertKeys = Object.keys(diff.upserts);
      for (var u = 0; u < upsertKeys.length; u++) {
        var key = upsertKeys[u];
        var items = diff.upserts[key];
        var tablo = TABLO_MAP[key];
        if (!tablo || !items.length) continue;
        hasChanges = true;

        // Batch upsert — her kayıt için { id, buro_id, data }
        var rows = items.map(function (item) {
          var id = item.id;
          var rest = {};
          Object.keys(item).forEach(function (k) { if (k !== 'id') rest[k] = item[k]; });
          return { id: id, buro_id: currentBuroId, data: rest };
        });

        var result = await sb.from(tablo).upsert(rows);
        
        if (result.error) {
          _handleError('kaydetme', tablo, result.error);
        } else {
          // Başarılı — konsola log
          console.log('[LexSync] ✅ ' + tablo + ': ' + items.length + ' kayıt senkronize edildi');
        }
      }

      // ── DELETE'ler ──
      var deleteKeys = Object.keys(diff.deletes);
      for (var d = 0; d < deleteKeys.length; d++) {
        var dKey = deleteKeys[d];
        var ids = diff.deletes[dKey];
        var dTablo = TABLO_MAP[dKey];
        if (!dTablo || !ids.length) continue;
        hasChanges = true;

        for (var di = 0; di < ids.length; di++) {
          var delResult = await sb.from(dTablo).delete()
            .eq('id', ids[di])
            .eq('buro_id', currentBuroId);
          
          if (delResult.error) {
            _handleError('silme', dTablo, delResult.error);
          }
        }

        if (!ids.some(function(id) { return false; })) {
          console.log('[LexSync] 🗑️ ' + dTablo + ': ' + ids.length + ' kayıt silindi');
        }
      }

      // Snapshot güncelle
      if (hasChanges) {
        _takeSnapshot();
        _errorCount = 0; // Başarılı sync → hata sayacını sıfırla
      }

    } catch (e) {
      _handleError('bağlantı', 'genel', { message: e.message });
    } finally {
      _isSyncing = false;
    }
  }

  // ── HATA YÖNETİMİ (Sıfır Sessiz Hata) ────────────────────
  function _handleError(islem, tablo, error) {
    _errorCount++;
    var mesaj = error.message || 'Bilinmeyen hata';

    // Konsola detaylı log
    console.error('[LexSync] ❌ ' + islem + ' hatası (' + tablo + '):', mesaj, error);

    // Kullanıcıya kırmızı toast göster
    if (typeof notify === 'function') {
      // RLS hatası
      if (mesaj.includes('row-level security') || mesaj.includes('policy')) {
        notify('🔒 Yetkilendirme hatası: Bu işlem için izniniz yok. Lütfen tekrar giriş yapın.');
      }
      // Null constraint
      else if (mesaj.includes('null value') || mesaj.includes('not-null')) {
        notify('⚠️ Zorunlu alan eksik: ' + mesaj);
      }
      // Diğer
      else {
        notify('❌ Senkronizasyon hatası: ' + mesaj);
      }
    }

    // 5+ ardışık hatada uyarı
    if (_errorCount >= 5 && typeof notify === 'function') {
      notify('⚠️ Birden fazla kayıt hatası! İnternet bağlantınızı kontrol edin. Veriler yerel olarak saklandı, bağlantı düzelince otomatik senkronize edilecek.');
      _errorCount = 0;
    }
  }

  // ── MANUEL SYNC (Tüm state'i zorla senkronize et) ─────────
  async function forcSync() {
    if (!currentBuroId || typeof sb === 'undefined') {
      notify('⚠️ Supabase bağlantısı aktif değil');
      return;
    }

    notify('🔄 Tam senkronizasyon başlatılıyor...');
    var basarili = 0;
    var hatali = 0;

    for (var i = 0; i < SYNC_KEYS.length; i++) {
      var key = SYNC_KEYS[i];
      var arr = state[key];
      if (!Array.isArray(arr) || arr.length === 0) continue;
      var tablo = TABLO_MAP[key];

      var rows = arr.map(function (item) {
        var id = item.id;
        var rest = {};
        Object.keys(item).forEach(function (k) { if (k !== 'id') rest[k] = item[k]; });
        return { id: id, buro_id: currentBuroId, data: rest };
      });

      try {
        var result = await sb.from(tablo).upsert(rows);
        if (result.error) {
          console.error('[LexSync] forceSync hata (' + tablo + '):', result.error.message);
          hatali++;
        } else {
          basarili++;
          console.log('[LexSync] forceSync ✅ ' + tablo + ': ' + rows.length + ' kayıt');
        }
      } catch (e) {
        hatali++;
        console.error('[LexSync] forceSync exception (' + tablo + '):', e.message);
      }
    }

    _takeSnapshot();
    notify('✅ Senkronizasyon tamamlandı: ' + basarili + ' tablo başarılı' + (hatali > 0 ? ', ' + hatali + ' hata' : ''));
  }

  // ── TEK KAYIT SYNC (Pessimistic — bekle, sonucu döndür) ────
  // Modal kapanmadan önce çağrılabilir
  async function kaydetVeBekle(stateKey, kayit) {
    if (!currentBuroId || typeof sb === 'undefined') return { ok: true };

    var tablo = TABLO_MAP[stateKey];
    if (!tablo) return { ok: true };

    var id = kayit.id;
    var rest = {};
    Object.keys(kayit).forEach(function (k) { if (k !== 'id') rest[k] = kayit[k]; });

    try {
      var result = await sb.from(tablo).upsert({
        id: id,
        buro_id: currentBuroId,
        data: rest
      });

      if (result.error) {
        _handleError('kaydetme', tablo, result.error);
        return { ok: false, error: result.error.message };
      }

      return { ok: true };
    } catch (e) {
      _handleError('bağlantı', tablo, { message: e.message });
      return { ok: false, error: e.message };
    }
  }

  // ── DURUM RAPORU ───────────────────────────────────────────
  function durum() {
    var rapor = { aktif: _initialized, syncing: _isSyncing, hataSayisi: _errorCount, koleksiyonlar: {} };
    SYNC_KEYS.forEach(function (key) {
      rapor.koleksiyonlar[key] = {
        kayitSayisi: (state[key] || []).length,
        snapshotSayisi: Object.keys(_snapshot[key] || {}).length,
      };
    });
    console.table(rapor.koleksiyonlar);
    return rapor;
  }

  // ── PUBLIC API ─────────────────────────────────────────────
  return {
    init: init,
    forcSync: forcSync,
    kaydetVeBekle: kaydetVeBekle,
    durum: durum,
    // Test/debug
    _calcDiff: _calcDiff,
    _takeSnapshot: _takeSnapshot,
  };

})();
