'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useMuvekkillar } from '@/lib/hooks/useMuvekkillar';
import { useDavalar } from '@/lib/hooks/useDavalar';
import { useIcralar } from '@/lib/hooks/useIcra';
import { useFinansUyarilar, useBuroKarZarar } from '@/lib/hooks/useFinans';
import { fmt, fmtTarih } from '@/lib/utils';

export default function DashboardPage() {
  const { data: muvekkillar } = useMuvekkillar();
  const { data: davalar } = useDavalar();
  const { data: icralar } = useIcralar();
  const { data: uyarilar } = useFinansUyarilar();
  const { data: karZarar } = useBuroKarZarar(new Date().getFullYear());

  // ── KPI Hesaplamaları ──────────────────────────────────────
  const kpis = useMemo(() => {
    const muvSayi = muvekkillar?.length ?? 0;
    const aktifDava = davalar?.filter((d) => d.durum === 'Aktif' || d.durum === 'Devam Ediyor').length ?? 0;
    const aktifIcra = icralar?.filter((i) => i.durum !== 'Kapandı').length ?? 0;

    // Bu hafta duruşma
    const bugun = new Date();
    const haftaSonu = new Date(bugun);
    haftaSonu.setDate(bugun.getDate() + 7);
    const buHaftaDurusma = davalar?.filter((d) => {
      if (!d.durusma) return false;
      const t = new Date(d.durusma);
      return t >= bugun && t <= haftaSonu;
    }).length ?? 0;

    // Yıl net gelir
    const yilNet = karZarar?.net ?? null;

    return { muvSayi, aktifDava, aktifIcra, buHaftaDurusma, yilNet };
  }, [muvekkillar, davalar, icralar, karZarar]);

  // ── Yaklaşan Duruşmalar ────────────────────────────────────
  const yaklasanDurusmalar = useMemo(() => {
    if (!davalar) return [];
    const bugun = new Date();
    const sinir = new Date(bugun);
    sinir.setDate(bugun.getDate() + 30);
    return davalar
      .filter((d) => {
        if (!d.durusma) return false;
        const t = new Date(d.durusma);
        return t >= bugun && t <= sinir;
      })
      .sort((a, b) => new Date(a.durusma!).getTime() - new Date(b.durusma!).getTime())
      .slice(0, 8);
  }, [davalar]);

  // ── Müvekkil adı çözücü ────────────────────────────────────
  const muvAdMap = useMemo(() => {
    const map: Record<string, string> = {};
    muvekkillar?.forEach((m) => { map[m.id] = m.ad || '?'; });
    return map;
  }, [muvekkillar]);

  // ── Son eklenen dosyalar ───────────────────────────────────
  const sonDosyalar = useMemo(() => {
    const items: Array<{ id: string; tip: string; no: string; konu: string; tarih: string; href: string }> = [];
    davalar?.forEach((d) => {
      items.push({ id: d.id, tip: 'Dava', no: d.no || '—', konu: d.konu || '—', tarih: d.tarih || '', href: `/davalar/${d.id}` });
    });
    icralar?.forEach((i) => {
      items.push({ id: i.id, tip: 'İcra', no: i.no || '—', konu: i.borclu || '—', tarih: i.tarih || '', href: `/icra/${i.id}` });
    });
    return items
      .sort((a, b) => (b.tarih || '').localeCompare(a.tarih || ''))
      .slice(0, 6);
  }, [davalar, icralar]);

  return (
    <div>
      <h1 className="font-[var(--font-playfair)] text-2xl text-text font-bold mb-6">
        Dashboard
      </h1>

      {/* ── KPI Strip ───────────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <KpiCard label="Müvekkiller" value={kpis.muvSayi} icon="👥" />
        <KpiCard label="Derdest Davalar" value={kpis.aktifDava} icon="⚖️" />
        <KpiCard label="Derdest İcra" value={kpis.aktifIcra} icon="📋" />
        <KpiCard label="Bu Hafta Duruşma" value={kpis.buHaftaDurusma} icon="📅" accent />
        <KpiCard
          label={`${new Date().getFullYear()} Net Gelir`}
          value={kpis.yilNet !== null ? fmt(kpis.yilNet) : '—'}
          icon="💰"
          color={kpis.yilNet !== null ? (kpis.yilNet >= 0 ? 'text-green' : 'text-red') : ''}
        />
      </div>

      {/* ── Bento Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {/* Yaklaşan Duruşmalar */}
        <div className="col-span-2 bg-surface border border-border rounded-lg p-5">
          <h3 className="text-sm font-semibold text-text mb-4">📅 Yaklaşan Duruşmalar</h3>
          {yaklasanDurusmalar.length === 0 ? (
            <div className="text-center py-8 text-text-muted text-xs">
              Yaklaşan duruşma bulunmuyor
            </div>
          ) : (
            <div className="space-y-2">
              {yaklasanDurusmalar.map((d) => {
                const gun = Math.ceil((new Date(d.durusma!).getTime() - Date.now()) / 86400000);
                return (
                  <Link
                    key={d.id}
                    href={`/davalar/${d.id}`}
                    className="flex items-center gap-3 p-3 bg-surface2 rounded-lg hover:bg-gold-dim hover:border-gold border border-transparent transition-all"
                  >
                    <div className={`text-xs font-bold px-2 py-1 rounded ${gun <= 3 ? 'bg-red-dim text-red' : gun <= 7 ? 'bg-gold-dim text-gold' : 'bg-surface text-text-muted'}`}>
                      {gun === 0 ? 'BUGÜN' : gun === 1 ? 'YARIN' : `${gun} gün`}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-text truncate">{d.no || d.konu || '—'}</div>
                      <div className="text-[11px] text-text-muted truncate">
                        {muvAdMap[d.muvId || ''] || '—'} · {d.konu || ''}
                      </div>
                    </div>
                    <div className="text-[11px] text-text-dim">{fmtTarih(d.durusma)}</div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Finansal Uyarılar */}
        <div className="bg-surface border border-border rounded-lg p-5">
          <h3 className="text-sm font-semibold text-text mb-4">⚠️ Finansal Uyarılar</h3>
          {!uyarilar || (Array.isArray(uyarilar) && uyarilar.length === 0) ? (
            <div className="text-center py-8 text-text-muted text-xs">
              Uyarı bulunmuyor
            </div>
          ) : (
            <div className="space-y-2">
              {(Array.isArray(uyarilar) ? uyarilar : []).slice(0, 5).map((u: Record<string, unknown>, i: number) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border text-xs ${
                    u.oncelik === 'yuksek'
                      ? 'bg-red-dim border-red/20 text-red'
                      : u.oncelik === 'orta'
                      ? 'bg-gold-dim border-gold/20 text-gold'
                      : 'bg-surface2 border-border text-text-muted'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span>{(u.icon as string) || '⚠️'}</span>
                    <div className="flex-1">
                      <div className="font-medium">{u.mesaj as string}</div>
                      {typeof u.tutar === 'number' && u.tutar > 0 && (
                        <div className="mt-0.5 font-semibold">{fmt(u.tutar)}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Son Dosyalar */}
        <div className="col-span-2 bg-surface border border-border rounded-lg p-5">
          <h3 className="text-sm font-semibold text-text mb-4">📂 Son Eklenen Dosyalar</h3>
          {sonDosyalar.length === 0 ? (
            <div className="text-center py-8 text-text-muted text-xs">
              Henüz dosya eklenmemiş
            </div>
          ) : (
            <div className="space-y-1.5">
              {sonDosyalar.map((d) => (
                <Link
                  key={d.id}
                  href={d.href}
                  className="flex items-center gap-3 p-3 bg-surface2 rounded-lg hover:bg-gold-dim transition-colors"
                >
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${d.tip === 'Dava' ? 'text-blue-400 bg-blue-400/10' : 'text-green bg-green-dim'}`}>
                    {d.tip}
                  </span>
                  <span className="text-xs font-semibold text-gold">{d.no}</span>
                  <span className="text-xs text-text truncate flex-1">{d.konu}</span>
                  <span className="text-[11px] text-text-dim">{fmtTarih(d.tarih)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Hızlı Erişim */}
        <div className="bg-surface border border-border rounded-lg p-5">
          <h3 className="text-sm font-semibold text-text mb-4">🚀 Hızlı Erişim</h3>
          <div className="space-y-2">
            {[
              { href: '/muvekkillar', icon: '👥', label: 'Müvekkiller', desc: `${muvekkillar?.length ?? 0} kayıt` },
              { href: '/davalar', icon: '⚖️', label: 'Davalar', desc: `${davalar?.length ?? 0} dosya` },
              { href: '/icra', icon: '📋', label: 'İcra Dosyaları', desc: `${icralar?.length ?? 0} dosya` },
              { href: '/finans', icon: '💰', label: 'Finans', desc: 'Rapor & analiz' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 p-3 bg-surface2 rounded-lg hover:bg-gold-dim transition-colors group"
              >
                <span className="text-lg">{item.icon}</span>
                <div>
                  <div className="text-xs font-semibold text-text group-hover:text-gold transition-colors">{item.label}</div>
                  <div className="text-[11px] text-text-muted">{item.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── KPI Card Component ─────────────────────────────────────────
function KpiCard({ label, value, icon, accent, color }: {
  label: string;
  value: number | string;
  icon: string;
  accent?: boolean;
  color?: string;
}) {
  return (
    <div className={`bg-surface border rounded-lg p-4 ${accent ? 'border-gold bg-gold-dim' : 'border-border'}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm">{icon}</span>
        <span className="text-[11px] text-text-muted uppercase tracking-wider">{label}</span>
      </div>
      <div className={`font-[var(--font-playfair)] text-2xl font-bold ${color || (accent ? 'text-gold' : 'text-gold')}`}>
        {value}
      </div>
    </div>
  );
}
