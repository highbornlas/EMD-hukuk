'use client';

import { useState, useEffect } from 'react';
import { Modal, FormGroup, FormInput, FormSelect, FormTextarea, BtnGold, BtnOutline } from '@/components/ui/Modal';
import { useIhtarnameKaydet, type Ihtarname } from '@/lib/hooks/useIhtarname';
import { useMuvekkillar } from '@/lib/hooks/useMuvekkillar';

interface IhtarnameModalProps {
  open: boolean;
  onClose: () => void;
  ihtarname?: Ihtarname | null;
}

const bos: Partial<Ihtarname> = {
  muvId: '',
  konu: '',
  tur: 'İhtar',
  durum: 'Taslak',
  gonderen: '',
  alici: '',
  aliciAdres: '',
  noterAd: '',
  tarih: new Date().toISOString().split('T')[0],
  ucret: 0,
  noterMasrafi: 0,
};

export function IhtarnameModal({ open, onClose, ihtarname }: IhtarnameModalProps) {
  const [form, setForm] = useState<Partial<Ihtarname>>({ ...bos });
  const [hata, setHata] = useState('');
  const kaydet = useIhtarnameKaydet();
  const { data: muvekkillar } = useMuvekkillar();

  useEffect(() => {
    if (ihtarname) {
      setForm({ ...ihtarname });
    } else {
      setForm({ ...bos, id: crypto.randomUUID() });
    }
    setHata('');
  }, [ihtarname, open]);

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
      await kaydet.mutateAsync(form as Ihtarname);
      onClose();
    } catch {
      setHata('Kayıt sırasında bir hata oluştu.');
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={ihtarname ? 'İhtarname Düzenle' : 'Yeni İhtarname'}
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
          <FormGroup label="İhtarname Türü">
            <FormSelect value={form.tur || ''} onChange={(e) => handleChange('tur', e.target.value)}>
              <option value="İhtar">İhtar</option>
              <option value="İhbarname">İhbarname</option>
              <option value="Fesih İhtarı">Fesih İhtarı</option>
              <option value="Ödeme İhtarı">Ödeme İhtarı</option>
              <option value="Tahliye İhtarı">Tahliye İhtarı</option>
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
          <FormInput value={form.konu || ''} onChange={(e) => handleChange('konu', e.target.value)} placeholder="İhtarname konusu" />
        </FormGroup>

        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Gönderen">
            <FormInput value={form.gonderen || ''} onChange={(e) => handleChange('gonderen', e.target.value)} placeholder="Gönderen ad/unvan" />
          </FormGroup>
          <FormGroup label="Alıcı">
            <FormInput value={form.alici || ''} onChange={(e) => handleChange('alici', e.target.value)} placeholder="Alıcı ad/unvan" />
          </FormGroup>
        </div>

        <FormGroup label="Alıcı Adresi">
          <FormTextarea value={form.aliciAdres || ''} onChange={(e) => handleChange('aliciAdres', e.target.value)} rows={2} placeholder="Alıcı açık adresi" />
        </FormGroup>

        <div className="grid grid-cols-3 gap-4">
          <FormGroup label="Durum">
            <FormSelect value={form.durum || ''} onChange={(e) => handleChange('durum', e.target.value)}>
              <option value="Taslak">Taslak</option>
              <option value="Hazırlandı">Hazırlandı</option>
              <option value="Gönderildi">Gönderildi</option>
              <option value="Tebliğ Edildi">Tebliğ Edildi</option>
              <option value="Cevap Geldi">Cevap Geldi</option>
              <option value="Sonuçlandı">Sonuçlandı</option>
            </FormSelect>
          </FormGroup>
          <FormGroup label="Tarih">
            <FormInput type="date" value={form.tarih || ''} onChange={(e) => handleChange('tarih', e.target.value)} />
          </FormGroup>
          <FormGroup label="Noter">
            <FormInput value={form.noterAd || ''} onChange={(e) => handleChange('noterAd', e.target.value)} placeholder="Noter adı" />
          </FormGroup>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Ücret (TL)">
            <FormInput type="number" value={form.ucret || ''} onChange={(e) => handleChange('ucret', Number(e.target.value))} placeholder="0" />
          </FormGroup>
          <FormGroup label="Noter Masrafı (TL)">
            <FormInput type="number" value={form.noterMasrafi || ''} onChange={(e) => handleChange('noterMasrafi', Number(e.target.value))} placeholder="0" />
          </FormGroup>
        </div>
      </div>
    </Modal>
  );
}
