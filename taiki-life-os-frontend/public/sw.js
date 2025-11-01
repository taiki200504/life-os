// Service Worker for Taiki Life OS PWA
const CACHE_NAME = 'taiki-life-os-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/icons/AppIcon_1024_black.png',
  '/icons/AppIcon_1024_white.png',
];

// インストールイベント
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// アクティベーションイベント
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// フェッチイベント（stale-while-revalidate戦略）
self.addEventListener('fetch', (event) => {
  // HTTP/HTTPSリクエストのみを処理（chrome-extensionなどは除外）
  const url = new URL(event.request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return; // スキップ
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // APIリクエストはキャッシュしない
        if (event.request.url.includes('/api/')) {
          return networkResponse;
        }
        
        // 成功したHTTP/HTTPSレスポンスのみをキャッシュに保存
        if (networkResponse && networkResponse.status === 200 && 
            (url.protocol === 'http:' || url.protocol === 'https:')) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch((err) => {
              // キャッシュエラーは無視（chrome-extensionなど）
              console.warn('Cache put failed:', err);
            });
          });
        }
        return networkResponse;
      }).catch(() => {
        // ネットワークエラー時はキャッシュを返す
        return cachedResponse;
      });

      // キャッシュがあれば即座に返し、バックグラウンドで更新
      return cachedResponse || fetchPromise;
    })
  );
});
// Background Sync（オフライン時のデータ同期）
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  console.log('Background sync triggered');
  
  try {
    // IndexedDBから未同期のデータを取得
    const db = await openIndexedDB();
    const syncQueue = await getSyncQueue(db);
    
    // 各アイテムを同期
    for (const item of syncQueue) {
      try {
        await syncItem(item);
        await markAsSynced(db, item.id);
      } catch (error) {
        console.error('Failed to sync item:', error);
      }
    }
    
    console.log('Background sync completed');
  } catch (error) {
    console.error('Background sync failed:', error);
    throw error; // 再試行のために例外を投げる
  }
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TaikiLifeOSDB', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getSyncQueue(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readonly');
    const store = transaction.objectStore('syncQueue');
    const request = store.index('synced').getAll(false);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function syncItem(item) {
  const apiUrl = self.registration.scope + 'api';
  let endpoint = '';
  let method = 'POST';
  
  switch (item.type) {
    case 'task':
      endpoint = item.action === 'create' ? '/tasks' : `/tasks/${item.data.id}`;
      method = item.action === 'delete' ? 'DELETE' : item.action === 'update' ? 'PUT' : 'POST';
      break;
    case 'session':
      endpoint = item.action === 'create' ? '/sessions/start' : `/sessions/${item.data.id}/stop`;
      method = 'POST';
      break;
    case 'review':
      endpoint = '/reviews';
      method = 'POST';
      break;
  }
  
  const response = await fetch(apiUrl + endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item.data),
  });
  
  if (!response.ok) {
    throw new Error(`Sync failed: ${response.status}`);
  }
}

function markAsSynced(db, itemId) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    const request = store.get(itemId);
    
    request.onsuccess = () => {
      const item = request.result;
      item.synced = true;
      const updateRequest = store.put(item);
      updateRequest.onsuccess = () => resolve();
      updateRequest.onerror = () => reject(updateRequest.error);
    };
    
    request.onerror = () => reject(request.error);
  });
}

// Push通知イベント
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icons/AppIcon_1024_black.png',
    badge: '/icons/AppIcon_1024_black.png',
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification('Taiki Life OS', options)
  );
});

// 通知クリックイベント
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
