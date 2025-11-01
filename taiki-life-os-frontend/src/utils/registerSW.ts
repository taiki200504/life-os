// Service Worker登録ユーティリティ

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      
      console.log('Service Worker registered successfully:', registration);
      
      // 更新チェック
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 新しいバージョンが利用可能
              console.log('New version available! Please refresh.');
              // 必要に応じてユーザーに通知
            }
          });
        }
      });
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  } else {
    console.log('Service Worker is not supported in this browser.');
    return null;
  }
}

// Service Worker更新チェック
export async function checkForUpdates(registration: ServiceWorkerRegistration): Promise<void> {
  try {
    await registration.update();
    console.log('Checked for Service Worker updates');
  } catch (error) {
    console.error('Failed to check for updates:', error);
  }
}

// Service Worker登録解除（デバッグ用）
export async function unregisterServiceWorker(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const success = await registration.unregister();
      console.log('Service Worker unregistered:', success);
      return success;
    }
  }
  return false;
}
