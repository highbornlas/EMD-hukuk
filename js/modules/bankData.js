// ================================================================
// LEXBASE — MERKEZI BANKA VERİSİ
// js/modules/bankData.js
//
// Türkiye'de faaliyet gösteren mevduat, katılım ve yatırım
// bankalarının tam listesi. IBAN kodu: TR + 2 kontrol + 5 banka
// kodu + 1 rezerv + 16 hesap = 26 karakter.
// Banka kodu: IBAN'ın 5-9. haneleri (0-index: 4-8).
// ================================================================

const BANKA_LISTESI = [
  // ── KAMU MEVDUAT BANKALARI ───────────────────────────────────
  { name: 'Türkiye Cumhuriyeti Ziraat Bankası A.Ş.',                          code: '00010', kisa: 'Ziraat'         },
  { name: 'Türkiye Halk Bankası A.Ş.',                                        code: '00012', kisa: 'Halkbank'       },
  { name: 'Türkiye Vakıflar Bankası T.A.O.',                                  code: '00015', kisa: 'Vakıfbank'      },

  // ── ÖZEL MEVDUAT BANKALARI ───────────────────────────────────
  { name: 'Akbank T.A.Ş.',                                                    code: '00046', kisa: 'Akbank'         },
  { name: 'Anadolubank A.Ş.',                                                 code: '00135', kisa: 'Anadolubank'    },
  { name: 'Fibabanka A.Ş.',                                                   code: '00103', kisa: 'Fibabanka'      },
  { name: 'Şekerbank T.A.Ş.',                                                 code: '00059', kisa: 'Şekerbank'      },
  { name: 'Turkish Bank A.Ş.',                                                code: '00096', kisa: 'Turkish Bank'   },
  { name: 'Türk Ekonomi Bankası A.Ş.',                                        code: '00032', kisa: 'TEB'            },
  { name: 'Türkiye Garanti Bankası A.Ş.',                                     code: '00062', kisa: 'Garanti BBVA'   },
  { name: 'Türkiye İş Bankası A.Ş.',                                          code: '00064', kisa: 'İş Bankası'     },
  { name: 'Yapı ve Kredi Bankası A.Ş.',                                       code: '00067', kisa: 'Yapı Kredi'     },

  // ── YABANCI SERMAYELİ MEVDUAT BANKALARI ─────────────────────
  { name: 'Alternatifbank A.Ş.',                                              code: '00132', kisa: 'Alternatifbank' },
  { name: 'Burgan Bank A.Ş.',                                                 code: '00143', kisa: 'Burgan Bank'    },
  { name: 'Citibank A.Ş.',                                                    code: '00092', kisa: 'Citibank'       },
  { name: 'Denizbank A.Ş.',                                                   code: '00134', kisa: 'Denizbank'      },
  { name: 'Deutsche Bank A.Ş.',                                               code: '00117', kisa: 'Deutsche Bank'  },
  { name: 'HSBC Bank A.Ş.',                                                   code: '00123', kisa: 'HSBC'           },
  { name: 'ICBC Turkey Bank A.Ş.',                                            code: '00196', kisa: 'ICBC Turkey'    },
  { name: 'ING Bank A.Ş.',                                                    code: '00098', kisa: 'ING Bank'       },
  { name: 'Intesa Sanpaolo S.p.A. Türkiye Merkez Şubesi',                     code: '00179', kisa: 'Intesa Sanpaolo'},
  { name: 'MUFG Bank Turkey A.Ş.',                                            code: '00176', kisa: 'MUFG Bank'      },
  { name: 'Odea Bank A.Ş.',                                                   code: '00168', kisa: 'Odeabank'       },
  { name: 'QNB Finansbank A.Ş.',                                              code: '00111', kisa: 'QNB Finansbank' },
  { name: 'Rabobank A.Ş.',                                                    code: '00180', kisa: 'Rabobank'       },
  { name: 'Bank of China Turkey A.Ş.',                                        code: '00204', kisa: 'Bank of China'  },

  // ── KATILIM BANKALARI ────────────────────────────────────────
  { name: 'Albaraka Türk Katılım Bankası A.Ş.',                               code: '00203', kisa: 'Albaraka Türk'  },
  { name: 'Kuveyt Türk Katılım Bankası A.Ş.',                                 code: '00200', kisa: 'Kuveyt Türk'    },
  { name: 'Türkiye Finans Katılım Bankası A.Ş.',                              code: '00205', kisa: 'Türkiye Finans' },
  { name: 'Ziraat Katılım Bankası A.Ş.',                                      code: '00210', kisa: 'Ziraat Katılım' },
  { name: 'Vakıf Katılım Bankası A.Ş.',                                       code: '00215', kisa: 'Vakıf Katılım'  },
  { name: 'Emlak Katılım Bankası A.Ş.',                                       code: '00216', kisa: 'Emlak Katılım'  },

  // ── KALKINMA VE YATIRIM BANKALARI ───────────────────────────
  { name: 'Türkiye Kalkınma ve Yatırım Bankası A.Ş.',                         code: '00116', kisa: 'TKYB'           },
  { name: 'Türkiye İhracat Kredi Bankası A.Ş. (Türk Eximbank)',               code: '00099', kisa: 'Eximbank'       },
  { name: 'Türkiye Sınai Kalkınma Bankası A.Ş.',                              code: '00110', kisa: 'TSKB'           },
  { name: 'İller Bankası A.Ş.',                                               code: '00150', kisa: 'İlbank'         },
  { name: 'Aktif Yatırım Bankası A.Ş.',                                       code: '00171', kisa: 'Aktif Yatırım'  },
  { name: 'Diler Yatırım Bankası A.Ş.',                                       code: '00164', kisa: 'Diler'          },
  { name: 'GSD Yatırım Bankası A.Ş.',                                         code: '00173', kisa: 'GSD'            },
  { name: 'Golden Global Yatırım Bankası A.Ş.',                               code: '00218', kisa: 'Golden Global'  },
  { name: 'Nurol Yatırım Bankası A.Ş.',                                       code: '00175', kisa: 'Nurol'          },
  { name: 'Pasha Yatırım Bankası A.Ş.',                                       code: '00219', kisa: 'Pasha'          },
  { name: 'BankPozitif Kredi ve Kalkınma Bankası A.Ş.',                       code: '00172', kisa: 'BankPozitif'    },
  { name: 'Merrill Lynch Yatırım Bank A.Ş.',                                  code: '00130', kisa: 'Merrill Lynch'  },
  { name: 'Standard Chartered Yatırım Bankası Türk A.Ş.',                     code: '00137', kisa: 'Standard Chartered'},

  // ── DİJİTAL / ÖDEME KURULUŞLARI ─────────────────────────────
  { name: 'Papara Elektronik Para A.Ş.',                                      code: '00208', kisa: 'Papara'         },
];

// Kod → banka nesnesi harita (hızlı arama için)
const BANKA_KOD_MAP = {};
BANKA_LISTESI.forEach(b => { BANKA_KOD_MAP[b.code] = b; });

/**
 * IBAN'dan banka kodunu çıkar (TR dahil 26 karakter, boşuksuz).
 * TR XX BBBBB R AAAAAAAAAAAAAAAA
 *  0  2   4   9 10
 * Banka kodu: index 4-8 (5 hane)
 */
function ibanBankaKoduCikar(iban) {
  const temiz = iban.replace(/\s/g, '').toUpperCase();
  if (temiz.length < 9) return null;
  return temiz.slice(4, 9);
}

/**
 * IBAN'dan bankayı bul. Null döner bulamazsa.
 */
function ibanBankaBul(iban) {
  const kod = ibanBankaKoduCikar(iban);
  return kod ? (BANKA_KOD_MAP[kod] || null) : null;
}
