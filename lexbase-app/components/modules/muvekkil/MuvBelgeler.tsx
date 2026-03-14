'use client';

import { useState, useMemo } from 'react';
import { useMuvBelgeler, useBelgeYukle, useBelgeSil, belgeIndir, fmtBoyut, useBelgeIstatistik, BELGE_TURLERI, MAX_BURO_BELGE_SAYI, MAX_BURO_TOPLAM_BOYUT, type BelgeTur, type Belge } from '@/lib/hooks/useBelgeler';
import { BelgeModal, type BelgeFormData } from '@/components/modules/BelgeModal';

interface Props {
  muvId: string;
}

const TUR_RENK: Record<string, string> = {
  vekaletname: 'text-gold bg-gold-dim border-gold/20',
  sozlesme: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  kimlik: 'text-green bg-green-dim border-green/20',
  sirkuler: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  makbuz: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  diger: 'text-text-muted bg-surface2 border-border',
};

const TUR_IKON: Record<string, string> = {
  vekaletname: '📜',
  sozlesme: '📄',
  kimlik: '🪪',
  sirkuler: '🏢',
  makbuz: '🧾',
  diger: '📎',
};

export function MuvBelgeler({ muvId }: Props) {
  const { data: belgeler, isLoading } = useMuvBelgeler(muvId);
  const yukleMutation = useBelgeYukle();
  const silMutation = useBelgeSil();
  const { data: istatistik } = useBelgeIstatistik();

  const limitDolu = istatistik ? istatistik.toplamSayi >= MAX_BURO_BELGE_SAYI || istatistik.toplamBoyut >= MAX_BURO_TOPLAM_BOYUT : false;

  const [modalOpen, setModalOpen] = useState(false);
  const [filtre, setFiltre] = useState<BelgeTur | 'tumu'>('tumu');

  const tumBelgeler = belgeler || [];

  /* ── Filtreleme ── */
  const filtreliBelgeler = useMemo(() => {
    if (filtre === 'tumu') return tumBelgeler;
    return tumBelgeler.filter(b => b.tur === filtre);
  }, [tumBelgeler, filtre]);

  /* ── Vekaletname süre hesaplama ── */
  const bugun = new Date().toISOString().slice(0, 10);

  const kalanGun = (bitis?: string) => {
    if (!bitis) return null;
    const diff = Math.ceil((new Date(bitis).getTime() - new Date(bugun).getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  /* ── Yükle handler ── */
  const handleYukle = async (formData: BelgeFormData, dosya: File) => {
    const belgeId = crypto.randomUUID();
    await yukleMutation.mutateAsync({
      dosya,
      belge: {
        id: belgeId,
        muvId,
        ad: formData.ad,
        tur: formData.tur,
        tarih: formData.tarih,
        etiketler: formData.etiketler,
        meta: formData.meta,
      },
    });
    setModalOpen(false);
  };

  /* ── İndir handler ── */
  const handleIndir = async (belge: Belge) => {
    try {
      const url = await belgeIndir(belge.storagePath);
      window.open(url, '_blank');
    } catch {
      alert('Dosya indirilemedi. Lütfen tekrar deneyin.');
    }
  };

  /* ── Sil handler ── */
  const handleSil = async (belge: Belge) => {
    if (!confirm(`"${belge.ad}" belgesini silmek istediğinize emin misiniz?`)) return;
    await silMutation.mutateAsync({ id: belge.id, storagePath: belge.storagePath });
  };

  /* ── Filtre sayıları ── */
  const turSayilari = useMemo(() => {
    const sayilar: Record<string, number> = { tumu: tumBelgeler.length };
    BELGE_TURLERI.forEach(t => {
      sayilar[t.key] = tumBelgeler.filter(b => b.tur === t.key).length;
    });
    return sayilar;
  }, [tumBelgeler]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-text-muted text-sm">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Başlık + Filtre + Yükle */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-1.5 overflow-x-auto">
          <FilterBtn
            label="Tümü"
            icon="📂"
            sayi={turSayilari['tumu']}
            aktif={filtre === 'tumu'}
            onClick={() => setFiltre('tumu')}
          />
          {BELGE_TURLERI.map(t => (
            <FilterBtn
              key={t.key}
              label={t.label}
              icon={t.icon}
              sayi={turSayilari[t.key] || 0}
              aktif={filtre === t.key}
              onClick={() => setFiltre(t.key)}
            />
          ))}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Kullanım istatistikleri */}
          {istatistik && (
            <div className="hidden sm:flex items-center gap-3 text-[10px] text-text-dim">
              <div className="flex items-center gap-1.5">
                <span>{istatistik.toplamSayi} / {MAX_BURO_BELGE_SAYI}</span>
                <div className="w-16 h-1.5 bg-surface2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      istatistik.toplamSayi / MAX_BURO_BELGE_SAYI > 0.9 ? 'bg-red' :
                      istatistik.toplamSayi / MAX_BURO_BELGE_SAYI > 0.7 ? 'bg-gold' : 'bg-green'
                    }`}
                    style={{ width: `${Math.min(100, (istatistik.toplamSayi / MAX_BURO_BELGE_SAYI) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span>{fmtBoyut(istatistik.toplamBoyut)} / 1 GB</span>
                <div className="w-16 h-1.5 bg-surface2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      istatistik.toplamBoyut / MAX_BURO_TOPLAM_BOYUT > 0.9 ? 'bg-red' :
                      istatistik.toplamBoyut / MAX_BURO_TOPLAM_BOYUT > 0.7 ? 'bg-gold' : 'bg-green'
                    }`}
                    style={{ width: `${Math.min(100, (istatistik.toplamBoyut / MAX_BURO_TOPLAM_BOYUT) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => setModalOpen(true)}
            disabled={limitDolu}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
              limitDolu
                ? 'bg-surface2 text-text-dim cursor-not-allowed'
                : 'bg-gold text-bg hover:bg-gold-light'
            }`}
            title={limitDolu ? 'Depolama limiti dolmuştur' : undefined}
          >
            + Belge Yükle
          </button>
        </div>
      </div>

      {/* Belge Modal */}
      <BelgeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onKaydet={handleYukle}
        yukleniyor={yukleMutation.isPending}
      />

      {/* Belge Listesi */}
      {tumBelgeler.length === 0 ? (
        <div className="text-center py-14 text-text-muted bg-surface border border-border rounded-lg">
          <div className="text-4xl mb-3">📎</div>
          <div className="text-sm font-medium mb-1">Henüz belge yüklenmemiş</div>
          <div className="text-xs text-text-dim mb-4">Vekaletname, sözleşme, kimlik ve diğer belgeleri yükleyin</div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-1.5 text-xs font-medium text-gold border border-gold/30 rounded-lg hover:bg-gold-dim transition-colors"
          >
            + İlk Belgeyi Yükle
          </button>
        </div>
      ) : filtreliBelgeler.length === 0 ? (
        <div className="text-center py-8 text-text-dim text-xs bg-surface border border-border rounded-lg">
          Bu kategoride belge bulunamadı
        </div>
      ) : (
        <div className="space-y-2">
          {/* Vekaletnameleri süreye göre sırala */}
          {filtreliBelgeler
            .sort((a, b) => {
              // Vekaletnameler önce, süre azalan
              if (a.tur === 'vekaletname' && b.tur !== 'vekaletname') return -1;
              if (a.tur !== 'vekaletname' && b.tur === 'vekaletname') return 1;
              return (b.tarih || '').localeCompare(a.tarih || '');
            })
            .map(belge => {
              const kalan = belge.tur === 'vekaletname' ? kalanGun(belge.meta?.bitis) : null;
              const turLabel = BELGE_TURLERI.find(t => t.key === belge.tur);

              return (
                <div
                  key={belge.id}
                  className="bg-surface border border-border rounded-lg p-4 hover:border-gold/40 transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* İkon */}
                      <div className="text-2xl shrink-0">{TUR_IKON[belge.tur] || '📎'}</div>

                      <div className="flex-1 min-w-0">
                        {/* Ad + Tür Badge */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-text truncate">{belge.ad}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${TUR_RENK[belge.tur] || TUR_RENK.diger}`}>
                            {turLabel?.label || belge.tur}
                          </span>
                          {/* Vekaletname süre badge */}
                          {kalan !== null && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                              kalan <= 0 ? 'text-red bg-red-dim border-red/20' :
                              kalan <= 3 ? 'text-red bg-red-dim border-red/20' :
                              kalan <= 15 ? 'text-gold bg-gold-dim border-gold/20' :
                              'text-green bg-green-dim border-green/20'
                            }`}>
                              {kalan <= 0 ? 'SÜRESİ DOLMUŞ' : `${kalan} Gün Kaldı`}
                            </span>
                          )}
                        </div>

                        {/* Alt bilgiler */}
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-text-muted">
                          <span>{belge.tarih}</span>
                          <span>{belge.dosyaAd}</span>
                          <span>{fmtBoyut(belge.boyut)}</span>
                        </div>

                        {/* Vekaletname meta */}
                        {belge.tur === 'vekaletname' && belge.meta && (
                          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-text-dim">
                            {belge.meta.noter && <span>Noter: {belge.meta.noter}</span>}
                            {belge.meta.yevmiye && <span>Yevmiye: {belge.meta.yevmiye}</span>}
                            {belge.meta.vekil && <span>Vekil: {belge.meta.vekil}</span>}
                            {belge.meta.ozel && <span className="text-gold font-semibold">Özel Yetkili</span>}
                          </div>
                        )}

                        {/* Etiketler */}
                        {belge.etiketler && belge.etiketler.length > 0 && (
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            {belge.etiketler.map(e => (
                              <span key={e} className="text-[9px] px-1.5 py-0.5 bg-surface2 text-text-dim rounded">
                                {e}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Aksiyonlar */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => handleIndir(belge)}
                        className="p-1.5 text-xs text-text-muted hover:text-gold transition-colors"
                        title="İndir / Önizle"
                      >
                        ⬇️
                      </button>
                      <button
                        onClick={() => handleSil(belge)}
                        className="p-1.5 text-xs text-text-muted hover:text-red transition-colors"
                        title="Sil"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

/* ── Filtre Butonu ── */
function FilterBtn({ label, icon, sayi, aktif, onClick }: {
  label: string;
  icon: string;
  sayi: number;
  aktif: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap ${
        aktif
          ? 'bg-gold text-bg border-gold'
          : 'bg-surface border-border text-text-muted hover:border-gold/40 hover:text-text'
      }`}
    >
      {icon} {label} ({sayi})
    </button>
  );
}
