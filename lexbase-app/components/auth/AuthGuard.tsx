'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

/**
 * AuthGuard — Client-side auth koruması
 *
 * Middleware static export'ta çalışmadığı için (Capacitor mobil build),
 * auth korumasını client-side'da yapıyoruz.
 *
 * Web build'de middleware zaten koruma sağlar, bu component ek güvenlik katmanı olur.
 * Mobil build'de tek koruma katmanı olarak çalışır.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = yükleniyor

  useEffect(() => {
    const supabase = createClient();

    // Mevcut oturumu kontrol et
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        router.replace(`/giris?redirect=${encodeURIComponent(pathname)}`);
      }
    };

    checkUser();

    // Auth değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session?.user) {
          setUser(null);
          router.replace('/giris');
        } else {
          setUser(session.user);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  // Yükleniyor
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-sm text-text-muted">Oturum kontrol ediliyor...</div>
        </div>
      </div>
    );
  }

  // Giriş yapmamış
  if (!user) {
    return null;
  }

  // Giriş yapmış → içeriği göster
  return <>{children}</>;
}
