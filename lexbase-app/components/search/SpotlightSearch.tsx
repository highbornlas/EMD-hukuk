'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSpotlightSearch, type AramaSonuc } from '@/lib/hooks/useSpotlightSearch';

/* ══════════════════════════════════════════════════════════════
   Spotlight Search — Cmd+K / Ctrl+K ile açılan global arama
   ══════════════════════════════════════════════════════════════ */

const LS_KEY = 'lb_son_aramalar';
const MAX_SON_ARAMA = 5;

function getSonAramalar(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch {
    return [];
  }
}

function kaydetSonArama(q: string) {
  if (!q.trim()) return;
  const mevcut = getSonAramalar().filter((a) => a !== q);
  const yeni = [q, ...mevcut].slice(0, MAX_SON_ARAMA);
  try { localStorage.setItem(LS_KEY, JSON.stringify(yeni)); } catch { /* */ }
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SpotlightSearch({ open, onClose }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [aktifIndex, setAktifIndex] = useState(0);
  const [sonAramalar, setSonAramalar] = useState<string[]>([]);

  const { kategoriler, toplamSonuc } = useSpotlightSearch(debouncedQuery);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setDebouncedQuery('');
      setAktifIndex(0);
      setSonAramalar(getSonAramalar());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // Flatten results for keyboard nav
  const tumSonuclar: AramaSonuc[] = kategoriler.flatMap((k) => k.sonuclar);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setAktifIndex((prev) => (prev + 1) % Math.max(tumSonuclar.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setAktifIndex((prev) => (prev - 1 + tumSonuclar.length) % Math.max(tumSonuclar.length, 1));
    } else if (e.key === 'Enter' && tumSonuclar[aktifIndex]) {
      e.preventDefault();
      const sonuc = tumSonuclar[aktifIndex];
      kaydetSonArama(query);
      router.push(sonuc.href);
      onClose();
    }
  }, [tumSonuclar, aktifIndex, query, router, onClose]);

  const handleSonucClick = useCallback((sonuc: AramaSonuc) => {
    kaydetSonArama(query);
    router.push(sonuc.href);
    onClose();
  }, [query, router, onClose]);

  if (!open) return null;

  let globalIdx = -1;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg mx-4 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
        {/* ── Search Input ── */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <span className="text-text-dim text-lg">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setAktifIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Müvekkil, dava, icra, avukat ara..."
            className="flex-1 bg-transparent text-text text-sm outline-none placeholder:text-text-dim"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="px-1.5 py-0.5 rounded border border-border bg-bg text-[10px] text-text-dim font-mono">
            ESC
          </kbd>
        </div>

        {/* ── Results ── */}
        <div className="max-h-[50vh] overflow-y-auto">
          {/* Son Aramalar (query boşken) */}
          {!debouncedQuery && sonAramalar.length > 0 && (
            <div className="px-4 py-3">
              <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-2">Son Aramalar</div>
              <div className="space-y-1">
                {sonAramalar.map((a) => (
                  <button
                    key={a}
                    onClick={() => { setQuery(a); setDebouncedQuery(a); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs text-text-muted hover:bg-surface2 hover:text-text transition-colors"
                  >
                    <span className="text-text-dim">🕐</span>
                    {a}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Boş query */}
          {!debouncedQuery && sonAramalar.length === 0 && (
            <div className="px-4 py-8 text-center text-text-dim text-sm">
              Aramaya başlayın...
            </div>
          )}

          {/* Sonuç yok */}
          {debouncedQuery && toplamSonuc === 0 && (
            <div className="px-4 py-8 text-center">
              <div className="text-2xl mb-2">🔍</div>
              <p className="text-sm text-text-dim">
                &ldquo;{debouncedQuery}&rdquo; için sonuç bulunamadı
              </p>
            </div>
          )}

          {/* Kategorize sonuçlar */}
          {kategoriler.map((kategori) => (
            <div key={kategori.baslik} className="py-2">
              <div className="px-4 py-1">
                <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider">
                  {kategori.ikon} {kategori.baslik}
                </span>
              </div>
              {kategori.sonuclar.map((sonuc) => {
                globalIdx++;
                const isActive = globalIdx === aktifIndex;
                const idx = globalIdx;
                return (
                  <button
                    key={sonuc.id}
                    onClick={() => handleSonucClick(sonuc)}
                    onMouseEnter={() => setAktifIndex(idx)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      isActive ? 'bg-gold-dim text-text' : 'text-text-muted hover:bg-surface2'
                    }`}
                  >
                    <span className="text-base flex-shrink-0">{sonuc.ikon}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm truncate ${isActive ? 'font-semibold text-gold' : 'text-text'}`}>
                        {sonuc.baslik}
                      </div>
                      {sonuc.altBilgi && (
                        <div className="text-[11px] text-text-dim truncate">{sonuc.altBilgi}</div>
                      )}
                    </div>
                    {isActive && (
                      <span className="text-[10px] text-text-dim">Enter ↵</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* ── Footer ── */}
        {toplamSonuc > 0 && (
          <div className="px-4 py-2 border-t border-border/50 flex items-center justify-between text-[10px] text-text-dim">
            <span>{toplamSonuc} sonuç</span>
            <div className="flex items-center gap-2">
              <span>↑↓ gezin</span>
              <span>↵ aç</span>
              <span>esc kapat</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
