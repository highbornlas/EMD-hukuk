import { redirect } from 'next/navigation';

/* /giris URL'sine doğrudan erişim → ana sayfaya yönlendir.
   Auth artık AuthModal ile modal tabanlı çalışıyor. */
export default function GirisPage() {
  redirect('/');
}
