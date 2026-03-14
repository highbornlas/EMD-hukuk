/* ══════════════════════════════════════════════════════════════
   Format Doğrulama — TC, VKN, IBAN, MERSİS, Telefon, E-posta
   ══════════════════════════════════════════════════════════════ */

/** TC Kimlik No — 11 haneli, algoritma kontrolü */
export function tcKimlikDogrula(tc: string): string | null {
  const temiz = tc.replace(/\s/g, '');
  if (!temiz) return null; // boşsa hata verme (zorunluluk ayrı kontrol)
  if (!/^\d{11}$/.test(temiz)) return 'TC Kimlik No 11 haneli olmalıdır.';
  if (temiz[0] === '0') return 'TC Kimlik No 0 ile başlayamaz.';

  const d = temiz.split('').map(Number);
  // 10. hane kontrolü
  const tek = d[0] + d[2] + d[4] + d[6] + d[8];
  const cift = d[1] + d[3] + d[5] + d[7];
  const hane10 = (tek * 7 - cift) % 10;
  if (hane10 < 0 ? hane10 + 10 : hane10 !== d[9]) return 'Geçersiz TC Kimlik No.';

  // 11. hane kontrolü
  const toplam = d.slice(0, 10).reduce((a, b) => a + b, 0);
  if (toplam % 10 !== d[10]) return 'Geçersiz TC Kimlik No.';

  return null;
}

/** Vergi Kimlik No — 10 haneli rakam */
export function vknDogrula(vkn: string): string | null {
  const temiz = vkn.replace(/\s/g, '');
  if (!temiz) return null;
  if (!/^\d{10}$/.test(temiz)) return 'Vergi Kimlik No 10 haneli olmalıdır.';

  // VKN algoritma kontrolü
  const d = temiz.split('').map(Number);
  let toplam = 0;
  for (let i = 0; i < 9; i++) {
    let t = (d[i] + (9 - i)) % 10;
    const katsayi = (t * Math.pow(2, 9 - i)) % 9;
    toplam += t === 0 ? 9 : katsayi === 0 ? 9 : katsayi;
  }
  if (toplam % 10 === 0 ? 0 : 10 - (toplam % 10) !== d[9]) {
    return 'Geçersiz Vergi Kimlik No.';
  }

  return null;
}

/** IBAN (TR) — TR + 24 karakter, MOD 97 kontrolü */
export function ibanDogrula(iban: string): string | null {
  const temiz = iban.replace(/\s/g, '').toUpperCase();
  if (!temiz) return null;

  // TR IBAN: TR + 2 kontrol + 5 banka + 1 ayrıl + 16 hesap = 26
  if (!/^TR\d{24}$/.test(temiz)) {
    if (temiz.length < 26) return 'IBAN 26 karakter olmalıdır (TR + 24 rakam).';
    if (!temiz.startsWith('TR')) return 'Türk IBAN\'ı TR ile başlamalıdır.';
    return 'Geçersiz IBAN formatı.';
  }

  // MOD 97 kontrolü (parçalı hesaplama — BigInt gerekmez)
  const yeniden = temiz.slice(4) + temiz.slice(0, 4);
  const sayisal = yeniden.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let kalan = 0;
  for (let i = 0; i < sayisal.length; i++) {
    kalan = (kalan * 10 + Number(sayisal[i])) % 97;
  }
  if (kalan !== 1) return 'Geçersiz IBAN kontrol kodu.';

  return null;
}

/** MERSİS No — 16 haneli rakam */
export function mersisDogrula(mersis: string): string | null {
  const temiz = mersis.replace(/\s/g, '');
  if (!temiz) return null;
  if (!/^\d{16}$/.test(temiz)) return 'MERSİS No 16 haneli olmalıdır.';
  return null;
}

/** Ticaret Sicil No — sadece rakam, 1-10 hane */
export function ticaretSicilDogrula(sicil: string): string | null {
  const temiz = sicil.replace(/\s/g, '');
  if (!temiz) return null;
  if (!/^\d{1,10}$/.test(temiz)) return 'Ticaret Sicil No yalnızca rakam içermelidir.';
  return null;
}

/** Yabancı Kimlik No — en az 5 karakter, alfanümerik */
export function yabanciKimlikDogrula(kimlik: string): string | null {
  const temiz = kimlik.replace(/\s/g, '');
  if (!temiz) return null;
  if (temiz.length < 5) return 'Yabancı Kimlik No en az 5 karakter olmalıdır.';
  if (!/^[A-Za-z0-9\-]+$/.test(temiz)) return 'Yabancı Kimlik No yalnızca harf, rakam ve tire içerebilir.';
  return null;
}

/** Baro Sicil No — rakam, 1-10 hane */
export function baroSicilDogrula(sicil: string): string | null {
  const temiz = sicil.replace(/\s/g, '');
  if (!temiz) return null;
  if (!/^\d{1,10}$/.test(temiz)) return 'Baro Sicil No yalnızca rakam içermelidir.';
  return null;
}

/** TBB Sicil No — rakam, 1-10 hane */
export function tbbSicilDogrula(sicil: string): string | null {
  const temiz = sicil.replace(/\s/g, '');
  if (!temiz) return null;
  if (!/^\d{1,10}$/.test(temiz)) return 'TBB Sicil No yalnızca rakam içermelidir.';
  return null;
}

/** Telefon — Türk GSM/sabit hat formatı, otomatik normalize */
export function telefonDogrula(tel: string): string | null {
  const temiz = tel.replace(/[\s\-\(\)]/g, '');
  if (!temiz) return null;
  // +90, 0090, 90 veya 0 ile başlayan 10-11 haneli numara
  const normalized = temiz.replace(/^(\+90|0090|90|0)/, '');
  if (!/^\d{10}$/.test(normalized)) return 'Geçersiz telefon numarası. Örnek: 0532 000 00 00';
  // GSM: 5xx, Sabit: 2xx, 3xx, 4xx
  const alan = normalized[0];
  if (!['2', '3', '4', '5'].includes(alan)) return 'Geçersiz alan kodu.';
  return null;
}

/** Telefon numarasını +90 5XX XXX XX XX formatına çevir */
export function telefonFormatla(tel: string): string {
  const temiz = tel.replace(/[\s\-\(\)]/g, '');
  const normalized = temiz.replace(/^(\+90|0090|90|0)/, '');
  if (!/^\d{10}$/.test(normalized)) return tel; // formatlayamıyorsa olduğu gibi döndür
  return `+90 ${normalized.slice(0, 3)} ${normalized.slice(3, 6)} ${normalized.slice(6, 8)} ${normalized.slice(8, 10)}`;
}

/** E-posta format doğrulama */
export function epostaDogrula(eposta: string): string | null {
  const temiz = eposta.trim();
  if (!temiz) return null;
  // Basit ama kapsamlı regex
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(temiz)) return 'Geçersiz e-posta adresi.';
  return null;
}

/** Banka listesindeki IBAN'ları toplu doğrula */
export function bankaIbanlarDogrula(
  bankalar: Array<{ iban?: string; [key: string]: unknown }>
): string | null {
  for (let i = 0; i < bankalar.length; i++) {
    const b = bankalar[i];
    if (b.iban) {
      const hata = ibanDogrula(b.iban);
      if (hata) return `${i + 1}. banka hesabı: ${hata}`;
    }
  }
  return null;
}
