'use client';

import { useEffect } from 'react';
import { initCapacitor } from '@/lib/capacitor';

/**
 * Capacitor native platform kurulumu.
 * Web'de çalışırken hiçbir şey yapmaz.
 * Mobilde status bar, keyboard, back button ve splash screen ayarları yapılır.
 */
export function CapacitorInit() {
  useEffect(() => {
    initCapacitor();
  }, []);

  return null;
}
