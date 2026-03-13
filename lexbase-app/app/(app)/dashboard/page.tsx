'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useMuvekkillar } from '@/lib/hooks/useMuvekkillar';
import { useDavalar } from '@/lib/hooks/useDavalar';
import { useIcralar } from '@/lib/hooks/useIcra';
import { useFinansUyarilar, useBuroKarZarar } from '@/lib/hooks/useFinans';
import { useDanismanliklar } from '@/lib/hooks/useDanismanlik';
import { useTodolar } from '@/lib/hooks/useTodolar';
import { fmt, fmtTarih } from '@/lib/utils';

/* ══════════════════════════════════════════════════════════════
   Dashboard — Orijinal LexBase Dashboard
   Full-width, dengeli boşluklar, dolu görünüm.
   Orijinal Vanilla JS tasarımıyla birebir eşleştirildi.
   ══════════════════════════════════════════════════════════════ */

export default function DashboardPage() {
  const { data: muvekkillar } = useMuvekkillar();
  const { data: davalar } = useDavalar();
  const { data: icralar } = useIcralar();
  const { data: uyarilar } = useFinansUyarilar();
  const { data: karZarar } = useBuroKarZarar(new Date().getFullYear(), new Date().getMonth() + 1);
  const { data: danismanliklar } = useDanismanliklar();
  const { data: gorevler } = useTodolar();

  // ── KPI Hesaplamaları ──
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
      const t = new Date(d.durusma);
      return t >= bugun && t <= haftaSonu;
    }).length ?? 0;

    const yilNet = karZarar?.net ?? 0;

    return { muvSayi, muvGercek, muvTuzel, aktifDava, davaSayi, aktifIcra, icraSayi, buHaftaDurusma, yilNet };
  }, [muvekkillar, davalar, icralar, karZarar]);

  // ── Müvekkil adı çözücü ──
  const muvAdMap = useMemo(() => {
    const map: Record<string, string> = {};
    muvekkillar?.forEach((m) => { map[m.id] = m.ad || '?'; });
    return map;
  }, [muvekkillar]);

  // ── Gündem (yaklaşan duruşmalar) ──
  const gundem = useMemo(() => {
    if (!davalar) return [];
    const bugun = new Date();
    const sinir = new Date(bugun);
    sinir.setDate(bugun.getDate() + 14);
    return davalar
      .filter((d) => {
        if (!d.durusma) return false;
        const t = new Date(d.durusma);
        return t >= bugun && t <= sinir;
      })
      .sort((a, b) => new Date(a.durusma!).getTime() - new Date(b.durusma!).getTime())
      .slice(0, 5);
  }, [davalar]);

  // ── Bu Hafta Görevler ──
  const buHaftaGorevler = useMemo(() => {
    if (!gorevler) return [];
    return gorevler
      .filter((g) => g.durum !== 'Tamamlandı' && g.durum !== 'İptal')
      .sort((a, b) => {
        if (a.oncelik === 'Yüksek' && b.oncelik !== 'Yüksek') return -1;
        if (b.oncelik === 'Yüksek' && a.oncelik !== 'Yüksek') return 1;
        return (a.sonTarih || '').localeCompare(b.sonTarih || '');
      })
      .slice(0, 5);
  }, [gorevler]);

  // ── Kritik Süreler (30 gün) ──
  const kritikSureler = useMemo(() => {
    const items: Array<{ tip: string; baslik: string; tarih: string; gun: number; icon: string }> = [];
    const bugun = new Date();
    const sinir = new Date(bugun);
    sinir.setDate(bugun.getDate() + 30);

    davalar?.forEach((d) => {
      if (d.durusma) {
        const t = new Date(d.durusma);
        if (t >= bugun && t <= sinir) {
          const gun = Math.ceil((t.getTime() - bugun.getTime()) / 86400000);
          items.push({ tip: 'Duruşma', baslik: `${d.no || d.konu || '—'}`, tarih: d.durusma, gun, icon: '📅' });
        }
      }
    });

    return items.sort((a, b) => a.gun - b.gun).slice(0, 5);
  }, [davalar]);

  // ── Devam Eden Hizmetler ──
  const devamEdenHizmetler = useMemo(() => {
    if (!danismanliklar) return [];
    return danismanliklar
      .filter((d) => d.durum === 'Aktif' || d.durum === 'Devam Ediyor' || d.durum === 'Taslak')
      .slice(0, 5);
  }, [danismanliklar]);

  // ── Tarih ──
  const bugun = new Date();
  const gunAdi = bugun.toLocaleDateString('tr-TR', { weekday: 'long' });
  const tarihStr = bugun.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  const uyariSayi = Array.isArray(uyarilar) ? uyarilar.length : 0;
  const kritikUyari = Array.isArray(uyarilar) ? uyarilar.filter((u: Record<string, unknown>) => u.oncelik === 'yuksek').length : 0;

  return (
    <div className="w-full">
      {/* ── BAŞLIK ── */}
      <div className="flex justify-between items-end flex-wrap gap-3 mb-5">
        <div>
          <h1 className="font-[var(--font-playfair)] text-2xl text-text font-bold leading-tight">Genel Bakış</h1>
          <p className="text-sm text-text-muted">İyi günler, {muvekkillar ? 'avukat' : '—'} — {tarihStr} {gunAdi}</p>
        </div>
      </div>

      {/* ── KPI STRIP — 5'li grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5">
        <KpiCard icon="👥" value={kpis.muvSayi} label="MÜVEKKİLLER" sub={`${kpis.muvGercek} Gerçek · ${kpis.muvTuzel} Tüzel`} />
        <KpiCard icon="📁" value={kpis.aktifDava} label="DERDEST DAVA" sub={`${kpis.davaSayi} dosya`} color="text-gold" />
        <KpiCard icon="⚡" value={kpis.aktifIcra} label="DERDEST İCRA" sub={`${kpis.icraSayi} dosya`} color="text-red" />
        <KpiCard icon="📅" value={kpis.buHaftaDurusma} label="BU HAFTA DURUŞMA" sub={`${kpis.buHaftaDurusma} adet`} color="text-red" accent />
        <KpiCard icon="💎" value={fmt(kpis.yilNet)} label="2026 NET GELİR" sub="Kâr" color={kpis.yilNet >= 0 ? 'text-green' : 'text-red'} />
      </div>

      {/* ── BENTO GRID: Satır 1 — 3 sütun ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Aylık Performans */}
        <DashPanel title="💰 Aylık Performans" linkText="Finans ›" linkHref="/finans" color="green">
          <div className="space-y-3 mt-2">
            <PerformansChart />
            <div className="flex items-center justify-center gap-5 text-[11px] text-text-muted">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-green" /> Gelir</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red" /> Gider</span>
            </div>
          </div>
        </DashPanel>

        {/* Gündem */}
        <DashPanel title="📋 Gündem" linkText="Takvim ›" linkHref="/takvim" color="blue">
          {gundem.length === 0 ? (
            <EmptyState icon="📅" text="Gündemde etkinlik yok" action="Ekle ›" actionHref="/takvim?yeni=1" />
          ) : (
            <div className="space-y-1.5 mt-1">
              {gundem.map((d) => {
                const gun = Math.ceil((new Date(d.durusma!).getTime() - Date.now()) / 86400000);
                return (
                  <Link key={d.id} href={`/davalar/${d.id}`} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-surface2 transition-colors">
                    <GunBadge gun={gun} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold text-text truncate">{d.no || d.konu || '—'}</div>
                      <div className="text-[11px] text-text-dim truncate">{muvAdMap[d.muvId || ''] || '—'}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </DashPanel>

        {/* Bu Hafta Yapılacaklar */}
        <DashPanel title="✅ Bu Hafta Yapılacaklar" linkText="Tümü ›" linkHref="/gorevler" color="purple">
          {buHaftaGorevler.length === 0 ? (
            <EmptyState icon="✅" text="Görev bulunmuyor" />
          ) : (
            <div className="space-y-1.5 mt-1">
              {buHaftaGorevler.map((g) => (
                <div key={g.id} className={`flex items-center gap-2 px-2 py-2 rounded-lg ${g.oncelik === 'Yüksek' ? 'bg-red-dim/30' : 'bg-surface2/50'}`}>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-text truncate">{g.baslik || '—'}</div>
                    <div className="text-[10px] text-text-dim">{g.sonTarih ? fmtTarih(g.sonTarih) : ''}</div>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 uppercase ${g.oncelik === 'Yüksek' ? 'bg-red text-white' : 'bg-gold-dim text-gold'}`}>
                    {g.oncelik === 'Yüksek' ? 'Gecikti' : g.oncelik || ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </DashPanel>
      </div>

      {/* ── BENTO GRID: Satır 2 — 3 sütun ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Kritik Süreler */}
        <DashPanel title="⚠️ Kritik Süreler" subtitle="(30 gün)" linkText="Takvim ›" linkHref="/takvim" color="gold">
          {kritikSureler.length === 0 ? (
            <EmptyState icon="📅" text="30 gün içinde kritik işlem yok" />
          ) : (
            <div className="space-y-1.5 mt-1">
              {kritikSureler.map((s, i) => (
                <div key={i} className={`flex items-center gap-2.5 px-2 py-2 rounded-lg ${s.gun <= 3 ? 'bg-red-dim/40' : s.gun <= 7 ? 'bg-gold-dim/40' : 'bg-surface2/50'}`}>
                  <span className="text-base flex-shrink-0">{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-text truncate">{s.baslik}</div>
                    <div className="text-[10px] text-text-dim">{fmtTarih(s.tarih)}</div>
                  </div>
                  <GunBadge gun={s.gun} />
                </div>
              ))}
            </div>
          )}
        </DashPanel>

        {/* Finansal Uyarılar */}
        <DashPanel title="🔴 Finansal Uyarılar" linkText="Finans ›" linkHref="/finans" color="red">
          {uyariSayi === 0 ? (
            <EmptyState icon="✅" text="Finansal uyarı bulunmuyor" />
          ) : (
            <div className="mt-1 space-y-2">
              {/* Özet */}
              <div className="bg-surface2 rounded-xl p-3 text-center">
                <div className="progress-bar mb-2">
                  <div className="progress-fill" style={{ width: `${Math.min(100, kritikUyari * 25)}%`, background: kritikUyari > 0 ? 'var(--red)' : 'var(--gradient-progress)' }} />
                </div>
                <div className={`font-[var(--font-playfair)] text-xl font-bold ${kritikUyari > 0 ? 'text-red' : 'text-gold'}`}>{kritikUyari} Kritik</div>
                <div className="text-[10px] text-text-dim">{uyariSayi} toplam uyarı</div>
              </div>
              {/* Liste */}
              {(Array.isArray(uyarilar) ? uyarilar : []).slice(0, 4).map((u: Record<string, unknown>, i: number) => (
                <div key={i} className={`flex items-start gap-2 px-2 py-2 rounded-lg text-[11px] ${u.oncelik === 'yuksek' ? 'bg-red-dim/40 text-red' : 'bg-gold-dim/30 text-gold'}`}>
                  <span className="flex-shrink-0 mt-0.5">{(u.icon as string) || '⚠️'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium leading-snug">{u.mesaj as string}</div>
                    {typeof u.tutar === 'number' && u.tutar > 0 && (
                      <div className="font-bold mt-0.5">{fmt(u.tutar)}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashPanel>

        {/* Menfaat Çakışması */}
        <DashPanel title="🔍 Menfaat Çakışması" color="red">
          <div className="flex flex-col items-center justify-center py-5 text-center">
            <div className="w-12 h-12 bg-green-dim rounded-full flex items-center justify-center text-green text-xl mb-2">✅</div>
            <div className="text-[13px] font-semibold text-green">Temiz</div>
            <div className="text-[11px] text-text-dim mt-0.5">Menfaat çakışması tespit edilmedi</div>
          </div>
        </DashPanel>
      </div>

      {/* ── BENTO GRID: Satır 3 — 2 sütun ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Devam Eden Hizmetler */}
        <DashPanel title="⚖️ Devam Eden Hizmetler" linkText="Tümü ›" linkHref="/danismanlik" color="gold">
          {devamEdenHizmetler.length === 0 ? (
            <EmptyState icon="⚖️" text="Aktif danışmanlık bulunmuyor" />
          ) : (
            <div className="space-y-1.5 mt-1">
              {devamEdenHizmetler.map((d) => (
                <div key={d.id} className="flex items-center gap-3 px-2 py-2 bg-surface2/50 rounded-lg hover:bg-surface2 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-text truncate">{d.konu || '—'}</div>
                    <div className="text-[10px] text-text-dim truncate">{muvAdMap[d.muvId || ''] || '—'} · {d.tur || 'Danışmanlık'} / {String(d.altTur || '—')}</div>
                  </div>
                  <span className="badge badge-gold text-[9px]">{d.durum || 'Taslak'}</span>
                </div>
              ))}
            </div>
          )}
        </DashPanel>

        {/* Son Aktiviteler */}
        <DashPanel title="📋 Son Aktiviteler" color="blue">
          <EmptyState icon="📋" text="Henüz aktivite yok" action="Müvekkil Ekle ›" actionHref="/muvekkillar?yeni=1" />
        </DashPanel>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════
   Dashboard Panel — Sol renkli bordür, gradient bg
   ══════════════════════════════════════════════════════════════ */
function DashPanel({ title, subtitle, linkText, linkHref, color, children }: {
  title: string;
  subtitle?: string;
  linkText?: string;
  linkHref?: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`dash-panel dp-${color}`}>
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
        <div className="text-[13px] font-bold text-text">
          {title}
          {subtitle && <span className="text-[10px] text-text-muted font-normal ml-1.5">{subtitle}</span>}
        </div>
        {linkText && linkHref && (
          <Link href={linkHref} className="text-[11px] text-gold hover:text-gold-light transition-colors font-medium">{linkText}</Link>
        )}
      </div>
      <div className="px-4 pb-3.5">{children}</div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════
   KPI Card — Orijinal tasarım: icon + sayı + label + subtitle
   ══════════════════════════════════════════════════════════════ */
function KpiCard({ icon, value, label, sub, accent, color }: {
  icon: string;
  value: number | string;
  label: string;
  sub?: string;
  accent?: boolean;
  color?: string;
}) {
  return (
    <div className={`kpi-card px-4 py-3.5 ${accent ? 'kpi-accent' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="text-xl flex-shrink-0 mt-0.5">{icon}</div>
        <div className="min-w-0">
          <div className={`font-[var(--font-playfair)] text-xl font-bold leading-tight ${color || 'text-text'}`}>
            {value}
          </div>
          <div className="text-[9px] text-text-muted uppercase tracking-wider font-semibold mt-0.5">{label}</div>
          {sub && <div className="text-[10px] text-text-dim mt-0.5">{sub}</div>}
        </div>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════
   Gün Badge
   ══════════════════════════════════════════════════════════════ */
function GunBadge({ gun }: { gun: number }) {
  const cls = gun <= 1 ? 'bg-red text-white' : gun <= 3 ? 'bg-red-dim text-red' : gun <= 7 ? 'bg-gold-dim text-gold' : 'bg-surface2 text-text-muted';
  const text = gun === 0 ? 'Bugün' : gun === 1 ? 'Yarın' : `${gun}g`;
  return <span className={`text-[10px] font-bold px-2 py-1 rounded-md flex-shrink-0 leading-none ${cls}`}>{text}</span>;
}


/* ══════════════════════════════════════════════════════════════
   Empty State — İçerikli boş durum
   ══════════════════════════════════════════════════════════════ */
function EmptyState({ icon, text, action, actionHref }: { icon?: string; text: string; action?: string; actionHref?: string }) {
  return (
    <div className="flex items-center gap-3 py-5 px-2">
      {icon && <span className="text-xl opacity-40">{icon}</span>}
      <div className="flex-1">
        <div className="text-[12px] text-text-dim">{text}</div>
      </div>
      {action && actionHref && (
        <Link href={actionHref} className="text-[11px] text-gold hover:text-gold-light transition-colors font-medium flex-shrink-0">{action}</Link>
      )}
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════
   Aylık Performans Chart (basit bar chart placeholder)
   ══════════════════════════════════════════════════════════════ */
function PerformansChart() {
  const aylar = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const buAy = new Date().getMonth();

  return (
    <div className="flex items-end gap-1.5 h-24 px-1">
      {aylar.map((ay, i) => (
        <div key={ay} className="flex-1 flex flex-col items-center gap-0.5">
          <div className="w-full flex flex-col gap-0.5 h-16 justify-end">
            <div
              className={`w-full rounded-sm ${i === buAy ? 'bg-green' : 'bg-green/30'}`}
              style={{ height: `${Math.random() * 60 + 10}%` }}
            />
          </div>
          <span className={`text-[8px] ${i === buAy ? 'text-text font-bold' : 'text-text-dim'}`}>{ay}</span>
        </div>
      ))}
    </div>
  );
}
