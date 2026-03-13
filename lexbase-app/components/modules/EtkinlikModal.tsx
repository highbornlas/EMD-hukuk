'use client';

import { useState, useEffect } from 'react';
import { Modal, FormGroup, FormInput, FormSelect, FormTextarea, BtnGold, BtnOutline } from '@/components/ui/Modal';
import { useEtkinlikKaydet, type Etkinlik } from '@/lib/hooks/useEtkinlikler';
import { useMuvekkillar } from '@/lib/hooks/useMuvekkillar';

interface EtkinlikModalProps {
  open: boolean;
  onClose: () => void;
  etkinlik?: Etkinlik | null;
}

const bos: Partial<Etkinlik> = {
  baslik: '',
  tarih: new Date().toISOString().split('T')[0],
  saat: '',
  tur: 'Toplantı',
  muvId: '',
  yer: '',
  not: '',
  hatirlatma: '30',
};

export function EtkinlikModal({ open, onClose, etkinlik }: EtkinlikModalProps) {
  const [form, setForm] = useState<Partial<Etkinlik>>({ ...bos });
  const [hata, setHata] = useState('');
  const kaydet = useEtkinlikKaydet();
  const { data: muvekkillar } = useMuvekkillar();

  useEffect(() => {
    if (etkinlik) {
      setForm({ ...etkinlik });
    } else {
      setForm({ ...bos, id: crypto.randomUUID() });
    }
    setHata('');
  }, [etkinlik, open]);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.baslik?.trim()) {
      setHata('Etkinlik başlığı zorunludur.');
      return;
    }
    if (!form.tarih) {
      setHata('Tarih zorunludur.');
      return;
    }
    setHata('');
    try {
      await kaydet.mutateAsync(form as Etkinlik);
      onClose();
    } catch {
      setHata('Kayıt sırasında bir hata oluştu.');
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={etkinlik ? 'Etkinlik Düzenle' : 'Yeni Etkinlik'}
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

        <FormGroup label="Etkinlik Başlığı" required>
          <FormInput value={form.baslik || ''} onChange={(e) => handleChange('baslik', e.target.value)} placeholder="Ör: Duruşma, Toplantı, Son Gün" />
        </FormGroup>

        <div className="grid grid-cols-3 gap-4">
          <FormGroup label="Tarih" required>
            <FormInput type="date" value={form.tarih || ''} onChange={(e) => handleChange('tarih', e.target.value)} />
          </FormGroup>
          <FormGroup label="Saat">
            <FormInput type="time" value={form.saat || ''} onChange={(e) => handleChange('saat', e.target.value)} />
          </FormGroup>
          <FormGroup label="Tür">
            <FormSelect value={form.tur || ''} onChange={(e) => handleChange('tur', e.target.value)}>
              <option value="Duruşma">Duruşma</option>
              <option value="Son Gün">Son Gün</option>
              <option value="Müvekkil Görüşmesi">Müvekkil Görüşmesi</option>
              <option value="Toplantı">Toplantı</option>
              <option value="Keşif">Keşif</option>
              <option value="Bilirkişi">Bilirkişi</option>
              <option value="Arabuluculuk">Arabuluculuk</option>
              <option value="Uzlaşma">Uzlaşma</option>
              <option value="Diğer">Diğer</option>
            </FormSelect>
          </FormGroup>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Müvekkil (Opsiyonel)">
            <FormSelect value={form.muvId || ''} onChange={(e) => handleChange('muvId', e.target.value)}>
              <option value="">Seçiniz</option>
              {muvekkillar?.map((m) => (
                <option key={m.id} value={m.id}>{m.ad}</option>
              ))}
            </FormSelect>
          </FormGroup>
          <FormGroup label="Hatırlatma">
            <FormSelect value={form.hatirlatma || ''} onChange={(e) => handleChange('hatirlatma', e.target.value)}>
              <option value="">Yok</option>
              <option value="15">15 dakika önce</option>
              <option value="30">30 dakika önce</option>
              <option value="60">1 saat önce</option>
              <option value="1440">1 gün önce</option>
              <option value="4320">3 gün önce</option>
            </FormSelect>
          </FormGroup>
        </div>

        <FormGroup label="Dosya No (Opsiyonel)">
          <FormInput value={form.davNo || ''} onChange={(e) => handleChange('davNo', e.target.value)} placeholder="İlişkili dosya numarası" />
        </FormGroup>

        <FormGroup label="Yer">
          <FormInput value={form.yer || ''} onChange={(e) => handleChange('yer', e.target.value)} placeholder="Ör: İstanbul 3. Asliye Hukuk Mahkemesi" />
        </FormGroup>

        <FormGroup label="Notlar">
          <FormTextarea value={(form.not as string) || ''} onChange={(e) => handleChange('not', e.target.value)} rows={2} placeholder="Ek notlar..." />
        </FormGroup>
      </div>
    </Modal>
  );
}
