import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Sadece sayfa rotalarında çalış:
     * - /dashboard, /davalar, /icra, /muvekkillar vb. (korumalı)
     * - /giris, /kayit (giriş yapmışları yönlendir)
     * Hariç tutulan:
     * - _next/static, _next/image (statik dosyalar)
     * - /api/* (kendi auth kontrolü var)
     * - favicon.ico, sitemap.xml, robots.txt
     * - Public assets (images, svg, etc.)
     */
    '/((?!_next/static|_next/image|api/|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css)$).*)',
  ],
};
