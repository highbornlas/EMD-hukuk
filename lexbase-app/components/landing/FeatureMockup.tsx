/* ═══════════════════════════════════════════════════════════════
   Feature Mockup — 6 farklı mini dashboard görünümü
   Türkçe random hukuk verileriyle gerçek uygulama gibi
   ═══════════════════════════════════════════════════════════════ */

const CELL = 'text-[8px] sm:text-[9px] px-2 sm:px-3 py-1.5 sm:py-2';
const HDR = `${CELL} text-white/25 uppercase tracking-wider font-medium`;
const ROW_BORDER = 'border-b border-white/[0.03] last:border-0';
const BADGE = 'px-1.5 py-0.5 rounded text-[7px] sm:text-[8px] font-medium';
const CARD_BG = 'bg-white/[0.03] rounded-lg border border-white/[0.05] p-2 sm:p-3';

/* ── 1. Müvekkil Yönetimi ── */
function MuvekkilMockup() {
  const muvekkiller = [
    { ad: 'Ahmet Yılmaz', tc: '312•••••42', tip: 'Gerçek', tel: '0532 814 ••••', dosya: 3, sel: true },
    { ad: 'Fatma Demir', tc: '456•••••18', tip: 'Gerçek', tel: '0544 271 ••••', dosya: 1, sel: false },
    { ad: 'Altın Yapı A.Ş.', tc: '912•••••00', tip: 'Tüzel', tel: '0212 456 ••••', dosya: 5, sel: false },
    { ad: 'Mehmet Kara', tc: '789•••••55', tip: 'Gerçek', tel: '0505 933 ••••', dosya: 2, sel: false },
  ];

  return (
    <div className="flex gap-2 sm:gap-3 h-full">
      {/* Tablo */}
      <div className="flex-1 bg-white/[0.02] rounded-lg border border-white/[0.05] overflow-hidden">
        <div className={`grid grid-cols-5 ${ROW_BORDER}`}>
          {['Ad Soyad', 'TC / Vergi', 'Tip', 'Telefon', 'Dosya'].map(h => <div key={h} className={HDR}>{h}</div>)}
        </div>
        {muvekkiller.map(m => (
          <div key={m.ad} className={`grid grid-cols-5 ${ROW_BORDER} ${m.sel ? 'bg-[#D4AF37]/[0.05]' : ''}`}>
            <div className={`${CELL} text-white/50 font-medium`}>{m.ad}</div>
            <div className={`${CELL} text-white/25 font-mono`}>{m.tc}</div>
            <div className={CELL}>
              <span className={`${BADGE} ${m.tip === 'Tüzel' ? 'bg-blue-500/15 text-blue-400' : 'bg-emerald-500/15 text-emerald-400'}`}>{m.tip}</span>
            </div>
            <div className={`${CELL} text-white/25`}>{m.tel}</div>
            <div className={`${CELL} text-[#D4AF37] font-bold`}>{m.dosya}</div>
          </div>
        ))}
      </div>

      {/* Mini profil */}
      <div className="w-28 sm:w-32 hidden sm:block bg-white/[0.02] rounded-lg border border-white/[0.05] p-2 sm:p-3">
        <div className="w-8 h-8 bg-[#D4AF37]/10 rounded-full flex items-center justify-center text-xs text-[#D4AF37] font-bold mb-2">AY</div>
        <div className="text-[9px] text-white/60 font-semibold mb-0.5">Ahmet Yılmaz</div>
        <div className="text-[7px] text-white/20 mb-3">Gerçek Kişi</div>
        <div className="space-y-1.5">
          {[['📞', '0532 814 ••'], ['📧', 'ahmet@•••'], ['📁', '3 Dosya']].map(([i, v]) => (
            <div key={v} className="flex items-center gap-1.5 text-[7px] text-white/25"><span className="text-[8px]">{i}</span>{v}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 2. Dava Yönetimi ── */
function DavaMockup() {
  const davalar = [
    { no: '2026/1247', mahkeme: 'İst. 3. Asliye Hukuk', muv: 'A. Yılmaz', tarih: '15.04', durum: 'Aktif', cls: 'bg-emerald-500/15 text-emerald-400' },
    { no: '2026/0934', mahkeme: 'Kadıköy 2. İş Mhk.', muv: 'F. Demir', tarih: '22.04', durum: 'Beklemede', cls: 'bg-[#D4AF37]/15 text-[#D4AF37]' },
    { no: '2025/2108', mahkeme: 'Ankara 7. Ticaret', muv: 'Altın Yapı A.Ş.', tarih: '—', durum: 'Kapandı', cls: 'bg-red-500/15 text-red-400' },
    { no: '2026/0412', mahkeme: 'İst. 12. Aile Mhk.', muv: 'M. Kara', tarih: '08.05', durum: 'Aktif', cls: 'bg-emerald-500/15 text-emerald-400' },
  ];

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* Tablo */}
      <div className="bg-white/[0.02] rounded-lg border border-white/[0.05] overflow-hidden">
        <div className={`grid grid-cols-5 ${ROW_BORDER}`}>
          {['Dosya No', 'Mahkeme', 'Müvekkil', 'Duruşma', 'Durum'].map(h => <div key={h} className={HDR}>{h}</div>)}
        </div>
        {davalar.map(d => (
          <div key={d.no} className={`grid grid-cols-5 ${ROW_BORDER}`}>
            <div className={`${CELL} text-white/30 font-mono`}>{d.no}</div>
            <div className={`${CELL} text-white/40`}>{d.mahkeme}</div>
            <div className={`${CELL} text-white/40`}>{d.muv}</div>
            <div className={`${CELL} text-white/25`}>{d.tarih}</div>
            <div className={CELL}><span className={`${BADGE} ${d.cls}`}>{d.durum}</span></div>
          </div>
        ))}
      </div>

      {/* Alt KPI */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { l: 'Vekâlet Ücreti', v: '₺145.000', c: '#D4AF37' },
          { l: 'Tahsilat', v: '₺82.000', c: '#2ecc71' },
          { l: 'Kalan', v: '₺63.000', c: '#e74c3c' },
        ].map(k => (
          <div key={k.l} className={CARD_BG}>
            <div className="text-[7px] text-white/20 uppercase tracking-wider mb-0.5">{k.l}</div>
            <div className="text-[10px] sm:text-xs font-bold font-[var(--font-playfair)]" style={{ color: k.c }}>{k.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 3. İcra Takibi ── */
function IcraMockup() {
  const dosyalar = [
    { no: '2026/E-347', daire: 'Kadıköy 2. İcra', tur: 'İlamlı', alacak: 85000, tahsilat: 35000 },
    { no: '2026/E-128', daire: 'İst. 5. İcra', tur: 'İlamsız', alacak: 42000, tahsilat: 42000 },
    { no: '2025/E-891', daire: 'Bakırköy 1. İcra', tur: 'Kambiyo', alacak: 120000, tahsilat: 58000 },
  ];

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="bg-white/[0.02] rounded-lg border border-white/[0.05] overflow-hidden">
        <div className={`grid grid-cols-6 ${ROW_BORDER}`}>
          {['Dosya No', 'İcra Dairesi', 'Tür', 'Alacak', 'Tahsilat', 'Kalan'].map(h => <div key={h} className={HDR}>{h}</div>)}
        </div>
        {dosyalar.map(d => {
          const kalan = d.alacak - d.tahsilat;
          const oran = Math.round((d.tahsilat / d.alacak) * 100);
          return (
            <div key={d.no} className={`grid grid-cols-6 ${ROW_BORDER}`}>
              <div className={`${CELL} text-white/30 font-mono`}>{d.no}</div>
              <div className={`${CELL} text-white/40`}>{d.daire}</div>
              <div className={CELL}><span className={`${BADGE} bg-purple-500/15 text-purple-400`}>{d.tur}</span></div>
              <div className={`${CELL} text-white/40`}>₺{(d.alacak / 1000).toFixed(0)}K</div>
              <div className={`${CELL} text-emerald-400`}>₺{(d.tahsilat / 1000).toFixed(0)}K</div>
              <div className={CELL}>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[8px] ${kalan === 0 ? 'text-emerald-400' : 'text-red-400'}`}>₺{(kalan / 1000).toFixed(0)}K</span>
                  <div className="w-10 h-1 bg-white/[0.06] rounded-full overflow-hidden hidden sm:block">
                    <div className="h-full bg-emerald-500/50 rounded-full" style={{ width: `${oran}%` }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toplam progress */}
      <div className={`${CARD_BG} flex items-center gap-3`}>
        <div className="flex-1">
          <div className="flex justify-between text-[7px] text-white/25 mb-1"><span>Toplam Tahsilat</span><span>55%</span></div>
          <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#D4AF37] to-emerald-500 rounded-full" style={{ width: '55%' }} />
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] sm:text-xs font-bold text-[#D4AF37] font-[var(--font-playfair)]">₺135K</div>
          <div className="text-[7px] text-white/20">/ ₺247K</div>
        </div>
      </div>
    </div>
  );
}

/* ── 4. Finans & Raporlama ── */
function FinansMockup() {
  const aylar = [
    { ay: 'Oca', gelir: 45, gider: 28 },
    { ay: 'Şub', gelir: 62, gider: 31 },
    { ay: 'Mar', gelir: 38, gider: 25 },
    { ay: 'Nis', gelir: 71, gider: 35 },
    { ay: 'May', gelir: 55, gider: 29 },
    { ay: 'Haz', gelir: 84, gider: 42 },
  ];
  const maxVal = 90;

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* KPI */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { l: 'Toplam Gelir', v: '₺355K', c: '#2ecc71', icon: '↑' },
          { l: 'Toplam Gider', v: '₺190K', c: '#e74c3c', icon: '↓' },
          { l: 'Net Kâr', v: '₺165K', c: '#D4AF37', icon: '★' },
        ].map(k => (
          <div key={k.l} className={CARD_BG}>
            <div className="flex items-center gap-1 mb-1">
              <span className="text-[8px]" style={{ color: k.c }}>{k.icon}</span>
              <span className="text-[7px] text-white/20 uppercase tracking-wider">{k.l}</span>
            </div>
            <div className="text-xs sm:text-sm font-bold font-[var(--font-playfair)]" style={{ color: k.c }}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className={`${CARD_BG}`}>
        <div className="text-[8px] text-white/25 mb-2 font-medium">Aylık Gelir vs Gider (₺1.000)</div>
        <div className="flex items-end gap-1.5 sm:gap-2 h-20 sm:h-24">
          {aylar.map(a => (
            <div key={a.ay} className="flex-1 flex flex-col items-center gap-0.5">
              <div className="w-full flex gap-[2px] items-end h-16 sm:h-20">
                <div className="flex-1 bg-emerald-500/30 rounded-t" style={{ height: `${(a.gelir / maxVal) * 100}%` }} />
                <div className="flex-1 bg-red-500/25 rounded-t" style={{ height: `${(a.gider / maxVal) * 100}%` }} />
              </div>
              <span className="text-[6px] sm:text-[7px] text-white/20">{a.ay}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/[0.04]">
          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-500/30 rounded-sm" /><span className="text-[7px] text-white/20">Gelir</span></div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500/25 rounded-sm" /><span className="text-[7px] text-white/20">Gider</span></div>
        </div>
      </div>
    </div>
  );
}

/* ── 5. Takvim & Uyarılar ── */
function TakvimMockup() {
  // Mart 2026 mini takvim
  const gunler = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];
  // Mart 1 = Pazar → offset 6 (0-indexed from Pazartesi)
  const offset = 6;
  const toplamGun = 31;
  const etkinlikGunler: Record<number, string> = { 5: '#e74c3c', 12: '#D4AF37', 15: '#e74c3c', 18: '#D4AF37', 22: '#3b82f6', 27: '#2ecc71' };

  const etkinlikler = [
    { tarih: '15 Mart', baslik: 'Duruşma: Yılmaz / İş Hukuku', renk: '#e74c3c', saat: '10:30' },
    { tarih: '18 Mart', baslik: 'İtiraz Son Gün — Kara Dosyası', renk: '#D4AF37', saat: '—' },
    { tarih: '22 Mart', baslik: 'Bilirkişi Raporu Teslim', renk: '#3b82f6', saat: '16:00' },
    { tarih: '27 Mart', baslik: 'Arabuluculuk Toplantısı', renk: '#2ecc71', saat: '14:00' },
  ];

  return (
    <div className="flex gap-2 sm:gap-3 h-full">
      {/* Mini takvim */}
      <div className="flex-1 bg-white/[0.02] rounded-lg border border-white/[0.05] p-2 sm:p-3">
        <div className="text-[9px] text-white/50 font-semibold mb-2">Mart 2026</div>
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {gunler.map(g => <div key={g} className="text-center text-[6px] sm:text-[7px] text-white/20 font-medium py-0.5">{g}</div>)}
          {Array.from({ length: offset }, (_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: toplamGun }, (_, i) => {
            const gun = i + 1;
            const renk = etkinlikGunler[gun];
            const bugun = gun === 13;
            return (
              <div key={gun} className={`text-center text-[7px] sm:text-[8px] py-0.5 sm:py-1 rounded relative ${bugun ? 'bg-[#D4AF37]/20 text-[#D4AF37] font-bold' : 'text-white/30'}`}>
                {gun}
                {renk && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: renk }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Etkinlik listesi */}
      <div className="w-36 sm:w-40 bg-white/[0.02] rounded-lg border border-white/[0.05] p-2 sm:p-3 hidden sm:block">
        <div className="text-[8px] text-white/30 uppercase tracking-wider font-medium mb-2">Yaklaşan</div>
        <div className="space-y-2">
          {etkinlikler.map(e => (
            <div key={e.baslik} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={{ background: e.renk }} />
              <div>
                <div className="text-[7px] text-white/20">{e.tarih} — {e.saat}</div>
                <div className="text-[8px] text-white/45 leading-snug">{e.baslik}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 6. Ekip & Yetki ── */
function EkipMockup() {
  const uyeler = [
    { ad: 'Av. Mehmet Kaya', rol: 'Kurucu Ortak', badge: 'bg-[#D4AF37]/15 text-[#D4AF37]', moduller: [true, true, true, true, true] },
    { ad: 'Av. Zeynep Aksoy', rol: 'Avukat', badge: 'bg-blue-500/15 text-blue-400', moduller: [true, true, true, true, false] },
    { ad: 'Selin Yurt', rol: 'Stajyer', badge: 'bg-purple-500/15 text-purple-400', moduller: [true, true, false, false, false] },
    { ad: 'Ayşe Polat', rol: 'Sekreter', badge: 'bg-emerald-500/15 text-emerald-400', moduller: [true, false, false, false, false] },
  ];
  const moduller = ['Müvekkil', 'Dava', 'İcra', 'Finans', 'Ayarlar'];

  return (
    <div className="bg-white/[0.02] rounded-lg border border-white/[0.05] overflow-hidden">
      {/* Header */}
      <div className={`grid grid-cols-[1fr_80px_repeat(5,28px)] ${ROW_BORDER} items-center`}>
        <div className={HDR}>Ekip Üyesi</div>
        <div className={HDR}>Rol</div>
        {moduller.map(m => <div key={m} className={`${HDR} text-center !px-0`} title={m}>{m.charAt(0)}</div>)}
      </div>
      {uyeler.map(u => (
        <div key={u.ad} className={`grid grid-cols-[1fr_80px_repeat(5,28px)] ${ROW_BORDER} items-center`}>
          <div className={`${CELL} text-white/50 font-medium`}>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-white/[0.06] rounded-full flex items-center justify-center text-[7px] text-white/30 flex-shrink-0">
                {u.ad.split(' ').slice(-1)[0].charAt(0)}
              </div>
              <span className="truncate">{u.ad}</span>
            </div>
          </div>
          <div className={CELL}><span className={`${BADGE} ${u.badge}`}>{u.rol}</span></div>
          {u.moduller.map((aktif, i) => (
            <div key={i} className={`${CELL} text-center !px-0`}>
              {aktif
                ? <span className="text-[#D4AF37] text-[10px]">✓</span>
                : <span className="text-white/10 text-[10px]">✗</span>
              }
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── Ana Bileşen ── */
const MOCKUP_MAP: Record<string, React.FC> = {
  muvekkil: MuvekkilMockup,
  dava: DavaMockup,
  icra: IcraMockup,
  finans: FinansMockup,
  takvim: TakvimMockup,
  ekip: EkipMockup,
};

interface FeatureMockupProps {
  featureKey: string;
  className?: string;
}

export function FeatureMockup({ featureKey, className = '' }: FeatureMockupProps) {
  const Mockup = MOCKUP_MAP[featureKey];

  return (
    <div className={`relative ${className}`}>
      <div className="relative bg-[#0D1117] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-[#D4AF37]/15 transition-all duration-500 group">
        {/* Browser chrome bar */}
        <div className="bg-[#131820] px-3 py-2 flex items-center gap-2 border-b border-white/[0.05]">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-[#e74c3c]/60" />
            <div className="w-2 h-2 rounded-full bg-[#f39c12]/60" />
            <div className="w-2 h-2 rounded-full bg-[#2ecc71]/60" />
          </div>
          <div className="flex-1 text-center text-[8px] text-white/15">lexbase.app</div>
        </div>
        {/* İçerik */}
        <div className="p-3 sm:p-4 min-h-[200px] sm:min-h-[240px]">
          {Mockup ? <Mockup /> : <div className="text-white/20 text-sm text-center py-8">Mockup yükleniyor...</div>}
        </div>
      </div>
      {/* Glow */}
      <div className="absolute -inset-4 bg-[#D4AF37]/[0.02] rounded-3xl blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
}
