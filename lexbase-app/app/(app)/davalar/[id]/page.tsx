'use client';

import { use, useState, useMemo } from 'react';
import Link from 'next/link';
import { useDava } from '@/lib/hooks/useDavalar';
import { useMuvekkillar } from '@/lib/hooks/useMuvekkillar';
import { useFinansOzet } from '@/lib/hooks/useFinans';
import { fmt, fmtTarih } from '@/lib/utils';

const TABS = [
  { key: 'evrak', label: 'Evraklar', icon: '📄' },
  { key: 'harcama', label: 'Harcamalar', icon: '💸' },
  { key: 'tahsilat', label: 'Tahsilat', icon: '💰' },
  { key: 'notlar', label: 'Notlar', icon: '📝' },
  { key: 'anlasma', label: 'Anlaşma', icon: '🤝' },
];

export default function DavaDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: dava, isLoading } = useDava(id);
  const { data: muvekkillar } = useMuvekkillar();
  const [aktifTab, setAktifTab] = useState('evrak');

  // Müvekkil adı
  const muvAd = useMemo(() => {
    if (!dava?.muvId || !muvekkillar) return '—';
    return muvekkillar.find((m) => m.id === dava.muvId)?.ad || '—';
  }, [dava, muvekkillar]);

  // Hesaplamalar
  const hesap = useMemo(() => {
    if (!dava) return { masraf: 0, tahsilat: 0, hakedis: 0, vekalet: 0, evrakSayisi: 0 };
    const masraf = (dava.harcamalar || []).reduce((t, h) => t + (h.tutar || 0), 0);
    const tahsilat = (dava.tahsilatlar || []).filter((t) => t.tur === 'tahsilat').reduce((t, h) => t + (h.tutar || 0), 0);
    const hakedis = (dava.tahsilatlar || []).filter((t) => t.tur === 'hakediş').reduce((t, h) => t + (h.tutar || 0), 0);
    const vekalet = (dava.tahsilatlar || []).filter((t) => t.tur === 'akdi_vekalet').reduce((t, h) => t + (h.tutar || 0), 0);
    const evrakSayisi = (dava.evraklar || []).length;
    return { masraf, tahsilat, hakedis, vekalet, evrakSayisi };
  }, [dava]);

  if (isLoading) {
    return <div className="text-center py-12 text-text-muted">Yükleniyor...</div>;
  }

  if (!dava) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3">❌</div>
        <div className="text-sm text-text-muted">Dava bulunamadı</div>
        <Link href="/davalar" className="text-xs text-gold mt-3 inline-block hover:underline">← Davalara dön</Link>
      </div>
    );
  }

  const ASAMA_RENK: Record<string, string> = {
    'İlk Derece': 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    'İstinaf': 'bg-purple-400/10 text-purple-400 border-purple-400/20',
    'Temyiz (Yargıtay)': 'bg-orange-400/10 text-orange-400 border-orange-400/20',
    'Kesinleşti': 'bg-green-dim text-green border-green/20',
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-text-muted mb-4">
        <Link href="/davalar" className="hover:text-gold transition-colors">Davalar</Link>
        <span>›</span>
        <span className="text-text">{dava.no || dava.id}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-[var(--font-playfair)] text-2xl text-gold font-bold">{dava.no || '—'}</h1>
          <div className="text-sm text-text mt-1">{dava.konu || '—'}</div>
          <div className="text-xs text-text-muted mt-0.5">
            Müvekkil: <span className="text-text">{muvAd}</span>
            {dava.karsi && <> · Karşı Taraf: <span className="text-text">{dava.karsi}</span></>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {dava.asama && (
            <span className={`text-[10px] font-bold px-2 py-1 rounded border ${ASAMA_RENK[dava.asama] || 'bg-surface2 text-text-muted border-border'}`}>
              {dava.asama}
            </span>
          )}
          {dava.durum && (
            <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
              dava.durum === 'Aktif' ? 'bg-green-dim text-green border-green/20' :
              dava.durum === 'Beklemede' ? 'bg-gold-dim text-gold border-gold/20' :
              'bg-surface2 text-text-dim border-border'
            }`}>
              {dava.durumTag || dava.durum}
            </span>
          )}
        </div>
      </div>

      {/* KPI Kartlar */}
      <div className="grid grid-cols-6 gap-3 mb-6">
        <KpiCard label="Mahkeme" value={`${dava.mtur || ''} ${dava.mno || ''}`.trim() || '—'} />
        <KpiCard label="Esas" value={dava.esasYil && dava.esasNo ? `${dava.esasYil}/${dava.esasNo}` : '—'} />
        <KpiCard label="Duruşma" value={fmtTarih(dava.durusma) || '—'} accent={!!dava.durusma} />
        <KpiCard label="Toplam Masraf" value={fmt(hesap.masraf)} />
        <KpiCard label="Tahsilat" value={fmt(hesap.tahsilat)} color="text-green" />
        <KpiCard label="Evrak" value={hesap.evrakSayisi.toString()} />
      </div>

      {/* Bilgi Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <InfoCard title="Dava Bilgileri">
          <InfoRow label="Taraf" value={dava.taraf || '—'} />
          <InfoRow label="İl / Adliye" value={[dava.il, dava.adliye].filter(Boolean).join(' / ') || '—'} />
          <InfoRow label="Hakim" value={dava.hakim || '—'} />
          <InfoRow label="Kayıt Tarihi" value={fmtTarih(dava.tarih) || '—'} />
          <InfoRow label="Dava Değeri" value={dava.deger ? fmt(dava.deger) : '—'} />
        </InfoCard>

        <InfoCard title="Karar Bilgileri">
          <InfoRow label="Karar" value={dava.kararYil && dava.kararNo ? `${dava.kararYil}/${dava.kararNo}` : '—'} />
          <InfoRow label="Kesinleşme" value={fmtTarih(dava.kesin) || '—'} />
          <InfoRow label="İcra No" value={dava.icrano || '—'} />
          <InfoRow label="Durum Açıklama" value={dava.durumAciklama || '—'} />
        </InfoCard>

        <InfoCard title="Taraflar">
          <InfoRow label="Müvekkil" value={muvAd} />
          <InfoRow label="Karşı Taraf" value={dava.karsi || '—'} />
          <InfoRow label="Karşı Vekil" value={dava.karsav || '—'} />
        </InfoCard>
      </div>

      {/* Tab Navigasyonu */}
      <div className="flex border-b border-border mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setAktifTab(tab.key)}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              aktifTab === tab.key
                ? 'border-gold text-gold'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab İçerikleri */}
      <div className="bg-surface border border-border rounded-lg p-5">
        {aktifTab === 'evrak' && <EvrakTab evraklar={dava.evraklar || []} />}
        {aktifTab === 'harcama' && <HarcamaTab harcamalar={dava.harcamalar || []} />}
        {aktifTab === 'tahsilat' && <TahsilatTab tahsilatlar={dava.tahsilatlar || []} />}
        {aktifTab === 'notlar' && <NotlarTab notlar={dava.notlar || []} notText={dava.not} />}
        {aktifTab === 'anlasma' && <AnlasmaTab anlasma={dava.anlasma} />}
      </div>
    </div>
  );
}

// ── Alt Componentler ─────────────────────────────────────────

function KpiCard({ label, value, accent, color }: { label: string; value: string; accent?: boolean; color?: string }) {
  return (
    <div className={`bg-surface border rounded-lg p-3 ${accent ? 'border-gold bg-gold-dim' : 'border-border'}`}>
      <div className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">{label}</div>
      <div className={`text-sm font-bold ${color || 'text-text'}`}>{value}</div>
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <h4 className="text-xs font-semibold text-text mb-3">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-text-muted">{label}</span>
      <span className="text-text font-medium">{value}</span>
    </div>
  );
}

function EvrakTab({ evraklar }: { evraklar: Record<string, unknown>[] }) {
  if (evraklar.length === 0) {
    return <EmptyTab icon="📄" message="Henüz evrak eklenmemiş" />;
  }
  return (
    <div className="space-y-2">
      {evraklar.map((e, i) => (
        <div key={(e.id as string) || i} className="flex items-center gap-3 p-3 bg-surface2 rounded-lg">
          <span className="text-sm">📄</span>
          <div className="flex-1">
            <div className="text-xs font-medium text-text">{(e.ad as string) || 'Belge'}</div>
            <div className="text-[11px] text-text-muted">
              {(e.sekme as string) && <span>{e.sekme as string}</span>}
              {(e.tarih as string) && <span> · {fmtTarih(e.tarih as string)}</span>}
            </div>
          </div>
          {typeof e.kat === 'string' && <span className="text-[10px] text-text-dim px-2 py-0.5 bg-surface rounded">{e.kat}</span>}
        </div>
      ))}
    </div>
  );
}

function HarcamaTab({ harcamalar }: { harcamalar: Array<{ id: string; kat?: string; acik?: string; tarih?: string; tutar: number }> }) {
  if (harcamalar.length === 0) {
    return <EmptyTab icon="💸" message="Henüz harcama kaydı yok" />;
  }
  const toplam = harcamalar.reduce((t, h) => t + (h.tutar || 0), 0);
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs text-text-muted">Toplam: <span className="font-bold text-text">{fmt(toplam)}</span></span>
      </div>
      <div className="space-y-1.5">
        {harcamalar.map((h) => (
          <div key={h.id} className="flex items-center gap-3 p-3 bg-surface2 rounded-lg text-xs">
            <span className="text-text-dim">{fmtTarih(h.tarih)}</span>
            {h.kat && <span className="px-2 py-0.5 bg-surface rounded text-text-muted text-[10px]">{h.kat}</span>}
            <span className="flex-1 text-text">{h.acik || '—'}</span>
            <span className="font-bold text-text">{fmt(h.tutar)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TahsilatTab({ tahsilatlar }: { tahsilatlar: Array<{ id: string; tur: string; tutar: number; tarih?: string; acik?: string }> }) {
  if (tahsilatlar.length === 0) {
    return <EmptyTab icon="💰" message="Henüz tahsilat kaydı yok" />;
  }
  const turLabel: Record<string, string> = {
    tahsilat: 'Tahsilat',
    akdi_vekalet: 'Akdi Vekalet',
    'hakediş': 'Hakediş',
    aktarim: 'Aktarım',
    iade: 'İade',
  };
  return (
    <div className="space-y-1.5">
      {tahsilatlar.map((t) => (
        <div key={t.id} className="flex items-center gap-3 p-3 bg-surface2 rounded-lg text-xs">
          <span className="text-text-dim">{fmtTarih(t.tarih)}</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            t.tur === 'tahsilat' ? 'bg-green-dim text-green' :
            t.tur === 'akdi_vekalet' ? 'bg-blue-400/10 text-blue-400' :
            t.tur === 'hakediş' ? 'bg-gold-dim text-gold' :
            'bg-surface text-text-muted'
          }`}>
            {turLabel[t.tur] || t.tur}
          </span>
          <span className="flex-1 text-text">{t.acik || '—'}</span>
          <span className={`font-bold ${t.tur === 'aktarim' || t.tur === 'iade' ? 'text-red' : 'text-green'}`}>{fmt(t.tutar)}</span>
        </div>
      ))}
    </div>
  );
}

function NotlarTab({ notlar, notText }: { notlar: Record<string, unknown>[]; notText?: string }) {
  return (
    <div className="space-y-3">
      {notText && (
        <div className="p-3 bg-surface2 rounded-lg text-xs text-text whitespace-pre-wrap">{notText}</div>
      )}
      {notlar.length === 0 && !notText && <EmptyTab icon="📝" message="Henüz not eklenmemiş" />}
      {notlar.map((n, i) => (
        <div key={(n.id as string) || i} className="p-3 bg-surface2 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] text-text-dim">{fmtTarih(n.tarih as string)}</span>
            {typeof n.yazar === 'string' && <span className="text-[11px] text-text-muted">{n.yazar}</span>}
          </div>
          <div className="text-xs text-text whitespace-pre-wrap">{(n.icerik as string) || '—'}</div>
        </div>
      ))}
    </div>
  );
}

function AnlasmaTab({ anlasma }: { anlasma?: Record<string, unknown> }) {
  if (!anlasma || Object.keys(anlasma).length === 0) {
    return <EmptyTab icon="🤝" message="Henüz vekalet anlaşması tanımlanmamış" />;
  }
  const turLabel: Record<string, string> = {
    pesin: 'Peşin',
    taksit: 'Taksitli',
    basari: 'Başarıya Göre',
    tahsilat: 'Tahsilata Göre',
    karma: 'Karma',
  };
  return (
    <div className="space-y-2">
      <InfoRow label="Ücret Türü" value={turLabel[(anlasma.tur as string) || ''] || (anlasma.tur as string) || '—'} />
      {typeof anlasma.ucret === 'number' && <InfoRow label="Ücret" value={fmt(anlasma.ucret)} />}
      {anlasma.yuzde != null && <InfoRow label="Yüzde" value={`%${String(anlasma.yuzde)}`} />}
      {anlasma.taksitSayisi != null && <InfoRow label="Taksit Sayısı" value={String(anlasma.taksitSayisi)} />}
    </div>
  );
}

function EmptyTab({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="text-center py-10">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-xs text-text-muted">{message}</div>
    </div>
  );
}
