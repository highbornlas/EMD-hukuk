// ================================================================
// LEXBASE — TANILANMA ARACI
// js/modules/tani.js
//
// Ayarlar sayfasındaki "🔧 Tanılama Çalıştır" butonuyla çalışır.
// Tüm kritik fonksiyonları, DOM elementlerini ve event handler'ları
// test eder, sonucu ekranda gösterir.
// ================================================================

function tanilama() {
  const sonuclar = [];
  let hataSayisi = 0;

  function test(ad, fn) {
    try {
      const sonuc = fn();
      if (sonuc === true) {
        sonuclar.push({ ad, durum: '✅', detay: 'OK' });
      } else if (sonuc === false) {
        sonuclar.push({ ad, durum: '❌', detay: 'BAŞARISIZ' });
        hataSayisi++;
      } else {
        sonuclar.push({ ad, durum: '✅', detay: String(sonuc) });
      }
    } catch (e) {
      sonuclar.push({ ad, durum: '💥', detay: e.message });
      hataSayisi++;
    }
  }

  // ── 1. Kritik Global Değişkenler ────────────────────────────
  test('state tanımlı mı', () => typeof state !== 'undefined');
  test('state.muvekkillar dizi mi', () => Array.isArray(state?.muvekkillar));
  test('state.davalar dizi mi', () => Array.isArray(state?.davalar));
  test('currentUser tanımlı mı', () => typeof currentUser !== 'undefined' ? (currentUser ? 'Var: ' + (currentUser.ad_soyad || currentUser.ad || '?') : 'null') : false);
  test('currentBuroId', () => typeof currentBuroId !== 'undefined' ? (currentBuroId || 'null (localStorage modu)') : false);
  test('SK (storage key)', () => typeof SK !== 'undefined' ? SK : false);
  test('sb (Supabase client)', () => typeof sb !== 'undefined');

  // ── 2. Kritik Fonksiyonlar ──────────────────────────────────
  const fonksiyonlar = [
    'openModal', 'closeModal', 'openYeniVek', 'openYeniKT',
    'muvBankaEkle', 'renderMuvBankalar', 'renderMuvBankalarBW',
    'saveMuvekkil', 'saveDava', 'saveVekil', 'saveKarsiTaraf',
    'renderDavalar', 'renderIcra', 'renderMuvekkillar',
    'renderDanismanlik', 'renderArabuluculuk', 'renderButce',
    'renderDashboard', 'renderCalendar',
    'populateMuvSelects', 'populateIlSelect',
    'formatTcInput', 'formatVergiInput', 'formatIbanInput',
    'addLog', 'saveData', 'loadData', 'uid', 'notify',
    'openBelgeModal', 'openDavaDetay', 'openIcraDetay',
    'deleteDavaById', 'deleteMuvekkil',
    'escHTML', 'onayDialog', // yeni güvenlik fonksiyonları
    'toggleSidebar', 'Bildirim', // yeni özellikler
  ];

  fonksiyonlar.forEach(fn => {
    test(`fn: ${fn}()`, () => {
      const val = window[fn];
      if (typeof val === 'function') return 'function';
      if (typeof val === 'object' && val !== null) return 'object';
      return false;
    });
  });

  // ── 3. Kritik DOM Elementleri ───────────────────────────────
  const elementler = [
    'm-modal', 'vek-modal', 'kt-modal', 'dav-modal', 'icra-modal',
    'avans-modal', 'tak-modal', 'dan-modal', 'but-modal',
    'ihtar-modal', 'arab-modal', 'personel-modal', 'todo-modal',
    'm-banka-list', 'app-wrapper', 'landing-screen',
    'header-user-ad', 'notif', 'plan-badge',
  ];

  elementler.forEach(id => {
    test(`DOM: #${id}`, () => {
      const el = document.getElementById(id);
      if (!el) return false;
      const style = window.getComputedStyle(el);
      return `${el.tagName} display:${style.display} visible:${style.visibility}`;
    });
  });

  // ── 4. Modal Açma Testi ─────────────────────────────────────
  test('Modal açma testi (vek-modal)', () => {
    const overlay = document.getElementById('vek-modal');
    if (!overlay) return false;
    const beforeClass = overlay.className;
    overlay.classList.add('open');
    const style = window.getComputedStyle(overlay);
    const gorunur = style.display !== 'none';
    overlay.classList.remove('open'); // geri al
    return gorunur ? 'display:flex ✓' : 'display:' + style.display + ' ✗';
  });

  test('Modal açma testi (m-modal)', () => {
    const overlay = document.getElementById('m-modal');
    if (!overlay) return false;
    overlay.classList.add('open');
    const style = window.getComputedStyle(overlay);
    const gorunur = style.display !== 'none';
    overlay.classList.remove('open');
    return gorunur ? 'display:flex ✓' : 'display:' + style.display + ' ✗';
  });

  // ── 5. Event Handler Testi ──────────────────────────────────
  test('muvBankaEkle çalışıyor mu', () => {
    if (typeof muvBankaEkle !== 'function') return false;
    const onceki = (typeof muvBankalar !== 'undefined') ? muvBankalar.length : -1;
    try {
      muvBankaEkle({ banka: 'TEST', sube: '', iban: '', hesapNo: '', hesapAd: '' });
      const sonraki = muvBankalar.length;
      // Temizle
      muvBankalar.pop();
      if (typeof renderMuvBankalar === 'function') renderMuvBankalar();
      if (typeof renderMuvBankalarBW === 'function') renderMuvBankalarBW();
      return `Eklendi: ${onceki} → ${sonraki}`;
    } catch (e) {
      return false;
    }
  });

  // ── 6. CSS Yükleme Kontrolü ─────────────────────────────────
  test('style.css yüklendi mi', () => {
    const sheets = document.styleSheets;
    for (let i = 0; i < sheets.length; i++) {
      try {
        if (sheets[i].href && sheets[i].href.includes('style.css')) {
          return `${sheets[i].cssRules.length} kural`;
        }
      } catch (e) { }
    }
    return false;
  });

  // ── 7. BANKA_LISTESI (bankData.js) ──────────────────────────
  test('BANKA_LISTESI tanımlı mı', () => {
    if (typeof BANKA_LISTESI === 'undefined') return false;
    return `${BANKA_LISTESI.length} banka`;
  });

  // ── 8. Supabase Bağlantı ───────────────────────────────────
  test('Supabase URL', () => typeof SUPABASE_URL !== 'undefined' ? SUPABASE_URL : false);

  // ── 9. Script Yükleme Sırası ───────────────────────────────
  test('Script sayısı', () => {
    const scripts = document.querySelectorAll('script[src*="modules"]');
    return `${scripts.length} modül yüklendi`;
  });

  // ── 10. localStorage ───────────────────────────────────────
  test('localStorage erişimi', () => {
    try {
      const data = localStorage.getItem(SK || 'hukuk_buro_v3');
      return data ? `${(data.length / 1024).toFixed(0)} KB veri` : 'Boş';
    } catch (e) {
      return false;
    }
  });

  // ── Sonuç Göster ───────────────────────────────────────────
  const modal = document.createElement('div');
  modal.className = 'modal-overlay open';
  modal.style.cssText = 'z-index:99999';
  modal.innerHTML = `
    <div class="modal" style="max-width:700px;max-height:85vh;overflow-y:auto">
      <div class="modal-header">
        <div class="modal-title">🔧 Tanılama Sonuçları</div>
        <button class="modal-x-btn" onclick="this.closest('.modal-overlay').remove()">✕</button>
      </div>
      <div class="modal-body" style="padding:16px">
        <div style="background:${hataSayisi > 0 ? 'var(--red-dim)' : 'var(--green-dim)'};border:1px solid ${hataSayisi > 0 ? 'var(--red)' : 'var(--green)'};border-radius:8px;padding:12px 16px;margin-bottom:16px;font-size:13px;font-weight:600;color:${hataSayisi > 0 ? 'var(--red)' : 'var(--green)'}">
          ${hataSayisi > 0 ? `❌ ${hataSayisi} sorun bulundu!` : '✅ Tüm testler başarılı'}
        </div>
        <table style="width:100%;font-size:12px">
          <thead><tr><th>Test</th><th style="width:40px">Durum</th><th>Detay</th></tr></thead>
          <tbody>
            ${sonuclar.map(s => `<tr style="${s.durum !== '✅' ? 'background:rgba(231,76,60,.08)' : ''}">
              <td style="font-weight:600">${s.ad}</td>
              <td style="text-align:center;font-size:14px">${s.durum}</td>
              <td style="color:var(--text-muted);font-size:11px;word-break:break-all">${s.detay}</td>
            </tr>`).join('')}
          </tbody>
        </table>
        <div style="margin-top:16px;padding:12px;background:var(--surface2);border-radius:8px;font-size:11px;color:var(--text-muted)">
          💡 <strong>Bu sonucu geliştiriciye gönderin.</strong> Ekran görüntüsü alıp paylaşabilirsiniz.
          <br><br>
          Tarayıcı: ${navigator.userAgent.slice(0, 80)}
          <br>Tarih: ${new Date().toLocaleString('tr-TR')}
          <br>URL: ${location.href}
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

// Ctrl+Shift+D ile tanılama çalıştır (herhangi sayfada)
document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.shiftKey && e.key === 'D') {
    e.preventDefault();
    tanilama();
  }
});
