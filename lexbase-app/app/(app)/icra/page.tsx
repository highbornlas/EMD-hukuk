'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useIcralar } from '@/lib/hooks/useIcra';
import { useMuvekkillar } from '@/lib/hooks/useMuvekkillar';
import { fmt, fmtTarih } from '@/lib/utils';

const DURUM_RENK: Record<string, string> = {
  'Aktif': 'text-green bg-green-dim border-green/20',
  'Takipte': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  'Haciz Aşaması': 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  'Satış Aşaması': 'text-red bg-red-dim border-red/20',
  'Kapandı': 'text-text-dim bg-surface2 border-border',
};

export default function IcraPage() {
  const { data: icralar, isLoading } = useIcralar();
  const { data: muvekkillar } = useMuvekkillar();
  const [arama, setArama] = useState('');
  const [durumFiltre, setDurumFiltre] = useState<string>('hepsi');
  const [turFiltre, setTurFiltre] = useState<string>('hepsi');

  // Müvekkil adı map
  const muvAdMap = useMemo(() => {
    const map: Record<string, string> = {};
    muvekkillar?.forEach((m) => { map[m.id] = m.ad || '?'; });
    return map;
  }, [muvekkillar]);

  // KPI'lar
  const kpis = useMemo(() => {
    if (!icralar) return { toplam: 0, aktifTakip: 0, toplamAlacak: 0, tahsilEdilen: 0, kalan: 0 };
    const aktifTakip = icralar.filter((i) => i.durum !== 'Kapandı').length;
    const toplamAlacak = icralar.reduce((t, i) => t + (i.alacak || 0), 0);
    const tahsilEdilen = icralar.reduce((t, i) => t + (i.tahsil || 0), 0);
    return {
      toplam: icralar.length,
      aktifTakip,
      toplamAlacak,
      tahsilEdilen,
      kalan: toplamAlacak - tahsilEdilen,
    };
  }, [icralar]);

  // Türler listesi (dinamik)
  const turler = useMemo(() => {
    if (!icralar) return [];
    const set = new Set<string>();
    icralar.forEach((i) => { if (i.tur) set.add(i.tur); });
    return Array.from(set);
  }, [icralar]);

  // Filtreleme
  const filtrelenmis = useMemo(() => {
    if (!icralar) return [];
    return icralar.filter((i) => {
      if (durumFiltre !== 'hepsi' && i.durum !== durumFiltre) return false;
      if (turFiltre !== 'hepsi' && i.tur !== turFiltre) return false;
      if (arama) {
        const q = arama.toLowerCase();
        const muvAd = muvAdMap[i.muvId || ''] || '';
        return (
          (i.no || '').toLowerCase().includes(q) ||
          (i.borclu || '').toLowerCase().includes(q) ||
          muvAd.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [icralar, arama, durumFiltre, turFiltre, muvAdMap]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-[var(--font-playfair)] text-2xl text-text font-bold">
          İcra Dosyaları
          {icralar && <span className="text-sm font-normal text-text-muted ml-2">({icralar.length})</span>}
        </h1>
        <button className="px-4 py-2 bg-gold text-bg font-semibold rounded-lg text-xs hover:bg-gold-light transition-colors">
          + Yeni İcra Dosyası
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        <MiniKpi label="Toplam" value={kpis.toplam.toString()} />
        <MiniKpi label="Aktif Takip" value={kpis.aktifTakip.toString()} color="text-green" />
        <MiniKpi label="Toplam Alacak" value={fmt(kpis.toplamAlacak)} color="text-gold" />
        <MiniKpi label="Tahsil Edilen" value={fmt(kpis.tahsilEdilen)} color="text-green" />
        <MiniKpi label="Kalan" value={fmt(kpis.kalan)} color="text-red" />
      </div>

      {/* Arama + Filtreler */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 relative">
          <input
            type="text"
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            placeholder="Dosya no, borçlu, müvekkil ile ara..."
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
          <option value="Takipte">Takipte</option>
          <option value="Haciz Aşaması">Haciz Aşaması</option>
          <option value="Satış Aşaması">Satış Aşaması</option>
          <option value="Kapandı">Kapandı</option>
        </select>

        {turler.length > 0 && (
          <select
            value={turFiltre}
            onChange={(e) => setTurFiltre(e.target.value)}
            className="px-3 py-2.5 bg-surface border border-border rounded-lg text-xs text-text focus:outline-none focus:border-gold max-w-[200px]"
          >
            <option value="hepsi">Tüm Türler</option>
            {turler.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        )}
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="text-center py-12 text-text-muted text-sm">Yükleniyor...</div>
      ) : filtrelenmis.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-border rounded-lg">
          <div className="text-4xl mb-3">📋</div>
          <div className="text-sm text-text-muted">
            {arama || durumFiltre !== 'hepsi' || turFiltre !== 'hepsi'
              ? 'Arama sonucu bulunamadı'
              : 'Henüz icra dosyası eklenmemiş'}
          </div>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          {/* Tablo Başlık */}
          <div className="grid grid-cols-[50px_1fr_1fr_1fr_120px_100px_140px_80px] gap-2 px-4 py-2.5 border-b border-border text-[11px] text-text-muted font-medium uppercase tracking-wider">
            <span>#</span>
            <span>Dosya No</span>
            <span>Müvekkil</span>
            <span>Borçlu</span>
            <span>Alacak</span>
            <span>Durum</span>
            <span>Tahsilat</span>
            <span></span>
          </div>

          {/* Satırlar */}
          {filtrelenmis.map((ic) => {
            const tahsilOran = ic.alacak && ic.alacak > 0 ? Math.min(((ic.tahsil || 0) / ic.alacak) * 100, 100) : 0;
            return (
              <Link
                key={ic.id}
                href={`/icra/${ic.id}`}
                className="grid grid-cols-[50px_1fr_1fr_1fr_120px_100px_140px_80px] gap-2 px-4 py-3 border-b border-border/50 hover:bg-gold-dim transition-colors group items-center"
              >
                <span className="text-[11px] text-text-dim">{ic.sira ?? '—'}</span>
                <span className="text-xs font-bold text-gold truncate">{ic.no || '—'}</span>
                <span className="text-xs text-text truncate">{muvAdMap[ic.muvId || ''] || '—'}</span>
                <span className="text-xs text-text-muted truncate">{ic.borclu || '—'}</span>
                <span className="text-xs font-semibold text-text">{fmt(ic.alacak || 0)}</span>
                <span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${DURUM_RENK[ic.durum || ''] || 'text-text-dim bg-surface2 border-border'}`}>
                    {ic.durum || '—'}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-surface2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${tahsilOran >= 100 ? 'bg-green' : tahsilOran > 50 ? 'bg-gold' : 'bg-red'}`}
                      style={{ width: `${tahsilOran}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-text-dim w-8 text-right">{Math.round(tahsilOran)}%</span>
                </span>
                <span className="text-text-dim group-hover:text-gold transition-colors text-right">›</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MiniKpi({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-surface border border-border rounded-lg px-3 py-2.5 text-center">
      <div className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">{label}</div>
      <div className={`font-[var(--font-playfair)] text-lg font-bold ${color || 'text-text'}`}>{value}</div>
    </div>
  );
}
