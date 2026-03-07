// ================================================================
// LEXBASE — EVENT BUS
// js/modules/eventbus.js
//
// Merkezi olay sistemi — modüller arası bağımlılığı kaldırır.
// State değiştiğinde ilgili tüm UI bileşenleri otomatik güncellenir.
//
// Kullanım:
//   LBEvents.on('davalar:changed', renderDavalar);
//   LBEvents.emit('davalar:changed', { id: 'dav01' });
//   LBEvents.off('davalar:changed', renderDavalar);
// ================================================================

const LBEvents = (function() {
  const _listeners = {};

  return {
    /**
     * Bir olaya abone ol
     * @param {string} event - Olay adı (örn: 'davalar:changed')
     * @param {Function} callback - Çağrılacak fonksiyon
     * @param {object} [opts] - { once: true } ile tek seferlik dinleme
     */
    on(event, callback, opts = {}) {
      if (!_listeners[event]) _listeners[event] = [];
      _listeners[event].push({ fn: callback, once: !!opts.once });
    },

    /**
     * Tek seferlik abone ol
     */
    once(event, callback) {
      this.on(event, callback, { once: true });
    },

    /**
     * Aboneliği iptal et
     */
    off(event, callback) {
      if (!_listeners[event]) return;
      _listeners[event] = _listeners[event].filter(l => l.fn !== callback);
    },

    /**
     * Olay tetikle — tüm aboneleri çağırır
     * @param {string} event - Olay adı
     * @param {*} data - İsteğe bağlı veri
     */
    emit(event, data) {
      if (!_listeners[event]) return;
      _listeners[event] = _listeners[event].filter(l => {
        try {
          l.fn(data);
        } catch (e) {
          console.error(`[LBEvents] ${event} handler hatası:`, e);
        }
        return !l.once;
      });
    },

    /**
     * Tüm abonelikleri temizle (test amaçlı)
     */
    clear() {
      Object.keys(_listeners).forEach(k => delete _listeners[k]);
    },

    /**
     * Debug: aktif dinleyicileri listele
     */
    debug() {
      const info = {};
      Object.entries(_listeners).forEach(([k, v]) => {
        info[k] = v.length;
      });
      console.table(info);
    }
  };
})();

// ================================================================
// STATE WRAPPER — Değişikliklerde otomatik event tetikler
// ================================================================

/**
 * State'e veri ekle ve ilgili olayları tetikle.
 * Doğrudan state.davalar.push() yerine bunu kullanın.
 * 
 * @param {string} koleksiyon - State koleksiyonu adı (örn: 'davalar')
 * @param {object} kayit - Eklenecek kayıt
 */
function stateEkle(koleksiyon, kayit) {
  if (!state[koleksiyon]) state[koleksiyon] = [];
  state[koleksiyon].push(kayit);
  saveData();
  LBEvents.emit(koleksiyon + ':changed', { action: 'add', id: kayit.id });
  LBEvents.emit('state:changed', { koleksiyon, action: 'add' });
}

/**
 * State'den veri sil ve ilgili olayları tetikle.
 */
function stateSil(koleksiyon, id) {
  if (!state[koleksiyon]) return;
  state[koleksiyon] = state[koleksiyon].filter(x => x.id !== id);
  saveData();
  LBEvents.emit(koleksiyon + ':changed', { action: 'delete', id });
  LBEvents.emit('state:changed', { koleksiyon, action: 'delete' });
}

/**
 * State'deki bir kaydı güncelle ve ilgili olayları tetikle.
 */
function stateGuncelle(koleksiyon, id, degisiklikler) {
  if (!state[koleksiyon]) return null;
  const kayit = state[koleksiyon].find(x => x.id === id);
  if (!kayit) return null;
  Object.assign(kayit, degisiklikler);
  saveData();
  LBEvents.emit(koleksiyon + ':changed', { action: 'update', id });
  LBEvents.emit('state:changed', { koleksiyon, action: 'update' });
  return kayit;
}

// ================================================================
// STANDART EVENT KAYITLARI
// ================================================================

/**
 * Tüm modüllerin event'lere abone olmasını sağlar.
 * init() sonrasında çağrılmalıdır.
 */
function registerStandardEvents() {
  // State değişikliklerinde badge'leri güncelle
  LBEvents.on('state:changed', () => {
    if (typeof updateBadges === 'function') updateBadges();
  });

  // Koleksiyon bazlı render güncellemeleri
  LBEvents.on('davalar:changed', () => {
    if (typeof renderDavalar === 'function') renderDavalar();
    if (typeof renderDavaCards === 'function') renderDavaCards();
    if (typeof renderDashboard === 'function') renderDashboard();
  });

  LBEvents.on('icra:changed', () => {
    if (typeof renderIcra === 'function') renderIcra();
    if (typeof renderIcraCards === 'function') renderIcraCards();
    if (typeof renderDashboard === 'function') renderDashboard();
  });

  LBEvents.on('muvekkillar:changed', () => {
    if (typeof renderMuvekkillar === 'function') renderMuvekkillar();
    if (typeof populateMuvSelects === 'function') populateMuvSelects();
    if (typeof renderDashboard === 'function') renderDashboard();
  });

  LBEvents.on('butce:changed', () => {
    if (typeof renderButce === 'function') renderButce();
    if (typeof renderDashboard === 'function') renderDashboard();
  });

  LBEvents.on('danismanlik:changed', () => {
    if (typeof renderDanismanlik === 'function') renderDanismanlik();
    if (typeof renderDashboard === 'function') renderDashboard();
  });

  LBEvents.on('etkinlikler:changed', () => {
    if (typeof renderCalendar === 'function') renderCalendar();
    if (typeof renderDashboard === 'function') renderDashboard();
  });
}
