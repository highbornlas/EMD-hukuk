'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useDavalar, type Dava } from '@/lib/hooks/useDavalar';
import { useMuvekkillar } from '@/lib/hooks/useMuvekkillar';
import { DavaModal } from '@/components/modules/DavaModal';
import { ExportMenu } from '@/components/ui/ExportMenu';
import { DurusmaBadge } from '@/components/ui/SureBadge';
import { tamMahkemeAdi, esasNoGoster, dosyaNoOlustur, davaciBelirle, durusmayaKalanGun } from '@/lib/utils/uyapHelpers';
import { fmtTarih } from '@/lib/utils';
import { DAVA_TURLERI, DAVA_DURUMLARI, DAVA_ASAMALARI } from '@/lib/constants/uyap';
import { exportDavaListeUYAPXLS } from '@/lib/export/excelExport';
import { exportDavaListePDF } from '@/lib/export/pdfExport';

// ── Badge renk haritaları ────────────────────────────────────

const ASAMA_RENK: Record<string, string> = {
  'İlk Derece': 'text-blue-400 bg-blue-400/10',
  'İstinaf': 'text-purple-400 bg-purple-400/10',
  'Temyiz (Yargıtay)': 'text-orange-400 bg-orange-400/10',
  'Temyiz (Danıştay)': 'text-orange-400 bg-orange-400/10',
  'Kesinleşti': 'text-green bg-green-dim',
  'Düşürüldü': 'text-text-dim bg-surface2',
};

const DURUM_RENK: Record<string, string> = {
  'Aktif': 'text-green bg-green-dim border-green/20',
  'Devam Ediyor': 'text-green bg-green-dim border-green/20',
  'Beklemede': 'text-gold bg-gold-dim border-gold/20',
  'Kapalı': 'text-text-dim bg-surface2 border-border',
};

// ── Sıralama ─────────────────────────────────────────────────

type SortKey = 'kayitNo' | 'esasNo' | 'mahkeme' | 'davaci' | 'davali' | 'acilisTarihi' | 'asama' | 'durum' | 'durusmaTarihi';
type SortDir = 'asc' | 'desc';

// ══════════════════════════════════════════════════════════════
//  Davalar Sayfası
// ══════════════════════════════════════════════════════════════

export default function DavalarPage() {
  const { data: davalar, isLoading } = useDavalar();
  const { data: muvekkillar } = useMuvekkillar();

  // UI state
  const [arama, setArama] = useState('');
  const [durumFiltre, setDurumFiltre] = useState<string>('hepsi');
  const [asamaFiltre, setAsamaFiltre] = useState<string>('hepsi');
  const [davaTuruFiltre, setDavaTuruFiltre] = useState<string>('hepsi');
  const [tarihBaslangic, setTarihBaslangic] = useState('');
  const [tarihBitis, setTarihBitis] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('kayitNo');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [modalAcik, setModalAcik] = useState(false);
  const [seciliDava, setSeciliDava] = useState<Dava | null>(null);

  // ── Müvekkil adı map ───────────────────────────────────────
  const muvAdMap = useMemo(() => {
    const map: Record<string, string> = {};
    muvekkillar?.forEach((m) => { map[m.id] = m.ad || '?'; });
    return map;
  }, [muvekkillar]);

  // ── KPI hesaplama ──────────────────────────────────────────
  const kpis = useMemo(() => {
    if (!davalar) return { toplam: 0, aktif: 0, yaklasanDurusma: 0, istinaf: 0, temyiz: 0, kapali: 0 };

    let yaklasanDurusma = 0;
    davalar.forEach((d) => {
      const kalan = durusmayaKalanGun(d.durusma);
      if (kalan !== null && kalan >= 0 && kalan <= 7) yaklasanDurusma++;
    });

    return {
      toplam: davalar.length,
      aktif: davalar.filter((d) => d.durum === 'Aktif' || d.durum === 'Devam Ediyor').length,
      yaklasanDurusma,
      istinaf: davalar.filter((d) => d.asama === 'İstinaf').length,
      temyiz: davalar.filter((d) => d.asama?.startsWith('Temyiz')).length,
      kapali: davalar.filter((d) => d.durum === 'Kapalı').length,
    };
  }, [davalar]);

  // ── Filtreleme + Arama ─────────────────────────────────────
  const filtrelenmis = useMemo(() => {
    if (!davalar) return [];

    return davalar.filter((d) => {
      // Durum filtre
      if (durumFiltre !== 'hepsi' && d.durum !== durumFiltre) return false;
      // Aşama filtre
      if (asamaFiltre !== 'hepsi' && d.asama !== asamaFiltre) return false;
      // Dava türü filtre
      if (davaTuruFiltre !== 'hepsi' && d.davaTuru !== davaTuruFiltre) return false;

      // Tarih aralığı filtre
      if (tarihBaslangic || tarihBitis) {
        const davaTarih = d.tarih || '';
        if (tarihBaslangic && davaTarih < tarihBaslangic) return false;
        if (tarihBitis && davaTarih > tarihBitis) return false;
      }

      // Arama
      if (arama) {
        const q = arama.toLowerCase();
        const muvAd = muvAdMap[d.muvId || ''] || '';
        const esasStr = esasNoGoster(d.esasYil, d.esasNo);
        const mahkemeStr = tamMahkemeAdi(d.il, d.mno, d.mtur);
        return (
          esasStr.toLowerCase().includes(q) ||
          mahkemeStr.toLowerCase().includes(q) ||
          muvAd.toLowerCase().includes(q) ||
          (d.karsi || '').toLowerCase().includes(q) ||
          (d.konu || '').toLowerCase().includes(q) ||
          (d.davaTuru || '').toLowerCase().includes(q) ||
          (d.no || '').toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [davalar, arama, durumFiltre, asamaFiltre, davaTuruFiltre, tarihBaslangic, tarihBitis, muvAdMap]);

  // ── Sıralama ───────────────────────────────────────────────
  const sirali = useMemo(() => {
    const list = [...filtrelenmis];

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'kayitNo':
          cmp = (a.kayitNo ?? a.sira ?? 0) - (b.kayitNo ?? b.sira ?? 0);
          break;
        case 'esasNo': {
          const aEsas = esasNoGoster(a.esasYil, a.esasNo);
          const bEsas = esasNoGoster(b.esasYil, b.esasNo);
          cmp = aEsas.localeCompare(bEsas, 'tr');
          break;
        }
        case 'mahkeme': {
          const aM = tamMahkemeAdi(a.il, a.mno, a.mtur);
          const bM = tamMahkemeAdi(b.il, b.mno, b.mtur);
          cmp = aM.localeCompare(bM, 'tr');
          break;
        }
        case 'davaci': {
          const aD = davaciBelirle(a.taraf, muvAdMap[a.muvId || ''] || '', a.karsi || '').davaci;
          const bD = davaciBelirle(b.taraf, muvAdMap[b.muvId || ''] || '', b.karsi || '').davaci;
          cmp = aD.localeCompare(bD, 'tr');
          break;
        }
        case 'davali': {
          const aD = davaciBelirle(a.taraf, muvAdMap[a.muvId || ''] || '', a.karsi || '').davali;
          const bD = davaciBelirle(b.taraf, muvAdMap[b.muvId || ''] || '', b.karsi || '').davali;
          cmp = aD.localeCompare(bD, 'tr');
          break;
        }
        case 'acilisTarihi': {
          const aT = a.tarih || '9999';
          const bT = b.tarih || '9999';
          cmp = aT.localeCompare(bT);
          break;
        }
        case 'asama': {
          cmp = (a.asama || '').localeCompare(b.asama || '', 'tr');
          break;
        }
        case 'durum': {
          cmp = (a.durum || '').localeCompare(b.durum || '', 'tr');
          break;
        }
        case 'durusmaTarihi': {
          const aD = a.durusma || '9999';
          const bD = b.durusma || '9999';
          cmp = aD.localeCompare(bD);
          break;
        }
        default:
          cmp = 0;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return list;
  }, [filtrelenmis, sortKey, sortDir, muvAdMap]);

  // ── Sıralama toggle ──────────────────────────────────────
  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function sortIcon(key: SortKey) {
    if (sortKey !== key) return ' ↕';
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  }

  // ── Row highlight class ────────────────────────────────────
  const satırVurgu = useCallback((d: Dava): string => {
    const kalan = durusmayaKalanGun(d.durusma);
    if (kalan === null || kalan < 0) return '';
    if (kalan <= 3) return 'bg-red/5';
    if (kalan <= 7) return 'bg-gold/5';
    return '';
  }, []);

  // ── Export handlers ────────────────────────────────────────
  const handleExportExcel = useCallback(() => {
    if (!sirali.length) return;
    exportDavaListeUYAPXLS(
      sirali as unknown as Array<Record<string, unknown>>,
      muvAdMap,
    );
  }, [sirali, muvAdMap]);

  const handleExportPDF = useCallback(() => {
    if (!sirali.length) return;
    exportDavaListePDF(
      sirali as unknown as Array<Record<string, unknown>>,
      muvAdMap,
    );
  }, [sirali, muvAdMap]);

  // ── Filtrelerin aktif olup olmadigi ────────────────────────
  const filtreAktif = durumFiltre !== 'hepsi' || asamaFiltre !== 'hepsi' || davaTuruFiltre !== 'hepsi' || !!tarihBaslangic || !!tarihBitis || !!arama;

  return (
    <div>
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-[var(--font-playfair)] text-2xl text-text font-bold">
          Davalar
          {davalar && <span className="text-sm font-normal text-text-muted ml-2">({davalar.length})</span>}
        </h1>
        <div className="flex items-center gap-2">
          <ExportMenu
            onExportExcel={handleExportExcel}
            onExportPDF={handleExportPDF}
            disabled={!sirali.length}
          />
          <button
            onClick={() => { setSeciliDava(null); setModalAcik(true); }}
            className="px-4 py-2 bg-gold text-bg font-semibold rounded-lg text-xs hover:bg-gold-light transition-colors"
          >
            + Yeni Dava
          </button>
        </div>
      </div>

      {/* ── KPI Strip ────────────────────────────────────────── */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-5">
        <MiniKpi label="Toplam" value={kpis.toplam} />
        <MiniKpi label="Aktif" value={kpis.aktif} color="text-green" />
        <MiniKpi label="Yaklaşan Duruşma" value={kpis.yaklasanDurusma} color="text-gold" />
        <MiniKpi label="İstinaf" value={kpis.istinaf} color="text-purple-400" />
        <MiniKpi label="Temyiz" value={kpis.temyiz} color="text-orange-400" />
        <MiniKpi label="Kapalı" value={kpis.kapali} color="text-text-muted" />
      </div>

      {/* ── Arama + Filtreler ────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Arama */}
        <div className="flex-1 min-w-[200px] relative">
          <input
            type="text"
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            placeholder="Esas no, mahkeme, taraf, konu, dava türü ile ara..."
            className="w-full px-4 py-2.5 pl-9 bg-surface border border-border rounded-lg text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-gold transition-colors"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim text-sm">&#x1F50D;</span>
        </div>

        {/* Durum */}
        <select
          value={durumFiltre}
          onChange={(e) => setDurumFiltre(e.target.value)}
          className="px-3 py-2.5 bg-surface border border-border rounded-lg text-xs text-text focus:outline-none focus:border-gold"
        >
          <option value="hepsi">Tum Durumlar</option>
          {DAVA_DURUMLARI.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        {/* Asama */}
        <select
          value={asamaFiltre}
          onChange={(e) => setAsamaFiltre(e.target.value)}
          className="px-3 py-2.5 bg-surface border border-border rounded-lg text-xs text-text focus:outline-none focus:border-gold"
        >
          <option value="hepsi">Tum Asamalar</option>
          {DAVA_ASAMALARI.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        {/* Dava Turu */}
        <select
          value={davaTuruFiltre}
          onChange={(e) => setDavaTuruFiltre(e.target.value)}
          className="px-3 py-2.5 bg-surface border border-border rounded-lg text-xs text-text focus:outline-none focus:border-gold"
        >
          <option value="hepsi">Tum Turler</option>
          {DAVA_TURLERI.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Sıralama artık sütün başlıklarından yapılıyor */}
      </div>

      {/* Tarih araligi filtre */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>Tarih:</span>
          <input
            type="date"
            value={tarihBaslangic}
            onChange={(e) => setTarihBaslangic(e.target.value)}
            className="px-2 py-1.5 bg-surface border border-border rounded-lg text-xs text-text focus:outline-none focus:border-gold"
          />
          <span>-</span>
          <input
            type="date"
            value={tarihBitis}
            onChange={(e) => setTarihBitis(e.target.value)}
            className="px-2 py-1.5 bg-surface border border-border rounded-lg text-xs text-text focus:outline-none focus:border-gold"
          />
        </div>

        {filtreAktif && (
          <button
            onClick={() => {
              setArama('');
              setDurumFiltre('hepsi');
              setAsamaFiltre('hepsi');
              setDavaTuruFiltre('hepsi');
              setTarihBaslangic('');
              setTarihBitis('');
            }}
            className="text-[11px] text-gold hover:text-gold-light transition-colors underline"
          >
            Filtreleri temizle
          </button>
        )}
      </div>

      {/* ── Tablo ────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="text-center py-12 text-text-muted text-sm">Yukleniyor...</div>
      ) : sirali.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-border rounded-lg">
          <div className="text-4xl mb-3">&#x2696;&#xFE0F;</div>
          <div className="text-sm text-text-muted">
            {filtreAktif
              ? 'Arama sonucu bulunamadi'
              : 'Henuz dava kaydi eklenmemis'}
          </div>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-x-auto">
          {/* Tablo Baslik */}
          <div
            className="grid grid-cols-[36px_minmax(80px,1fr)_minmax(140px,2fr)_minmax(100px,1fr)_minmax(100px,1fr)_90px_80px_75px_100px] gap-2 px-4 py-2.5 border-b border-border text-[11px] text-text-muted font-medium uppercase tracking-wider min-w-[950px]"
          >
            <button type="button" onClick={() => toggleSort('kayitNo')} className="text-left hover:text-text transition-colors">#{ sortIcon('kayitNo')}</button>
            <button type="button" onClick={() => toggleSort('esasNo')} className="text-left hover:text-text transition-colors">Esas No{sortIcon('esasNo')}</button>
            <button type="button" onClick={() => toggleSort('mahkeme')} className="text-left hover:text-text transition-colors">Mahkeme{sortIcon('mahkeme')}</button>
            <button type="button" onClick={() => toggleSort('davaci')} className="text-left hover:text-text transition-colors">Davacı{sortIcon('davaci')}</button>
            <button type="button" onClick={() => toggleSort('davali')} className="text-left hover:text-text transition-colors">Davalı{sortIcon('davali')}</button>
            <button type="button" onClick={() => toggleSort('acilisTarihi')} className="text-left hover:text-text transition-colors">Açılış{sortIcon('acilisTarihi')}</button>
            <button type="button" onClick={() => toggleSort('asama')} className="text-left hover:text-text transition-colors">Aşama{sortIcon('asama')}</button>
            <button type="button" onClick={() => toggleSort('durum')} className="text-left hover:text-text transition-colors">Durum{sortIcon('durum')}</button>
            <button type="button" onClick={() => toggleSort('durusmaTarihi')} className="text-left hover:text-text transition-colors">Duruşma{sortIcon('durusmaTarihi')}</button>
          </div>

          {/* Satirlar */}
          {sirali.map((d, idx) => {
            const muvAd = muvAdMap[d.muvId || ''] || '';
            const karsiAd = d.karsi || '';
            const { davaci, davali } = davaciBelirle(d.taraf, muvAd, karsiAd);
            const mahkeme = tamMahkemeAdi(d.il, d.mno, d.mtur);
            const esasStr = esasNoGoster(d.esasYil, d.esasNo);
            const vurgu = satırVurgu(d);

            return (
              <Link
                key={d.id}
                href={`/davalar/${d.id}`}
                className={`grid grid-cols-[36px_minmax(80px,1fr)_minmax(140px,2fr)_minmax(100px,1fr)_minmax(100px,1fr)_90px_80px_75px_100px] gap-2 px-4 py-3 border-b border-border/50 hover:bg-gold-dim transition-colors group items-center min-w-[950px] ${vurgu}`}
              >
                {/* Sıra */}
                <span className="text-[11px] text-text-dim">{idx + 1}</span>

                {/* Esas No */}
                <div className="min-w-0 flex items-center gap-1.5">
                  <span className="font-[var(--font-playfair)] text-sm font-bold text-gold truncate">
                    {esasStr || '—'}
                  </span>
                  {d.davaTuru && (
                    <span className="text-[9px] px-1 py-0.5 rounded bg-surface2 text-text-dim border border-border/50 whitespace-nowrap flex-shrink-0">
                      {d.davaTuru}
                    </span>
                  )}
                </div>

                {/* Mahkeme */}
                <span className="text-xs text-text truncate" title={mahkeme || d.konu || ''}>
                  {mahkeme || d.konu || '—'}
                </span>

                {/* Davaci */}
                <span className="text-xs text-text truncate" title={davaci}>
                  {davaci || '—'}
                </span>

                {/* Davali */}
                <span className="text-xs text-text truncate" title={davali}>
                  {davali || '—'}
                </span>

                {/* Açılış Tarihi */}
                <span className="text-[11px] text-text-muted">
                  {d.tarih ? fmtTarih(d.tarih) : '—'}
                </span>

                {/* Asama */}
                <span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ASAMA_RENK[d.asama || ''] || 'text-text-dim bg-surface2'}`}>
                    {d.asama || '—'}
                  </span>
                </span>

                {/* Durum */}
                <span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${DURUM_RENK[d.durum || ''] || 'text-text-dim bg-surface2 border-border'}`}>
                    {d.durum || '—'}
                  </span>
                </span>

                {/* Durusma */}
                <span>
                  <DurusmaBadge tarih={d.durusma} saat={d.durusmaSaati} />
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Sonuc sayisi */}
      {!isLoading && sirali.length > 0 && (
        <div className="mt-3 text-[11px] text-text-dim text-right">
          {filtreAktif
            ? `${sirali.length} / ${davalar?.length ?? 0} dava gosteriliyor`
            : `${sirali.length} dava`}
        </div>
      )}

      {/* ── Modal ────────────────────────────────────────────── */}
      <DavaModal open={modalAcik} onClose={() => setModalAcik(false)} dava={seciliDava} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  Mini KPI Kartı
// ══════════════════════════════════════════════════════════════

function MiniKpi({ label, value, color }: { label: string; value: number | string; color?: string }) {
  return (
    <div className="bg-surface border border-border rounded-lg px-3 py-2.5 text-center">
      <div className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">{label}</div>
      <div className={`font-[var(--font-playfair)] text-xl font-bold ${color || 'text-text'}`}>{value}</div>
    </div>
  );
}
