import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Landing page ve public sayfalar — auth kontrolü gereksiz
  const pathname = request.nextUrl.pathname;
  if (
    pathname === '/' ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/')
  ) {
    return NextResponse.next();
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Korumalı app rotaları + giriş/kayıt sayfaları:
     * updateSession içinde detaylı kontrol yapılır
     */
    '/dashboard/:path*',
    '/davalar/:path*',
    '/icra/:path*',
    '/muvekkillar/:path*',
    '/finans/:path*',
    '/takvim/:path*',
    '/gorevler/:path*',
    '/personel/:path*',
    '/danismanlik/:path*',
    '/arabuluculuk/:path*',
    '/ihtarname/:path*',
    '/evrak/:path*',
    '/destek/:path*',
    '/ayarlar/:path*',
    '/giris',
    '/kayit',
    '/sifre-sifirla',
  ],
};
