'use client';

import { useMemo } from 'react';
import { fmt } from '@/lib/utils';

/* ══════════════════════════════════════════════════════════════
   KPI Widget — Üst sıra KPI kartları
   ══════════════════════════════════════════════════════════════ */

interface KpiWidgetProps {
  muvekkillar: Array<Record<string, unknown>>;
  davalar: Array<Record<string, unknown>>;
  icralar: Array<Record<string, unknown>>;
  yilNet: number;
}

function KpiCard({ icon, value, label, sub, accent, color }: {
  icon: string;
  value: number | string;
  label: string;
  sub?: string;
  accent?: boolean;
  color?: string;
}) {
  return (
    <div className={`kpi-card px-3 sm:px-4 py-3 ${accent ? 'kpi-accent' : ''}`}>
      <div className="flex items-start gap-2.5">
        <div className="text-lg sm:text-xl flex-shrink-0 mt-0.5">{icon}</div>
        <div className="min-w-0">
          <div className={`font-[var(--font-playfair)] text-lg sm:text-xl font-bold leading-tight ${color || 'text-text'}`}>
            {value}
          </div>
          <div className="text-[8px] sm:text-[9px] text-text-muted uppercase tracking-wider font-semibold mt-0.5">{label}</div>
          {sub && <div className="text-[9px] sm:text-[10px] text-text-dim mt-0.5">{sub}</div>}
        </div>
      </div>
    </div>
  );
}

export function KpiWidget({ muvekkillar, davalar, icralar, yilNet }: KpiWidgetProps) {
  const kpis = useMemo(() => {
    const muvSayi = muvekkillar?.length ?? 0;
    const muvGercek = muvekkillar?.filter((m) => m.tip === 'gercek').length ?? 0;
    const muvTuzel = muvekkillar?.filter((m) => m.tip === 'tuzel').length ?? 0;
    const aktifDava = davalar?.filter((d) => d.durum === 'Aktif' || d.durum === 'Devam Ediyor').length ?? 0;
    const davaSayi = davalar?.length ?? 0;
    const aktifIcra = icralar?.filter((i) => i.durum !== 'Kapandı').length ?? 0;
    const icraSayi = icralar?.length ?? 0;

    const bugun = new Date();
    const haftaSonu = new Date(bugun);
    haftaSonu.setDate(bugun.getDate() + 7);
    const buHaftaDurusma = davalar?.filter((d) => {
      if (!d.durusma) return false;
      const t = new Date(d.durusma as string);
      return t >= bugun && t <= haftaSonu;
    }).length ?? 0;

    return { muvSayi, muvGercek, muvTuzel, aktifDava, davaSayi, aktifIcra, icraSayi, buHaftaDurusma };
  }, [muvekkillar, davalar, icralar]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <KpiCard icon="👥" value={kpis.muvSayi} label="MÜVEKKİLLER" sub={`${kpis.muvGercek} Gerçek · ${kpis.muvTuzel} Tüzel`} />
      <KpiCard icon="📁" value={kpis.aktifDava} label="DERDEST DAVA" sub={`${kpis.davaSayi} dosya`} color="text-gold" />
      <KpiCard icon="⚡" value={kpis.aktifIcra} label="DERDEST İCRA" sub={`${kpis.icraSayi} dosya`} color="text-red" />
      <KpiCard icon="📅" value={kpis.buHaftaDurusma} label="BU HAFTA DURUŞMA" sub={`${kpis.buHaftaDurusma} adet`} color="text-red" accent />
      <KpiCard icon="💎" value={fmt(yilNet)} label={`${new Date().getFullYear()} NET GELİR`} sub="Kâr" color={yilNet >= 0 ? 'text-green' : 'text-red'} />
    </div>
  );
}
