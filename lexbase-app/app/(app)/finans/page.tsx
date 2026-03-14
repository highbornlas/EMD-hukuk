'use client';

import { useState } from 'react';
import { BakiyelerTab } from '@/components/modules/finans/BakiyelerTab';
import { GelirlerTab } from '@/components/modules/finans/GelirlerTab';
import { BuroGiderleriTab } from '@/components/modules/finans/BuroGiderleriTab';
import { KarZararTab } from '@/components/modules/finans/KarZararTab';
import { KarlilikTab } from '@/components/modules/finans/KarlilikTab';
import { BeklenenGelirTab } from '@/components/modules/finans/BeklenenGelirTab';
import { UyarilarTab } from '@/components/modules/finans/UyarilarTab';
import { VergiOzetTab } from '@/components/modules/finans/VergiOzetTab';

const TABS = [
  { key: 'bakiye', label: 'Bakiyeler', icon: '💳' },
  { key: 'gelir', label: 'Gelirler', icon: '💰' },
  { key: 'gider', label: 'Büro Giderleri', icon: '📊' },
  { key: 'karzarar', label: 'Kâr / Zarar', icon: '📈' },
  { key: 'vergi', label: 'Vergi Özeti', icon: '🧾' },
  { key: 'karlilik', label: 'Kârlılık', icon: '🎯' },
  { key: 'beklenen', label: 'Beklenen Gelir', icon: '📅' },
  { key: 'uyari', label: 'Uyarılar', icon: '⚠️' },
];

export default function FinansPage() {
  const [aktifTab, setAktifTab] = useState('bakiye');
  const [kzYil, setKzYil] = useState(new Date().getFullYear());
  const [kzAy, setKzAy] = useState(0);

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      <h1 className="font-[var(--font-playfair)] text-2xl text-text font-bold mb-6">
        Finans
      </h1>

      {/* Tab Navigasyonu */}
      <div className="flex border-b border-border mb-5 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setAktifTab(tab.key)}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              aktifTab === tab.key
                ? 'border-gold text-gold'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab İçerikleri */}
      {aktifTab === 'bakiye' && <BakiyelerTab />}
      {aktifTab === 'gelir' && <GelirlerTab />}
      {aktifTab === 'gider' && <BuroGiderleriTab />}
      {aktifTab === 'karzarar' && <KarZararTab yil={kzYil} setYil={setKzYil} ay={kzAy} setAy={setKzAy} />}
      {aktifTab === 'vergi' && <VergiOzetTab />}
      {aktifTab === 'karlilik' && <KarlilikTab />}
      {aktifTab === 'beklenen' && <BeklenenGelirTab />}
      {aktifTab === 'uyari' && <UyarilarTab />}
    </div>
  );
}
