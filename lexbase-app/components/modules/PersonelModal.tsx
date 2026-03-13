'use client';

import { useState, useEffect } from 'react';
import { Modal, FormGroup, FormInput, FormSelect, FormTextarea, BtnGold, BtnOutline } from '@/components/ui/Modal';
import { usePersonelKaydet, type Personel } from '@/lib/hooks/usePersonel';

interface PersonelModalProps {
  open: boolean;
  onClose: () => void;
  personel?: Personel | null;
}

const bos: Partial<Personel> = {
  ad: '',
  rol: 'avukat',
  email: '',
  tel: '',
  tc: '',
  baroSicil: '',
  baslama: new Date().toISOString().split('T')[0],
  durum: 'aktif',
  notlar: '',
};

export function PersonelModal({ open, onClose, personel }: PersonelModalProps) {
  const [form, setForm] = useState<Partial<Personel>>({ ...bos });
  const [hata, setHata] = useState('');
  const kaydet = usePersonelKaydet();

  useEffect(() => {
    if (personel) {
      setForm({ ...personel });
    } else {
      setForm({ ...bos, id: crypto.randomUUID() });
    }
    setHata('');
  }, [personel, open]);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.ad?.trim()) {
      setHata('Ad Soyad zorunludur.');
      return;
    }
    setHata('');
    try {
      await kaydet.mutateAsync(form as Personel);
      onClose();
    } catch {
      setHata('Kayıt sırasında bir hata oluştu.');
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={personel ? 'Personel Düzenle' : 'Yeni Personel'}
      maxWidth="max-w-xl"
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

        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Ad Soyad" required>
            <FormInput value={form.ad || ''} onChange={(e) => handleChange('ad', e.target.value)} placeholder="Personel adı" />
          </FormGroup>
          <FormGroup label="Rol">
            <FormSelect value={form.rol || ''} onChange={(e) => handleChange('rol', e.target.value)}>
              <option value="avukat">Avukat</option>
              <option value="stajyer">Stajyer</option>
              <option value="sekreter">Sekreter</option>
              <option value="sahip">Büro Sahibi</option>
            </FormSelect>
          </FormGroup>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="E-posta">
            <FormInput type="email" value={form.email || ''} onChange={(e) => handleChange('email', e.target.value)} placeholder="ornek@mail.com" />
          </FormGroup>
          <FormGroup label="Telefon">
            <FormInput type="tel" value={form.tel || ''} onChange={(e) => handleChange('tel', e.target.value)} placeholder="0532 000 0000" />
          </FormGroup>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="TC Kimlik No">
            <FormInput value={form.tc || ''} onChange={(e) => handleChange('tc', e.target.value)} placeholder="11 haneli TC" maxLength={11} />
          </FormGroup>
          <FormGroup label="Baro Sicil No">
            <FormInput value={form.baroSicil || ''} onChange={(e) => handleChange('baroSicil', e.target.value)} placeholder="Baro sicil numarası" />
          </FormGroup>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Başlama Tarihi">
            <FormInput type="date" value={form.baslama || ''} onChange={(e) => handleChange('baslama', e.target.value)} />
          </FormGroup>
          <FormGroup label="Durum">
            <FormSelect value={form.durum || ''} onChange={(e) => handleChange('durum', e.target.value)}>
              <option value="aktif">Aktif</option>
              <option value="davet_gonderildi">Davet Gönderildi</option>
              <option value="pasif">Pasif</option>
            </FormSelect>
          </FormGroup>
        </div>

        <FormGroup label="Notlar">
          <FormTextarea value={form.notlar || ''} onChange={(e) => handleChange('notlar', e.target.value)} rows={2} placeholder="Ek notlar..." />
        </FormGroup>
      </div>
    </Modal>
  );
}
