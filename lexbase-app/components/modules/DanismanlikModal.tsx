'use client';

import { useState, useEffect } from 'react';
import { Modal, FormGroup, FormInput, FormSelect, FormTextarea, BtnGold, BtnOutline } from '@/components/ui/Modal';
import { useDanismanlikKaydet, type Danismanlik } from '@/lib/hooks/useDanismanlik';
import { useMuvekkillar } from '@/lib/hooks/useMuvekkillar';

interface DanismanlikModalProps {
  open: boolean;
  onClose: () => void;
  danismanlik?: Danismanlik | null;
}

const bos: Partial<Danismanlik> = {
  tur: '',
  muvId: '',
  konu: '',
  durum: 'Taslak',
  tarih: new Date().toISOString().split('T')[0],
  teslimTarih: '',
  ucret: 0,
  tahsilEdildi: 0,
  aciklama: '',
};

export function DanismanlikModal({ open, onClose, danismanlik }: DanismanlikModalProps) {
  const [form, setForm] = useState<Partial<Danismanlik>>({ ...bos });
  const [hata, setHata] = useState('');
  const kaydet = useDanismanlikKaydet();
  const { data: muvekkillar } = useMuvekkillar();

  useEffect(() => {
    if (danismanlik) {
      setForm({ ...danismanlik });
    } else {
      setForm({ ...bos, id: crypto.randomUUID() });
    }
    setHata('');
  }, [danismanlik, open]);

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
      await kaydet.mutateAsync(form as Danismanlik);
      onClose();
    } catch {
      setHata('Kayıt sırasında bir hata oluştu.');
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={danismanlik ? 'Danışmanlık Düzenle' : 'Yeni Danışmanlık'}
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
          <FormGroup label="Danışmanlık Türü">
            <FormSelect value={form.tur || ''} onChange={(e) => handleChange('tur', e.target.value)}>
              <option value="">Seçiniz</option>
              <option value="Hukuki Mütalaa">Hukuki Mütalaa</option>
              <option value="Sözleşme İnceleme">Sözleşme İnceleme</option>
              <option value="Sözleşme Hazırlama">Sözleşme Hazırlama</option>
              <option value="Due Diligence">Due Diligence</option>
              <option value="Şirket Danışmanlık">Şirket Danışmanlık</option>
              <option value="İş Hukuku Danışmanlık">İş Hukuku Danışmanlık</option>
              <option value="Vergi Danışmanlık">Vergi Danışmanlık</option>
              <option value="Diğer">Diğer</option>
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
          <FormInput value={form.konu || ''} onChange={(e) => handleChange('konu', e.target.value)} placeholder="Danışmanlık konusu" />
        </FormGroup>

        <div className="grid grid-cols-3 gap-4">
          <FormGroup label="Durum">
            <FormSelect value={form.durum || ''} onChange={(e) => handleChange('durum', e.target.value)}>
              <option value="Taslak">Taslak</option>
              <option value="Devam Ediyor">Devam Ediyor</option>
              <option value="Müvekkil Onayında">Müvekkil Onayında</option>
              <option value="Gönderildi">Gönderildi</option>
              <option value="Tamamlandı">Tamamlandı</option>
              <option value="İptal">İptal</option>
            </FormSelect>
          </FormGroup>
          <FormGroup label="Başlangıç Tarihi">
            <FormInput type="date" value={form.tarih || ''} onChange={(e) => handleChange('tarih', e.target.value)} />
          </FormGroup>
          <FormGroup label="Teslim Tarihi">
            <FormInput type="date" value={form.teslimTarih || ''} onChange={(e) => handleChange('teslimTarih', e.target.value)} />
          </FormGroup>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Ücret (TL)">
            <FormInput type="number" value={form.ucret || ''} onChange={(e) => handleChange('ucret', Number(e.target.value))} placeholder="0" />
          </FormGroup>
          <FormGroup label="Tahsil Edilen (TL)">
            <FormInput type="number" value={form.tahsilEdildi || ''} onChange={(e) => handleChange('tahsilEdildi', Number(e.target.value))} placeholder="0" />
          </FormGroup>
        </div>

        <FormGroup label="Açıklama">
          <FormTextarea value={form.aciklama || ''} onChange={(e) => handleChange('aciklama', e.target.value)} rows={3} placeholder="Detaylar..." />
        </FormGroup>
      </div>
    </Modal>
  );
}
