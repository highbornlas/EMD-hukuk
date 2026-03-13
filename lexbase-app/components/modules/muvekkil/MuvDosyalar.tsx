'use client';

interface Props {
  davalar: Record<string, unknown>[];
  icralar: Record<string, unknown>[];
}

export function MuvDosyalar({ davalar, icralar }: Props) {
  const durumRenk: Record<string, string> = {
    'Aktif': 'text-green bg-green-dim border-green/20',
    'derdest': 'text-green bg-green-dim border-green/20',
    'Kapandı': 'text-text-dim bg-surface2 border-border',
    'kapandi': 'text-text-dim bg-surface2 border-border',
    'Kazanıldı': 'text-green bg-green-dim border-green/20',
    'Kaybedildi': 'text-red bg-red-dim border-red/20',
  };

  return (
    <div className="space-y-6">
      {/* Davalar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text">⚖️ Davalar ({davalar.length})</h3>
        </div>

        {davalar.length === 0 ? (
          <EmptyState icon="⚖️" message="Henüz dava kaydı yok" />
        ) : (
          <div className="space-y-2">
            {davalar.map((d) => (
              <DosyaCard
                key={d.id as string}
                no={d.no as string}
                konu={d.konu as string}
                mahkeme={d.mahkeme as string}
                durum={d.durum as string}
                tarih={d.tarih as string}
                durumRenk={durumRenk}
              />
            ))}
          </div>
        )}
      </div>

      {/* İcra */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text">📋 İcra Dosyaları ({icralar.length})</h3>
        </div>

        {icralar.length === 0 ? (
          <EmptyState icon="📋" message="Henüz icra kaydı yok" />
        ) : (
          <div className="space-y-2">
            {icralar.map((i) => (
              <DosyaCard
                key={i.id as string}
                no={i.no as string}
                konu={(i.borclu as string) || (i.konu as string)}
                mahkeme={i.daire as string}
                durum={i.durum as string}
                tarih={i.tarih as string}
                durumRenk={durumRenk}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DosyaCard({
  no,
  konu,
  mahkeme,
  durum,
  tarih,
  durumRenk,
}: {
  no: string;
  konu: string;
  mahkeme: string;
  durum: string;
  tarih: string;
  durumRenk: Record<string, string>;
}) {
  const renkClass = durumRenk[durum] || 'text-text-muted bg-surface2 border-border';

  return (
    <div className="bg-surface border border-border rounded-lg p-4 hover:border-gold hover:bg-gold-dim transition-all cursor-pointer">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-bold text-gold">{no || '—'}</div>
          <div className="text-xs text-text mt-1">{konu || '—'}</div>
          <div className="text-[11px] text-text-muted mt-1">{mahkeme || ''}</div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${renkClass}`}>
            {durum || 'Belirsiz'}
          </span>
          <span className="text-[10px] text-text-dim">{tarih || ''}</span>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="text-center py-8 text-text-muted bg-surface border border-border rounded-lg">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-xs">{message}</div>
    </div>
  );
}
