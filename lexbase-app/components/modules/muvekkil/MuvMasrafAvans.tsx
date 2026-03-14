'use client';

import { useState, useMemo } from 'react';
import { fmt } from '@/lib/utils';

/* ── Masraf kategorileri ── */
const KATEGORILER = ['Harçlar', 'Posta/Tebligat', 'Bilirkişi', 'Tanık', 'Yol/Konaklama', 'Vekaletname Harcı', 'Diğer'] as const;

interface MasrafKayit {
  tarih: string;
  tutar: number;
  kat: string;
  acik: string;
  dosyaNo: string;
  dosyaId: string;
  dosyaTur: string;
}

interface Props {
  davalar: Record<string, unknown>[];
  icralar: Record<string, unknown>[];
  arabuluculuklar: Record<string, unknown>[];
  ihtarnameler: Record<string, unknown>[];
  finansOzet: Record<string, unknown> | null | undefined;
  onMasrafEkle: () => void;
}

export function MuvMasrafAvans({ davalar, icralar, arabuluculuklar, ihtarnameler, finansOzet, onMasrafEkle }: Props) {
  const [katFiltre, setKatFiltre] = useState<string>('');

  /* ── Tüm harcamaları birleştir ── */
  const tumMasraflar = useMemo(() => {
    const result: MasrafKayit[] = [];
    const dosyaGruplari = [
      { items: davalar, tur: 'Dava' },
      { items: icralar, tur: 'İcra' },
      { items: arabuluculuklar, tur: 'Arabuluculuk' },
      { items: ihtarnameler, tur: 'İhtarname' },
    ];

    dosyaGruplari.forEach(({ items, tur }) => {
      items.forEach((dosya) => {
        const harcamalar = (dosya.harcamalar || []) as Array<Record<string, string>>;
        harcamalar.forEach((h) => {
          result.push({
            tarih: h.tarih || '',
            tutar: parseFloat(h.tutar) || 0,
            kat: h.kat || 'Harcama',
            acik: h.acik || '',
            dosyaNo: (dosya.no as string) || '—',
            dosyaId: dosya.id as string,
            dosyaTur: tur,
          });
        });
      });
    });

    result.sort((a, b) => b.tarih.localeCompare(a.tarih));
    return result;
  }, [davalar, icralar, arabuluculuklar, ihtarnameler]);

  /* ── Filtreleme ── */
  const gosterilenler = katFiltre
    ? tumMasraflar.filter((m) => m.kat === katFiltre)
    : tumMasraflar;

  /* ── Özet hesapları ── */
  const avanslar = finansOzet?.avanslar as Record<string, number> | undefined;
  const toplamMasraf = tumMasraflar.reduce((s, m) => s + m.tutar, 0);
  const alinanAvans = avanslar?.alinan ?? 0;
  const emanetBakiye = alinanAvans - toplamMasraf;

  /* ── Benzersiz kategoriler ── */
  const mevcutKategoriler = useMemo(() => {
    const set = new Set(tumMasraflar.map((m) => m.kat));
    return Array.from(set).sort();
  }, [tumMasraflar]);

  const turRenk: Record<string, string> = {
    'Dava': 'text-blue-400 bg-blue-400/10',
    'İcra': 'text-orange-400 bg-orange-400/10',
    'Arabuluculuk': 'text-green bg-green-dim',
    'İhtarname': 'text-purple-400 bg-purple-400/10',
  };

  return (
    <div className="space-y-5">
      {/* Emanet Kasa Özet Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-lg p-5">
          <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Alınan Avans</div>
          <div className="font-[var(--font-playfair)] text-xl text-green font-bold">{fmt(alinanAvans)}</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-5">
          <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Toplam Masraf</div>
          <div className="font-[var(--font-playfair)] text-xl text-text font-bold">{fmt(toplamMasraf)}</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-5">
          <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Emanet Bakiye</div>
          <div className={`font-[var(--font-playfair)] text-xl font-bold ${emanetBakiye >= 0 ? 'text-green' : 'text-red'}`}>
            {fmt(emanetBakiye)}
          </div>
        </div>
      </div>

      {/* Masraf Tablosu Başlık + Butonlar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-text">Masraf Kayıtları ({gosterilenler.length})</h3>
          {mevcutKategoriler.length > 0 && (
            <select
              value={katFiltre}
              onChange={(e) => setKatFiltre(e.target.value)}
              className="text-[11px] px-2 py-1 bg-surface border border-border rounded text-text-muted focus:border-gold focus:outline-none"
            >
              <option value="">Tüm Kategoriler</option>
              {mevcutKategoriler.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          )}
        </div>
        <button
          onClick={onMasrafEkle}
          className="px-3 py-1.5 text-xs font-semibold text-gold border border-gold/30 rounded-lg hover:bg-gold-dim transition-colors"
        >
          + Masraf / Avans Ekle
        </button>
      </div>

      {/* Masraf Tablosu */}
      {gosterilenler.length === 0 ? (
        <div className="text-center py-10 text-text-muted bg-surface border border-border rounded-lg">
          <div className="text-3xl mb-2">💸</div>
          <div className="text-sm font-medium">Henüz masraf kaydı yok</div>
          <div className="text-xs text-text-dim mt-1">Dosyalara yapılan masraflar burada listelenecek</div>
          <button
            onClick={onMasrafEkle}
            className="mt-3 px-4 py-1.5 text-xs font-medium text-gold border border-gold/30 rounded-lg hover:bg-gold-dim transition-colors"
          >
            + İlk Masrafı Ekle
          </button>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-text-muted">Tarih</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-muted">Kategori</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-muted">Açıklama</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-muted">Dosya</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-muted">Tür</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-muted text-right">Tutar</th>
                </tr>
              </thead>
              <tbody>
                {gosterilenler.map((h, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-surface2 transition-colors">
                    <td className="px-4 py-2.5 text-text-muted text-xs">{h.tarih || '—'}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-surface2 border border-border text-text-muted">
                        {h.kat}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-text text-xs">{h.acik || '—'}</td>
                    <td className="px-4 py-2.5 text-gold text-xs font-medium">{h.dosyaNo}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${turRenk[h.dosyaTur] || 'text-text-dim bg-surface2'}`}>
                        {h.dosyaTur}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-text font-semibold text-xs">{fmt(h.tutar)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border">
                  <td colSpan={5} className="px-4 py-3 text-xs font-semibold text-text-muted text-right">Toplam:</td>
                  <td className="px-4 py-3 text-right text-gold font-bold text-sm">
                    {fmt(gosterilenler.reduce((s, h) => s + h.tutar, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
