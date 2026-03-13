'use client';

import { useState, useEffect } from 'react';
import { Modal, FormGroup, FormInput, FormSelect, FormTextarea, BtnGold, BtnOutline } from '@/components/ui/Modal';
import { useTodoKaydet, type Todo } from '@/lib/hooks/useTodolar';
import { useMuvekkillar } from '@/lib/hooks/useMuvekkillar';

interface GorevModalProps {
  open: boolean;
  onClose: () => void;
  gorev?: Todo | null;
}

const bos: Partial<Todo> = {
  baslik: '',
  aciklama: '',
  oncelik: 'Orta',
  durum: 'Bekliyor',
  sonTarih: '',
  muvId: '',
  dosyaTur: '',
};

export function GorevModal({ open, onClose, gorev }: GorevModalProps) {
  const [form, setForm] = useState<Partial<Todo>>({ ...bos });
  const [hata, setHata] = useState('');
  const kaydet = useTodoKaydet();
  const { data: muvekkillar } = useMuvekkillar();

  useEffect(() => {
    if (gorev) {
      setForm({ ...gorev });
    } else {
      setForm({ ...bos, id: crypto.randomUUID(), olusturmaTarih: new Date().toISOString() });
    }
    setHata('');
  }, [gorev, open]);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.baslik?.trim()) {
      setHata('Görev başlığı zorunludur.');
      return;
    }
    setHata('');
    try {
      await kaydet.mutateAsync(form as Todo);
      onClose();
    } catch {
      setHata('Kayıt sırasında bir hata oluştu.');
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={gorev ? 'Görev Düzenle' : 'Yeni Görev'}
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

        <FormGroup label="Görev Başlığı" required>
          <FormInput value={form.baslik || ''} onChange={(e) => handleChange('baslik', e.target.value)} placeholder="Ne yapılması gerekiyor?" />
        </FormGroup>

        <FormGroup label="Açıklama">
          <FormTextarea value={form.aciklama || ''} onChange={(e) => handleChange('aciklama', e.target.value)} rows={3} placeholder="Detaylı açıklama..." />
        </FormGroup>

        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Öncelik">
            <FormSelect value={form.oncelik || ''} onChange={(e) => handleChange('oncelik', e.target.value)}>
              <option value="Yüksek">🔴 Yüksek</option>
              <option value="Orta">🟡 Orta</option>
              <option value="Düşük">🟢 Düşük</option>
            </FormSelect>
          </FormGroup>
          <FormGroup label="Durum">
            <FormSelect value={form.durum || ''} onChange={(e) => handleChange('durum', e.target.value)}>
              <option value="Bekliyor">Bekliyor</option>
              <option value="Devam Ediyor">Devam Ediyor</option>
              <option value="Tamamlandı">Tamamlandı</option>
              <option value="İptal">İptal</option>
            </FormSelect>
          </FormGroup>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Son Tarih">
            <FormInput type="date" value={form.sonTarih || ''} onChange={(e) => handleChange('sonTarih', e.target.value)} />
          </FormGroup>
          <FormGroup label="Müvekkil (Opsiyonel)">
            <FormSelect value={form.muvId || ''} onChange={(e) => handleChange('muvId', e.target.value)}>
              <option value="">Seçiniz</option>
              {muvekkillar?.map((m) => (
                <option key={m.id} value={m.id}>{m.ad}</option>
              ))}
            </FormSelect>
          </FormGroup>
        </div>

        <FormGroup label="İlgili Dosya Türü">
          <FormSelect value={form.dosyaTur || ''} onChange={(e) => handleChange('dosyaTur', e.target.value)}>
            <option value="">Yok</option>
            <option value="Dava">Dava</option>
            <option value="İcra">İcra</option>
            <option value="Danışmanlık">Danışmanlık</option>
            <option value="Arabuluculuk">Arabuluculuk</option>
            <option value="İhtarname">İhtarname</option>
          </FormSelect>
        </FormGroup>
      </div>
    </Modal>
  );
}
