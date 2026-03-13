'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useDavalar } from '@/lib/hooks/useDavalar';
import { useMuvekkillar } from '@/lib/hooks/useMuvekkillar';
import { fmtTarih } from '@/lib/utils';

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

export default function DavalarPage() {
  const { data: davalar, isLoading } = useDavalar();
  const { data: muvekkillar } = useMuvekkillar();
  const [arama, setArama] = useState('');
  const [durumFiltre, setDurumFiltre] = useState<string>('hepsi');
  const [asamaFiltre, setAsamaFiltre] = useState<string>('hepsi');

  // Müvekkil adı map
  const muvAdMap = useMemo(() => {
    const map: Record<string, string> = {};
    muvekkillar?.forEach((m) => { map[m.id] = m.ad || '?'; });
    return map;
  }, [muvekkillar]);

  // KPI'lar
  const kpis = useMemo(() => {
    if (!davalar) return { toplam: 0, aktif: 0, istinaf: 0, temyiz: 0, kesinlesti: 0 };
    return {
      toplam: davalar.length,
      aktif: davalar.filter((d) => d.durum === 'Aktif' || d.durum === 'Devam Ediyor').length,
      istinaf: davalar.filter((d) => d.asama === 'İstinaf').length,
      temyiz: davalar.filter((d) => d.asama?.startsWith('Temyiz')).length,
      kesinlesti: davalar.filter((d) => d.asama === 'Kesinleşti').length,
    };
  }, [davalar]);

  // Filtreleme
  const filtrelenmis = useMemo(() => {
    if (!davalar) return [];
    return davalar.filter((d) => {
      if (durumFiltre !== 'hepsi' && d.durum !== durumFiltre) return false;
      if (asamaFiltre !== 'hepsi' && d.asama !== asamaFiltre) return false;
      if (arama) {
        const q = arama.toLowerCase();
        const muvAd = muvAdMap[d.muvId || ''] || '';
        return (
          (d.no || '').toLowerCase().includes(q) ||
          (d.konu || '').toLowerCase().includes(q) ||
          muvAd.toLowerCase().includes(q) ||
          (d.karsi || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [davalar, arama, durumFiltre, asamaFiltre, muvAdMap]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-[var(--font-playfair)] text-2xl text-text font-bold">
          Davalar
          {davalar && <span className="text-sm font-normal text-text-muted ml-2">({davalar.length})</span>}
        </h1>
        <button className="px-4 py-2 bg-gold text-bg font-semibold rounded-lg text-xs hover:bg-gold-light transition-colors">
          + Yeni Dava
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        <MiniKpi label="Toplam" value={kpis.toplam} />
        <MiniKpi label="Aktif" value={kpis.aktif} color="text-green" />
        <MiniKpi label="İstinaf" value={kpis.istinaf} color="text-purple-400" />
        <MiniKpi label="Temyiz" value={kpis.temyiz} color="text-orange-400" />
        <MiniKpi label="Kesinleşti" value={kpis.kesinlesti} color="text-text-muted" />
      </div>

      {/* Arama + Filtreler */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 relative">
          <input
            type="text"
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            placeholder="Dosya no, konu, müvekkil, karşı taraf ile ara..."
            className="w-full px-4 py-2.5 pl-9 bg-surface border border-border rounded-lg text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-gold transition-colors"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim text-sm">🔍</span>
        </div>

        <select
          value={durumFiltre}
          onChange={(e) => setDurumFiltre(e.target.value)}
          className="px-3 py-2.5 bg-surface border border-border rounded-lg text-xs text-text focus:outline-none focus:border-gold"
        >
          <option value="hepsi">Tüm Durumlar</option>
          <option value="Aktif">Aktif</option>
          <option value="Beklemede">Beklemede</option>
          <option value="Kapalı">Kapalı</option>
        </select>

        <select
          value={asamaFiltre}
          onChange={(e) => setAsamaFiltre(e.target.value)}
          className="px-3 py-2.5 bg-surface border border-border rounded-lg text-xs text-text focus:outline-none focus:border-gold"
        >
          <option value="hepsi">Tüm Aşamalar</option>
          <option value="İlk Derece">İlk Derece</option>
          <option value="İstinaf">İstinaf</option>
          <option value="Temyiz (Yargıtay)">Temyiz (Yargıtay)</option>
          <option value="Temyiz (Danıştay)">Temyiz (Danıştay)</option>
          <option value="Kesinleşti">Kesinleşti</option>
        </select>
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="text-center py-12 text-text-muted text-sm">Yükleniyor...</div>
      ) : filtrelenmis.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-border rounded-lg">
          <div className="text-4xl mb-3">⚖️</div>
          <div className="text-sm text-text-muted">
            {arama || durumFiltre !== 'hepsi' || asamaFiltre !== 'hepsi'
              ? 'Arama sonucu bulunamadı'
              : 'Henüz dava kaydı eklenmemiş'}
          </div>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          {/* Tablo Başlık */}
          <div className="grid grid-cols-[60px_1fr_1fr_1fr_120px_100px_100px_80px] gap-2 px-4 py-2.5 border-b border-border text-[11px] text-text-muted font-medium uppercase tracking-wider">
            <span>#</span>
            <span>Dosya No</span>
            <span>Müvekkil</span>
            <span>Konu</span>
            <span>Aşama</span>
            <span>Durum</span>
            <span>Duruşma</span>
            <span></span>
          </div>

          {/* Satırlar */}
          {filtrelenmis.map((d) => (
            <Link
              key={d.id}
              href={`/davalar/${d.id}`}
              className="grid grid-cols-[60px_1fr_1fr_1fr_120px_100px_100px_80px] gap-2 px-4 py-3 border-b border-border/50 hover:bg-gold-dim transition-colors group items-center"
            >
              <span className="text-[11px] text-text-dim">{d.sira ?? '—'}</span>
              <span className="text-xs font-bold text-gold truncate">{d.no || '—'}</span>
              <span className="text-xs text-text truncate">{muvAdMap[d.muvId || ''] || '—'}</span>
              <span className="text-xs text-text-muted truncate">{d.konu || '—'}</span>
              <span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ASAMA_RENK[d.asama || ''] || 'text-text-dim bg-surface2'}`}>
                  {d.asama || '—'}
                </span>
              </span>
              <span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${DURUM_RENK[d.durum || ''] || 'text-text-dim bg-surface2 border-border'}`}>
                  {d.durum || '—'}
                </span>
              </span>
              <span className="text-[11px] text-text-dim">{d.durusma ? fmtTarih(d.durusma) : '—'}</span>
              <span className="text-text-dim group-hover:text-gold transition-colors text-right">›</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function MiniKpi({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-surface border border-border rounded-lg px-3 py-2.5 text-center">
      <div className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">{label}</div>
      <div className={`font-[var(--font-playfair)] text-xl font-bold ${color || 'text-text'}`}>{value}</div>
    </div>
  );
}
