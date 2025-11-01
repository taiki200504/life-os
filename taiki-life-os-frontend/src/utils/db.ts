import Dexie, { Table } from 'dexie';
import { Task, Session, DailyReview } from '../types';

// IndexedDBデータベースクラス
export class TaikiLifeOSDB extends Dexie {
  tasks!: Table<Task, string>;
  sessions!: Table<Session, string>;
  reviews!: Table<DailyReview, string>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super('TaikiLifeOSDB');
    
    this.version(1).stores({
      tasks: 'id, user_id, status, created_at, updated_at',
      sessions: 'id, user_id, start_at, end_at',
      reviews: 'id, user_id, date',
      syncQueue: '++id, type, timestamp, synced',
    });
  }
}

export interface SyncQueueItem {
  id?: number;
  type: 'task' | 'session' | 'review';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  synced: boolean;
}

// データベースインスタンスをエクスポート
export const db = new TaikiLifeOSDB();

// オフライン状態の検出
export function isOnline(): boolean {
  return navigator.onLine;
}

// 同期キューにアイテムを追加
export async function addToSyncQueue(
  type: SyncQueueItem['type'],
  action: SyncQueueItem['action'],
  data: any
): Promise<void> {
  await db.syncQueue.add({
    type,
    action,
    data,
    timestamp: Date.now(),
    synced: false,
  });
}

// 同期キューを処理
export async function processSyncQueue(): Promise<void> {
  if (!isOnline()) {
    console.log('Offline: sync queue will be processed when online');
    return;
  }

  const items = await db.syncQueue.where('synced').equals(false).toArray();
  
  for (const item of items) {
    try {
      // ここで実際のAPI呼び出しを行う
      // 成功したらsyncedをtrueに更新
      await db.syncQueue.update(item.id!, { synced: true });
      console.log(`Synced ${item.type} ${item.action}:`, item.data);
    } catch (error) {
      console.error(`Failed to sync ${item.type} ${item.action}:`, error);
      // 失敗した場合はキューに残す
    }
  }
}

// オンライン復帰時に同期を実行
window.addEventListener('online', () => {
  console.log('Back online, processing sync queue...');
  processSyncQueue();
});

// 定期的に同期キューを処理（5分ごと）
setInterval(() => {
  if (isOnline()) {
    processSyncQueue();
  }
}, 5 * 60 * 1000);
