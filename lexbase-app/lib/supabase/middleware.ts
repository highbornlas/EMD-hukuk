import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // API route'ları ve statik dosyalar için auth kontrolü gereksiz — hızlıca geç
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
    return NextResponse.next({ request });
  }

  // Sadece sayfa navigasyonlarında auth kontrolü yap
  const korumalıRotalar = ['/dashboard', '/muvekkillar', '/davalar', '/icra', '/finans', '/takvim', '/gorevler', '/ayarlar', '/personel', '/danismanlik', '/arabuluculuk', '/ihtarname', '/evrak', '/destek'];
  const korunmali = korumalıRotalar.some(r => pathname.startsWith(r));
  const girisRotasi = pathname === '/giris' || pathname === '/kayit';

  // Korumalı rota veya giriş sayfası değilse (landing, legal sayfalar vb.) — hızlıca geç
  if (!korunmali && !girisRotasi) {
    return NextResponse.next({ request });
  }

  // Sadece korumalı veya giriş rotalarında session kontrolü yap
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Session kontrolü — getSession cookie'den okur, network call yapmaz (Workers uyumlu)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Korumalı rota + giriş yapmamış → login'e yönlendir
  if (korunmali && !session) {
    const url = request.nextUrl.clone();
    url.pathname = '/giris';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Zaten giriş yapmış kullanıcı login/kayıt sayfasına gitmeye çalışırsa
  if (session && girisRotasi) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
