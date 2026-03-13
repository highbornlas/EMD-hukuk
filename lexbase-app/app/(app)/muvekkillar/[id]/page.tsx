'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useMuvekkil, useMuvDavalar, useMuvIcralar } from '@/lib/hooks/useMuvekkillar';
import { useFinansOzet } from '@/lib/hooks/useFinans';
import { fmt } from '@/lib/utils';
import { MuvKpiCards } from '@/components/modules/muvekkil/MuvKpiCards';
import { MuvKimlik } from '@/components/modules/muvekkil/MuvKimlik';
import { MuvDosyalar } from '@/components/modules/muvekkil/MuvDosyalar';
import { MuvRapor } from '@/components/modules/muvekkil/MuvRapor';

const TABS = [
  { key: 'davalar', label: '📁 Davalar', icon: '📁' },
  { key: 'kimlik', label: '🪪 Kimlik & İletişim', icon: '🪪' },
  { key: 'harcamalar', label: '💸 Harcamalar', icon: '💸' },
  { key: 'avans', label: '💰 Avans & Alacak', icon: '💰' },
  { key: 'rapor', label: '📊 Rapor', icon: '📊' },
  { key: 'notlar', label: '📝 Notlar', icon: '📝' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function MuvekkilDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: muv, isLoading } = useMuvekkil(id);
  const { data: finansOzet } = useFinansOzet(id);
  const { data: davalar } = useMuvDavalar(id);
  const { data: icralar } = useMuvIcralar(id);
  const [aktifTab, setAktifTab] = useState<TabKey>('davalar');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-muted text-sm">Yükleniyor...</div>
      </div>
    );
  }

  if (!muv) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-4xl">🔍</div>
        <div className="text-text-muted text-sm">Müvekkil bulunamadı</div>
        <Link href="/muvekkillar" className="text-gold text-sm hover:text-gold-light">
          ← Müvekkil Listesine Dön
        </Link>
      </div>
    );
  }

  const tipLabel = muv.tip === 'tuzel' ? 'TÜZEL KİŞİ' : 'GERÇEK KİŞİ';
  const tipColor = muv.tip === 'tuzel' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' : 'text-green bg-green-dim border-green/20';

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-text-dim mb-4">
        <Link href="/muvekkillar" className="hover:text-gold transition-colors">Müvekkiller</Link>
        <span>›</span>
        <span className="text-text-muted">{muv.ad}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-[var(--font-playfair)] text-2xl text-text font-bold">
              {muv.ad}
            </h1>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${tipColor}`}>
              {tipLabel}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-text-muted">
            {muv.tc && <span>TC: {muv.tc}</span>}
            {muv.vergiNo && <span>VKN: {muv.vergiNo}</span>}
            {muv.tel && <span>📞 {muv.tel}</span>}
            {muv.mail && <span>✉️ {muv.mail}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-xs font-medium text-text-muted border border-border rounded-lg hover:border-gold hover:text-gold transition-colors">
            ✏️ Düzenle
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <MuvKpiCards
        davaSayisi={davalar?.length ?? 0}
        aktifDava={davalar?.filter((d: Record<string, unknown>) => d.durum === 'Aktif' || d.durum === 'derdest').length ?? 0}
        finansOzet={finansOzet}
      />

      {/* Tab Navigation */}
      <div className="flex gap-0 border-b-2 border-border mb-5 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setAktifTab(tab.key)}
            className={`
              px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 -mb-[2px] transition-all
              ${aktifTab === tab.key
                ? 'text-gold border-gold'
                : 'text-text-muted border-transparent hover:text-text hover:border-border'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {aktifTab === 'davalar' && <MuvDosyalar davalar={davalar || []} icralar={icralar || []} />}
        {aktifTab === 'kimlik' && <MuvKimlik muv={muv} />}
        {aktifTab === 'harcamalar' && <HarcamalarTab davalar={davalar || []} icralar={icralar || []} />}
        {aktifTab === 'avans' && <AvansTab finansOzet={finansOzet} />}
        {aktifTab === 'rapor' && <MuvRapor muv={muv} finansOzet={finansOzet} />}
        {aktifTab === 'notlar' && <NotlarTab not={muv.not} />}
      </div>
    </div>
  );
}

// ── Harcamalar Tab ────────────────────────────────────────────
function HarcamalarTab({ davalar, icralar }: { davalar: Record<string, unknown>[]; icralar: Record<string, unknown>[] }) {
  const tumHarcamalar: Array<{ tarih: string; tutar: number; kat: string; acik: string; dosyaNo: string; dosyaTur: string }> = [];

  [...davalar, ...icralar].forEach((dosya) => {
    const harcamalar = (dosya.harcamalar || []) as Array<Record<string, string>>;
    const tur = (dosya as Record<string, unknown>).konu ? 'Dava' : 'İcra';
    harcamalar.forEach((h) => {
      tumHarcamalar.push({
        tarih: h.tarih || '',
        tutar: parseFloat(h.tutar) || 0,
        kat: h.kat || 'Harcama',
        acik: h.acik || '',
        dosyaNo: (dosya.no as string) || '',
        dosyaTur: tur,
      });
    });
  });

  tumHarcamalar.sort((a, b) => b.tarih.localeCompare(a.tarih));

  if (!tumHarcamalar.length) {
    return (
      <div className="text-center py-12 text-text-muted">
        <div className="text-4xl mb-3">💸</div>
        <div className="text-sm">Henüz harcama kaydı yok</div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="px-4 py-3 text-xs font-semibold text-text-muted">Tarih</th>
            <th className="px-4 py-3 text-xs font-semibold text-text-muted">Kategori</th>
            <th className="px-4 py-3 text-xs font-semibold text-text-muted">Açıklama</th>
            <th className="px-4 py-3 text-xs font-semibold text-text-muted">Dosya</th>
            <th className="px-4 py-3 text-xs font-semibold text-text-muted text-right">Tutar</th>
          </tr>
        </thead>
        <tbody>
          {tumHarcamalar.map((h, i) => (
            <tr key={i} className="border-b border-border/50 hover:bg-surface2 transition-colors">
              <td className="px-4 py-2.5 text-text-muted text-xs">{h.tarih}</td>
              <td className="px-4 py-2.5">
                <span className="text-[10px] px-2 py-0.5 rounded bg-surface2 border border-border text-text-muted">
                  {h.kat}
                </span>
              </td>
              <td className="px-4 py-2.5 text-text text-xs">{h.acik || '—'}</td>
              <td className="px-4 py-2.5 text-gold text-xs font-medium">{h.dosyaNo}</td>
              <td className="px-4 py-2.5 text-right text-text font-semibold text-xs">{fmt(h.tutar)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-border">
            <td colSpan={4} className="px-4 py-3 text-xs font-semibold text-text-muted text-right">
              Toplam:
            </td>
            <td className="px-4 py-3 text-right text-gold font-bold text-sm">
              {fmt(tumHarcamalar.reduce((s, h) => s + h.tutar, 0))}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ── Avans Tab ─────────────────────────────────────────────────
function AvansTab({ finansOzet }: { finansOzet: Record<string, unknown> | null | undefined }) {
  const avanslar = finansOzet?.avanslar as Record<string, number> | undefined;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-surface border border-border rounded-lg p-5">
        <div className="text-[11px] text-text-muted uppercase tracking-wider mb-1">Alınan Avans</div>
        <div className="font-[var(--font-playfair)] text-xl text-green font-bold">
          {fmt(avanslar?.alinan ?? 0)}
        </div>
      </div>
      <div className="bg-surface border border-border rounded-lg p-5">
        <div className="text-[11px] text-text-muted uppercase tracking-wider mb-1">Bekleyen Avans</div>
        <div className="font-[var(--font-playfair)] text-xl text-gold font-bold">
          {fmt(avanslar?.bekleyen ?? 0)}
        </div>
      </div>
      <div className="bg-surface border border-border rounded-lg p-5">
        <div className="text-[11px] text-text-muted uppercase tracking-wider mb-1">Masraf Bakiyesi</div>
        <div className={`font-[var(--font-playfair)] text-xl font-bold ${(avanslar?.kalan ?? 0) >= 0 ? 'text-green' : 'text-red'}`}>
          {fmt(avanslar?.kalan ?? 0)}
        </div>
      </div>
    </div>
  );
}

// ── Notlar Tab ────────────────────────────────────────────────
function NotlarTab({ not }: { not?: string }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      {not ? (
        <div className="text-sm text-text whitespace-pre-wrap leading-relaxed">{not}</div>
      ) : (
        <div className="text-center py-8 text-text-muted">
          <div className="text-4xl mb-3">📝</div>
          <div className="text-sm">Henüz not eklenmemiş</div>
        </div>
      )}
    </div>
  );
}
