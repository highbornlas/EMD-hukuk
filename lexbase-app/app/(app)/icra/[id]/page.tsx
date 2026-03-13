'use client';

import { use, useState, useMemo } from 'react';
import Link from 'next/link';
import { useIcra } from '@/lib/hooks/useIcra';
import { useMuvekkillar } from '@/lib/hooks/useMuvekkillar';
import { fmt, fmtTarih } from '@/lib/utils';

const TABS = [
  { key: 'evrak', label: 'Evraklar', icon: '📄' },
  { key: 'harcama', label: 'Harcamalar', icon: '💸' },
  { key: 'tahsilat', label: 'Tahsilat', icon: '💰' },
  { key: 'notlar', label: 'Notlar', icon: '📝' },
  { key: 'anlasma', label: 'Anlaşma', icon: '🤝' },
];

export default function IcraDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: icra, isLoading } = useIcra(id);
  const { data: muvekkillar } = useMuvekkillar();
  const [aktifTab, setAktifTab] = useState('evrak');

  const muvAd = useMemo(() => {
    if (!icra?.muvId || !muvekkillar) return '—';
    return muvekkillar.find((m) => m.id === icra.muvId)?.ad || '—';
  }, [icra, muvekkillar]);

  // Hesaplamalar
  const hesap = useMemo(() => {
    if (!icra) return { masraf: 0, tahsilat: 0, tahsilOran: 0, kalan: 0, evrakSayisi: 0 };
    const masraf = (icra.harcamalar || []).reduce((t, h) => t + (h.tutar || 0), 0);
    const tahsilat = (icra.tahsilatlar || []).filter((t) => t.tur === 'tahsilat').reduce((t, h) => t + (h.tutar || 0), 0);
    const alacak = icra.alacak || 0;
    const tahsilOran = alacak > 0 ? Math.min((tahsilat / alacak) * 100, 100) : 0;
    return { masraf, tahsilat, tahsilOran, kalan: alacak - tahsilat, evrakSayisi: (icra.evraklar || []).length };
  }, [icra]);

  // İtiraz süresi hesaplama
  const itirazBilgi = useMemo(() => {
    if (!icra?.otarih) return null;
    const itirazTarih = icra.itarih || icra.itirazSonTarih;
    if (!itirazTarih) return null;
    const sonTarih = new Date(itirazTarih);
    const bugun = new Date();
    const kalanGun = Math.ceil((sonTarih.getTime() - bugun.getTime()) / 86400000);
    return {
      tarih: itirazTarih,
      kalanGun,
      gecmis: kalanGun < 0,
      acil: kalanGun >= 0 && kalanGun <= 2,
    };
  }, [icra]);

  if (isLoading) {
    return <div className="text-center py-12 text-text-muted">Yükleniyor...</div>;
  }

  if (!icra) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3">❌</div>
        <div className="text-sm text-text-muted">İcra dosyası bulunamadı</div>
        <Link href="/icra" className="text-xs text-gold mt-3 inline-block hover:underline">← İcra dosyalarına dön</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-text-muted mb-4">
        <Link href="/icra" className="hover:text-gold transition-colors">İcra Dosyaları</Link>
        <span>›</span>
        <span className="text-text">{icra.no || icra.id}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-[var(--font-playfair)] text-2xl text-gold font-bold">{icra.no || '—'}</h1>
          <div className="text-sm text-text mt-1">Borçlu: {icra.borclu || '—'}</div>
          <div className="text-xs text-text-muted mt-0.5">
            Müvekkil: <span className="text-text">{muvAd}</span>
            {icra.daire && <> · {icra.daire}</>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {icra.muvRol && (
            <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
              icra.muvRol === 'alacakli' ? 'bg-green-dim text-green border-green/20' : 'bg-red-dim text-red border-red/20'
            }`}>
              {icra.muvRol === 'alacakli' ? 'ALACAKLI' : 'BORÇLU'}
            </span>
          )}
          {icra.durum && (
            <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
              icra.durum === 'Aktif' ? 'bg-green-dim text-green border-green/20' :
              icra.durum === 'Kapandı' ? 'bg-surface2 text-text-dim border-border' :
              'bg-gold-dim text-gold border-gold/20'
            }`}>
              {icra.durum}
            </span>
          )}
        </div>
      </div>

      {/* KPI Kartlar */}
      <div className="grid grid-cols-6 gap-3 mb-6">
        <KpiCard label="Toplam Alacak" value={fmt(icra.alacak || 0)} color="text-gold" />
        <div className="bg-surface border border-border rounded-lg p-3">
          <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Tahsil Edilen</div>
          <div className="text-sm font-bold text-green mb-1">{fmt(icra.tahsil || 0)}</div>
          <div className="h-1.5 bg-surface2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${hesap.tahsilOran >= 100 ? 'bg-green' : hesap.tahsilOran > 50 ? 'bg-gold' : 'bg-red'}`}
              style={{ width: `${hesap.tahsilOran}%` }}
            />
          </div>
        </div>
        <KpiCard label="Kalan" value={fmt(hesap.kalan)} color="text-red" />
        {itirazBilgi && (
          <div className={`bg-surface border rounded-lg p-3 ${itirazBilgi.gecmis ? 'border-text-dim' : itirazBilgi.acil ? 'border-red bg-red-dim' : 'border-gold bg-gold-dim'}`}>
            <div className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">İtiraz Süresi</div>
            <div className={`text-sm font-bold ${itirazBilgi.gecmis ? 'text-text-dim' : itirazBilgi.acil ? 'text-red' : 'text-gold'}`}>
              {itirazBilgi.gecmis ? 'Süre doldu' : `${itirazBilgi.kalanGun} gün`}
            </div>
            <div className="text-[10px] text-text-dim mt-0.5">{fmtTarih(itirazBilgi.tarih)}</div>
          </div>
        )}
        <KpiCard label="Masraf" value={fmt(hesap.masraf)} />
        <KpiCard label="Evrak" value={hesap.evrakSayisi.toString()} />
      </div>

      {/* Bilgi Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <InfoCard title="İcra Bilgileri">
          <InfoRow label="Tür" value={icra.tur || '—'} />
          <InfoRow label="İl / Adliye" value={[icra.il, icra.adliye].filter(Boolean).join(' / ') || '—'} />
          <InfoRow label="İcra Dairesi" value={icra.daire || '—'} />
          <InfoRow label="Esas" value={icra.esas || '—'} />
          <InfoRow label="Dayanak" value={icra.dayanak || '—'} />
        </InfoCard>

        <InfoCard title="Tarihler">
          <InfoRow label="Kayıt Tarihi" value={fmtTarih(icra.tarih) || '—'} />
          <InfoRow label="Ödeme Emri" value={fmtTarih(icra.otarih) || '—'} />
          <InfoRow label="İtiraz Son Tarih" value={fmtTarih(icra.itarih || icra.itirazSonTarih) || '—'} />
          <InfoRow label="İlişkili Dava" value={icra.davno || '—'} />
        </InfoCard>

        <InfoCard title="Taraflar">
          <InfoRow label="Müvekkil" value={muvAd} />
          <InfoRow label="Müvekkil Rolü" value={icra.muvRol === 'alacakli' ? 'Alacaklı' : icra.muvRol === 'borclu' ? 'Borçlu' : '—'} />
          <InfoRow label="Borçlu" value={icra.borclu || '—'} />
          <InfoRow label="Borçlu TC" value={icra.btc || '—'} />
          <InfoRow label="Karşı Vekil" value={icra.karsav || '—'} />
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
        {aktifTab === 'evrak' && <EvrakTab evraklar={icra.evraklar || []} />}
        {aktifTab === 'harcama' && <HarcamaTab harcamalar={icra.harcamalar || []} />}
        {aktifTab === 'tahsilat' && <TahsilatTab tahsilatlar={icra.tahsilatlar || []} />}
        {aktifTab === 'notlar' && <NotlarTab notlar={icra.notlar || []} notText={icra.not} />}
        {aktifTab === 'anlasma' && <AnlasmaTab anlasma={icra.anlasma} />}
      </div>
    </div>
  );
}

// ── Alt Componentler ─────────────────────────────────────────

function KpiCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-3">
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
      <span className="text-text font-medium text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}

function EvrakTab({ evraklar }: { evraklar: Record<string, unknown>[] }) {
  if (evraklar.length === 0) return <EmptyTab icon="📄" message="Henüz evrak eklenmemiş" />;
  return (
    <div className="space-y-2">
      {evraklar.map((e, i) => (
        <div key={(e.id as string) || i} className="flex items-center gap-3 p-3 bg-surface2 rounded-lg">
          <span className="text-sm">📄</span>
          <div className="flex-1">
            <div className="text-xs font-medium text-text">{(e.ad as string) || 'Belge'}</div>
            {(e.tarih as string) && <div className="text-[11px] text-text-muted">{fmtTarih(e.tarih as string)}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function HarcamaTab({ harcamalar }: { harcamalar: Array<{ id: string; kat?: string; acik?: string; tarih?: string; tutar: number }> }) {
  if (harcamalar.length === 0) return <EmptyTab icon="💸" message="Henüz harcama kaydı yok" />;
  const toplam = harcamalar.reduce((t, h) => t + (h.tutar || 0), 0);
  return (
    <div>
      <div className="text-xs text-text-muted mb-3">Toplam: <span className="font-bold text-text">{fmt(toplam)}</span></div>
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
  if (tahsilatlar.length === 0) return <EmptyTab icon="💰" message="Henüz tahsilat kaydı yok" />;
  const turLabel: Record<string, string> = {
    tahsilat: 'Tahsilat', akdi_vekalet: 'Akdi Vekalet', 'hakediş': 'Hakediş', aktarim: 'Aktarım', iade: 'İade',
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
      {notText && <div className="p-3 bg-surface2 rounded-lg text-xs text-text whitespace-pre-wrap">{notText}</div>}
      {notlar.length === 0 && !notText && <EmptyTab icon="📝" message="Henüz not eklenmemiş" />}
      {notlar.map((n, i) => (
        <div key={(n.id as string) || i} className="p-3 bg-surface2 rounded-lg">
          <div className="text-[11px] text-text-dim mb-1">{fmtTarih(n.tarih as string)}</div>
          <div className="text-xs text-text whitespace-pre-wrap">{(n.icerik as string) || '—'}</div>
        </div>
      ))}
    </div>
  );
}

function AnlasmaTab({ anlasma }: { anlasma?: Record<string, unknown> }) {
  if (!anlasma || Object.keys(anlasma).length === 0) return <EmptyTab icon="🤝" message="Henüz anlaşma tanımlanmamış" />;
  const turLabel: Record<string, string> = { pesin: 'Peşin', taksit: 'Taksitli', basari: 'Başarıya Göre', tahsilat: 'Tahsilata Göre', karma: 'Karma' };
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
