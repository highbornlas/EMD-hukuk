'use client';

import { useState, useEffect } from 'react';
import { Modal, FormGroup, FormInput, FormTextarea, BtnGold, BtnOutline } from '@/components/ui/Modal';
import { useVekilKaydet, type Vekil } from '@/lib/hooks/useVekillar';
import { SmartBankaSecici } from '@/components/ui/SmartBankaSecici';

/* ══════════════════════════════════════════════════════════════
   Vekil (Avukat) Modal — Oluştur / Düzenle
   Basit form — tip seçimi yok, tüm avukatlar gerçek kişi
   BankaWidget entegre
   ══════════════════════════════════════════════════════════════ */

interface VekilModalProps {
  open: boolean;
  onClose: () => void;
  vekil?: Vekil | null;
  /** Modal kapanınca oluşturulan kaydı döndür (RehberSecici için) */
  onCreated?: (v: Vekil) => void;
}

const BAROLAR = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya',
  'Ardahan', 'Artvin', 'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik',
  'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum',
  'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir',
  'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul',
  'İzmir', 'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kilis',
  'Kırıkkale', 'Kırklareli', 'Kırşehir', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa',
  'Mardin', 'Mersin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye',
  'Rize', 'Sakarya', 'Samsun', 'Şanlıurfa', 'Siirt', 'Sinop', 'Şırnak', 'Sivas',
  'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak',
];

const bos: Partial<Vekil> = {
  ad: '',
  soyad: '',
  baro: '',
  baroSicil: '',
  tbbSicil: '',
  tel: '',
  mail: '',
  uets: '',
  bankalar: [],
  aciklama: '',
};

export function VekilModal({ open, onClose, vekil, onCreated }: VekilModalProps) {
  const [form, setForm] = useState<Partial<Vekil>>({ ...bos });
  const [hata, setHata] = useState('');
  const kaydet = useVekilKaydet();

  useEffect(() => {
    if (vekil) {
      setForm({ ...vekil });
    } else {
      setForm({ ...bos, id: crypto.randomUUID() });
    }
    setHata('');
  }, [vekil, open]);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.ad?.trim()) {
      setHata('Avukat adı zorunludur.');
      return;
    }
    setHata('');
    try {
      await kaydet.mutateAsync(form as Vekil);
      onCreated?.(form as Vekil);
      onClose();
    } catch {
      setHata('Kayıt sırasında bir hata oluştu.');
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={vekil ? 'Avukat Düzenle' : 'Yeni Avukat'}
      maxWidth="max-w-2xl"
      footer={
        <>
          <BtnOutline onClick={onClose}>İptal</BtnOutline>
          <BtnGold onClick={handleSubmit} disabled={kaydet.isPending}>
            {kaydet.isPending ? 'Kaydediliyor...' : 'Kaydet'}
          </BtnGold>
        </>
      }
    >
      <div className="space-y-4">
        {hata && (
          <div className="bg-red-dim border border-red/20 rounded-[10px] px-3 py-2 text-xs text-red">
            {hata}
          </div>
        )}

        {/* Ad + Soyad */}
        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Ad" required>
            <FormInput
              value={form.ad || ''}
              onChange={(e) => handleChange('ad', e.target.value)}
              placeholder="Ad"
            />
          </FormGroup>
          <FormGroup label="Soyad">
            <FormInput
              value={form.soyad || ''}
              onChange={(e) => handleChange('soyad', e.target.value)}
              placeholder="Soyad"
            />
          </FormGroup>
        </div>

        {/* Baro + Sicil */}
        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Baro">
            <select
              value={form.baro || ''}
              onChange={(e) => handleChange('baro', e.target.value)}
              className="form-input"
            >
              <option value="">Baro Seçin</option>
              {BAROLAR.map((b) => (
                <option key={b} value={b}>{b} Barosu</option>
              ))}
            </select>
          </FormGroup>
          <FormGroup label="Baro Sicil No">
            <FormInput value={form.baroSicil || ''} onChange={(e) => handleChange('baroSicil', e.target.value)} placeholder="Sicil No" />
          </FormGroup>
        </div>

        {/* TBB Sicil */}
        <FormGroup label="TBB Sicil No">
          <FormInput value={form.tbbSicil || ''} onChange={(e) => handleChange('tbbSicil', e.target.value)} placeholder="Türkiye Barolar Birliği Sicil No" />
        </FormGroup>

        {/* İletişim */}
        <div className="border-t border-border/50 pt-4">
          <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3">İletişim Bilgileri</div>
          <div className="grid grid-cols-2 gap-4">
            <FormGroup label="Telefon">
              <FormInput type="tel" value={form.tel || ''} onChange={(e) => handleChange('tel', e.target.value)} placeholder="0532 000 0000" />
            </FormGroup>
            <FormGroup label="E-posta">
              <FormInput type="email" value={form.mail || ''} onChange={(e) => handleChange('mail', e.target.value)} placeholder="ornek@mail.com" />
            </FormGroup>
          </div>
          <div className="mt-3">
            <FormGroup label="UETS / KEP Adresi">
              <FormInput value={form.uets || ''} onChange={(e) => handleChange('uets', e.target.value)} placeholder="UETS adresi" />
            </FormGroup>
          </div>
        </div>

        {/* ═══════ BANKA HESAPLARI ═══════ */}
        <SmartBankaSecici
          bankalar={form.bankalar || []}
          onChange={(bankalar) => setForm((prev) => ({ ...prev, bankalar }))}
        />

        {/* Notlar */}
        <FormGroup label="Notlar">
          <FormTextarea value={form.aciklama || ''} onChange={(e) => handleChange('aciklama', e.target.value)} rows={3} placeholder="Ek notlar..." />
        </FormGroup>
      </div>
    </Modal>
  );
}
