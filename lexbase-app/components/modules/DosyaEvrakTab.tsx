'use client';

import { useState, useMemo } from 'react';
import {
  useDavaBelgeler,
  useIcraBelgeler,
  useBelgeYukle,
  useBelgeSil,
  belgeIndir,
  fmtBoyut,
  type Belge,
} from '@/lib/hooks/useBelgeler';
import { DAVA_EVRAK_TURLERI, ICRA_EVRAK_TURLERI } from '@/lib/constants/uyap';
import { DosyaBelgeModal, type DosyaBelgeFormData } from './DosyaBelgeModal';
import { fmtTarih } from '@/lib/utils';

/* ══════════════════════════════════════════════════════════════
   DosyaEvrakTab — Dava/İcra evrak yönetimi sekmesi
   NOT: Müvekkil belgeleriyle karışmaz. Tamamen ayrı filtre.
   ══════════════════════════════════════════════════════════════ */

interface Props {
  dosyaId: string;
  dosyaTipi: 'dava' | 'icra';
  muvId?: string; // storage path için (opsiyonel)
}

export function DosyaEvrakTab({ dosyaId, dosyaTipi, muvId }: Props) {
  const { data: belgeler, isLoading } = dosyaTipi === 'dava'
    ? useDavaBelgeler(dosyaId)
    : useIcraBelgeler(dosyaId);

  const yukle = useBelgeYukle();
  const sil = useBelgeSil();

  const [modalAcik, setModalAcik] = useState(false);
  const [filtre, setFiltre] = useState<string>('hepsi');
  const [silOnay, setSilOnay] = useState<string | null>(null);
  const [indiriliyor, setIndiriliyor] = useState<string | null>(null);

  const evrakTurleri = dosyaTipi === 'dava' ? DAVA_EVRAK_TURLERI : ICRA_EVRAK_TURLERI;

  // Filtreleme
  const filtreliBelgeler = useMemo(() => {
    if (!belgeler) return [];
    if (filtre === 'hepsi') return belgeler;
    return belgeler.filter(b => b.evrakTuru === filtre);
  }, [belgeler, filtre]);

  // Evrak sayılarını hesapla (kategori başına)
  const kategoriSayilari = useMemo(() => {
    if (!belgeler) return {};
    const sayilar: Record<string, number> = {};
    belgeler.forEach(b => {
      const tur = b.evrakTuru || 'diger';
      sayilar[tur] = (sayilar[tur] || 0) + 1;
    });
    return sayilar;
  }, [belgeler]);

  // Evrak yükleme
  const handleYukle = async (form: DosyaBelgeFormData, dosya: File) => {
    const belgeId = crypto.randomUUID();
    try {
      await yukle.mutateAsync({
        dosya,
        belge: {
          id: belgeId,
          muvId: muvId || '', // storage path için
          ad: form.ad,
          tur: 'diger', // ana tür — evrakTuru detayı verir
          tarih: form.tarih,
          etiketler: form.etiketler,
          // Dosya bağlantısı
          ...(dosyaTipi === 'dava' ? { davaId: dosyaId } : { icraId: dosyaId }),
          evrakTuru: form.evrakTuru,
          aciklama: form.aciklama,
        },
      });
      setModalAcik(false);
    } catch (err) {
      alert((err as Error).message || 'Yükleme başarısız');
    }
  };

  // Evrak indirme
  const handleIndir = async (belge: Belge) => {
    try {
      setIndiriliyor(belge.id);
      const url = await belgeIndir(belge.storagePath);
      window.open(url, '_blank');
    } catch {
      alert('İndirme başarısız');
    } finally {
      setIndiriliyor(null);
    }
  };

  // Evrak silme
  const handleSil = async (belge: Belge) => {
    try {
      await sil.mutateAsync({ id: belge.id, storagePath: belge.storagePath });
      setSilOnay(null);
    } catch {
      alert('Silme başarısız');
    }
  };

  // Evrak türü bilgisi al
  const evrakBilgi = (key: string) => {
    return evrakTurleri.find(t => t.key === key) || { key: 'diger', label: 'Diğer', icon: '📄' };
  };

  if (isLoading) {
    return <div className="text-center py-8 text-text-muted text-xs">Evraklar yükleniyor...</div>;
  }

  return (
    <div>
      {/* Üst Bar — Yükle Butonu + Filtre */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">
            {(belgeler || []).length} evrak
          </span>
        </div>
        <button
          onClick={() => setModalAcik(true)}
          className="text-xs px-3 py-1.5 rounded bg-gold text-bg font-bold hover:bg-gold/90 transition-colors"
        >
          + Evrak Yükle
        </button>
      </div>

      {/* Kategori Filtreleri */}
      {(belgeler || []).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          <button
            onClick={() => setFiltre('hepsi')}
            className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
              filtre === 'hepsi'
                ? 'bg-gold/15 text-gold border-gold/30 font-bold'
                : 'bg-surface2 text-text-muted border-border hover:border-gold/20'
            }`}
          >
            Tümü ({(belgeler || []).length})
          </button>
          {evrakTurleri
            .filter(t => kategoriSayilari[t.key])
            .map(t => (
              <button
                key={t.key}
                onClick={() => setFiltre(t.key)}
                className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                  filtre === t.key
                    ? 'bg-gold/15 text-gold border-gold/30 font-bold'
                    : 'bg-surface2 text-text-muted border-border hover:border-gold/20'
                }`}
              >
                {t.icon} {t.label} ({kategoriSayilari[t.key]})
              </button>
            ))}
        </div>
      )}

      {/* Evrak Listesi */}
      {filtreliBelgeler.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-3xl mb-2">{dosyaTipi === 'dava' ? '📋' : '📁'}</div>
          <div className="text-xs text-text-muted mb-3">
            {filtre === 'hepsi'
              ? `Henüz ${dosyaTipi === 'dava' ? 'dava' : 'icra'} evrakı yüklenmemiş`
              : `Bu kategoride evrak bulunamadı`}
          </div>
          <button
            onClick={() => setModalAcik(true)}
            className="text-xs text-gold hover:underline"
          >
            İlk evrakı yükle →
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtreliBelgeler.map((belge) => {
            const tur = evrakBilgi(belge.evrakTuru || 'diger');
            return (
              <div
                key={belge.id}
                className="group flex items-center gap-3 p-3 bg-surface2 rounded-lg hover:bg-surface2/80 transition-colors"
              >
                {/* İkon */}
                <span className="text-lg flex-shrink-0">{tur.icon}</span>

                {/* Bilgiler */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-text truncate">{belge.ad}</div>
                  <div className="flex items-center gap-2 text-[10px] text-text-muted mt-0.5">
                    <span className="px-1.5 py-0.5 rounded bg-surface text-text-dim border border-border/50">
                      {tur.label}
                    </span>
                    {belge.tarih && <span>{fmtTarih(belge.tarih)}</span>}
                    {belge.boyut > 0 && <span>{fmtBoyut(belge.boyut)}</span>}
                    {belge.dosyaAd && <span className="truncate max-w-[150px]">{belge.dosyaAd}</span>}
                  </div>
                  {/* Açıklama */}
                  {typeof (belge as Record<string, unknown>).aciklama === 'string' && (
                    <div className="text-[10px] text-text-dim mt-0.5 truncate">
                      {String((belge as Record<string, unknown>).aciklama)}
                    </div>
                  )}
                  {/* Etiketler */}
                  {belge.etiketler && belge.etiketler.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {belge.etiketler.map(e => (
                        <span key={e} className="text-[9px] px-1.5 py-0.5 bg-gold/10 text-gold rounded">
                          {e}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Aksiyonlar (hover'da görünür) */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleIndir(belge)}
                    disabled={indiriliyor === belge.id}
                    className="text-xs p-1.5 rounded hover:bg-surface transition-colors text-text-muted hover:text-gold"
                    title="İndir"
                  >
                    {indiriliyor === belge.id ? '⏳' : '⬇️'}
                  </button>
                  <button
                    onClick={() => setSilOnay(belge.id)}
                    className="text-xs p-1.5 rounded hover:bg-red-dim transition-colors text-text-muted hover:text-red"
                    title="Sil"
                  >
                    🗑
                  </button>
                </div>

                {/* Silme Onay */}
                {silOnay === belge.id && (
                  <div className="absolute right-2 flex items-center gap-2 bg-bg border border-red/30 rounded-lg px-3 py-2 shadow-lg z-10">
                    <span className="text-[11px] text-text">Silinsin mi?</span>
                    <button
                      onClick={() => handleSil(belge)}
                      className="text-[10px] px-2 py-0.5 bg-red text-white rounded font-bold"
                    >
                      Evet
                    </button>
                    <button
                      onClick={() => setSilOnay(null)}
                      className="text-[10px] px-2 py-0.5 bg-surface2 text-text-muted rounded"
                    >
                      İptal
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Yükleme Modal */}
      <DosyaBelgeModal
        open={modalAcik}
        onClose={() => setModalAcik(false)}
        onKaydet={handleYukle}
        dosyaTipi={dosyaTipi}
        yukleniyor={yukle.isPending}
      />
    </div>
  );
}
