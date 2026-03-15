'use client';

import { useYetki } from '@/lib/hooks/useRol';
import type { ReactNode } from 'react';

/* ══════════════════════════════════════════════════════════════
   YetkiKoruma — Yetkiye göre children göster/gizle
   ══════════════════════════════════════════════════════════════ */

interface Props {
  yetki: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function YetkiKoruma({ yetki, children, fallback = null }: Props) {
  const { yetkili, loading } = useYetki(yetki);

  if (loading) return null;
  if (!yetkili) return fallback;
  return children;
}
