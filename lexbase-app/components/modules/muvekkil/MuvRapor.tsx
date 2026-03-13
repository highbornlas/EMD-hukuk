'use client';

import type { Muvekkil } from '@/lib/hooks/useMuvekkillar';
import { fmt } from '@/lib/utils';

interface Props {
  muv: Muvekkil;
  finansOzet: Record<string, unknown> | null | undefined;
}

export function MuvRapor({ muv, finansOzet }: Props) {
  if (!finansOzet) {
    return (
      <div className="text-center py-12 text-text-muted">
        <div className="text-4xl mb-3">📊</div>
        <div className="text-sm">Finansal veri yükleniyor...</div>
      </div>
    );
  }

  const masraflar = finansOzet.masraflar as Record<string, number> | undefined;
  const avanslar = finansOzet.avanslar as Record<string, number> | undefined;
  const tahsilatlar = finansOzet.tahsilatlar as Record<string, number> | undefined;
  const vekalet = finansOzet.vekaletUcreti as Record<string, Record<string, number>> | undefined;
  const bakiye = finansOzet.bakiye as Record<string, number> | undefined;
  const danismanlik = finansOzet.danismanlik as Record<string, number> | undefined;

  const rows = [
    { label: 'Toplam Masraf', value: masraflar?.toplam, color: '' },
    { label: 'Alınan Avans', value: avanslar?.alinan, color: 'text-green' },
    { label: 'Masraf Bakiyesi', value: bakiye?.masrafBakiye, color: (bakiye?.masrafBakiye ?? 0) >= 0 ? 'text-green' : 'text-red' },
    { label: '', value: 0, color: '', divider: true },
    { label: 'Karşı Taraf Tahsilatı', value: tahsilatlar?.karsiTaraf, color: '' },
    { label: 'Anlaşılan Vekalet Ücreti', value: vekalet?.akdi?.anlasilanToplam, color: '' },
    { label: 'Tahsil Edilen Vekalet', value: vekalet?.akdi?.tahsilEdilen, color: 'text-green' },
    { label: 'Kalan Vekalet Alacağı', value: vekalet?.akdi?.kalan, color: 'text-gold' },
    { label: 'Hakediş Toplamı', value: vekalet?.hakedis?.toplam, color: 'text-green' },
    { label: '', value: 0, color: '', divider: true },
    { label: 'Tahsilat Bakiyesi', value: bakiye?.tahsilatBakiye, color: 'text-gold' },
    { label: 'Danışmanlık Geliri', value: danismanlik?.gelir, color: 'text-green' },
    { label: 'GENEL BAKİYE', value: bakiye?.genelBakiye, color: (bakiye?.genelBakiye ?? 0) >= 0 ? 'text-green' : 'text-red', bold: true },
  ];

  return (
    <div className="bg-surface border border-border rounded-lg p-6 max-w-xl">
      <h3 className="text-sm font-semibold text-text mb-1">📊 Finansal Rapor</h3>
      <p className="text-[11px] text-text-dim mb-5">{muv.ad} — Müvekkil Cari Özet</p>

      <div className="space-y-0">
        {rows.map((row, i) => {
          if (row.divider) {
            return <div key={i} className="border-t border-border my-3" />;
          }
          return (
            <div key={i} className={`flex justify-between items-baseline py-1.5 ${row.bold ? 'border-t-2 border-gold pt-3 mt-2' : ''}`}>
              <span className={`text-xs ${row.bold ? 'font-bold text-text' : 'text-text-muted'}`}>
                {row.label}
              </span>
              <span className={`text-xs font-semibold ${row.color || 'text-text'} ${row.bold ? 'text-base font-bold' : ''}`}>
                {fmt(row.value ?? 0)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
