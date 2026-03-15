'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  useTumEtkinlikler,
  useEtkinlikler,
  cakismaTespit,
  TUR_RENK,
  TUR_IKON,
  type Etkinlik,
} from '@/lib/hooks/useEtkinlikler';
import { useMuvekkillar } from '@/lib/hooks/useMuvekkillar';
import { usePersoneller } from '@/lib/hooks/usePersonel';
import { EtkinlikModal } from '@/components/modules/EtkinlikModal';
import { SkeletonTable } from '@/components/ui/SkeletonTable';
import { fmtTarih } from '@/lib/utils';
import { ayTatilleri, tatilRenkSiniflari, type TatilBilgi } from '@/lib/data/tatiller';

const GUNLER = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const AYLAR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

// ── Filtre türleri ──
type FiltreTur = '' | 'Duruşma' | 'Görev' | 'Son Gün' | 'İtiraz Son Gün' | 'Oturum' | 'İhtarname Süresi' | 'Teslim Tarihi' | 'Toplantı' | 'Müvekkil Görüşmesi' | 'sanal' | 'gercek';

export default function TakvimPage() {
  useEffect(() => { document.title = 'Takvim | LexBase'; }, []);

  const tumEtkinlikler = useTumEtkinlikler();
  const { isLoading } = useEtkinlikler();
  const { data: muvekkillar } = useMuvekkillar();
  const { data: personeller } = usePersoneller();

  const bugun = new Date();
  const [yil, setYil] = useState(bugun.getFullYear());
  const [ay, setAy] = useState(bugun.getMonth());
  const [modalAcik, setModalAcik] = useState(false);
  const [seciliEtkinlik, setSeciliEtkinlik] = useState<Etkinlik | null>(null);
  const [seciliGun, setSeciliGun] = useState<string | null>(null);
  const [prefillTarih, setPrefillTarih] = useState<string>('');
  const [arama, setArama] = useState('');
  const [filtre, setFiltre] = useState<FiltreTur>('');

  // ── Yardımcı map'ler ──
  const muvAdMap = useMemo(() => {
    const map: Record<string, string> = {};
    muvekkillar?.forEach((m) => { map[m.id] = m.ad || '?'; });
    return map;
  }, [muvekkillar]);

  const personelAdMap = useMemo(() => {
    const map: Record<string, string> = {};
    personeller?.forEach((p) => { map[p.id] = p.ad || p.email || '?'; });
    return map;
  }, [personeller]);

  // ── Filtrelenmiş etkinlikler ──
  const filtrelenmis = useMemo(() => {
    let liste = tumEtkinlikler;

    // Arama
    if (arama.trim()) {
      const q = arama.toLocaleLowerCase('tr');
      liste = liste.filter((e) =>
        (e.baslik || '').toLocaleLowerCase('tr').includes(q) ||
        (e.yer || '').toLocaleLowerCase('tr').includes(q) ||
        (e.not as string || '').toLocaleLowerCase('tr').includes(q) ||
        (e.muvId && muvAdMap[e.muvId]?.toLocaleLowerCase('tr').includes(q))
      );
    }

    // Tür filtresi
    if (filtre === 'sanal') {
      liste = liste.filter((e) => e.sanal);
    } else if (filtre === 'gercek') {
      liste = liste.filter((e) => !e.sanal);
    } else if (filtre) {
      liste = liste.filter((e) => e.tur === filtre);
    }

    return liste;
  }, [tumEtkinlikler, arama, filtre, muvAdMap]);

  // ── Bu ayın tatilleri ──
  const tatilMap = useMemo(() => ayTatilleri(yil, ay), [yil, ay]);

  // ── Takvim grid hesaplama ──
  const grid = useMemo(() => {
    const ilkGun = new Date(yil, ay, 1);
    const sonGun = new Date(yil, ay + 1, 0);
    const baslangicGunu = (ilkGun.getDay() + 6) % 7;
    const toplamGun = sonGun.getDate();

    const hucreler: Array<{
      gun: number | null;
      tarih: string;
      etkinlikler: Etkinlik[];
      tatiller: TatilBilgi[];
      haftaSonu: boolean;
    }> = [];

    for (let i = 0; i < baslangicGunu; i++) {
      hucreler.push({ gun: null, tarih: '', etkinlikler: [], tatiller: [], haftaSonu: false });
    }

    for (let g = 1; g <= toplamGun; g++) {
      const tarih = `${yil}-${String(ay + 1).padStart(2, '0')}-${String(g).padStart(2, '0')}`;
      const gunEtkinlikleri = filtrelenmis.filter((e) => e.tarih === tarih);
      const gunTatilleri = tatilMap[tarih] || [];
      const d = new Date(yil, ay, g);
      const haftaSonu = d.getDay() === 0 || d.getDay() === 6;
      hucreler.push({ gun: g, tarih, etkinlikler: gunEtkinlikleri, tatiller: gunTatilleri, haftaSonu });
    }

    return hucreler;
  }, [yil, ay, filtrelenmis, tatilMap]);

  // ── Seçili günün detayı ──
  const seciliGunDetay = useMemo(() => {
    if (!seciliGun) return null;
    const etkinlikler = filtrelenmis
      .filter((e) => e.tarih === seciliGun)
      .sort((a, b) => (a.saat || '99:99').localeCompare(b.saat || '99:99'));
    const tatiller = tatilMap[seciliGun] || [];
    const cakismalar = cakismaTespit(filtrelenmis, seciliGun);
    return { etkinlikler, tatiller, cakismalar };
  }, [seciliGun, filtrelenmis, tatilMap]);

  // ── Yaklaşan etkinlikler (sidebar, gelecek 21 gün) ──
  const yaklasan = useMemo(() => {
    const bugunStr = bugun.toISOString().split('T')[0];
    const sinir = new Date();
    sinir.setDate(sinir.getDate() + 21);
    const sinirStr = sinir.toISOString().split('T')[0];
    return filtrelenmis
      .filter((e) => e.tarih && e.tarih >= bugunStr && e.tarih <= sinirStr)
      .sort((a, b) => (a.tarih || '').localeCompare(b.tarih || '') || (a.saat || '').localeCompare(b.saat || ''))
      .slice(0, 20);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtrelenmis]);

  const bugunStr = bugun.toISOString().split('T')[0];

  // ── Navigasyon ──
  const oncekiAy = useCallback(() => {
    if (ay === 0) { setAy(11); setYil(yil - 1); }
    else setAy(ay - 1);
  }, [ay, yil]);

  const sonrakiAy = useCallback(() => {
    if (ay === 11) { setAy(0); setYil(yil + 1); }
    else setAy(ay + 1);
  }, [ay, yil]);

  const bugunGit = useCallback(() => {
    setYil(bugun.getFullYear());
    setAy(bugun.getMonth());
    setSeciliGun(bugunStr);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Etkinlik tıklama
  function etkinlikAc(e: Etkinlik) {
    setSeciliEtkinlik(e);
    setModalAcik(true);
  }

  // Hücre tıklama (boş alana tıklayınca)
  function hucreAc(tarih: string) {
    setSeciliGun(tarih);
  }

  // Yeni etkinlik (tarih prefill)
  function yeniEtkinlik(tarih?: string) {
    setSeciliEtkinlik(null);
    setPrefillTarih(tarih || '');
    setModalAcik(true);
  }

  // Filtre butonları
  const filtreler: Array<{ value: FiltreTur; label: string }> = [
    { value: '', label: 'Tümü' },
    { value: 'gercek', label: 'Manuel' },
    { value: 'sanal', label: 'Otomatik' },
    { value: 'Duruşma', label: '⚖️ Duruşma' },
    { value: 'Görev', label: '📋 Görev' },
    { value: 'Son Gün', label: '⏰ Son Gün' },
    { value: 'İtiraz Son Gün', label: '⚠️ İtiraz' },
    { value: 'Toplantı', label: '👥 Toplantı' },
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="font-[var(--font-playfair)] text-2xl text-text font-bold mb-6">Takvim</h1>
        <SkeletonTable rows={8} cols={7} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-[var(--font-playfair)] text-2xl text-text font-bold">Takvim</h1>
        <div className="flex items-center gap-2">
          {/* Arama */}
          <div className="relative">
            <input
              type="text"
              value={arama}
              onChange={(e) => setArama(e.target.value)}
              placeholder="Etkinlik ara..."
              className="w-48 pl-7 pr-3 py-1.5 bg-surface2 border border-border rounded-lg text-xs text-text placeholder:text-text-dim focus:outline-none focus:border-gold/40"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-dim text-xs">🔍</span>
          </div>
          <button
            onClick={() => yeniEtkinlik()}
            className="px-4 py-2 bg-gold text-bg font-semibold rounded-lg text-xs hover:bg-gold-light transition-colors"
          >
            + Yeni Etkinlik
          </button>
        </div>
      </div>

      {/* Filtreler */}
      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
        {filtreler.map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltre(f.value)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
              filtre === f.value
                ? 'bg-gold/20 text-gold border-gold/30'
                : 'bg-surface2 text-text-muted border-border hover:text-text'
            }`}
          >
            {f.label}
          </button>
        ))}
        {(arama || filtre) && (
          <button
            onClick={() => { setArama(''); setFiltre(''); }}
            className="px-2 py-1 text-[11px] text-red hover:text-red/80"
          >
            ✕ Temizle
          </button>
        )}
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-4 flex-1">
        {/* ── TAKVİM GRİD ── */}
        <div className="bg-surface border border-border rounded-lg p-4">
          {/* Ay Navigasyonu */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={oncekiAy} className="px-3 py-1.5 bg-surface2 border border-border rounded-lg text-xs text-text-muted hover:text-text transition-colors">
              ‹ Önceki
            </button>
            <div className="flex items-center gap-3">
              <h2 className="font-[var(--font-playfair)] text-lg text-text font-bold">
                {AYLAR[ay]} {yil}
              </h2>
              <button onClick={bugunGit} className="px-2 py-1 text-[10px] bg-gold-dim text-gold rounded border border-gold/20 hover:bg-gold hover:text-bg transition-colors">
                Bugün
              </button>
            </div>
            <button onClick={sonrakiAy} className="px-3 py-1.5 bg-surface2 border border-border rounded-lg text-xs text-text-muted hover:text-text transition-colors">
              Sonraki ›
            </button>
          </div>

          {/* Gün başlıkları */}
          <div className="grid grid-cols-7 gap-px mb-1">
            {GUNLER.map((g, i) => (
              <div key={g} className={`text-center text-[11px] font-medium py-1 ${
                i >= 5 ? 'text-text-dim' : 'text-text-muted'
              }`}>{g}</div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-px">
            {grid.map((hucre, i) => {
              const isBugun = hucre.tarih === bugunStr;
              const isSecili = hucre.tarih === seciliGun;
              const hasTatil = hucre.tatiller.length > 0;
              const hasAdliTatil = hucre.tatiller.some((t) => t.tip === 'adli');
              const hasResmiTatil = hucre.tatiller.some((t) => t.tip === 'resmi' || t.tip === 'dini');

              return (
                <div
                  key={i}
                  onClick={() => hucre.gun !== null && hucreAc(hucre.tarih)}
                  className={`min-h-[90px] p-1 border rounded cursor-pointer transition-colors ${
                    hucre.gun === null
                      ? 'bg-transparent border-transparent'
                      : isSecili
                        ? 'bg-gold-dim border-gold/40 ring-1 ring-gold/20'
                        : isBugun
                          ? 'bg-gold-dim border-gold/30'
                          : hasResmiTatil
                            ? 'bg-red/5 border-red/10'
                            : hasAdliTatil
                              ? 'bg-blue-400/5 border-blue-400/10'
                              : hucre.haftaSonu
                                ? 'bg-surface2/30 border-border/20 hover:bg-surface2/50'
                                : 'bg-surface2/50 border-border/30 hover:bg-surface2'
                  }`}
                >
                  {hucre.gun !== null && (
                    <>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-[11px] font-medium ${
                          isBugun ? 'text-gold font-bold' :
                          hasResmiTatil ? 'text-red font-bold' :
                          hucre.haftaSonu ? 'text-text-dim' : 'text-text-muted'
                        }`}>
                          {hucre.gun}
                        </span>
                        {hasTatil && (
                          <span
                            className="text-[8px] leading-none"
                            title={hucre.tatiller.map((t) => t.ad).join(', ')}
                          >
                            {hasResmiTatil ? '🔴' : hasAdliTatil ? '🔵' : '🟢'}
                          </span>
                        )}
                      </div>

                      {/* Tatil adı (kısa) */}
                      {hucre.tatiller.filter((t) => t.tip === 'resmi' || t.tip === 'dini').slice(0, 1).map((t, ti) => (
                        <div key={ti} className="text-[8px] text-red/80 truncate mb-0.5 leading-tight">
                          {t.ad}
                        </div>
                      ))}

                      {/* Etkinlikler */}
                      {hucre.etkinlikler.slice(0, 3).map((e) => (
                        <div
                          key={e.id}
                          onClick={(ev) => { ev.stopPropagation(); etkinlikAc(e); }}
                          className={`text-[9px] px-1 py-0.5 rounded mb-0.5 truncate border cursor-pointer hover:opacity-80 ${
                            e.adliTatilUzama && e.id.endsWith('-uzama')
                              ? 'bg-amber-500/15 text-amber-500 border-amber-500/30 border-dashed'
                              : TUR_RENK[e.tur || ''] || TUR_RENK['Diğer']
                          } ${e.sanal ? 'border-dashed' : ''}`}
                          title={`${e.saat ? e.saat + ' ' : ''}${e.baslik}${e.adliTatilUzama ? ' (Adli tatil uzaması)' : ''}`}
                        >
                          {e.saat && <span className="font-bold">{e.saat} </span>}
                          {(TUR_IKON[e.tur || ''] || '') + ' '}
                          {e.baslik}
                        </div>
                      ))}
                      {hucre.etkinlikler.length > 3 && (
                        <div className="text-[9px] text-text-dim text-center font-medium">
                          +{hucre.etkinlikler.length - 3} daha
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── SIDEBAR ── */}
        <div className="space-y-4">
          {/* Seçili Gün Detayı */}
          {seciliGun && seciliGunDetay && (
            <div className="bg-surface border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-text">
                  📆 {fmtTarih(seciliGun)}
                </h3>
                <button
                  onClick={() => yeniEtkinlik(seciliGun)}
                  className="px-2 py-1 text-[10px] bg-gold text-bg rounded font-semibold hover:bg-gold-light"
                >
                  + Ekle
                </button>
              </div>

              {/* Tatil bilgisi */}
              {seciliGunDetay.tatiller.length > 0 && (
                <div className="space-y-1 mb-3">
                  {seciliGunDetay.tatiller.map((t, i) => (
                    <div
                      key={i}
                      className={`text-[10px] px-2 py-1 rounded border ${tatilRenkSiniflari(t.tip)}`}
                    >
                      {t.tip === 'resmi' ? '🔴' : t.tip === 'dini' ? '🌙' : t.tip === 'adli' ? '⚖️' : '📌'}{' '}
                      {t.ad}
                    </div>
                  ))}
                </div>
              )}

              {/* Çakışma uyarıları */}
              {seciliGunDetay.cakismalar.length > 0 && (
                <div className="space-y-1 mb-3">
                  {seciliGunDetay.cakismalar.map((c, i) => (
                    <div
                      key={i}
                      className={`text-[10px] px-2 py-1.5 rounded border ${
                        c.seviye === 'kirmizi'
                          ? 'bg-red/10 text-red border-red/20'
                          : 'bg-amber-400/10 text-amber-500 border-amber-400/20'
                      }`}
                    >
                      {c.seviye === 'kirmizi' ? '🔴 Fiziken İmkânsız Çakışma' : '🟡 Aynı Adliye Çakışması'}
                      <div className="text-[9px] mt-0.5 opacity-80">
                        {c.etkinlik1.saat} — {c.etkinlik1.baslik?.substring(0, 30)}
                        {' vs '}
                        {c.etkinlik2.baslik?.substring(0, 30)}
                      </div>
                      {c.seviye === 'kirmizi' && c.etkinlik1.yer && c.etkinlik2.yer && (
                        <div className="text-[9px] mt-0.5 opacity-60">
                          📍 {c.etkinlik1.yer} ≠ {c.etkinlik2.yer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Günün etkinlikleri */}
              {seciliGunDetay.etkinlikler.length === 0 ? (
                <div className="text-center py-4 text-text-muted text-xs">
                  Bu günde etkinlik yok
                </div>
              ) : (
                <div className="space-y-2">
                  {seciliGunDetay.etkinlikler.map((e) => (
                    <div
                      key={e.id}
                      onClick={() => etkinlikAc(e)}
                      className={`p-2.5 rounded-lg cursor-pointer hover:ring-1 hover:ring-gold/20 transition-all ${
                        e.sanal ? 'bg-surface2/70 border border-dashed border-border' : 'bg-surface2'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                          e.adliTatilUzama && e.id.endsWith('-uzama')
                            ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                            : TUR_RENK[e.tur || ''] || TUR_RENK['Diğer']
                        }`}>
                          {TUR_IKON[e.tur || ''] || '📌'} {e.tur || 'Diğer'}
                        </span>
                        {e.saat && (
                          <span className="text-[10px] text-text-muted font-mono">
                            {e.saat}{e.bitisSaati ? `–${e.bitisSaati}` : ''}
                          </span>
                        )}
                        {e.sanal && (
                          <span className="text-[8px] bg-blue-400/10 text-blue-400 px-1 py-0.5 rounded">
                            otomatik
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-medium text-text">{e.baslik || '—'}</div>
                      {e.muvId && muvAdMap[e.muvId] && (
                        <div className="text-[10px] text-text-muted mt-0.5">
                          👤 {muvAdMap[e.muvId]}
                        </div>
                      )}
                      {e.yer && (
                        <div className="text-[10px] text-text-dim mt-0.5">📍 {e.yer}</div>
                      )}
                      {e.adliTatilUzama && !e.id.endsWith('-uzama') && (
                        <div className="text-[9px] text-amber-500 mt-1">
                          ⚠️ Adli tatil — süre {e.adliTatilUzama} tarihine uzar
                        </div>
                      )}
                      {e.katilimcilar && e.katilimcilar.length > 0 && (
                        <div className="text-[10px] text-text-dim mt-0.5">
                          👥 {e.katilimcilar.map((id) => personelAdMap[id] || '?').join(', ')}
                        </div>
                      )}
                      {e.kaynakUrl && e.sanal && (
                        <a
                          href={e.kaynakUrl}
                          className="text-[9px] text-gold hover:underline mt-1 inline-block"
                          onClick={(ev) => ev.stopPropagation()}
                        >
                          Dosyaya git →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Yaklaşan Etkinlikler */}
          <div className="bg-surface border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-text mb-3">📅 Yaklaşan Etkinlikler</h3>
            {yaklasan.length === 0 ? (
              <div className="text-center py-6 text-text-muted text-xs">Yaklaşan etkinlik yok</div>
            ) : (
              <div className="space-y-2">
                {yaklasan.map((e) => {
                  const gun = Math.ceil((new Date(e.tarih!).getTime() - Date.now()) / 86400000);
                  return (
                    <div
                      key={e.id}
                      onClick={() => {
                        setSeciliGun(e.tarih || null);
                        // Eğer farklı ayda ise, o aya git
                        if (e.tarih) {
                          const [eYil, eAy] = e.tarih.split('-').map(Number);
                          if (eYil !== yil || eAy - 1 !== ay) {
                            setYil(eYil);
                            setAy(eAy - 1);
                          }
                        }
                      }}
                      className={`p-2.5 rounded-lg cursor-pointer hover:ring-1 hover:ring-gold/20 transition-all ${
                        e.sanal ? 'bg-surface2/70 border border-dashed border-border' : 'bg-surface2'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${TUR_RENK[e.tur || ''] || TUR_RENK['Diğer']}`}>
                          {TUR_IKON[e.tur || ''] || '📌'} {e.tur || 'Diğer'}
                        </span>
                        <span className={`text-[10px] font-bold ${
                          gun <= 0 ? 'text-red' : gun <= 1 ? 'text-orange-400' : gun <= 3 ? 'text-gold' : 'text-text-dim'
                        }`}>
                          {gun <= 0 ? 'BUGÜN' : gun === 1 ? 'YARIN' : `${gun} gün`}
                        </span>
                        {e.sanal && (
                          <span className="text-[8px] bg-blue-400/10 text-blue-400 px-1 py-0.5 rounded ml-auto">
                            oto
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-medium text-text truncate">{e.baslik || '—'}</div>
                      <div className="text-[11px] text-text-muted mt-0.5">
                        {fmtTarih(e.tarih)} {e.saat && `· ${e.saat}`}
                        {e.muvId && muvAdMap[e.muvId] && ` · ${muvAdMap[e.muvId]}`}
                      </div>
                      {e.yer && <div className="text-[10px] text-text-dim mt-0.5">📍 {e.yer}</div>}
                      {e.adliTatilUzama && !e.id.endsWith('-uzama') && (
                        <div className="text-[9px] text-amber-500 mt-0.5">
                          ⚠️ Süre {e.adliTatilUzama}&apos;e uzar
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Lejant */}
          <div className="bg-surface border border-border rounded-lg p-3">
            <h4 className="text-[11px] font-semibold text-text-muted mb-2">Gösterim</h4>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red"></span>
                <span className="text-[10px] text-text-muted">Duruşma</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                <span className="text-[10px] text-text-muted">Görev</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                <span className="text-[10px] text-text-muted">Son Gün</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span className="text-[10px] text-text-muted">İtiraz</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                <span className="text-[10px] text-text-muted">Toplantı</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-[10px] text-text-muted">Oturum</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="text-[10px] text-text-muted">İhtarname</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span className="text-[10px] text-text-muted">Teslim</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px]">🔴</span>
                <span className="text-[10px] text-text-dim">Resmi tatil</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px]">🔵</span>
                <span className="text-[10px] text-text-dim">Adli tatil</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px]">🟢</span>
                <span className="text-[10px] text-text-dim">Hukuk günü</span>
              </div>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5">
              <div className="w-5 h-2 border border-dashed border-text-dim rounded"></div>
              <span className="text-[10px] text-text-dim">Otomatik (sanal) etkinlik</span>
            </div>
          </div>
        </div>
      </div>

      <EtkinlikModal
        open={modalAcik}
        onClose={() => { setModalAcik(false); setSeciliEtkinlik(null); setPrefillTarih(''); }}
        etkinlik={seciliEtkinlik}
        prefillTarih={prefillTarih}
      />
    </div>
  );
}
