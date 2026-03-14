'use client';

import { use, useState, useMemo } from 'react';
import Link from 'next/link';
import { useDava, useDavaKaydet } from '@/lib/hooks/useDavalar';
import { useIcralar } from '@/lib/hooks/useIcra';
import { useMuvekkillar } from '@/lib/hooks/useMuvekkillar';
import { fmt, fmtTarih } from '@/lib/utils';
import {
  tamMahkemeAdi,
  esasNoGoster,
  davaciBelirle,
  durusmaTarihSaatGoster,
  durusmayaKalanGun,
  sureHesapla,
} from '@/lib/utils/uyapHelpers';
import { SureBadge, DurusmaBadge } from '@/components/ui/SureBadge';
import { DavaModal } from '@/components/modules/DavaModal';
import { DosyaEvrakTab } from '@/components/modules/DosyaEvrakTab';

const TABS = [
  { key: 'ozet', label: 'Özet', icon: '📋' },
  { key: 'evrak', label: 'Evraklar', icon: '📄' },
  { key: 'harcama', label: 'Harcamalar', icon: '💸' },
  { key: 'tahsilat', label: 'Tahsilat', icon: '💰' },
  { key: 'sureler', label: 'Süreler', icon: '⏳' },
  { key: 'notlar', label: 'Notlar', icon: '📝' },
  { key: 'anlasma', label: 'Anlaşma', icon: '🤝' },
];

const ASAMA_RENK: Record<string, string> = {
  'İlk Derece': 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  'İstinaf': 'bg-purple-400/10 text-purple-400 border-purple-400/20',
  'Temyiz (Yargıtay)': 'bg-orange-400/10 text-orange-400 border-orange-400/20',
  'Kesinleşti': 'bg-green-dim text-green border-green/20',
};

const DURUM_RENK: Record<string, string> = {
  'Aktif': 'bg-green-dim text-green border-green/20',
  'Beklemede': 'bg-gold-dim text-gold border-gold/20',
  'Kapalı': 'bg-surface2 text-text-dim border-border',
};

export default function DavaDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: dava, isLoading } = useDava(id);
  const { data: muvekkillar } = useMuvekkillar();
  const { data: icralar } = useIcralar();
  const davaKaydet = useDavaKaydet();
  const [aktifTab, setAktifTab] = useState('ozet');
  const [duzenleModu, setDuzenleModu] = useState(false);

  // Müvekkil adı
  const muvAd = useMemo(() => {
    if (!dava?.muvId || !muvekkillar) return '—';
    return muvekkillar.find((m) => m.id === dava.muvId)?.ad || '—';
  }, [dava, muvekkillar]);

  // Tam mahkeme adı
  const mahkemeAdi = useMemo(() => {
    if (!dava) return '';
    return tamMahkemeAdi(dava.il, dava.mno, dava.mtur);
  }, [dava]);

  // Esas no
  const esasNo = useMemo(() => {
    if (!dava) return '';
    return esasNoGoster(dava.esasYil, dava.esasNo);
  }, [dava]);

  // Davacı / Davalı
  const taraflar = useMemo(() => {
    if (!dava) return { davaci: '—', davali: '—' };
    return davaciBelirle(dava.taraf, muvAd, dava.karsi || '—');
  }, [dava, muvAd]);

  // Duruşma bilgisi
  const durusmaKalan = useMemo(() => {
    if (!dava?.durusma) return null;
    return durusmayaKalanGun(dava.durusma);
  }, [dava]);

  // İlişkili İcra
  const iliskiliIcra = useMemo(() => {
    if (!dava?.iliskiliIcraId || !icralar) return null;
    return icralar.find((ic) => ic.id === dava.iliskiliIcraId) || null;
  }, [dava, icralar]);

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

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-text-muted mb-4">
        <Link href="/davalar" className="hover:text-gold transition-colors">Davalar</Link>
        <span>›</span>
        <span className="text-text">{esasNo || dava.no || dava.id.slice(0, 8)}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-[var(--font-playfair)] text-2xl text-gold font-bold">
              {esasNo || dava.no || '—'}
            </h1>
            {dava.davaTuru && (
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-surface2 text-text-muted border border-border">
                {dava.davaTuru}
              </span>
            )}
          </div>

          {dava.konu && <div className="text-sm text-text mt-1">{dava.konu}</div>}

          {mahkemeAdi && (
            <div className="text-xs text-gold/80 mt-1 font-medium">{mahkemeAdi}</div>
          )}

          <div className="text-xs text-text-muted mt-1">
            Davacı: <span className="text-text">{taraflar.davaci}</span>
            <span className="mx-1.5 text-text-dim">vs</span>
            Davalı: <span className="text-text">{taraflar.davali}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDuzenleModu(true)}
            className="text-xs px-3 py-1.5 rounded bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-colors"
          >
            Düzenle
          </button>
          {dava.asama && (
            <span className={`text-[10px] font-bold px-2 py-1 rounded border ${ASAMA_RENK[dava.asama] || 'bg-surface2 text-text-muted border-border'}`}>
              {dava.asama}
            </span>
          )}
          {dava.durum && (
            <span className={`text-[10px] font-bold px-2 py-1 rounded border ${DURUM_RENK[dava.durum] || 'bg-surface2 text-text-dim border-border'}`}>
              {dava.durum}
            </span>
          )}
        </div>
      </div>

      {/* KPI Kartlar */}
      <div className="grid grid-cols-6 gap-3 mb-6">
        <KpiCard label="Mahkeme" value={mahkemeAdi || '—'} small />
        <KpiCard label="Esas No" value={esasNo || '—'} />
        <div className={`bg-surface border rounded-lg p-3 ${
          durusmaKalan !== null && durusmaKalan >= 0 && durusmaKalan <= 7 ? 'border-gold bg-gold-dim' : 'border-border'
        }`}>
          <div className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">Duruşma</div>
          {dava.durusma ? (
            <DurusmaBadge tarih={dava.durusma} saat={dava.durusmaSaati} />
          ) : (
            <div className="text-sm font-bold text-text-dim">—</div>
          )}
        </div>
        <KpiCard label="Toplam Masraf" value={fmt(hesap.masraf)} />
        <KpiCard label="Tahsilat" value={fmt(hesap.tahsilat)} color="text-green" />
        <KpiCard label="Evrak" value={hesap.evrakSayisi.toString()} />
      </div>

      {/* Kapanış Bilgisi */}
      {dava.durum === 'Kapalı' && dava.kapanisSebebi && (
        <div className="bg-surface2 border border-border rounded-lg p-4 mb-6 flex items-center gap-3">
          <span className="text-lg">🔒</span>
          <div>
            <div className="text-xs font-semibold text-text">Dosya Kapatıldı</div>
            <div className="text-[11px] text-text-muted">
              Sebep: <span className="text-text">{dava.kapanisSebebi}</span>
              {dava.kapanisTarih && <> · {fmtTarih(dava.kapanisTarih)}</>}
            </div>
          </div>
        </div>
      )}

      {/* Bilgi Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <InfoCard title="Dava Bilgileri">
          <InfoRow label="Dava Türü" value={dava.davaTuru || '—'} />
          <InfoRow label="Konu" value={dava.konu || '—'} />
          <InfoRow label="Taraf" value={
            dava.taraf === 'davaci' ? 'Davacı' :
            dava.taraf === 'davali' ? 'Davalı' :
            dava.taraf === 'mudahil' ? 'Müdahil' :
            dava.taraf || '—'
          } />
          <InfoRow label="İl / Adliye" value={[dava.il, dava.adliye].filter(Boolean).join(' / ') || '—'} />
          <InfoRow label="Mahkeme" value={mahkemeAdi || '—'} />
          <InfoRow label="Esas No" value={esasNo || '—'} />
          <InfoRow label="Dava Tarihi" value={fmtTarih(dava.tarih) || '—'} />
          <InfoRow label="Dava Değeri" value={dava.deger ? fmt(dava.deger) : '—'} />
          <InfoRow label="Hakim" value={dava.hakim || '—'} />
        </InfoCard>

        <InfoCard title="Karar & Duruşma">
          <InfoRow label="Aşama" value={dava.asama || '—'} />
          <InfoRow label="Durum" value={dava.durum || '—'} />
          {dava.durumAciklama && <InfoRow label="Durum Açıklama" value={dava.durumAciklama} />}
          <InfoRow label="Karar No" value={dava.kararYil && dava.kararNo ? `${dava.kararYil}/${dava.kararNo}` : '—'} />
          <InfoRow label="Karar Tarihi" value={fmtTarih(dava.ktarih) || '—'} />
          <InfoRow label="Kesinleşme" value={fmtTarih(dava.kesin) || '—'} />
          <div className="border-t border-border pt-2 mt-2">
            <InfoRow label="Duruşma" value={durusmaTarihSaatGoster(dava.durusma, dava.durusmaSaati) || '—'} />
            {durusmaKalan !== null && durusmaKalan >= 0 && (
              <div className="mt-1 flex justify-end">
                <SureBadge kalanGun={durusmaKalan} label="duruşma" />
              </div>
            )}
          </div>
        </InfoCard>

        <InfoCard title="Taraflar & İlişkiler">
          <InfoRow label="Müvekkil" value={muvAd} />
          <InfoRow label="Davacı" value={taraflar.davaci} />
          <InfoRow label="Davalı" value={taraflar.davali} />
          <InfoRow label="Karşı Vekil" value={dava.karsav || '—'} />
          <div className="border-t border-border pt-2 mt-2">
            {iliskiliIcra ? (
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-muted">İlişkili İcra</span>
                <Link
                  href={`/icra/${iliskiliIcra.id}`}
                  className="text-gold hover:underline font-medium"
                >
                  {esasNoGoster(iliskiliIcra.esasYil, iliskiliIcra.esasNo) || iliskiliIcra.no || 'Dosya'}
                </Link>
              </div>
            ) : (
              <InfoRow label="İlişkili İcra" value={dava.icrano || '—'} />
            )}
          </div>
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
            {tab.key === 'sureler' && (dava.sureler || []).length > 0 && (
              <span className="ml-1 text-[10px] bg-gold/10 text-gold px-1 rounded">{dava.sureler!.length}</span>
            )}
            {tab.key === 'evrak' && hesap.evrakSayisi > 0 && (
              <span className="ml-1 text-[10px] bg-surface2 text-text-muted px-1 rounded">{hesap.evrakSayisi}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab İçerikleri */}
      <div className="bg-surface border border-border rounded-lg p-5">
        {aktifTab === 'ozet' && <OzetTab dava={dava} muvAd={muvAd} mahkeme={mahkemeAdi} taraflar={taraflar} esasNo={esasNo} hesap={hesap} />}
        {aktifTab === 'evrak' && <DosyaEvrakTab dosyaId={id} dosyaTipi="dava" muvId={dava.muvId} />}
        {aktifTab === 'harcama' && <HarcamaTab harcamalar={dava.harcamalar || []} />}
        {aktifTab === 'tahsilat' && <TahsilatTab tahsilatlar={dava.tahsilatlar || []} />}
        {aktifTab === 'sureler' && <SurelerTab sureler={dava.sureler || []} />}
        {aktifTab === 'notlar' && <NotlarTab notlar={dava.notlar || []} notText={dava.not} />}
        {aktifTab === 'anlasma' && <AnlasmaTab anlasma={dava.anlasma} />}
      </div>

      {/* Düzenleme Modal */}
      {duzenleModu && (
        <DavaModal
          open={duzenleModu}
          onClose={() => setDuzenleModu(false)}
          dava={dava}
          onCreated={(d) => {
            davaKaydet.mutate(d);
            setDuzenleModu(false);
          }}
        />
      )}
    </div>
  );
}

// ── Alt Componentler ─────────────────────────────────────────

function KpiCard({ label, value, color, small }: { label: string; value: string; color?: string; small?: boolean }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-3">
      <div className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">{label}</div>
      <div className={`${small ? 'text-xs' : 'text-sm'} font-bold ${color || 'text-text'} truncate`}>{value}</div>
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

// ── Özet Sekmesi ─────────────────────────────────────────────
function OzetTab({
  dava,
  muvAd,
  mahkeme,
  taraflar,
  esasNo: esas,
  hesap,
}: {
  dava: import('@/lib/hooks/useDavalar').Dava;
  muvAd: string;
  mahkeme: string;
  taraflar: { davaci: string; davali: string };
  esasNo: string;
  hesap: { masraf: number; tahsilat: number; hakedis: number; vekalet: number; evrakSayisi: number };
}) {
  return (
    <div className="space-y-5">
      {/* UYAP Tarzı Dosya Kartı */}
      <div className="bg-surface2 rounded-lg p-5 border border-border">
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          <div className="col-span-2 border-b border-border pb-3 mb-1">
            <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Dosya Bilgileri</div>
            <div className="text-sm font-bold text-gold">{esas || '—'}</div>
            {mahkeme && <div className="text-xs text-text-muted mt-0.5">{mahkeme}</div>}
          </div>

          <OzetSatir label="Dava Türü" value={dava.davaTuru || '—'} />
          <OzetSatir label="Konu" value={dava.konu || '—'} />
          <OzetSatir label="Davacı" value={taraflar.davaci} />
          <OzetSatir label="Davalı" value={taraflar.davali} />
          <OzetSatir label="Müvekkil" value={muvAd} />
          <OzetSatir label="Karşı Vekil" value={dava.karsav || '—'} />
          <OzetSatir label="Aşama" value={dava.asama || '—'} />
          <OzetSatir label="Durum" value={dava.durum || '—'} />
          <OzetSatir label="Dava Tarihi" value={fmtTarih(dava.tarih) || '—'} />
          <OzetSatir label="Dava Değeri" value={dava.deger ? fmt(dava.deger) : '—'} />
        </div>
      </div>

      {/* Duruşma Bilgisi */}
      {dava.durusma && (
        <div className="bg-gold-dim border border-gold/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-gold uppercase tracking-wider font-bold mb-1">Sonraki Duruşma</div>
              <div className="text-sm font-bold text-text">
                {durusmaTarihSaatGoster(dava.durusma, dava.durusmaSaati)}
              </div>
            </div>
            <DurusmaBadge tarih={dava.durusma} saat={dava.durusmaSaati} />
          </div>
        </div>
      )}

      {/* Finansal Özet */}
      <div className="grid grid-cols-4 gap-3">
        <MiniKpi label="Masraf" value={fmt(hesap.masraf)} />
        <MiniKpi label="Tahsilat" value={fmt(hesap.tahsilat)} color="text-green" />
        <MiniKpi label="Hakediş" value={fmt(hesap.hakedis)} color="text-gold" />
        <MiniKpi label="Akdi Vekalet" value={fmt(hesap.vekalet)} color="text-blue-400" />
      </div>
    </div>
  );
}

function OzetSatir({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-text-dim uppercase tracking-wider">{label}</div>
      <div className="text-xs text-text font-medium truncate">{value}</div>
    </div>
  );
}

function MiniKpi({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-surface2 rounded-lg p-3 text-center">
      <div className="text-[10px] text-text-muted mb-0.5">{label}</div>
      <div className={`text-sm font-bold ${color || 'text-text'}`}>{value}</div>
    </div>
  );
}

// ── Süreler Sekmesi ──────────────────────────────────────────
function SurelerTab({ sureler }: { sureler: Array<{ id: string; tip: string; baslangic: string; gun: number }> }) {
  if (sureler.length === 0) {
    return <EmptyTab icon="⏳" message="Henüz süre tanımlanmamış" />;
  }
  return (
    <div className="space-y-2">
      {sureler.map((s) => {
        const hesap = sureHesapla(s.baslangic, s.gun);
        return (
          <div key={s.id} className="flex items-center gap-3 p-3 bg-surface2 rounded-lg">
            <SureBadge kalanGun={hesap.kalanGun} compact />
            <div className="flex-1">
              <div className="text-xs font-medium text-text">{s.tip}</div>
              <div className="text-[11px] text-text-muted">
                {fmtTarih(s.baslangic)} → {fmtTarih(hesap.sonTarih)} ({s.gun} gün)
              </div>
            </div>
            <SureBadge kalanGun={hesap.kalanGun} label={s.tip} />
          </div>
        );
      })}
    </div>
  );
}

// ── Harcama Sekmesi ──────────────────────────────────────────
function HarcamaTab({ harcamalar }: { harcamalar: Array<{ id: string; kat?: string; acik?: string; tarih?: string; tutar: number }> }) {
  if (harcamalar.length === 0) return <EmptyTab icon="💸" message="Henüz harcama kaydı yok" />;
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

// ── Tahsilat Sekmesi ─────────────────────────────────────────
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

// ── Notlar Sekmesi ───────────────────────────────────────────
function NotlarTab({ notlar, notText }: { notlar: Record<string, unknown>[]; notText?: string }) {
  return (
    <div className="space-y-3">
      {notText && <div className="p-3 bg-surface2 rounded-lg text-xs text-text whitespace-pre-wrap">{notText}</div>}
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

// ── Anlaşma Sekmesi ──────────────────────────────────────────
function AnlasmaTab({ anlasma }: { anlasma?: Record<string, unknown> }) {
  if (!anlasma || Object.keys(anlasma).length === 0) return <EmptyTab icon="🤝" message="Henüz vekalet anlaşması tanımlanmamış" />;
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

// ── Boş Sekme ────────────────────────────────────────────────
function EmptyTab({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="text-center py-10">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-xs text-text-muted">{message}</div>
    </div>
  );
}
