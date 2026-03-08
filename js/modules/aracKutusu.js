// ================================================================
// LEXBASE — AVUKAT ARAÇ KUTUSU
// js/modules/aracKutusu.js
//
// 1. Faiz Hesaplayıcı — Supabase'den dönemsel oranlar + dilim hesabı
// 2. Yasal Süre Hesaplayıcı — HMK/İİK/CMK + resmi tatil motoru
// 3. Vekalet Ücreti Hesaplayıcı — AAÜT 2024 tarifesi
// 4. Admin: Faiz Oranı Yönetimi (ekleme/silme)
// ================================================================

var AracKutusu = (function () {

// ── FAİZ ORANLARI (dinamik — Supabase'den yüklenir) ──────────
// Uygulama açılışında Supabase'den çekilir.
// Çekilemezse (offline/hata) hardcoded fallback kullanılır.
var _faizOranlari = [];
var _faizYuklendi = false;

// Hardcoded fallback (Supabase erişilemezse)
var FALLBACK_ORANLAR = [
  {baslangic:'2006-01-01', yasal:9,  ticari:18},
  {baslangic:'2017-01-01', yasal:9,  ticari:14.75},
  {baslangic:'2020-06-01', yasal:9,  ticari:9.75},
  {baslangic:'2023-09-01', yasal:9,  ticari:34.25},
  {baslangic:'2024-01-01', yasal:9,  ticari:49},
  {baslangic:'2024-07-01', yasal:24, ticari:54},
  {baslangic:'2025-01-01', yasal:24, ticari:49},
  {baslangic:'2025-04-01', yasal:24, ticari:44},
];

// ── Supabase'den oranları çek ────────────────────────────────
async function oranlariYukle() {
  if (typeof sb === 'undefined' || !sb) {
    _faizOranlari = FALLBACK_ORANLAR;
    _faizYuklendi = true;
    console.log('[AracKutusu] Supabase yok — fallback oranlar kullanılıyor (' + _faizOranlari.length + ')');
    return;
  }
  try {
    var result = await sb.from('faiz_oranlari').select('baslangic, yasal, ticari, kaynak').order('baslangic', {ascending: true});
    if (result.error) throw new Error(result.error.message);
    if (result.data && result.data.length > 0) {
      _faizOranlari = result.data.map(function(r) {
        return { baslangic: r.baslangic, yasal: parseFloat(r.yasal), ticari: parseFloat(r.ticari), kaynak: r.kaynak || '' };
      });
      _faizYuklendi = true;
      console.log('[AracKutusu] Faiz oranları Supabase\'den yüklendi: ' + _faizOranlari.length + ' dönem');
    } else {
      _faizOranlari = FALLBACK_ORANLAR;
      _faizYuklendi = true;
      console.log('[AracKutusu] Supabase boş — fallback kullanılıyor');
    }
  } catch (e) {
    _faizOranlari = FALLBACK_ORANLAR;
    _faizYuklendi = true;
    console.warn('[AracKutusu] Oran yükleme hatası, fallback kullanılıyor:', e.message);
  }
}

// ════════════════════════════════════════════════════════════════
// 1. FAİZ HESAPLAYICI — Dönemsel Oran Değişimli
// ════════════════════════════════════════════════════════════════

// Tarih aralığını oran değişim noktalarından böl
function _faizDilimleri(basTarih, bitTarih, oranKey) {
  var oranlar = _faizOranlari.length ? _faizOranlari : FALLBACK_ORANLAR;
  var bas = new Date(basTarih); bas.setHours(0,0,0,0);
  var bit = new Date(bitTarih); bit.setHours(0,0,0,0);
  if (bas >= bit) return [];

  // Oran geçiş noktalarını topla
  var noktalar = [bas.getTime()];
  for (var i = 0; i < oranlar.length; i++) {
    var oT = new Date(oranlar[i].baslangic); oT.setHours(0,0,0,0);
    if (oT > bas && oT < bit) noktalar.push(oT.getTime());
  }
  noktalar.push(bit.getTime());
  // Tekrar kaldır + sırala
  noktalar = noktalar.filter(function(v,i,a){return a.indexOf(v)===i;}).sort(function(a,b){return a-b;});

  var dilimler = [];
  for (var d = 0; d < noktalar.length - 1; d++) {
    var dBas = new Date(noktalar[d]);
    var dBit = new Date(noktalar[d+1]);
    var gun = Math.round((dBit - dBas) / 86400000);
    if (gun <= 0) continue;

    // Bu dilim için geçerli oranı bul
    var oran = 0;
    for (var o = oranlar.length - 1; o >= 0; o--) {
      var oTarih = new Date(oranlar[o].baslangic); oTarih.setHours(0,0,0,0);
      if (oTarih <= dBas) { oran = oranlar[o][oranKey]; break; }
    }
    dilimler.push({ baslangic:dBas.toISOString().split('T')[0], bitis:dBit.toISOString().split('T')[0], gun:gun, oran:oran });
  }
  return dilimler;
}

function faizHesapla(anapara, basTarih, bitTarih, faizTuru) {
  var oranKey = (faizTuru === 'ticari' || faizTuru === 'temerr_ticari') ? 'ticari' : 'yasal';
  var dilimler = _faizDilimleri(basTarih, bitTarih, oranKey);
  var toplamFaiz = 0, toplamGun = 0, detay = [];

  for (var i = 0; i < dilimler.length; i++) {
    var dl = dilimler[i];
    var dilimFaiz = anapara * (dl.oran / 100) / 365 * dl.gun;
    dilimFaiz = Math.round(dilimFaiz * 100) / 100;
    toplamFaiz += dilimFaiz;
    toplamGun += dl.gun;
    detay.push({ baslangic:dl.baslangic, bitis:dl.bitis, gun:dl.gun, oran:dl.oran, faiz:dilimFaiz });
  }
  return { anapara:anapara, toplamFaiz:Math.round(toplamFaiz*100)/100, genelToplam:Math.round((anapara+toplamFaiz)*100)/100, toplamGun:toplamGun, dilimSayisi:detay.length, detay:detay, faizTuru:faizTuru };
}

// ════════════════════════════════════════════════════════════════
// 2. YASAL SÜRE HESAPLAYICI
// ════════════════════════════════════════════════════════════════
var SURELER = [
  {kat:'HMK', ad:'Cevap dilekçesi süresi', gun:14, madde:'HMK m.127'},
  {kat:'HMK', ad:'Cevaba cevap dilekçesi', gun:14, madde:'HMK m.136/1'},
  {kat:'HMK', ad:'İkinci cevap dilekçesi', gun:14, madde:'HMK m.136/1'},
  {kat:'HMK', ad:'İstinaf süresi', gun:14, madde:'HMK m.345'},
  {kat:'HMK', ad:'Temyiz süresi', gun:14, madde:'HMK m.361'},
  {kat:'HMK', ad:'Karar düzeltme süresi', gun:15, madde:'HMK m.363'},
  {kat:'HMK', ad:'İhtiyati tedbire itiraz', gun:7, madde:'HMK m.394'},
  {kat:'İİK', ad:'Ödeme emrine itiraz (ilamsız)', gun:7, madde:'İİK m.62'},
  {kat:'İİK', ad:'Kambiyo senedine itiraz', gun:5, madde:'İİK m.168/5'},
  {kat:'İİK', ad:'İcra emrine itiraz (ilamlı)', gun:7, madde:'İİK m.33'},
  {kat:'İİK', ad:'İtirazın iptali davası', gun:365, madde:'İİK m.67 (1 yıl)'},
  {kat:'İİK', ad:'İtirazın kaldırılması', gun:180, madde:'İİK m.68 (6 ay)'},
  {kat:'İİK', ad:'Menfi tespit davası', gun:7, madde:'İİK m.72'},
  {kat:'İİK', ad:'İstihkak davası', gun:7, madde:'İİK m.97'},
  {kat:'İş', ad:'İşe iade davası', gun:30, madde:'İş K. m.20'},
  {kat:'İş', ad:'Arabuluculuk sonrası dava', gun:14, madde:'7036 s.K. m.3/15'},
  {kat:'İş', ad:'Kıdem tazminatı zamanaşımı', gun:1825, madde:'İş K. Geçici m.7 (5 yıl)'},
  {kat:'Ceza', ad:'İstinaf süresi (ceza)', gun:7, madde:'CMK m.273'},
  {kat:'Ceza', ad:'Temyiz süresi (ceza)', gun:15, madde:'CMK m.291'},
  {kat:'Ceza', ad:'İtiraz süresi', gun:7, madde:'CMK m.268'},
  {kat:'İdare', ad:'İptal davası süresi', gun:60, madde:'İYUK m.7'},
  {kat:'İdare', ad:'Tam yargı davası', gun:60, madde:'İYUK m.13'},
  {kat:'İdare', ad:'İstinaf süresi (idari)', gun:30, madde:'İYUK m.45'},
];

var RESMI_TATILLER = [
  '2024-01-01','2024-04-10','2024-04-11','2024-04-12','2024-04-23','2024-05-01',
  '2024-06-16','2024-06-17','2024-06-18','2024-06-19','2024-07-15','2024-08-30','2024-10-28','2024-10-29',
  '2025-01-01','2025-03-30','2025-03-31','2025-04-01','2025-04-23','2025-05-01',
  '2025-06-06','2025-06-07','2025-06-08','2025-06-09','2025-07-15','2025-08-30','2025-10-28','2025-10-29',
  '2026-01-01','2026-03-20','2026-03-21','2026-03-22','2026-04-23','2026-05-01',
  '2026-05-26','2026-05-27','2026-05-28','2026-05-29','2026-07-15','2026-08-30','2026-10-28','2026-10-29',
];

function _tatilMi(d) {
  var s = d.toISOString().split('T')[0];
  if (RESMI_TATILLER.indexOf(s)>=0) return true;
  if (d.getDay()===0 || d.getDay()===6) return true;
  return false;
}

function sureHesapla(basTarih, gun) {
  var d = new Date(basTarih); d.setHours(0,0,0,0);
  // Süre ertesi gün başlar
  d.setDate(d.getDate()+1);
  var kalan = gun;
  while (kalan > 0) {
    if (!_tatilMi(d)) kalan--;
    if (kalan > 0) d.setDate(d.getDate()+1);
  }
  // Son gün tatilse bir sonraki iş gününe kaydır
  while (_tatilMi(d)) d.setDate(d.getDate()+1);
  return d.toISOString().split('T')[0];
}

// ════════════════════════════════════════════════════════════════
// 3. VEKALET ÜCRETİ HESAPLAYICI (AAÜT 2024)
// ════════════════════════════════════════════════════════════════
var AAUT = [
  {ad:'Danışma (sözlü)', ucret:4700},
  {ad:'Danışma (yazılı)', ucret:12000},
  {ad:'Ceza — Sulh Ceza (duruşmalı)', ucret:12500},
  {ad:'Ceza — Asliye Ceza', ucret:20000},
  {ad:'Ceza — Ağır Ceza', ucret:32000},
  {ad:'Hukuk — Sulh Hukuk', ucret:12500},
  {ad:'Hukuk — Asliye Hukuk', ucret:20000},
  {ad:'Hukuk — Asliye Ticaret', ucret:27000},
  {ad:'Hukuk — İş Mahkemesi', ucret:16500},
  {ad:'Hukuk — Aile Mahkemesi', ucret:16500},
  {ad:'Hukuk — Tüketici Mahkemesi', ucret:7600},
  {ad:'İcra Takibi (ilamsız)', ucret:7000},
  {ad:'İcra Takibi (ilamlı)', ucret:7000},
  {ad:'İcra — İtirazın kaldırılması', ucret:7600},
  {ad:'İcra — İtirazın iptali', ucret:16500},
  {ad:'İstinaf (Hukuk)', ucret:16500},
  {ad:'İstinaf (Ceza)', ucret:16500},
  {ad:'Temyiz (Hukuk)', ucret:20000},
  {ad:'Temyiz (Ceza)', ucret:20000},
  {ad:'İdare — İptal davası', ucret:16500},
  {ad:'İdare — Tam yargı', ucret:20000},
  {ad:'Arabuluculuk', ucret:7600},
  {ad:'Tahkim', ucret:32000},
];
// Nispi ücret: Dava değerinin %15'i (asgari tarifenin altına düşemez)
function vekaletHesapla(davaTuru, davaDeger) {
  var tablo = AAUT.find(function(a){return a.ad === davaTuru;});
  var maktu = tablo ? tablo.ucret : 16500;
  var nispi = davaDeger > 0 ? davaDeger * 0.15 : 0;
  return { maktu: maktu, nispi: Math.round(nispi*100)/100, onerilen: Math.max(maktu, nispi) };
}

// ════════════════════════════════════════════════════════════════
// MODAL UI
// ════════════════════════════════════════════════════════════════
function ac(sekme) {
  var modal = document.getElementById('arac-kutusu-modal');
  if (!modal) _modalOlustur();
  modal = document.getElementById('arac-kutusu-modal');
  modal.classList.add('open');
  aracTab(sekme || 'faiz');
}

function _modalOlustur() {
  var m = document.createElement('div');
  m.className = 'modal-overlay';
  m.id = 'arac-kutusu-modal';
  m.innerHTML =
    '<div class="modal modal-lg" style="max-width:860px;max-height:92vh;display:flex;flex-direction:column">' +
    '<div class="modal-header" style="flex-shrink:0"><div class="modal-title">🧰 Avukat Araç Kutusu</div></div>' +
    '<div class="tabs" style="padding:0 20px;flex-shrink:0">' +
      '<div class="tab active" onclick="AracKutusu.tab(\'faiz\',this)">💰 Faiz</div>' +
      '<div class="tab" onclick="AracKutusu.tab(\'sure\',this)">⏱ Süre</div>' +
      '<div class="tab" onclick="AracKutusu.tab(\'ucret\',this)">⚖️ Vekalet Ücreti</div>' +
    '</div>' +
    '<div id="ak-icerik" style="flex:1;overflow-y:auto;padding:20px"></div>' +
    '<div class="modal-footer" style="flex-shrink:0"><button class="btn btn-outline" onclick="closeModal(\'arac-kutusu-modal\')">Kapat</button></div>' +
    '</div>';
  document.body.appendChild(m);
}

function aracTab(sekme, el) {
  if (el) {
    el.parentElement.querySelectorAll('.tab').forEach(function(t){t.classList.remove('active');});
    el.classList.add('active');
  }
  var ic = document.getElementById('ak-icerik');
  if (!ic) return;
  if (sekme === 'faiz') _renderFaiz(ic);
  else if (sekme === 'sure') _renderSure(ic);
  else if (sekme === 'ucret') _renderUcret(ic);
}

// ── FAİZ TAB ─────────────────────────────────────────────────
function _renderFaiz(el) {
  var oranSayisi = _faizOranlari.length || FALLBACK_ORANLAR.length;
  var kaynak = _faizOranlari.length > 0 && _faizYuklendi ? 'Supabase' : 'Yerel';
  el.innerHTML =
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
      '<div style="font-size:15px;font-weight:700">💰 Faiz Hesaplayıcı</div>' +
      '<div style="font-size:10px;color:var(--text-dim)">' + oranSayisi + ' dönem · Kaynak: ' + kaynak + '</div>' +
    '</div>' +
    '<div style="background:rgba(201,168,76,.06);border:1px solid rgba(201,168,76,.2);border-radius:8px;padding:12px;margin-bottom:16px;font-size:11px;color:var(--text-muted)">' +
      '⚠️ <b>Dönemsel oran değişimi desteklenir.</b> Hesaplama, başlangıç-bitiş arasındaki her oran değişikliğini ayrı dilim olarak hesaplar. Tek oran hatası yapılmaz.</div>' +
    '<div class="form-row"><div class="form-group"><label>Anapara (₺)</label><input type="number" id="ak-f-anapara" value="100000" step="0.01"></div>' +
    '<div class="form-group"><label>Faiz Türü</label><select id="ak-f-tur"><option value="yasal">Yasal Faiz</option><option value="ticari">Ticari (Avans) Faiz</option></select></div></div>' +
    '<div class="form-row"><div class="form-group"><label>Başlangıç Tarihi</label><input type="date" id="ak-f-bas"></div>' +
    '<div class="form-group"><label>Bitiş Tarihi</label><input type="date" id="ak-f-bit"></div></div>' +
    '<button class="btn btn-gold" onclick="AracKutusu.hesaplaFaiz()" style="width:100%;margin-bottom:16px">📊 Hesapla</button>' +
    '<div id="ak-f-sonuc"></div>';
  document.getElementById('ak-f-bit').value = today();
}

function hesaplaFaiz() {
  var anapara = parseFloat(document.getElementById('ak-f-anapara').value);
  var bas = document.getElementById('ak-f-bas').value;
  var bit = document.getElementById('ak-f-bit').value;
  var tur = document.getElementById('ak-f-tur').value;
  if (!anapara || anapara <= 0) { notify('⚠️ Anapara girin'); return; }
  if (!bas || !bit) { notify('⚠️ Tarih aralığı girin'); return; }
  if (bas >= bit) { notify('⚠️ Bitiş tarihi başlangıçtan sonra olmalı'); return; }

  var sonuc = faizHesapla(anapara, bas, bit, tur);
  var el = document.getElementById('ak-f-sonuc');

  // Özet kartları
  var html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px">' +
    '<div style="background:var(--surface2);border-radius:8px;padding:14px;text-align:center"><div style="font-size:10px;color:var(--text-muted)">ANAPARA</div><div style="font-size:18px;font-weight:800;color:var(--text)">' + fmt(sonuc.anapara) + '</div></div>' +
    '<div style="background:rgba(231,76,60,.06);border:1px solid rgba(231,76,60,.2);border-radius:8px;padding:14px;text-align:center"><div style="font-size:10px;color:#e74c3c">FAİZ TUTARI</div><div style="font-size:18px;font-weight:800;color:#e74c3c">' + fmt(sonuc.toplamFaiz) + '</div></div>' +
    '<div style="background:rgba(39,174,96,.06);border:1px solid rgba(39,174,96,.2);border-radius:8px;padding:14px;text-align:center"><div style="font-size:10px;color:var(--green)">GENEL TOPLAM</div><div style="font-size:18px;font-weight:800;color:var(--green)">' + fmt(sonuc.genelToplam) + '</div></div></div>';

  html += '<div style="font-size:11px;color:var(--text-muted);margin-bottom:8px">' + sonuc.toplamGun + ' gün · ' + sonuc.dilimSayisi + ' oran dilimi · ' + (tur==='ticari'?'Ticari':'Yasal') + ' faiz</div>';

  // Dilim detay tablosu
  html += '<table><thead><tr><th>Dönem Başlangıç</th><th>Dönem Bitiş</th><th>Gün</th><th>Oran (%)</th><th style="text-align:right">Faiz (₺)</th></tr></thead><tbody>';
  sonuc.detay.forEach(function(d) {
    var oranDegisti = false;
    for (var j = 0; j < sonuc.detay.length; j++) {
      if (j > 0 && sonuc.detay[j].oran !== sonuc.detay[j-1].oran) { if (sonuc.detay[j] === d) oranDegisti = true; }
    }
    html += '<tr' + (oranDegisti ? ' style="background:rgba(201,168,76,.06)"' : '') + '>' +
      '<td>' + fmtD(d.baslangic) + '</td><td>' + fmtD(d.bitis) + '</td>' +
      '<td>' + d.gun + '</td><td>' + (oranDegisti ? '<b style="color:var(--gold)">%' + d.oran + ' ⬆</b>' : '%' + d.oran) + '</td>' +
      '<td style="text-align:right;font-weight:600">' + fmt(d.faiz) + '</td></tr>';
  });
  html += '<tr style="font-weight:700;border-top:2px solid var(--border)"><td colspan="2">TOPLAM</td><td>' + sonuc.toplamGun + '</td><td></td><td style="text-align:right;color:#e74c3c">' + fmt(sonuc.toplamFaiz) + '</td></tr>';
  html += '</tbody></table>';

  el.innerHTML = html;
}

// ── SÜRE TAB ─────────────────────────────────────────────────
function _renderSure(el) {
  var kategoriler = {};
  SURELER.forEach(function(s){ if(!kategoriler[s.kat]) kategoriler[s.kat]=[]; kategoriler[s.kat].push(s); });

  var optHtml = '<option value="">— Süre türü seçin —</option>';
  Object.keys(kategoriler).forEach(function(kat) {
    optHtml += '<optgroup label="' + kat + '">';
    kategoriler[kat].forEach(function(s,i) {
      optHtml += '<option value="' + s.gun + '" data-madde="' + s.madde + '">' + s.ad + ' (' + s.gun + ' gün — ' + s.madde + ')</option>';
    });
    optHtml += '</optgroup>';
  });

  el.innerHTML =
    '<div style="font-size:15px;font-weight:700;margin-bottom:16px">⏱ Yasal Süre Hesaplayıcı</div>' +
    '<div style="background:rgba(41,128,185,.06);border:1px solid rgba(41,128,185,.2);border-radius:8px;padding:12px;margin-bottom:16px;font-size:11px;color:var(--text-muted)">' +
      'Hafta sonları ve resmi tatiller otomatik atlanır. Son gün tatile denk gelirse bir sonraki iş gününe kaydırılır.</div>' +
    '<div class="form-row"><div class="form-group"><label>Süre Türü (Mevzuattan Seç)</label><select id="ak-s-tur" onchange="AracKutusu._sureSecildi()">' + optHtml + '</select></div></div>' +
    '<div class="form-row"><div class="form-group"><label>Tebliğ / Başlangıç Tarihi</label><input type="date" id="ak-s-bas"></div>' +
    '<div class="form-group"><label>Gün Sayısı</label><input type="number" id="ak-s-gun" min="1" value="14"></div></div>' +
    '<div style="font-size:10px;color:var(--text-dim);margin-bottom:12px" id="ak-s-madde"></div>' +
    '<button class="btn btn-gold" onclick="AracKutusu.hesaplaSure()" style="width:100%;margin-bottom:16px">📊 Hesapla</button>' +
    '<div id="ak-s-sonuc"></div>';
  document.getElementById('ak-s-bas').value = today();
}

function _sureSecildi() {
  var sel = document.getElementById('ak-s-tur');
  var opt = sel.options[sel.selectedIndex];
  document.getElementById('ak-s-gun').value = sel.value || 14;
  var maddeEl = document.getElementById('ak-s-madde');
  if (maddeEl) maddeEl.textContent = opt.dataset.madde ? '📖 ' + opt.dataset.madde : '';
}

function hesaplaSure() {
  var bas = document.getElementById('ak-s-bas').value;
  var gun = parseInt(document.getElementById('ak-s-gun').value);
  if (!bas) { notify('⚠️ Başlangıç tarihi girin'); return; }
  if (!gun || gun <= 0) { notify('⚠️ Gün sayısı girin'); return; }

  var sonTarih = sureHesapla(bas, gun);
  var kalan = Math.ceil((new Date(sonTarih) - new Date()) / 86400000);
  var renk = kalan <= 0 ? '#e74c3c' : kalan <= 3 ? '#e67e22' : kalan <= 7 ? '#f39c12' : 'var(--green)';
  var durumText = kalan <= 0 ? '❌ SÜRESİ GEÇTİ' : kalan <= 3 ? '🚨 ' + kalan + ' gün kaldı!' : '✅ ' + kalan + ' gün kaldı';

  document.getElementById('ak-s-sonuc').innerHTML =
    '<div style="background:' + renk + '11;border:2px solid ' + renk + ';border-radius:12px;padding:24px;text-align:center">' +
    '<div style="font-size:12px;color:var(--text-muted);margin-bottom:4px">SON TARİH</div>' +
    '<div style="font-size:32px;font-weight:800;color:' + renk + '">' + fmtD(sonTarih) + '</div>' +
    '<div style="font-size:14px;margin-top:8px;color:' + renk + '">' + durumText + '</div>' +
    '<div style="font-size:11px;color:var(--text-muted);margin-top:8px">Başlangıç: ' + fmtD(bas) + ' + ' + gun + ' iş günü (tatiller hariç)</div>' +
    '</div>' +
    '<div style="display:flex;gap:8px;margin-top:12px;justify-content:center">' +
    '<button class="btn btn-outline btn-sm" onclick="AracKutusu._sureTakvimeEkle(\'' + sonTarih + '\')">📅 Takvime Ekle</button>' +
    '<button class="btn btn-outline btn-sm" onclick="AracKutusu._sureTodoyaEkle(\'' + sonTarih + '\')">✅ Göreve Ekle</button>' +
    '</div>';
}

function _sureTakvimeEkle(tarih) {
  openTakModal(tarih);
  closeModal('arac-kutusu-modal');
}
function _sureTodoyaEkle(tarih) {
  if(typeof openTodoModal==='function') openTodoModal();
  var sonEl = document.getElementById('todo-son-tarih');
  if(sonEl) sonEl.value = tarih;
  closeModal('arac-kutusu-modal');
}

// ── VEKALET ÜCRETİ TAB ──────────────────────────────────────
function _renderUcret(el) {
  var optHtml = '';
  AAUT.forEach(function(a) {
    optHtml += '<option value="' + a.ad + '" data-ucret="' + a.ucret + '">' + a.ad + ' — ' + fmt(a.ucret) + '</option>';
  });

  el.innerHTML =
    '<div style="font-size:15px;font-weight:700;margin-bottom:16px">⚖️ Vekalet Ücreti Hesaplayıcı <span style="font-size:11px;color:var(--text-muted);font-weight:400">(AAÜT 2024)</span></div>' +
    '<div class="form-row"><div class="form-group"><label>Dava / İş Türü</label><select id="ak-u-tur" onchange="AracKutusu._ucretSecildi()">' + optHtml + '</select></div>' +
    '<div class="form-group"><label>Dava Değeri (₺, opsiyonel)</label><input type="number" id="ak-u-deger" step="0.01" placeholder="Nispi hesap için"></div></div>' +
    '<button class="btn btn-gold" onclick="AracKutusu.hesaplaUcret()" style="width:100%;margin-bottom:16px">📊 Hesapla</button>' +
    '<div id="ak-u-sonuc"></div>';
}

function _ucretSecildi() {}

function hesaplaUcret() {
  var tur = document.getElementById('ak-u-tur').value;
  var deger = parseFloat(document.getElementById('ak-u-deger').value) || 0;
  var sonuc = vekaletHesapla(tur, deger);

  document.getElementById('ak-u-sonuc').innerHTML =
    '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">' +
    '<div style="background:var(--surface2);border-radius:8px;padding:14px;text-align:center"><div style="font-size:10px;color:var(--text-muted)">MAKTU (AAÜT)</div><div style="font-size:18px;font-weight:800">' + fmt(sonuc.maktu) + '</div></div>' +
    (deger > 0 ? '<div style="background:var(--surface2);border-radius:8px;padding:14px;text-align:center"><div style="font-size:10px;color:var(--text-muted)">NİSPİ (%15)</div><div style="font-size:18px;font-weight:800">' + fmt(sonuc.nispi) + '</div></div>' : '<div></div>') +
    '<div style="background:rgba(201,168,76,.1);border:1px solid var(--gold);border-radius:8px;padding:14px;text-align:center"><div style="font-size:10px;color:var(--gold)">ÖNERİLEN ASGARİ</div><div style="font-size:18px;font-weight:800;color:var(--gold)">' + fmt(sonuc.onerilen) + '</div></div></div>' +
    '<div style="font-size:11px;color:var(--text-muted);margin-top:10px">⚠️ Nispi ücret, dava değerinin %15\'idir. Maktu tarife altında ücret kararlaştırılamaz (TBB/AAÜT 2024).</div>';
}

// ════════════════════════════════════════════════════════════════
// ADMIN: FAİZ ORANI YÖNETİMİ
// ════════════════════════════════════════════════════════════════
function adminOranlarAc() {
  var modal = document.getElementById('admin-faiz-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'admin-faiz-modal';
    modal.innerHTML =
      '<div class="modal modal-lg" style="max-width:700px">' +
      '<div class="modal-header"><div class="modal-title">📊 Faiz Oranı Yönetimi</div></div>' +
      '<div class="modal-body">' +
        '<div style="background:rgba(201,168,76,.06);border:1px solid rgba(201,168,76,.2);border-radius:8px;padding:12px;margin-bottom:16px;font-size:11px;color:var(--text-muted)">' +
        'Yeni oran ekleyin veya mevcut oranları düzenleyin. Değişiklikler Supabase\'e kaydedilir ve tüm hesaplamalarda kullanılır.</div>' +
        '<div class="form-row"><div class="form-group"><label>Yürürlük Tarihi</label><input type="date" id="afo-tarih"></div>' +
        '<div class="form-group"><label>Yasal Faiz (%)</label><input type="number" id="afo-yasal" step="0.01"></div>' +
        '<div class="form-group"><label>Ticari Faiz (%)</label><input type="number" id="afo-ticari" step="0.01"></div></div>' +
        '<div class="form-group"><label>Kaynak / Not</label><input id="afo-kaynak" placeholder="Resmi Gazete / TCMB"></div>' +
        '<button class="btn btn-gold" onclick="AracKutusu.adminOranEkle()" style="width:100%;margin:12px 0" id="afo-ekle-btn">+ Oran Ekle</button>' +
        '<div id="afo-liste" style="max-height:300px;overflow-y:auto"></div>' +
      '</div>' +
      '<div class="modal-footer"><button class="btn btn-outline" onclick="closeModal(\'admin-faiz-modal\')">Kapat</button></div></div>';
    document.body.appendChild(modal);
  }
  modal.classList.add('open');
  _adminOranListesi();
}

function _adminOranListesi() {
  var el = document.getElementById('afo-liste');
  if (!el) return;
  var oranlar = _faizOranlari.length ? _faizOranlari : FALLBACK_ORANLAR;
  var rows = oranlar.slice().reverse(); // en yeni üstte
  el.innerHTML = '<table><thead><tr><th>Tarih</th><th>Yasal %</th><th>Ticari %</th><th>Kaynak</th><th></th></tr></thead><tbody>' +
    rows.map(function(r) {
      return '<tr><td>' + fmtD(r.baslangic) + '</td><td>%' + r.yasal + '</td><td>%' + r.ticari + '</td>' +
        '<td style="font-size:10px;color:var(--text-muted)">' + (r.kaynak||'') + '</td>' +
        '<td><button class="delete-btn" onclick="AracKutusu.adminOranSil(\'' + r.baslangic + '\')">✕</button></td></tr>';
    }).join('') + '</tbody></table>';
}

async function adminOranEkle() {
  var tarih = document.getElementById('afo-tarih').value;
  var yasal = parseFloat(document.getElementById('afo-yasal').value);
  var ticari = parseFloat(document.getElementById('afo-ticari').value);
  var kaynak = document.getElementById('afo-kaynak').value.trim();
  if (!tarih || isNaN(yasal) || isNaN(ticari)) { notify('⚠️ Tüm alanları doldurun'); return; }

  var btn = document.getElementById('afo-ekle-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="btn-spinner"></span> Kaydediliyor...'; }

  if (typeof sb !== 'undefined' && sb) {
    try {
      var result = await sb.from('faiz_oranlari').upsert({ baslangic: tarih, yasal: yasal, ticari: ticari, kaynak: kaynak });
      if (result.error) { notify('❌ ' + result.error.message); if(btn){btn.disabled=false;btn.textContent='+ Oran Ekle';} return; }
    } catch(e) { notify('❌ ' + e.message); if(btn){btn.disabled=false;btn.textContent='+ Oran Ekle';} return; }
  }

  // Bellekteki listeyi güncelle
  var mevcut = _faizOranlari.findIndex(function(r){return r.baslangic === tarih;});
  if (mevcut >= 0) _faizOranlari[mevcut] = {baslangic:tarih, yasal:yasal, ticari:ticari, kaynak:kaynak};
  else { _faizOranlari.push({baslangic:tarih, yasal:yasal, ticari:ticari, kaynak:kaynak}); _faizOranlari.sort(function(a,b){return a.baslangic.localeCompare(b.baslangic);}); }

  if(btn){btn.disabled=false;btn.textContent='+ Oran Ekle';}
  document.getElementById('afo-tarih').value = '';
  document.getElementById('afo-yasal').value = '';
  document.getElementById('afo-ticari').value = '';
  document.getElementById('afo-kaynak').value = '';
  _adminOranListesi();
  notify('✅ Oran kaydedildi');
}

async function adminOranSil(tarih) {
  if (!confirm(fmtD(tarih) + ' tarihli oranı silmek istiyor musunuz?')) return;
  if (typeof sb !== 'undefined' && sb) {
    try {
      await sb.from('faiz_oranlari').delete().eq('baslangic', tarih);
    } catch(e) { console.warn(e); }
  }
  _faizOranlari = _faizOranlari.filter(function(r){return r.baslangic !== tarih;});
  _adminOranListesi();
  notify('Oran silindi');
}

// ── PUBLIC API ───────────────────────────────────────────────
return {
  oranlariYukle: oranlariYukle,
  faizHesapla: faizHesapla,
  sureHesapla: sureHesapla,
  vekaletHesapla: vekaletHesapla,
  ac: ac,
  tab: aracTab,
  hesaplaFaiz: hesaplaFaiz,
  hesaplaSure: hesaplaSure,
  hesaplaUcret: hesaplaUcret,
  adminOranlarAc: adminOranlarAc,
  adminOranEkle: adminOranEkle,
  adminOranSil: adminOranSil,
  _sureSecildi: _sureSecildi,
  _sureTakvimeEkle: _sureTakvimeEkle,
  _sureTodoyaEkle: _sureTodoyaEkle,
  SURELER: SURELER,
  AAUT: AAUT,
  getOranlar: function(){ return _faizOranlari; },
};
})();
