'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { fmt } from '@/lib/utils';

interface AlacakSatir {
  dosyaId: string;
  dosyaNo: string;
  dosyaTur: string;
  dosyaLink: string;
  anlasmaToplam: number;
  tahsilEdilen: number;
  kalan: number;
  vadeTarihi?: string;
  taksitSayisi?: number;
  taksitOdenen?: number;
}

interface Props {
  davalar: Record<string, unknown>[];
  icralar: Record<string, unknown>[];
  arabuluculuklar: Record<string, unknown>[];
  ihtarnameler: Record<string, unknown>[];
  finansOzet: Record<string, unknown> | null | undefined;
}

export function MuvAlacak({ davalar, icralar, arabuluculuklar, ihtarnameler, finansOzet }: Props) {
  /* ── Dosya bazlı alacak bilgilerini topla ── */
  const alacaklar = useMemo(() => {
    const result: AlacakSatir[] = [];

    const ekle = (items: Record<string, unknown>[], tur: string, linkPrefix: string) => {
      items.forEach((d) => {
        const anlasma = d.anlasma as Record<string, unknown> | undefined;
        const tahsilatlar = (d.tahsilatlar || []) as Array<Record<string, string>>;
        const ucret = d.ucret as number | string | undefined;

        // Anlaşılan toplam
        let anlasmaToplam = 0;
        if (anlasma) {
          anlasmaToplam = parseFloat(String(anlasma.toplam || anlasma.ucret || 0)) || 0;
        } else if (ucret) {
          anlasmaToplam = parseFloat(String(ucret)) || 0;
        }

        // Tahsil edilen
        const tahsilEdilen = tahsilatlar.reduce((s, t) => s + (parseFloat(t.tutar) || 0), 0)
          + (parseFloat(String(d.tahsilEdildi || 0)) || 0);

        // Sadece alacağı olan dosyaları göster
        if (anlasmaToplam > 0 || tahsilEdilen > 0) {
          result.push({
            dosyaId: d.id as string,
            dosyaNo: (d.no as string) || '—',
            dosyaTur: tur,
            dosyaLink: `${linkPrefix}/${d.id}`,
            anlasmaToplam,
            tahsilEdilen,
            kalan: anlasmaToplam - tahsilEdilen,
            vadeTarihi: anlasma?.vadeTarihi as string | undefined,
            taksitSayisi: anlasma?.taksitSayisi as number | undefined,
            taksitOdenen: anlasma?.taksitOdenen as number | undefined,
          });
        }
      });
    };

    ekle(davalar, 'Dava', '/davalar');
    ekle(icralar, 'İcra', '/icra');
    ekle(arabuluculuklar, 'Arabuluculuk', '/arabuluculuk');
    ekle(ihtarnameler, 'İhtarname', '/ihtarname');

    return result;
  }, [davalar, icralar, arabuluculuklar, ihtarnameler]);

  /* ── Toplamlar ── */
  const toplamAnlasma = alacaklar.reduce((s, a) => s + a.anlasmaToplam, 0);
  const toplamTahsil = alacaklar.reduce((s, a) => s + a.tahsilEdilen, 0);
  const toplamKalan = toplamAnlasma - toplamTahsil;

  const turRenk: Record<string, string> = {
    'Dava': 'text-blue-400 bg-blue-400/10',
    'İcra': 'text-orange-400 bg-orange-400/10',
    'Arabuluculuk': 'text-green bg-green-dim',
    'İhtarname': 'text-purple-400 bg-purple-400/10',
  };

  return (
    <div className="space-y-5">
      {/* Özet Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-lg p-5">
          <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Toplam Alacak</div>
          <div className="font-[var(--font-playfair)] text-xl text-text font-bold">{fmt(toplamAnlasma)}</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-5">
          <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Tahsil Edilen</div>
          <div className="font-[var(--font-playfair)] text-xl text-green font-bold">{fmt(toplamTahsil)}</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-5">
          <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Kalan Alacak</div>
          <div className={`font-[var(--font-playfair)] text-xl font-bold ${toplamKalan > 0 ? 'text-gold' : 'text-green'}`}>
            {fmt(toplamKalan)}
          </div>
        </div>
      </div>

      {/* Alacak Tablosu */}
      {alacaklar.length === 0 ? (
        <div className="text-center py-10 text-text-muted bg-surface border border-border rounded-lg">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-sm font-medium">Henüz alacak kaydı yok</div>
          <div className="text-xs text-text-dim mt-1">Dosyalardaki ücret anlaşmaları burada listelenecek</div>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-text-muted">Dosya No</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-muted">Tür</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-muted text-right">Anlaşılan</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-muted text-right">Tahsil</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-muted text-right">Kalan</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-muted">Vade</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-muted">Taksit</th>
                </tr>
              </thead>
              <tbody>
                {alacaklar.map((a) => {
                  const tahsilYuzde = a.anlasmaToplam > 0 ? Math.round((a.tahsilEdilen / a.anlasmaToplam) * 100) : 0;
                  return (
                    <tr key={a.dosyaId} className="border-b border-border/50 hover:bg-surface2 transition-colors">
                      <td className="px-4 py-2.5">
                        <Link href={a.dosyaLink} className="text-gold text-xs font-medium hover:text-gold-light">
                          {a.dosyaNo}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${turRenk[a.dosyaTur] || 'text-text-dim bg-surface2'}`}>
                          {a.dosyaTur}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-text text-xs font-medium">{fmt(a.anlasmaToplam)}</td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="text-xs text-green font-medium">{fmt(a.tahsilEdilen)}</div>
                        {a.anlasmaToplam > 0 && (
                          <div className="w-full bg-surface2 rounded-full h-1 mt-1">
                            <div
                              className="bg-green rounded-full h-1 transition-all"
                              style={{ width: `${Math.min(tahsilYuzde, 100)}%` }}
                            />
                          </div>
                        )}
                      </td>
                      <td className={`px-4 py-2.5 text-right text-xs font-bold ${a.kalan > 0 ? 'text-gold' : 'text-green'}`}>
                        {fmt(a.kalan)}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-text-muted">
                        {a.vadeTarihi || '—'}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-text-muted">
                        {a.taksitSayisi
                          ? `${a.taksitOdenen || 0}/${a.taksitSayisi}`
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-border">
                  <td colSpan={2} className="px-4 py-3 text-xs font-semibold text-text-muted text-right">Toplam:</td>
                  <td className="px-4 py-3 text-right text-text font-bold text-xs">{fmt(toplamAnlasma)}</td>
                  <td className="px-4 py-3 text-right text-green font-bold text-xs">{fmt(toplamTahsil)}</td>
                  <td className="px-4 py-3 text-right text-gold font-bold text-sm">{fmt(toplamKalan)}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
