'use client';

import type { Muvekkil } from '@/lib/hooks/useMuvekkillar';

export function MuvKimlik({ muv }: { muv: Muvekkil }) {
  const isGercek = muv.tip !== 'tuzel';

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Kimlik Bilgileri */}
      <div className="bg-surface border border-border rounded-lg p-5">
        <h3 className="text-sm font-semibold text-text mb-4 flex items-center gap-2">
          🪪 {isGercek ? 'Kişisel Bilgiler' : 'Kurum Bilgileri'}
        </h3>
        <div className="space-y-3">
          {isGercek ? (
            <>
              <InfoRow label="Ad Soyad" value={muv.ad} />
              <InfoRow label="TC Kimlik No" value={muv.tc} />
              <InfoRow label="Doğum Tarihi" value={muv.dogum} />
              <InfoRow label="Doğum Yeri" value={muv.dogumYeri} />
              <InfoRow label="Uyruk" value={muv.uyruk || 'T.C.'} />
              <InfoRow label="Meslek" value={muv.meslek} />
              <InfoRow label="Pasaport No" value={muv.pasaport} />
            </>
          ) : (
            <>
              <InfoRow label="Unvan" value={muv.ad} />
              <InfoRow label="Şirket Türü" value={muv.sirketTur} />
              <InfoRow label="Vergi No" value={muv.vergiNo} />
              <InfoRow label="Vergi Dairesi" value={muv.vergiDairesi} />
              <InfoRow label="MERSİS No" value={muv.mersis} />
              <InfoRow label="Ticaret Sicil" value={muv.ticaretSicil} />
              <InfoRow label="Yetkili" value={muv.yetkiliAd} />
              <InfoRow label="Yetkili TC" value={muv.yetkiliTc} />
            </>
          )}
        </div>
      </div>

      {/* İletişim Bilgileri */}
      <div className="bg-surface border border-border rounded-lg p-5">
        <h3 className="text-sm font-semibold text-text mb-4 flex items-center gap-2">
          📞 İletişim Bilgileri
        </h3>
        <div className="space-y-3">
          <InfoRow label="Telefon" value={muv.tel} />
          <InfoRow label="E-posta" value={muv.mail} />
          <InfoRow label="Faks" value={muv.faks} />
          <InfoRow label="Web" value={muv.web} />
          <InfoRow label="UETS" value={muv.uets} />
          {muv.adres && (
            <InfoRow
              label="Adres"
              value={[muv.adres.mahalle, muv.adres.sokak, muv.adres.sayi, muv.adres.ilce, muv.adres.il]
                .filter(Boolean)
                .join(', ')}
            />
          )}
        </div>

        {/* Banka Bilgileri */}
        {muv.bankalar && muv.bankalar.length > 0 && (
          <>
            <h3 className="text-sm font-semibold text-text mt-6 mb-4 flex items-center gap-2">
              🏦 Banka Hesapları
            </h3>
            <div className="space-y-3">
              {muv.bankalar.map((b, i) => (
                <div key={i} className="bg-surface2 rounded-lg p-3 border border-border/50">
                  <div className="text-xs font-semibold text-text mb-1">
                    {b.banka} {b.sube && `— ${b.sube}`}
                  </div>
                  {b.iban && (
                    <div className="text-[11px] text-text-muted font-mono tracking-wider">
                      {b.iban}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-[11px] text-text-dim">{label}</span>
      <span className="text-xs text-text font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
}
