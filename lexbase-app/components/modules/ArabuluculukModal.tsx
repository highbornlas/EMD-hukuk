'use client';

import { useState, useEffect } from 'react';
import { Modal, FormGroup, FormInput, FormSelect, FormTextarea, BtnGold, BtnOutline } from '@/components/ui/Modal';
import { useArabuluculukKaydet, type Arabuluculuk } from '@/lib/hooks/useArabuluculuk';
import { useMuvekkillar } from '@/lib/hooks/useMuvekkillar';

interface ArabuluculukModalProps {
  open: boolean;
  onClose: () => void;
  arabuluculuk?: Arabuluculuk | null;
}

const bos: Partial<Arabuluculuk> = {
  muvId: '',
  konu: '',
  tur: '',
  durum: 'Başvuru',
  arabulucu: '',
  basvuruTarih: new Date().toISOString().split('T')[0],
  karsiTaraf: '',
  talep: 0,
  ucret: 0,
  aciklama: '',
};

export function ArabuluculukModal({ open, onClose, arabuluculuk }: ArabuluculukModalProps) {
  const [form, setForm] = useState<Partial<Arabuluculuk>>({ ...bos });
  const [hata, setHata] = useState('');
  const kaydet = useArabuluculukKaydet();
  const { data: muvekkillar } = useMuvekkillar();

  useEffect(() => {
    if (arabuluculuk) {
      setForm({ ...arabuluculuk });
    } else {
      setForm({ ...bos, id: crypto.randomUUID() });
    }
    setHata('');
  }, [arabuluculuk, open]);

  function handleChange(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.konu?.trim()) {
      setHata('Konu zorunludur.');
      return;
    }
    setHata('');
    try {
      await kaydet.mutateAsync(form as Arabuluculuk);
      onClose();
    } catch {
      setHata('Kayıt sırasında bir hata oluştu.');
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={arabuluculuk ? 'Arabuluculuk Düzenle' : 'Yeni Arabuluculuk'}
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

        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Arabuluculuk Türü">
            <FormSelect value={form.tur || ''} onChange={(e) => handleChange('tur', e.target.value)}>
              <option value="">Seçiniz</option>
              <option value="Ticari">Ticari</option>
              <option value="İş">İş</option>
              <option value="Tüketici">Tüketici</option>
              <option value="Aile">Aile</option>
            </FormSelect>
          </FormGroup>
          <FormGroup label="Müvekkil">
            <FormSelect value={form.muvId || ''} onChange={(e) => handleChange('muvId', e.target.value)}>
              <option value="">Seçiniz</option>
              {muvekkillar?.map((m) => (
                <option key={m.id} value={m.id}>{m.ad}</option>
              ))}
            </FormSelect>
          </FormGroup>
        </div>

        <FormGroup label="Konu" required>
          <FormInput value={form.konu || ''} onChange={(e) => handleChange('konu', e.target.value)} placeholder="Arabuluculuk konusu" />
        </FormGroup>

        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Durum">
            <FormSelect value={form.durum || ''} onChange={(e) => handleChange('durum', e.target.value)}>
              <option value="Başvuru">Başvuru</option>
              <option value="Görüşme">Görüşme</option>
              <option value="Anlaşma">Anlaşma</option>
              <option value="Anlaşamama">Anlaşamama</option>
              <option value="İptal">İptal</option>
            </FormSelect>
          </FormGroup>
          <FormGroup label="Başvuru Tarihi">
            <FormInput type="date" value={form.basvuruTarih || ''} onChange={(e) => handleChange('basvuruTarih', e.target.value)} />
          </FormGroup>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Arabulucu">
            <FormInput value={form.arabulucu || ''} onChange={(e) => handleChange('arabulucu', e.target.value)} placeholder="Arabulucu adı" />
          </FormGroup>
          <FormGroup label="Karşı Taraf">
            <FormInput value={form.karsiTaraf || ''} onChange={(e) => handleChange('karsiTaraf', e.target.value)} placeholder="Karşı taraf adı" />
          </FormGroup>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Karşı Taraf Vekili">
            <FormInput value={form.karsiTarafVekil || ''} onChange={(e) => handleChange('karsiTarafVekil', e.target.value)} placeholder="Vekil adı" />
          </FormGroup>
          <FormGroup label="Oturum Sayısı">
            <FormInput type="number" value={form.oturumSayisi || ''} onChange={(e) => handleChange('oturumSayisi', Number(e.target.value))} placeholder="0" />
          </FormGroup>
        </div>

        <div className="border-t border-border/50 pt-4">
          <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3">Finansal</div>
          <div className="grid grid-cols-3 gap-4">
            <FormGroup label="Talep Tutarı (TL)">
              <FormInput type="number" value={form.talep || ''} onChange={(e) => handleChange('talep', Number(e.target.value))} placeholder="0" />
            </FormGroup>
            <FormGroup label="Anlaşma Ücreti (TL)">
              <FormInput type="number" value={form.anlasmaUcret || ''} onChange={(e) => handleChange('anlasmaUcret', Number(e.target.value))} placeholder="0" />
            </FormGroup>
            <FormGroup label="Vekalet Ücreti (TL)">
              <FormInput type="number" value={form.ucret || ''} onChange={(e) => handleChange('ucret', Number(e.target.value))} placeholder="0" />
            </FormGroup>
          </div>
        </div>

        <FormGroup label="Açıklama">
          <FormTextarea value={form.aciklama || ''} onChange={(e) => handleChange('aciklama', e.target.value)} rows={2} placeholder="Ek notlar..." />
        </FormGroup>
      </div>
    </Modal>
  );
}
