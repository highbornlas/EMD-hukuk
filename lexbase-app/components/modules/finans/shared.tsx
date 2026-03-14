'use client';

import { fmt } from '@/lib/utils';

// ── Sabitler ────────────────────────────────────────────────────

export const AYLAR = [
  { val: 0, label: 'Tümü' },
  { val: 1, label: 'Ocak' }, { val: 2, label: 'Şubat' }, { val: 3, label: 'Mart' },
  { val: 4, label: 'Nisan' }, { val: 5, label: 'Mayıs' }, { val: 6, label: 'Haziran' },
  { val: 7, label: 'Temmuz' }, { val: 8, label: 'Ağustos' }, { val: 9, label: 'Eylül' },
  { val: 10, label: 'Ekim' }, { val: 11, label: 'Kasım' }, { val: 12, label: 'Aralık' },
];

export const ODEME_RENK: Record<string, string> = {
  odendi: 'text-green bg-green-dim border-green/20',
  bekliyor: 'text-gold bg-gold-dim border-gold/20',
  gecikti: 'text-red bg-red-dim border-red/20',
};

export const ODEME_LABEL: Record<string, string> = {
  odendi: 'Ödendi',
  bekliyor: 'Bekliyor',
  gecikti: 'Gecikti',
};

// ── Ortak Bileşenler ────────────────────────────────────────────

export function MiniKpi({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-surface border border-border rounded-lg px-3 py-2.5 text-center">
      <div className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">{label}</div>
      <div className={`font-[var(--font-playfair)] text-lg font-bold ${color || 'text-text'}`}>{value}</div>
    </div>
  );
}

export function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="text-center py-16 bg-surface border border-border rounded-lg">
      <div className="text-4xl mb-3">{icon}</div>
      <div className="text-sm text-text-muted">{message}</div>
    </div>
  );
}

export function BakiyeItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-surface2 rounded px-2 py-1.5">
      <div className="text-[9px] text-text-dim uppercase tracking-wider">{label}</div>
      <div className={`text-xs font-semibold ${color || 'text-text'}`}>{value}</div>
    </div>
  );
}

export function KzRow({ label, value, color, bold }: { label: string; value?: number; color?: string; bold?: boolean }) {
  return (
    <div className="flex justify-between text-xs">
      <span className={bold ? 'font-bold text-text' : 'text-text-muted'}>{label}</span>
      <span className={`font-semibold ${bold ? 'font-bold' : ''} ${color || 'text-text'}`}>{fmt(value ?? 0)}</span>
    </div>
  );
}
