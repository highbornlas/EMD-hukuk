'use client';

import { useState, useEffect } from 'react';
import { SectionTitle, Toggle, Separator, StatusMessage, SaveButton } from './shared';

/* ══════════════════════════════════════════════════════════════
   Görünüm Tab — Tema, font boyutu, kompakt mod, sidebar tercihleri
   ══════════════════════════════════════════════════════════════ */

interface GorunumTercihleri {
  fontBoyutu: 'kucuk' | 'normal' | 'buyuk';
  kompaktMod: boolean;
  sidebarDaralt: boolean;
  tabloSatirCizgisi: boolean;
  animasyonlar: boolean;
}

const VARSAYILAN: GorunumTercihleri = {
  fontBoyutu: 'normal',
  kompaktMod: false,
  sidebarDaralt: false,
  tabloSatirCizgisi: true,
  animasyonlar: true,
};

const LS_GORUNUM_KEY = 'lb_gorunum_tercihleri';

const TEMALAR = [
  { key: 'koyu', label: 'Koyu', icon: '🌙', desc: 'Klasik karanlık tema' },
  { key: 'acik', label: 'Açık', icon: '☀️', desc: 'Parlak, aydınlık tema' },
  { key: 'sistem', label: 'Sistem', icon: '💻', desc: 'İşletim sistemi ayarını takip et' },
  { key: 'gece-mavisi', label: 'Gece Mavisi', icon: '🌊', desc: 'Koyu mavi tonlarında' },
  { key: 'orman', label: 'Orman', icon: '🌲', desc: 'Doğal yeşil tonları' },
  { key: 'bordo', label: 'Bordo', icon: '🍷', desc: 'Zarif bordo ve koyu tonlar' },
  { key: 'gri-tas', label: 'Gri Taş', icon: '🪨', desc: 'Nötr gri tonları' },
  { key: 'lacivert', label: 'Lacivert', icon: '⚓', desc: 'Profesyonel lacivert tema' },
];

const FONT_SECENEKLERI = [
  { key: 'kucuk' as const, label: 'Küçük', desc: 'Daha fazla içerik, %90 boyut', size: '90%' },
  { key: 'normal' as const, label: 'Normal', desc: 'Standart metin boyutu', size: '100%' },
  { key: 'buyuk' as const, label: 'Büyük', desc: 'Daha rahat okuma, %110 boyut', size: '110%' },
];

// Tema CSS değişkenlerini uygula
function temaUygula(temaKey: string) {
  const root = document.documentElement;

  // Önce tüm tema attribute'larını temizle
  root.removeAttribute('data-theme');

  if (temaKey === 'sistem') {
    const karanlık = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (!karanlık) root.setAttribute('data-theme', 'light');
    return;
  }

  if (temaKey === 'acik') {
    root.setAttribute('data-theme', 'light');
    return;
  }

  if (temaKey === 'koyu') {
    // Varsayılan :root zaten koyu tema
    return;
  }

  // Özel temalar — data-theme attribute ile
  root.setAttribute('data-theme', temaKey);
}

// Görünüm tercihlerini DOM'a uygula
function tercihleriUygula(tercihler: GorunumTercihleri) {
  const root = document.documentElement;

  // Font boyutu
  const fontMap: Record<string, string> = { kucuk: '90%', normal: '100%', buyuk: '110%' };
  root.style.fontSize = fontMap[tercihler.fontBoyutu] || '100%';

  // Kompakt mod
  root.classList.toggle('compact-mode', tercihler.kompaktMod);

  // Animasyonlar
  root.classList.toggle('no-animations', !tercihler.animasyonlar);
}

export function GorunumTab() {
  const [tema, setTema] = useState('koyu');
  const [tercihler, setTercihler] = useState<GorunumTercihleri>(VARSAYILAN);
  const [mesaj, setMesaj] = useState('');

  useEffect(() => {
    const kayitliTema = localStorage.getItem('hukuk_tema') || 'koyu';
    setTema(kayitliTema);
    temaUygula(kayitliTema);

    try {
      const kayitli = localStorage.getItem(LS_GORUNUM_KEY);
      if (kayitli) {
        const parsed = { ...VARSAYILAN, ...JSON.parse(kayitli) };
        setTercihler(parsed);
        tercihleriUygula(parsed);
      }
    } catch {
      // varsayılan kullan
    }

    // Sistem teması değişince otomatik güncelle
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (localStorage.getItem('hukuk_tema') === 'sistem') {
        temaUygula('sistem');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  function temaSecim(yeni: string) {
    setTema(yeni);
    localStorage.setItem('hukuk_tema', yeni);
    temaUygula(yeni);
  }

  function guncelle<K extends keyof GorunumTercihleri>(key: K, val: GorunumTercihleri[K]) {
    setTercihler((prev) => {
      const yeni = { ...prev, [key]: val };
      // Hemen uygula
      tercihleriUygula(yeni);
      return yeni;
    });
  }

  function kaydet() {
    try {
      localStorage.setItem(LS_GORUNUM_KEY, JSON.stringify(tercihler));
      tercihleriUygula(tercihler);
      setMesaj('Görünüm tercihleri kaydedildi.');
    } catch {
      setMesaj('Tercihler kaydedilemedi.');
    }
  }

  return (
    <div>
      {/* Tema */}
      <SectionTitle sub="Uygulamanın renk şemasını seçin">Tema</SectionTitle>

      <div className="grid grid-cols-4 gap-3 max-w-2xl mb-6">
        {TEMALAR.map((t) => (
          <button
            key={t.key}
            onClick={() => temaSecim(t.key)}
            className={`p-3 rounded-lg border-2 text-center transition-all ${
              tema === t.key
                ? 'border-gold bg-gold-dim'
                : 'border-border bg-surface2 hover:border-gold/30'
            }`}
          >
            <div className="text-2xl mb-1.5">{t.icon}</div>
            <div className="text-xs font-semibold text-text">{t.label}</div>
            <div className="text-[9px] text-text-muted mt-0.5 leading-tight">{t.desc}</div>
          </button>
        ))}
      </div>

      <Separator />

      {/* Font Boyutu */}
      <SectionTitle sub="Uygulama genelindeki metin boyutunu ayarlayın">Font Boyutu</SectionTitle>

      <div className="grid grid-cols-3 gap-3 max-w-lg mb-6">
        {FONT_SECENEKLERI.map((f) => (
          <button
            key={f.key}
            onClick={() => guncelle('fontBoyutu', f.key)}
            className={`p-3 rounded-lg border-2 text-center transition-all ${
              tercihler.fontBoyutu === f.key
                ? 'border-gold bg-gold-dim'
                : 'border-border bg-surface2 hover:border-gold/30'
            }`}
          >
            <div className="font-semibold text-text" style={{ fontSize: f.size }}>Aa</div>
            <div className="text-xs font-medium text-text mt-1">{f.label}</div>
            <div className="text-[10px] text-text-muted mt-0.5">{f.desc}</div>
          </button>
        ))}
      </div>

      <Separator />

      {/* Görünüm Tercihleri */}
      <SectionTitle sub="Arayüz davranışını kişiselleştirin">Görünüm Tercihleri</SectionTitle>

      <div className="max-w-lg space-y-1">
        <Toggle
          checked={tercihler.kompaktMod}
          onChange={(v) => guncelle('kompaktMod', v)}
          label="Kompakt Mod"
          description="Daha az boşluk, daha fazla içerik görüntülenir"
        />
        <Toggle
          checked={tercihler.sidebarDaralt}
          onChange={(v) => guncelle('sidebarDaralt', v)}
          label="Sidebar varsayılan dar"
          description="Sidebar başlangıçta daraltılmış olarak açılır"
        />
        <Toggle
          checked={tercihler.tabloSatirCizgisi}
          onChange={(v) => guncelle('tabloSatirCizgisi', v)}
          label="Tablo satır çizgileri"
          description="Tablo satırları arasında ayırıcı çizgi göster"
        />
        <Toggle
          checked={tercihler.animasyonlar}
          onChange={(v) => guncelle('animasyonlar', v)}
          label="Animasyonlar"
          description="Geçiş animasyonları ve hover efektleri"
        />
      </div>

      <Separator />

      <StatusMessage mesaj={mesaj} />
      <div className="mt-3">
        <SaveButton onClick={kaydet} label="Tercihleri Kaydet" />
      </div>
    </div>
  );
}
