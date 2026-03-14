'use client';

import { useState, useMemo } from 'react';
import { useDanismanliklar } from '@/lib/hooks/useDanismanlik';
import { DanismanlikModal } from '@/components/modules/DanismanlikModal';
import { fmt } from '@/lib/utils';

interface Props {
  muvId: string;
}

const DURUM_RENK: Record<string, string> = {
  'Taslak': 'text-text-dim bg-surface2 border-border',
  'Devam Ediyor': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  'Müvekkil Onayında': 'text-gold bg-gold-dim border-gold/20',
  'Gönderildi': 'text-green bg-green-dim border-green/20',
  'Tamamlandı': 'text-green bg-green-dim border-green/20',
};

export function MuvDanismanlik({ muvId }: Props) {
  const { data: tumDanismanliklar = [], isLoading } = useDanismanliklar();
  const [modalOpen, setModalOpen] = useState(false);

  /* ── Müvekkile ait danışmanlıklar ── */
  const danismanliklar = useMemo(() =>
    tumDanismanliklar.filter((d: Record<string, unknown>) => d.muvId === muvId),
    [tumDanismanliklar, muvId]
  );

  /* ── Düzenli (retainer) danışmanlıklar ── */
  const duzenliDanismanliklar = danismanliklar.filter((d: Record<string, unknown>) =>
    d.tur === 'Şirket Danışmanlık' || (d as Record<string, unknown>).tekrar === true
  );
  const tekSefer = danismanliklar.filter((d: Record<string, unknown>) =>
    d.tur !== 'Şirket Danışmanlık' && !(d as Record<string, unknown>).tekrar
  );

  /* ── Toplamlar ── */
  const toplamUcret = danismanliklar.reduce((s: number, d: Record<string, unknown>) => s + (parseFloat(String(d.ucret || 0)) || 0), 0);
  const toplamTahsil = danismanliklar.reduce((s: number, d: Record<string, unknown>) => s + (parseFloat(String(d.tahsilEdildi || 0)) || 0), 0);

  if (isLoading) {
    return <div className="text-center py-8 text-text-dim text-sm">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-5">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text">💼 Danışmanlık ({danismanliklar.length})</h3>
        <button
          onClick={() => setModalOpen(true)}
          className="text-xs font-medium text-gold hover:text-gold-light transition-colors"
        >
          + Yeni Danışmanlık
        </button>
      </div>

      {danismanliklar.length === 0 ? (
        <div className="text-center py-10 text-text-muted bg-surface border border-border rounded-lg">
          <div className="text-3xl mb-2">💼</div>
          <div className="text-sm font-medium">Henüz danışmanlık kaydı yok</div>
          <div className="text-xs text-text-dim mt-1">Müvekkile verilen danışmanlık hizmetlerini kaydedin</div>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-3 px-4 py-1.5 text-xs font-medium text-gold border border-gold/30 rounded-lg hover:bg-gold-dim transition-colors"
          >
            + İlk Danışmanlığı Ekle
          </button>
        </div>
      ) : (
        <>
          {/* Özet Kartları */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-surface border border-border rounded-lg p-4">
              <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Toplam Ücret</div>
              <div className="font-[var(--font-playfair)] text-lg text-text font-bold">{fmt(toplamUcret)}</div>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4">
              <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Tahsil Edilen</div>
              <div className="font-[var(--font-playfair)] text-lg text-green font-bold">{fmt(toplamTahsil)}</div>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4">
              <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Kalan</div>
              <div className="font-[var(--font-playfair)] text-lg text-gold font-bold">{fmt(toplamUcret - toplamTahsil)}</div>
            </div>
          </div>

          {/* Düzenli Danışmanlık (Retainer) */}
          {duzenliDanismanliklar.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                🔄 Düzenli Danışmanlık (Retainer)
              </h4>
              <DanismanlikTablosu items={duzenliDanismanliklar} />
            </div>
          )}

          {/* Tek Seferlik Danışmanlıklar */}
          {tekSefer.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                📄 Tek Seferlik
              </h4>
              <DanismanlikTablosu items={tekSefer} />
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <DanismanlikModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

function DanismanlikTablosu({ items }: { items: Record<string, unknown>[] }) {
  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3 text-xs font-semibold text-text-muted">Tür</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-muted">Konu</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-muted">Durum</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-muted text-right">Ücret</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-muted text-right">Tahsil</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-muted text-right">Kalan</th>
            </tr>
          </thead>
          <tbody>
            {items.map((d) => {
              const ucret = parseFloat(String(d.ucret || 0)) || 0;
              const tahsil = parseFloat(String(d.tahsilEdildi || 0)) || 0;
              return (
                <tr key={d.id as string} className="border-b border-border/50 hover:bg-surface2 transition-colors">
                  <td className="px-4 py-2.5 text-xs text-text">{(d.tur as string) || '—'}</td>
                  <td className="px-4 py-2.5 text-xs text-text font-medium">{(d.konu as string) || '—'}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${DURUM_RENK[d.durum as string] || DURUM_RENK['Taslak']}`}>
                      {(d.durum as string) || 'Taslak'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs text-text font-medium">{fmt(ucret)}</td>
                  <td className="px-4 py-2.5 text-right text-xs text-green">{fmt(tahsil)}</td>
                  <td className="px-4 py-2.5 text-right text-xs text-gold font-semibold">{fmt(ucret - tahsil)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
