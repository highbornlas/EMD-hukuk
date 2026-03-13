import { redirect } from 'next/navigation';

/* /kayit URL'sine doğrudan erişim → ana sayfaya yönlendir.
   Auth artık AuthModal ile modal tabanlı çalışıyor. */
export default function KayitPage() {
  redirect('/');
}
