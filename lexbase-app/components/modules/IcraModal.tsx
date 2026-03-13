'use client';

import { useState, useEffect } from 'react';
import { Modal, FormGroup, FormInput, FormSelect, FormTextarea, BtnGold, BtnOutline } from '@/components/ui/Modal';
import { useIcraKaydet, type Icra } from '@/lib/hooks/useIcra';
import { useMuvekkillar } from '@/lib/hooks/useMuvekkillar';

interface IcraModalProps {
  open: boolean;
  onClose: () => void;
  icra?: Icra | null;
}

const bos: Partial<Icra> = {
  muvId: '',
  borclu: '',
  btc: '',
  il: '',
  adliye: '',
  daire: '',
  esas: '',
  tur: '',
  durum: 'Aktif',
  alacak: 0,
  tarih: new Date().toISOString().split('T')[0],
  muvRol: 'alacakli',
  karsi: '',
  dayanak: '',
  not: '',
};

export function IcraModal({ open, onClose, icra }: IcraModalProps) {
  const [form, setForm] = useState<Partial<Icra>>({ ...bos });
  const [hata, setHata] = useState('');
  const kaydet = useIcraKaydet();
  const { data: muvekkillar } = useMuvekkillar();

  useEffect(() => {
    if (icra) {
      setForm({ ...icra });
    } else {
      setForm({ ...bos, id: crypto.randomUUID() });
    }
    setHata('');
  }, [icra, open]);

  function handleChange(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.borclu?.trim() && !form.muvId) {
      setHata('Borçlu adı veya müvekkil seçimi zorunludur.');
      return;
    }
    setHata('');
    try {
      await kaydet.mutateAsync(form as Icra);
      onClose();
    } catch {
      setHata('Kayıt sırasında bir hata oluştu.');
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={icra ? 'İcra Dosyası Düzenle' : 'Yeni İcra Dosyası'}
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

        {/* Müvekkil + Rol */}
        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Müvekkil">
            <FormSelect value={form.muvId || ''} onChange={(e) => handleChange('muvId', e.target.value)}>
              <option value="">Seçiniz</option>
              {muvekkillar?.map((m) => (
                <option key={m.id} value={m.id}>{m.ad}</option>
              ))}
            </FormSelect>
          </FormGroup>
          <FormGroup label="Müvekkil Rolü">
            <FormSelect value={form.muvRol || ''} onChange={(e) => handleChange('muvRol', e.target.value)}>
              <option value="alacakli">Alacaklı</option>
              <option value="borclu">Borçlu</option>
            </FormSelect>
          </FormGroup>
        </div>

        {/* Borçlu Bilgileri */}
        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Borçlu Ad/Unvan">
            <FormInput value={form.borclu || ''} onChange={(e) => handleChange('borclu', e.target.value)} placeholder="Borçlu adı veya unvanı" />
          </FormGroup>
          <FormGroup label="Borçlu TC/VKN">
            <FormInput value={form.btc || ''} onChange={(e) => handleChange('btc', e.target.value)} placeholder="TC Kimlik No veya Vergi No" maxLength={11} />
          </FormGroup>
        </div>

        {/* Tür + Durum + Alacak Türü */}
        <div className="grid grid-cols-3 gap-4">
          <FormGroup label="İcra Türü">
            <FormSelect value={form.tur || ''} onChange={(e) => handleChange('tur', e.target.value)}>
              <option value="">Seçiniz</option>
              <option value="İlamlı">İlamlı</option>
              <option value="İlamsız">İlamsız</option>
              <option value="Kambiyo">Kambiyo</option>
              <option value="Kira">Kira</option>
              <option value="Rehnin Paraya Çevrilmesi">Rehnin Paraya Çevrilmesi</option>
              <option value="İflas">İflas</option>
            </FormSelect>
          </FormGroup>
          <FormGroup label="Durum">
            <FormSelect value={form.durum || ''} onChange={(e) => handleChange('durum', e.target.value)}>
              <option value="Aktif">Aktif</option>
              <option value="Takipte">Takipte</option>
              <option value="Haciz Aşaması">Haciz Aşaması</option>
              <option value="Satış Aşaması">Satış Aşaması</option>
              <option value="Kapandı">Kapandı</option>
            </FormSelect>
          </FormGroup>
          <FormGroup label="Alacak Türü">
            <FormSelect value={form.atur || ''} onChange={(e) => handleChange('atur', e.target.value)}>
              <option value="">Seçiniz</option>
              <option value="Ticari">Ticari Alacak</option>
              <option value="Kira">Kira Alacağı</option>
              <option value="İş">İş Alacağı</option>
              <option value="Çek/Senet">Çek/Senet</option>
              <option value="Tazminat">Tazminat</option>
              <option value="Diğer">Diğer</option>
            </FormSelect>
          </FormGroup>
        </div>

        {/* İcra Dairesi */}
        <div className="border-t border-border/50 pt-4">
          <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3">İcra Dairesi</div>
          <div className="grid grid-cols-4 gap-4">
            <FormGroup label="İl">
              <FormInput value={form.il || ''} onChange={(e) => handleChange('il', e.target.value)} placeholder="İl" />
            </FormGroup>
            <FormGroup label="Adliye">
              <FormInput value={form.adliye || ''} onChange={(e) => handleChange('adliye', e.target.value)} placeholder="Adliye" />
            </FormGroup>
            <FormGroup label="Daire">
              <FormInput value={form.daire || ''} onChange={(e) => handleChange('daire', e.target.value)} placeholder="Ör: 5. İcra" />
            </FormGroup>
            <FormGroup label="Esas No">
              <FormInput value={form.esas || ''} onChange={(e) => handleChange('esas', e.target.value)} placeholder="2026/1234" />
            </FormGroup>
          </div>
        </div>

        {/* Tarihler + Değer */}
        <div className="border-t border-border/50 pt-4">
          <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3">Tarih ve Tutar</div>
          <div className="grid grid-cols-3 gap-4">
            <FormGroup label="Takip Tarihi">
              <FormInput type="date" value={form.tarih || ''} onChange={(e) => handleChange('tarih', e.target.value)} />
            </FormGroup>
            <FormGroup label="Ödeme Emri Tarihi">
              <FormInput type="date" value={form.otarih || ''} onChange={(e) => handleChange('otarih', e.target.value)} />
            </FormGroup>
            <FormGroup label="Alacak Tutarı (TL)">
              <FormInput type="number" value={form.alacak || ''} onChange={(e) => handleChange('alacak', Number(e.target.value))} placeholder="0" />
            </FormGroup>
          </div>
        </div>

        {/* Dayanak */}
        <FormGroup label="Dayanak">
          <FormInput value={form.dayanak || ''} onChange={(e) => handleChange('dayanak', e.target.value)} placeholder="Ör: İstanbul 3. Asliye Ticaret Mahkemesi 2025/456 E." />
        </FormGroup>

        {/* Notlar */}
        <FormGroup label="Notlar">
          <FormTextarea value={(form.not as string) || ''} onChange={(e) => handleChange('not', e.target.value)} rows={2} placeholder="Ek notlar..." />
        </FormGroup>
      </div>
    </Modal>
  );
}
