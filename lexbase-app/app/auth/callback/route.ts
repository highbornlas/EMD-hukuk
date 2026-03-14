import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Auth Callback Route
 * Google OAuth, Magic Link ve Password Reset sonrası
 * Supabase'den dönen code'u session'a çevirir.
 *
 * Flow:
 * 1. Kullanıcı Google/Magic Link ile giriş yapar
 * 2. Supabase code ile bu URL'ye yönlendirir
 * 3. Bu route code'u session cookie'ye çevirir
 * 4. Kullanıcıyı hedef sayfaya yönlendirir
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Server Component'te cookie set edilemezse görmezden gel
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Başarılı — hedef sayfaya yönlendir
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Hata varsa ana sayfaya yönlendir
  return NextResponse.redirect(`${origin}/?auth_error=callback_failed`);
}
