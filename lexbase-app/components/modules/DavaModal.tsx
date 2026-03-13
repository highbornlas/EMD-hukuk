'use client';

import { useState, useEffect } from 'react';
import { Modal, FormGroup, FormInput, FormSelect, FormTextarea, BtnGold, BtnOutline } from '@/components/ui/Modal';
import { useDavaKaydet, type Dava } from '@/lib/hooks/useDavalar';
import { useMuvekkillar } from '@/lib/hooks/useMuvekkillar';

interface DavaModalProps {
  open: boolean;
  onClose: () => void;
  dava?: Dava | null;
}

const bos: Partial<Dava> = {
  konu: '',
  muvId: '',
  il: '',
  adliye: '',
  mtur: '',
  mno: '',
  esasYil: '',
  esasNo: '',
  taraf: 'davaci',
  asama: 'İlk Derece',
  durum: 'Aktif',
  tarih: new Date().toISOString().split('T')[0],
  durusma: '',
  deger: 0,
  karsi: '',
  not: '',
};

export function DavaModal({ open, onClose, dava }: DavaModalProps) {
  const [form, setForm] = useState<Partial<Dava>>({ ...bos });
  const [hata, setHata] = useState('');
  const kaydet = useDavaKaydet();
  const { data: muvekkillar } = useMuvekkillar();

  useEffect(() => {
    if (dava) {
      setForm({ ...dava });
    } else {
      setForm({ ...bos, id: crypto.randomUUID() });
    }
    setHata('');
  }, [dava, open]);

  function handleChange(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.konu?.trim()) {
      setHata('Dava konusu zorunludur.');
      return;
    }
    setHata('');
    try {
      await kaydet.mutateAsync(form as Dava);
      onClose();
    } catch {
      setHata('Kayıt sırasında bir hata oluştu.');
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={dava ? 'Dava Düzenle' : 'Yeni Dava'}
      maxWidth="max-w-3xl"
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

        {/* Konu + Müvekkil */}
        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Dava Konusu" required>
            <FormInput value={form.konu || ''} onChange={(e) => handleChange('konu', e.target.value)} placeholder="Ör: Boşanma, Alacak, İş Davası" />
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

        {/* Taraf + Durum */}
        <div className="grid grid-cols-3 gap-4">
          <FormGroup label="Taraf">
            <FormSelect value={form.taraf || ''} onChange={(e) => handleChange('taraf', e.target.value)}>
              <option value="davaci">Davacı</option>
              <option value="davali">Davalı</option>
              <option value="mudahil">Müdahil</option>
            </FormSelect>
          </FormGroup>
          <FormGroup label="Aşama">
            <FormSelect value={form.asama || ''} onChange={(e) => handleChange('asama', e.target.value)}>
              <option value="İlk Derece">İlk Derece</option>
              <option value="İstinaf">İstinaf</option>
              <option value="Temyiz (Yargıtay)">Temyiz (Yargıtay)</option>
              <option value="Temyiz (Danıştay)">Temyiz (Danıştay)</option>
              <option value="Kesinleşti">Kesinleşti</option>
            </FormSelect>
          </FormGroup>
          <FormGroup label="Durum">
            <FormSelect value={form.durum || ''} onChange={(e) => handleChange('durum', e.target.value)}>
              <option value="Aktif">Aktif</option>
              <option value="Beklemede">Beklemede</option>
              <option value="Kapalı">Kapalı</option>
            </FormSelect>
          </FormGroup>
        </div>

        {/* Mahkeme Bilgileri */}
        <div className="border-t border-border/50 pt-4">
          <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3">Mahkeme Bilgileri</div>
          <div className="grid grid-cols-3 gap-4">
            <FormGroup label="İl">
              <FormInput value={form.il || ''} onChange={(e) => handleChange('il', e.target.value)} placeholder="Ör: İstanbul" />
            </FormGroup>
            <FormGroup label="Adliye">
              <FormInput value={form.adliye || ''} onChange={(e) => handleChange('adliye', e.target.value)} placeholder="Ör: İstanbul Anadolu" />
            </FormGroup>
            <FormGroup label="Mahkeme Türü">
              <FormSelect value={form.mtur || ''} onChange={(e) => handleChange('mtur', e.target.value)}>
                <option value="">Seçiniz</option>
                <option value="Asliye Hukuk">Asliye Hukuk</option>
                <option value="Asliye Ticaret">Asliye Ticaret</option>
                <option value="Sulh Hukuk">Sulh Hukuk</option>
                <option value="Aile">Aile</option>
                <option value="İş">İş</option>
                <option value="Tüketici">Tüketici</option>
                <option value="Fikri Sınai Haklar">Fikri Sınai Haklar</option>
                <option value="İdare">İdare</option>
                <option value="Vergi">Vergi</option>
                <option value="Ağır Ceza">Ağır Ceza</option>
                <option value="Asliye Ceza">Asliye Ceza</option>
              </FormSelect>
            </FormGroup>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-3">
            <FormGroup label="Mahkeme No">
              <FormInput value={form.mno || ''} onChange={(e) => handleChange('mno', e.target.value)} placeholder="Ör: 3" />
            </FormGroup>
            <FormGroup label="Esas Yılı">
              <FormInput value={form.esasYil || ''} onChange={(e) => handleChange('esasYil', e.target.value)} placeholder="Ör: 2026" />
            </FormGroup>
            <FormGroup label="Esas No">
              <FormInput value={form.esasNo || ''} onChange={(e) => handleChange('esasNo', e.target.value)} placeholder="Ör: 123" />
            </FormGroup>
          </div>
        </div>

        {/* Tarihler + Değer */}
        <div className="border-t border-border/50 pt-4">
          <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3">Tarihler ve Değer</div>
          <div className="grid grid-cols-3 gap-4">
            <FormGroup label="Dava Tarihi">
              <FormInput type="date" value={form.tarih || ''} onChange={(e) => handleChange('tarih', e.target.value)} />
            </FormGroup>
            <FormGroup label="Duruşma Tarihi">
              <FormInput type="date" value={form.durusma || ''} onChange={(e) => handleChange('durusma', e.target.value)} />
            </FormGroup>
            <FormGroup label="Dava Değeri (TL)">
              <FormInput type="number" value={form.deger || ''} onChange={(e) => handleChange('deger', Number(e.target.value))} placeholder="0" />
            </FormGroup>
          </div>
        </div>

        {/* Karşı Taraf */}
        <FormGroup label="Karşı Taraf">
          <FormInput value={form.karsi || ''} onChange={(e) => handleChange('karsi', e.target.value)} placeholder="Karşı taraf adı" />
        </FormGroup>

        {/* Notlar */}
        <FormGroup label="Notlar">
          <FormTextarea value={(form.not as string) || ''} onChange={(e) => handleChange('not', e.target.value)} rows={2} placeholder="Ek notlar..." />
        </FormGroup>
      </div>
    </Modal>
  );
}
