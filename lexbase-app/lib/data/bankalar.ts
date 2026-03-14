export interface BankaInfo {
  ad: string;
  swift?: string;
  kod?: string; // banka kodu
}

export const BANKALAR: BankaInfo[] = [
  // === KAMU BANKALARI ===
  { ad: 'Ziraat Bankası', swift: 'TCZBTR2A', kod: '0010' },
  { ad: 'Halkbank', swift: 'TRHBTR2A', kod: '0012' },
  { ad: 'Vakıfbank', swift: 'TVBATR2A', kod: '0015' },
  { ad: 'İller Bankası', kod: '0013' },

  // === ÖZEL BANKALAR ===
  { ad: 'İş Bankası', swift: 'ISBKTR2A', kod: '0064' },
  { ad: 'Garanti BBVA', swift: 'TGBATRIS', kod: '0062' },
  { ad: 'Yapı Kredi', swift: 'YAPITRIS', kod: '0067' },
  { ad: 'Akbank', swift: 'AKBKTRIS', kod: '0046' },
  { ad: 'Denizbank', swift: 'DENITRIS', kod: '0134' },
  { ad: 'QNB Finansbank', swift: 'FABORTR2', kod: '0111' },
  { ad: 'TEB', swift: 'TEBUTRIS', kod: '0032' },
  { ad: 'Şekerbank', swift: 'SABORTR2', kod: '0059' },
  { ad: 'ING Türkiye', swift: 'INGBTRIS', kod: '0099' },
  { ad: 'HSBC Türkiye', swift: 'HABORTR2', kod: '0123' },
  { ad: 'Fibabanka', swift: 'FBHLTRIS', kod: '0103' },
  { ad: 'Anadolubank', swift: 'ANDLTRIS', kod: '0135' },
  { ad: 'Alternatifbank', swift: 'COBATRIS', kod: '0124' },
  { ad: 'Burgan Bank', swift: 'TARISTRI', kod: '0125' },
  { ad: 'Citibank', swift: 'CABORTR2', kod: '0092' },
  { ad: 'Turkish Bank', swift: 'TUBATRIS', kod: '0096' },
  { ad: 'Odeabank', swift: 'ODEATRIS', kod: '0146' },
  { ad: 'ICBC Turkey Bank', swift: 'ICBKTRIS', kod: '0208' },
  { ad: 'Pasha Yatırım Bankası', swift: 'PABORTR2', kod: '0210' },
  { ad: 'Bank of China Turkey', swift: 'BKCHTR2A', kod: '0218' },
  { ad: 'Rabobank', swift: 'RABOTRIS', kod: '0093' },
  { ad: 'Deutsche Bank', swift: 'DEUTTRXX', kod: '0082' },
  { ad: 'Société Générale', swift: 'SGSBTR2X', kod: '0100' },
  { ad: 'JPMorgan Chase', swift: 'CABORTR1', kod: '0091' },
  { ad: 'Habib Bank', swift: 'HABBTRIS', kod: '0145' },
  { ad: 'Intesa Sanpaolo', swift: 'ISABTR2A', kod: '0098' },

  // === KALKINMA VE YATIRIM BANKALARI ===
  { ad: 'İlbank (İller Bankası)', kod: '0013' },
  { ad: 'Türkiye Kalkınma ve Yatırım Bankası', swift: 'TKYBTR2A', kod: '0016' },
  { ad: 'İstanbul Takas ve Saklama Bankası (Takasbank)', swift: 'TAKBTR2A', kod: '0022' },
  { ad: 'Türk Eximbank', swift: 'TEBUTR2A', kod: '0019' },
  { ad: 'Aktif Yatırım Bankası', swift: 'CAABORTR', kod: '0143' },
  { ad: 'GSD Yatırım Bankası', swift: 'GSDITRIS', kod: '0137' },
  { ad: 'Diler Yatırım Bankası', swift: 'DABATRIS', kod: '0138' },
  { ad: 'Nurol Yatırım Bankası', swift: 'NORATRIS', kod: '0141' },
  { ad: 'Merrill Lynch', swift: 'MLYMTR2A', kod: '0142' },
  { ad: 'Standard Chartered Yatırım Bankası', swift: 'SCBLTRIS', kod: '0121' },
  { ad: 'Goldbank', kod: '0136' },
  { ad: 'İstanbul Settlement and Custody Bank', kod: '0022' },
  { ad: 'BankPozitif', swift: 'BPOSTRIS', kod: '0139' },
  { ad: 'Pasha Yatırım Bankası', swift: 'PASHTRIS', kod: '0210' },

  // === KATILIM BANKALARI ===
  { ad: 'Kuveyt Türk', swift: 'KTEFTRIS', kod: '0205' },
  { ad: 'Türkiye Finans', swift: 'AFKBTRIS', kod: '0206' },
  { ad: 'Albaraka Türk', swift: 'BTFHTRIS', kod: '0203' },
  { ad: 'Ziraat Katılım', swift: 'ZTKATR2A', kod: '0209' },
  { ad: 'Vakıf Katılım', swift: 'VAKFTR21', kod: '0210' },
  { ad: 'Emlak Katılım', swift: 'EMKBTR2A', kod: '0212' },

  // === DİJİTAL / NEO BANKALAR ===
  { ad: 'Hayat Finans', kod: '0214' },
  { ad: 'N Kolay (İş Bankası)', kod: '0064' },
  { ad: 'Enpara (QNB Finansbank)', kod: '0111' },
  { ad: 'Papara', kod: '0216' },
  { ad: 'Moka (İyzico)', kod: '' },
  { ad: 'Tosla (Akbank)', kod: '0046' },
  { ad: 'Param', kod: '' },
  { ad: 'Colendi', kod: '' },
  { ad: 'Sipay', kod: '' },

  // === DİĞER ===
  { ad: 'PTT (Posta ve Telgraf Teşkilatı)', kod: '0017' },
];
