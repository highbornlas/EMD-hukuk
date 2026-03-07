// ================================================================
// LEXBASE — GÜVENLİK YARDIMCI FONKSİYONLARI
// js/modules/security.js
//
// XSS koruması, HTML sanitizasyonu ve güvenli DOM işlemleri
// ================================================================

/**
 * HTML özel karakterlerini escape eder — XSS koruması
 * Kullanıcı girdisini innerHTML ile DOM'a yazmadan önce mutlaka çağırın.
 * @param {string} str - Escape edilecek metin
 * @returns {string} Güvenli metin
 */
function escHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Template literal ile güvenli HTML oluşturma
 * Kullanım: safeHTML`<div>${kullaniciGirdisi}</div>`
 * Otomatik olarak tüm interpolasyonları escape eder.
 */
function safeHTML(strings, ...values) {
  return strings.reduce((result, str, i) => {
    const val = i < values.length ? escHTML(values[i]) : '';
    return result + str + val;
  }, '');
}

/**
 * Attribute değerlerini güvenli yapar
 * onclick, oninput gibi event handler'larda kullanıcı verisini güvenli iletir.
 * @param {string} str - Attribute'a yazılacak değer
 * @returns {string} Güvenli attribute değeri
 */
function escAttr(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n');
}

/**
 * Güvenli ID — ID olarak kullanılacak string'leri temizler
 * Sadece alfanumerik, tire ve alt çizgi bırakır.
 */
function safeId(str) {
  return String(str || '').replace(/[^a-zA-Z0-9_-]/g, '');
}

/**
 * Özel onay dialogu — native confirm() yerine kullanılır
 * @param {string} baslik - Dialog başlığı
 * @param {string} mesaj - Dialog mesajı
 * @param {object} opts - Opsiyonlar { onayText, iptalText, tehlikeli }
 * @returns {Promise<boolean>} Kullanıcının kararı
 */
function onayDialog(baslik, mesaj, opts = {}) {
  return new Promise((resolve) => {
    const { onayText = 'Evet', iptalText = 'İptal', tehlikeli = false } = opts;
    const overlayId = 'onay-dialog-' + Date.now();

    const overlay = document.createElement('div');
    overlay.id = overlayId;
    overlay.className = 'modal-overlay open';
    overlay.style.cssText = 'z-index:99999';
    overlay.innerHTML = `
      <div class="modal" style="max-width:400px;animation:modalIn .2s ease">
        <div class="modal-header">
          <div class="modal-title">${escHTML(baslik)}</div>
        </div>
        <div class="modal-body" style="padding:16px 20px">
          <p style="font-size:13px;color:var(--text-muted);line-height:1.6;margin:0">${escHTML(mesaj)}</p>
        </div>
        <div class="modal-footer" style="display:flex;gap:8px;justify-content:flex-end">
          <button class="btn btn-outline" id="${overlayId}-iptal">${escHTML(iptalText)}</button>
          <button class="btn ${tehlikeli ? 'btn-red' : 'btn-gold'}" id="${overlayId}-onay">${escHTML(onayText)}</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    const kapat = (sonuc) => {
      const modal = overlay.querySelector('.modal');
      if (modal) modal.style.animation = 'modalOut .15s ease forwards';
      setTimeout(() => { overlay.remove(); resolve(sonuc); }, 140);
    };

    document.getElementById(`${overlayId}-iptal`).onclick = () => kapat(false);
    document.getElementById(`${overlayId}-onay`).onclick = () => kapat(true);

    // ESC ile iptal
    const escHandler = (e) => {
      if (e.key === 'Escape') { document.removeEventListener('keydown', escHandler); kapat(false); }
    };
    document.addEventListener('keydown', escHandler);

    // Otomatik focus onay butonuna
    setTimeout(() => document.getElementById(`${overlayId}-${tehlikeli ? 'iptal' : 'onay'}`)?.focus(), 50);
  });
}

/**
 * Silme onay dialogu — kırmızı vurgulu tehlikeli işlemler için
 */
function silmeOnay(oge, detay) {
  return onayDialog(
    `🗑 ${oge} Sil`,
    detay || `Bu ${oge.toLowerCase()} kalıcı olarak silinecek. Bu işlem geri alınamaz.`,
    { onayText: 'Evet, Sil', tehlikeli: true }
  );
}
