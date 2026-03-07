// ================================================================
// LEXBASE — WIZARD v2: ADIMLI FORM SİSTEMİ
// js/modules/wizard.js
//
// react-hook-form + zod mimarisi, vanilla JS'e uyarlanmış.
//
// 1. Global State: Panel toggle (display:none) — input'lar
//    DOM'da kalır, veri KAYBOLMAZ.
// 2. Adım Adım Validasyon: ileri() → trigger() → alan bazlı
//    doğrulama. Başarısızsa geçiş ENGELLENİR.
// 3. Alan Bazlı Hata: Kırmızı border + altında mesaj.
//    Input değişince anında temizlenir (realtime).
// 4. Adım Dot Hata Badge: Hangi adımda hata → kırmızı "!".
// 5. Otomatik Odaklama: Kaydet → tüm adımlar taranır →
//    ilk hatalı adıma zıpla + ilk alana focus.
// ================================================================

const Wizard = (function () {

  var _instances = {};

  function olustur(modalId, config) {
    var inst = {
      modalId: modalId,
      adimlar: config.adimlar || [],
      bitirFn: config.bitirFn,
      kaydetLabel: config.kaydetLabel || '✓ Kaydet',
      aktifAdim: 0,
      hatalar: {},
      adimHatalari: [],
    };
    _instances[modalId] = inst;
    _baglaRealtime(inst);
    return inst;
  }

  // ── RENDER ───────────────────────────────────────────────
  function render(modalId) {
    var inst = _instances[modalId];
    if (!inst) return;

    // Progress bar
    var progEl = document.getElementById(modalId + '-wiz-progress');
    if (progEl) {
      var html = '<div class="wizard-line"></div>';
      for (var i = 0; i < inst.adimlar.length; i++) {
        var durum = i < inst.aktifAdim ? 'done' : i === inst.aktifAdim ? 'active' : '';
        var hataVar = inst.adimHatalari[i];
        html += '<div class="wizard-step-indicator ' + durum + (hataVar ? ' has-error' : '') + '" onclick="Wizard.adimaSec(\'' + modalId + '\',' + i + ')" style="cursor:pointer">'
          + '<div class="wizard-step-dot">'
          + (hataVar ? '!' : (i < inst.aktifAdim ? '✓' : (i + 1)))
          + '</div>'
          + '<div class="wizard-step-label">' + inst.adimlar[i].baslik + '</div>'
          + '</div>';
      }
      progEl.innerHTML = html;
    }

    // Paneller — toggle class, DOM'dan kaldırmıyoruz
    for (var j = 0; j < inst.adimlar.length; j++) {
      var panel = document.getElementById(inst.adimlar[j].panelId);
      if (panel) panel.classList.toggle('active', j === inst.aktifAdim);
    }

    // Footer
    var footerEl = document.getElementById(modalId + '-wiz-footer');
    if (footerEl) {
      var ilkMi = inst.aktifAdim === 0;
      var sonMu = inst.aktifAdim === inst.adimlar.length - 1;
      footerEl.innerHTML =
        '<button class="btn btn-outline" onclick="Wizard.iptal(\'' + modalId + '\')">İptal</button>'
        + '<div style="display:flex;gap:8px;align-items:center">'
        + '<span style="font-size:11px;color:var(--text-dim)">Adım ' + (inst.aktifAdim + 1) + '/' + inst.adimlar.length + '</span>'
        + (ilkMi ? '' : '<button class="btn btn-outline" onclick="Wizard.geri(\'' + modalId + '\')">← Geri</button>')
        + (sonMu
          ? '<button class="btn btn-gold" onclick="Wizard.bitir(\'' + modalId + '\')">' + inst.kaydetLabel + '</button>'
          : '<button class="btn btn-gold" onclick="Wizard.ileri(\'' + modalId + '\')">İleri →</button>')
        + '</div>';
    }
  }

  // ── İLERİ — Adım validasyonu ─────────────────────────────
  function ileri(modalId) {
    var inst = _instances[modalId];
    if (!inst) return;

    var hatalar = _dogrula(inst, inst.aktifAdim);
    if (hatalar.length > 0) {
      _hatalariGoster(inst, hatalar);
      var ilk = document.getElementById(hatalar[0].id);
      if (ilk && ilk.focus) ilk.focus();
      return;
    }

    // Ek doğrulama
    var adim = inst.adimlar[inst.aktifAdim];
    if (adim.dogrula && !adim.dogrula()) return;

    inst.adimHatalari[inst.aktifAdim] = false;
    if (inst.aktifAdim < inst.adimlar.length - 1) {
      inst.aktifAdim++;
      render(modalId);
    }
  }

  // ── GERİ ─────────────────────────────────────────────────
  function geri(modalId) {
    var inst = _instances[modalId];
    if (!inst) return;
    if (inst.aktifAdim > 0) { inst.aktifAdim--; render(modalId); }
  }

  // ── BİTİR — Tüm adımları tara ───────────────────────────
  function bitir(modalId) {
    var inst = _instances[modalId];
    if (!inst) return;

    var ilkHataliAdim = -1;
    var tumHatalar = [];

    for (var s = 0; s < inst.adimlar.length; s++) {
      var h = _dogrula(inst, s);
      inst.adimHatalari[s] = h.length > 0;
      if (h.length > 0) {
        tumHatalar = tumHatalar.concat(h);
        if (ilkHataliAdim === -1) ilkHataliAdim = s;
      }
    }

    if (ilkHataliAdim >= 0) {
      // Hatalı adıma zıpla
      inst.aktifAdim = ilkHataliAdim;
      render(modalId);
      _hatalariGoster(inst, tumHatalar);

      setTimeout(function () {
        var ilk = document.getElementById(tumHatalar[0].id);
        if (ilk && ilk.focus) ilk.focus();
      }, 100);

      var isimler = [];
      for (var k = 0; k < inst.adimHatalari.length; k++) {
        if (inst.adimHatalari[k]) isimler.push(inst.adimlar[k].baslik);
      }
      notify('⚠️ Eksik alanlar: ' + isimler.join(', '));
      return;
    }

    // Son adım ek doğrulama
    var adim = inst.adimlar[inst.aktifAdim];
    if (adim.dogrula && !adim.dogrula()) return;

    if (inst.bitirFn) inst.bitirFn();
  }

  // ── ADIMA DOĞRUDAN GEÇ ──────────────────────────────────
  function adimaSec(modalId, idx) {
    var inst = _instances[modalId];
    if (!inst) return;

    // İleri gidiyorsa aradaki adımları doğrula
    if (idx > inst.aktifAdim) {
      for (var s = inst.aktifAdim; s < idx; s++) {
        var h = _dogrula(inst, s);
        if (h.length > 0) {
          inst.aktifAdim = s;
          render(modalId);
          _hatalariGoster(inst, h);
          return;
        }
      }
    }

    inst.aktifAdim = idx;
    render(modalId);
  }

  function iptal(modalId) { _temizle(_instances[modalId]); closeModal(modalId); }

  function sifirla(modalId) {
    var inst = _instances[modalId];
    if (!inst) return;
    inst.aktifAdim = 0;
    inst.hatalar = {};
    inst.adimHatalari = [];
    _temizle(inst);
    render(modalId);
  }

  // ================================================================
  // VALİDASYON MOTORU
  // ================================================================

  function _dogrula(inst, adimIdx) {
    var adim = inst.adimlar[adimIdx];
    if (!adim || !adim.alanlar) return [];
    var hatalar = [];

    for (var i = 0; i < adim.alanlar.length; i++) {
      var alan = adim.alanlar[i];
      var el = document.getElementById(alan.id);
      if (!el) continue;
      var deger = (el.value || '').trim();
      var hata = null;

      if (alan.tip === 'zorunlu') {
        if (!deger) hata = alan.mesaj || (alan.label + ' zorunludur');
      } else if (alan.tip === 'sayi') {
        if (!deger || isNaN(parseFloat(deger)) || parseFloat(deger) <= 0)
          hata = alan.mesaj || (alan.label + ' geçerli bir sayı olmalı');
      } else if (alan.tip === 'min') {
        if (deger && deger.length < (alan.min || 1))
          hata = alan.label + ' en az ' + alan.min + ' karakter olmalı';
      } else if (alan.tip === 'pattern') {
        if (deger && alan.pattern && !alan.pattern.test(deger))
          hata = alan.mesaj || (alan.label + ' formatı hatalı');
      } else if (alan.tip === 'custom') {
        if (alan.custom && !alan.custom(deger, el))
          hata = alan.mesaj || (alan.label + ' geçersiz');
      }

      if (hata) {
        hatalar.push({ id: alan.id, mesaj: hata, adim: adimIdx });
        inst.hatalar[alan.id] = hata;
      } else {
        delete inst.hatalar[alan.id];
        _alanTemizle(alan.id);
      }
    }

    return hatalar;
  }

  // ── HATA GÖSTERİMİ ──────────────────────────────────────
  function _hatalariGoster(inst, hatalar) {
    for (var i = 0; i < hatalar.length; i++) {
      var h = hatalar[i];
      var el = document.getElementById(h.id);
      if (!el) continue;

      el.classList.add('wiz-field-error');

      var errId = h.id + '-wiz-err';
      var errEl = document.getElementById(errId);
      if (!errEl) {
        errEl = document.createElement('div');
        errEl.id = errId;
        errEl.className = 'wiz-error-msg';
        var parent = el.closest('.form-group') || el.parentElement;
        if (parent) parent.appendChild(errEl);
      }
      errEl.textContent = '⚠ ' + h.mesaj;
      errEl.style.display = 'block';
    }
    render(inst.modalId);
  }

  function _alanTemizle(id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove('wiz-field-error');
    var err = document.getElementById(id + '-wiz-err');
    if (err) err.style.display = 'none';
  }

  function _temizle(inst) {
    if (!inst) return;
    for (var s = 0; s < inst.adimlar.length; s++) {
      var alanlar = inst.adimlar[s].alanlar || [];
      for (var i = 0; i < alanlar.length; i++) _alanTemizle(alanlar[i].id);
    }
    inst.hatalar = {};
    inst.adimHatalari = [];
  }

  // ── REALTIME VALİDASYON ──────────────────────────────────
  function _baglaRealtime(inst) {
    var init = function () {
      for (var s = 0; s < inst.adimlar.length; s++) {
        var alanlar = inst.adimlar[s].alanlar || [];
        for (var i = 0; i < alanlar.length; i++) {
          (function (alan, adimIdx) {
            var el = document.getElementById(alan.id);
            if (!el || el._wizBound) return;
            el._wizBound = true;

            var handler = function () {
              var deger = (el.value || '').trim();
              var ok = true;

              if (alan.tip === 'zorunlu') ok = !!deger;
              else if (alan.tip === 'sayi') ok = deger && !isNaN(parseFloat(deger)) && parseFloat(deger) > 0;
              else if (alan.tip === 'custom') ok = !alan.custom || alan.custom(deger, el);

              if (ok && inst.hatalar[alan.id]) {
                delete inst.hatalar[alan.id];
                _alanTemizle(alan.id);
                // Adım hata durumunu güncelle
                var kaldi = false;
                var adimAlanlar = inst.adimlar[adimIdx].alanlar || [];
                for (var j = 0; j < adimAlanlar.length; j++) {
                  if (inst.hatalar[adimAlanlar[j].id]) { kaldi = true; break; }
                }
                inst.adimHatalari[adimIdx] = kaldi;
                // Progress bar dot'u güncelle (render çağırmadan)
                var dots = document.querySelectorAll('#' + inst.modalId + '-wiz-progress .wizard-step-indicator');
                if (dots[adimIdx]) dots[adimIdx].classList.toggle('has-error', kaldi);
              }
            };

            el.addEventListener('input', handler);
            el.addEventListener('change', handler);
          })(alanlar[i], s);
        }
      }
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else setTimeout(init, 300);
  }

  return { olustur: olustur, render: render, ileri: ileri, geri: geri, bitir: bitir, iptal: iptal, sifirla: sifirla, adimaSec: adimaSec };
})();
