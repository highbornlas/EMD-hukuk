// ================================================================
// LEXBASE — TÜRKİYE TATİL, ÖZEL GÜN & ADLİ TATİL SİSTEMİ
// lib/data/tatiller.ts
//
// Resmi tatiller, dini bayramlar, adli tatil, hukuk özel günleri
// Adli tatil süre uzaması hesaplama (HMK md.104)
// ================================================================

export interface TatilBilgi {
  ad: string;
  tip: 'resmi' | 'dini' | 'adli' | 'hukuk' | 'anma';
  renk: string; // tailwind uyumlu renk kodu
}

// ── RESMİ TATİLLER (sabit tarihli) ──
const RESMI_TATILLER: Array<{ ay: number; gun: number; ad: string }> = [
  { ay: 1, gun: 1, ad: 'Yılbaşı' },
  { ay: 4, gun: 23, ad: 'Ulusal Egemenlik ve Çocuk Bayramı' },
  { ay: 5, gun: 1, ad: 'Emek ve Dayanışma Günü' },
  { ay: 5, gun: 19, ad: 'Atatürk\'ü Anma, Gençlik ve Spor Bayramı' },
  { ay: 7, gun: 15, ad: 'Demokrasi ve Millî Birlik Günü' },
  { ay: 8, gun: 30, ad: 'Zafer Bayramı' },
  { ay: 10, gun: 29, ad: 'Cumhuriyet Bayramı' },
];

// ── DİNİ BAYRAMLAR (Hicri takvime göre değişken) ──
// Ramazan Bayramı (3 gün) + arife yarım gün
// Kurban Bayramı (4 gün) + arife yarım gün
const DINI_BAYRAMLAR: Record<number, {
  ramazan: string[]; ramazanArife: string;
  kurban: string[]; kurbanArife: string;
}> = {
  2024: {
    ramazan: ['04-10', '04-11', '04-12'], ramazanArife: '04-09',
    kurban: ['06-17', '06-18', '06-19', '06-20'], kurbanArife: '06-16',
  },
  2025: {
    ramazan: ['03-30', '03-31', '04-01'], ramazanArife: '03-29',
    kurban: ['06-06', '06-07', '06-08', '06-09'], kurbanArife: '06-05',
  },
  2026: {
    ramazan: ['03-20', '03-21', '03-22'], ramazanArife: '03-19',
    kurban: ['05-27', '05-28', '05-29', '05-30'], kurbanArife: '05-26',
  },
  2027: {
    ramazan: ['03-09', '03-10', '03-11'], ramazanArife: '03-08',
    kurban: ['05-16', '05-17', '05-18', '05-19'], kurbanArife: '05-15',
  },
  2028: {
    ramazan: ['02-26', '02-27', '02-28'], ramazanArife: '02-25',
    kurban: ['05-04', '05-05', '05-06', '05-07'], kurbanArife: '05-03',
  },
  2029: {
    ramazan: ['02-14', '02-15', '02-16'], ramazanArife: '02-13',
    kurban: ['04-24', '04-25', '04-26', '04-27'], kurbanArife: '04-23',
  },
  2030: {
    ramazan: ['02-04', '02-05', '02-06'], ramazanArife: '02-03',
    kurban: ['04-13', '04-14', '04-15', '04-16'], kurbanArife: '04-12',
  },
};

// ── ADLİ TATİL (HMK md.104, CMK md.331) ──
// Her yıl 20 Temmuz – 31 Ağustos
const ADLI_TATIL_BASLANGIC = { ay: 7, gun: 20 };
const ADLI_TATIL_BITIS = { ay: 8, gun: 31 };

// Adli tatil bitiminden sonraki ilk iş günü: 1 Eylül
// Süre uzaması: 7 Eylül'e kadar (HMK md.104/2)
const ADLI_TATIL_SURE_UZAMA_GUN = 7; // Eylül
const ADLI_TATIL_SURE_UZAMA_AY = 9; // Eylül

// ── HUKUK CAMİASI ÖZEL GÜNLERİ ──
const HUKUK_GUNLERI: Array<{ ay: number; gun: number; ad: string; tip: 'hukuk' | 'anma' }> = [
  { ay: 1, gun: 13, ad: 'Basın Onur Günü', tip: 'hukuk' },
  { ay: 4, gun: 5, ad: 'Avukatlar Günü', tip: 'hukuk' },
  { ay: 5, gun: 6, ad: 'Hıdrellez (geleneksel)', tip: 'hukuk' },
  { ay: 6, gun: 1, ad: 'Adli Yıl Kapanışı', tip: 'hukuk' },
  { ay: 9, gun: 1, ad: 'Adli Yıl Açılışı', tip: 'hukuk' },
  { ay: 10, gun: 6, ad: 'Dünya Avukatlar Günü', tip: 'hukuk' },
  { ay: 11, gun: 10, ad: 'Atatürk\'ü Anma Günü', tip: 'anma' },
  { ay: 11, gun: 26, ad: 'Dünya Arabuluculuk Günü', tip: 'hukuk' },
  { ay: 12, gun: 10, ad: 'İnsan Hakları Günü', tip: 'hukuk' },
];

// ────────────────────────────────────────────────────────────────
// PUBLIC API
// ────────────────────────────────────────────────────────────────

/**
 * Belirli bir tarih için tatil/özel gün bilgilerini döndürür
 * @param tarihStr 'YYYY-MM-DD' formatında tarih
 */
export function tatilBilgiGetir(tarihStr: string): TatilBilgi[] {
  const [yilStr, ayStr, gunStr] = tarihStr.split('-');
  const yil = parseInt(yilStr);
  const ay = parseInt(ayStr);
  const gun = parseInt(gunStr);
  const mmdd = `${ayStr}-${gunStr}`;
  const sonuclar: TatilBilgi[] = [];

  // Resmi tatiller
  for (const t of RESMI_TATILLER) {
    if (t.ay === ay && t.gun === gun) {
      sonuclar.push({ ad: t.ad, tip: 'resmi', renk: 'red' });
    }
  }

  // Dini bayramlar
  const yilDini = DINI_BAYRAMLAR[yil];
  if (yilDini) {
    if (yilDini.ramazanArife === mmdd) {
      sonuclar.push({ ad: 'Ramazan Bayramı Arifesi', tip: 'dini', renk: 'gold' });
    }
    const rIdx = yilDini.ramazan.indexOf(mmdd);
    if (rIdx !== -1) {
      sonuclar.push({ ad: `Ramazan Bayramı (${rIdx + 1}. gün)`, tip: 'dini', renk: 'gold' });
    }
    if (yilDini.kurbanArife === mmdd) {
      sonuclar.push({ ad: 'Kurban Bayramı Arifesi', tip: 'dini', renk: 'gold' });
    }
    const kIdx = yilDini.kurban.indexOf(mmdd);
    if (kIdx !== -1) {
      sonuclar.push({ ad: `Kurban Bayramı (${kIdx + 1}. gün)`, tip: 'dini', renk: 'gold' });
    }
  }

  // Adli tatil kontrolü
  const adliBasla = new Date(yil, ADLI_TATIL_BASLANGIC.ay - 1, ADLI_TATIL_BASLANGIC.gun);
  const adliBit = new Date(yil, ADLI_TATIL_BITIS.ay - 1, ADLI_TATIL_BITIS.gun);
  const buTarih = new Date(yil, ay - 1, gun);
  if (buTarih >= adliBasla && buTarih <= adliBit) {
    sonuclar.push({ ad: 'Adli Tatil', tip: 'adli', renk: 'blue' });
  }

  // Hukuk özel günleri
  for (const h of HUKUK_GUNLERI) {
    if (h.ay === ay && h.gun === gun) {
      sonuclar.push({ ad: h.ad, tip: h.tip, renk: h.tip === 'anma' ? 'gray' : 'green' });
    }
  }

  return sonuclar;
}

/**
 * Belirli bir ay için tüm tatil/özel gün bilgilerini map olarak döndürür
 * @param yil Yıl (ör: 2026)
 * @param ay 0-indexed ay (Ocak=0)
 */
export function ayTatilleri(yil: number, ay: number): Record<string, TatilBilgi[]> {
  const map: Record<string, TatilBilgi[]> = {};
  const gunSayisi = new Date(yil, ay + 1, 0).getDate();

  for (let g = 1; g <= gunSayisi; g++) {
    const tarih = `${yil}-${String(ay + 1).padStart(2, '0')}-${String(g).padStart(2, '0')}`;
    const bilgi = tatilBilgiGetir(tarih);
    if (bilgi.length > 0) map[tarih] = bilgi;
  }

  return map;
}

/**
 * Tarih resmi tatil/bayram/adli tatil mi? (iş günü hesaplamaları için)
 */
export function tatilMi(tarihStr: string): boolean {
  const bilgi = tatilBilgiGetir(tarihStr);
  return bilgi.some((b) => b.tip === 'resmi' || b.tip === 'dini' || b.tip === 'adli');
}

/**
 * Tarih adli tatil döneminde mi? (20 Temmuz – 31 Ağustos)
 */
export function adliTatilMi(tarihStr: string): boolean {
  const bilgi = tatilBilgiGetir(tarihStr);
  return bilgi.some((b) => b.tip === 'adli');
}

/**
 * Hafta sonu mu? (Cumartesi veya Pazar)
 */
export function haftaSonuMu(tarihStr: string): boolean {
  const d = new Date(tarihStr + 'T00:00:00');
  const gun = d.getDay();
  return gun === 0 || gun === 6;
}

/**
 * İş günü mü? (Hafta sonu veya resmi tatil/bayram DEĞİLSE iş günü)
 * Not: Adli tatil tek başına iş günü engeli değildir, ama süreleri etkiler
 */
export function isGunuMu(tarihStr: string): boolean {
  if (haftaSonuMu(tarihStr)) return false;
  const bilgi = tatilBilgiGetir(tarihStr);
  return !bilgi.some((b) => b.tip === 'resmi' || b.tip === 'dini');
}

/**
 * Adli Tatil Süre Uzaması Hesaplama (HMK md.104)
 *
 * Eğer bir yasal sürenin son günü adli tatile (20 Tem - 31 Ağu) denk gelirse,
 * süre adli tatilin bitiminden itibaren 1 hafta daha uzar → 7 Eylül
 *
 * @param sonGun 'YYYY-MM-DD' formatında sürenin orijinal son günü
 * @returns null ise uzama yok, string ise uzamış tarih
 */
export function adliTatilSureUzamasi(sonGun: string): string | null {
  if (!adliTatilMi(sonGun)) return null;
  const yil = parseInt(sonGun.split('-')[0]);
  // HMK md.104/2: Adli tatil süresi içinde biten süreler, adli tatilin
  // bittiği günden itibaren bir hafta uzamış sayılır.
  // Adli tatil bitişi: 31 Ağustos, +7 gün = 7 Eylül
  return `${yil}-${String(ADLI_TATIL_SURE_UZAMA_AY).padStart(2, '0')}-${String(ADLI_TATIL_SURE_UZAMA_GUN).padStart(2, '0')}`;
}

/**
 * Tatil tipine göre Tailwind renk sınıfları
 */
export function tatilRenkSiniflari(tip: TatilBilgi['tip']): string {
  switch (tip) {
    case 'resmi': return 'bg-red/10 text-red border-red/20';
    case 'dini': return 'bg-gold/10 text-gold border-gold/20';
    case 'adli': return 'bg-blue-400/10 text-blue-400 border-blue-400/20';
    case 'hukuk': return 'bg-green/10 text-green border-green/20';
    case 'anma': return 'bg-gray-400/10 text-gray-400 border-gray-400/20';
    default: return 'bg-surface2 text-text-muted border-border';
  }
}
