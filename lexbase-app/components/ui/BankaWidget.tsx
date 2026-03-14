'use client';

/* ══════════════════════════════════════════════════════════════
   BankaWidget — Reusable Banka Hesap Yönetim Widget
   MuvekkilModal, KarsiTarafModal, VekilModal içinde kullanılır
   ══════════════════════════════════════════════════════════════ */

import { FormGroup, FormInput } from '@/components/ui/Modal';

interface BankaHesap {
  banka?: string;
  sube?: string;
  iban?: string;
  hesapNo?: string;
  hesapAd?: string;
}

interface BankaWidgetProps {
  bankalar: BankaHesap[];
  onChange: (bankalar: BankaHesap[]) => void;
}

export function BankaWidget({ bankalar, onChange }: BankaWidgetProps) {
  function handleChange(index: number, field: keyof BankaHesap, value: string) {
    const yeni = [...bankalar];
    yeni[index] = { ...yeni[index], [field]: value };
    onChange(yeni);
  }

  function handleEkle() {
    onChange([...bankalar, { banka: '', sube: '', iban: '', hesapNo: '', hesapAd: '' }]);
  }

  function handleKaldir(index: number) {
    onChange(bankalar.filter((_, i) => i !== index));
  }

  return (
    <div className="border-t border-border/50 pt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          Banka Hesapları
        </div>
        <button
          type="button"
          onClick={handleEkle}
          className="text-[11px] font-semibold text-gold hover:text-gold-light transition-colors flex items-center gap-1"
        >
          <span>+</span> Hesap Ekle
        </button>
      </div>

      {bankalar.length === 0 ? (
        <div className="text-center py-4 text-text-dim text-xs bg-surface2/50 rounded-lg border border-border/30">
          Henüz banka hesabı eklenmemiş
        </div>
      ) : (
        <div className="space-y-3">
          {bankalar.map((hesap, idx) => (
            <div
              key={idx}
              className="bg-surface2/50 rounded-xl border border-border/50 p-3 relative group"
            >
              {/* Kaldır butonu */}
              <button
                type="button"
                onClick={() => handleKaldir(idx)}
                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-md
                           text-text-dim hover:text-red hover:bg-red-dim transition-all text-xs
                           opacity-0 group-hover:opacity-100"
                title="Hesabı kaldır"
              >
                ✕
              </button>

              {/* Banka + Şube */}
              <div className="grid grid-cols-2 gap-3 mb-2">
                <FormGroup label="Banka Adı">
                  <FormInput
                    value={hesap.banka || ''}
                    onChange={(e) => handleChange(idx, 'banka', e.target.value)}
                    placeholder="Ör: Ziraat Bankası"
                    className="!h-8 !text-xs"
                  />
                </FormGroup>
                <FormGroup label="Şube">
                  <FormInput
                    value={hesap.sube || ''}
                    onChange={(e) => handleChange(idx, 'sube', e.target.value)}
                    placeholder="Şube adı"
                    className="!h-8 !text-xs"
                  />
                </FormGroup>
              </div>

              {/* IBAN */}
              <div className="mb-2">
                <FormGroup label="IBAN">
                  <FormInput
                    value={hesap.iban || ''}
                    onChange={(e) => handleChange(idx, 'iban', e.target.value)}
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                    className="!h-8 !text-xs !font-mono !tracking-wider"
                    maxLength={34}
                  />
                </FormGroup>
              </div>

              {/* Hesap No + Hesap Sahibi */}
              <div className="grid grid-cols-2 gap-3">
                <FormGroup label="Hesap No">
                  <FormInput
                    value={hesap.hesapNo || ''}
                    onChange={(e) => handleChange(idx, 'hesapNo', e.target.value)}
                    placeholder="Hesap numarası"
                    className="!h-8 !text-xs"
                  />
                </FormGroup>
                <FormGroup label="Hesap Sahibi">
                  <FormInput
                    value={hesap.hesapAd || ''}
                    onChange={(e) => handleChange(idx, 'hesapAd', e.target.value)}
                    placeholder="Hesap sahibi adı"
                    className="!h-8 !text-xs"
                  />
                </FormGroup>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
