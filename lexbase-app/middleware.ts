import { type NextRequest, NextResponse } from 'next/server';

/**
 * Minimal middleware — Cloudflare Workers free plan uyumlu
 *
 * NOT: Ağır Supabase server client + getUser() çağrısı kaldırıldı.
 * Auth koruması tamamen client-side AuthGuard ile yapılıyor.
 * Bu middleware sadece auth callback için cookie ayarlaması yapar.
 *
 * Workers free plan CPU limiti: 10ms — her istekte
 * Supabase getUser() tek başına bu limiti aşıyordu.
 */
export async function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Sadece auth callback route'una müdahale et, diğer her şeyi geç
    '/auth/callback',
  ],
};
