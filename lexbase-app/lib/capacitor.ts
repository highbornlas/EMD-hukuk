/**
 * Capacitor Platform Utilities
 *
 * Mobil (Capacitor) ve web ortamı arasında farkları yöneten yardımcı fonksiyonlar.
 * Tüm Capacitor import'ları dinamik — web'de çalışırken hata vermez.
 */

/** Uygulama Capacitor ortamında mı çalışıyor? */
export function isNative(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } })
    .Capacitor?.isNativePlatform?.();
}

/** Platform adı: 'ios' | 'android' | 'web' */
export function getPlatform(): 'ios' | 'android' | 'web' {
  if (typeof window === 'undefined') return 'web';
  const cap = (window as unknown as { Capacitor?: { getPlatform?: () => string } }).Capacitor;
  return (cap?.getPlatform?.() as 'ios' | 'android' | 'web') || 'web';
}

/** iOS safe area desteği için class */
export function getSafeAreaClass(): string {
  if (!isNative()) return '';
  const platform = getPlatform();
  if (platform === 'ios') return 'pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]';
  return '';
}

/** Status bar ayarları (mobilde) */
export async function setupStatusBar() {
  if (!isNative()) return;

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0D0D0D' });
  } catch {
    // Web'de çalışırken hata vermez
  }
}

/** Keyboard eventi dinle (mobilde input focus/blur) */
export async function setupKeyboard() {
  if (!isNative()) return;

  try {
    const { Keyboard } = await import('@capacitor/keyboard');
    Keyboard.addListener('keyboardWillShow', () => {
      document.body.classList.add('keyboard-open');
    });
    Keyboard.addListener('keyboardWillHide', () => {
      document.body.classList.remove('keyboard-open');
    });
  } catch {
    // Web'de çalışırken hata vermez
  }
}

/** Splash screen'i kapat */
export async function hideSplash() {
  if (!isNative()) return;

  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide();
  } catch {
    // Web'de çalışırken hata vermez
  }
}

/** Deep link handling (back button — Android) */
export async function setupBackButton() {
  if (!isNative() || getPlatform() !== 'android') return;

  try {
    const { App: CapApp } = await import('@capacitor/app');
    CapApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        CapApp.exitApp();
      }
    });
  } catch {
    // Web'de çalışırken hata vermez
  }
}

/** Tüm native kurulumları tek seferde çalıştır */
export async function initCapacitor() {
  if (!isNative()) return;

  await Promise.allSettled([
    setupStatusBar(),
    setupKeyboard(),
    setupBackButton(),
    hideSplash(),
  ]);
}
