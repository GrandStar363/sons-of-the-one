// IndexedDB utility for offline data storage
const DB_NAME = 'BibleStudyOfflineDB';
const DB_VERSION = 1;

// Store names
export const STORES = {
  BIBLE_TEXT: 'bibleText',
  BOOKMARKS: 'bookmarks',
  NOTES: 'notes',
  READING_PROGRESS: 'readingProgress',
  JOURNAL_ENTRIES: 'journalEntries',
  SYNC_QUEUE: 'syncQueue',
  CACHED_VERSES: 'cachedVerses',
} as const;

export interface BibleTextEntry {
  id: string; // book-chapter format
  book: string;
  chapter: number;
  verses: { number: number; text: string }[];
  version: string;
  cachedAt: number;
}

export interface BookmarkEntry {
  id: string;
  reference: string;
  book: string;
  chapter: number;
  verse?: number;
  note?: string;
  createdAt: number;
  synced: boolean;
}

export interface NoteEntry {
  id: string;
  reference: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  synced: boolean;
}

export interface ReadingProgressEntry {
  id: string;
  planId: string;
  day: number;
  completed: boolean;
  completedAt?: number;
  synced: boolean;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  mood?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
  synced: boolean;
}

export interface SyncQueueItem {
  id: string;
  store: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retries: number;
}

let dbInstance: IDBDatabase | null = null;

// Initialize the database
export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      console.log('IndexedDB opened successfully');
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      console.log('Upgrading IndexedDB...');

      // Bible text store
      if (!db.objectStoreNames.contains(STORES.BIBLE_TEXT)) {
        const bibleStore = db.createObjectStore(STORES.BIBLE_TEXT, { keyPath: 'id' });
        bibleStore.createIndex('book', 'book', { unique: false });
        bibleStore.createIndex('version', 'version', { unique: false });
      }

      // Bookmarks store
      if (!db.objectStoreNames.contains(STORES.BOOKMARKS)) {
        const bookmarkStore = db.createObjectStore(STORES.BOOKMARKS, { keyPath: 'id' });
        bookmarkStore.createIndex('reference', 'reference', { unique: false });
        bookmarkStore.createIndex('synced', 'synced', { unique: false });
      }

      // Notes store
      if (!db.objectStoreNames.contains(STORES.NOTES)) {
        const notesStore = db.createObjectStore(STORES.NOTES, { keyPath: 'id' });
        notesStore.createIndex('reference', 'reference', { unique: false });
        notesStore.createIndex('synced', 'synced', { unique: false });
      }

      // Reading progress store
      if (!db.objectStoreNames.contains(STORES.READING_PROGRESS)) {
        const progressStore = db.createObjectStore(STORES.READING_PROGRESS, { keyPath: 'id' });
        progressStore.createIndex('planId', 'planId', { unique: false });
        progressStore.createIndex('synced', 'synced', { unique: false });
      }

      // Journal entries store
      if (!db.objectStoreNames.contains(STORES.JOURNAL_ENTRIES)) {
        const journalStore = db.createObjectStore(STORES.JOURNAL_ENTRIES, { keyPath: 'id' });
        journalStore.createIndex('date', 'date', { unique: false });
        journalStore.createIndex('synced', 'synced', { unique: false });
      }

      // Sync queue store
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' });
        syncStore.createIndex('store', 'store', { unique: false });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Cached verses store
      if (!db.objectStoreNames.contains(STORES.CACHED_VERSES)) {
        const versesStore = db.createObjectStore(STORES.CACHED_VERSES, { keyPath: 'id' });
        versesStore.createIndex('reference', 'reference', { unique: false });
      }
    };
  });
}

// Generic add function
export async function addItem<T>(storeName: string, item: T): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Generic get function
export async function getItem<T>(storeName: string, id: string): Promise<T | undefined> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Generic get all function
export async function getAllItems<T>(storeName: string): Promise<T[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

// Generic delete function
export async function deleteItem(storeName: string, id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Get items by index
export async function getItemsByIndex<T>(
  storeName: string,
  indexName: string,
  value: IDBValidKey
): Promise<T[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

// Bible text specific functions
export async function cacheBibleText(
  book: string,
  chapter: number,
  verses: { number: number; text: string }[],
  version: string = 'kjv'
): Promise<void> {
  const entry: BibleTextEntry = {
    id: `${book}-${chapter}-${version}`,
    book,
    chapter,
    verses,
    version,
    cachedAt: Date.now(),
  };
  await addItem(STORES.BIBLE_TEXT, entry);
}

export async function getCachedBibleText(
  book: string,
  chapter: number,
  version: string = 'kjv'
): Promise<BibleTextEntry | undefined> {
  return getItem(STORES.BIBLE_TEXT, `${book}-${chapter}-${version}`);
}

// Bookmark functions
export async function saveBookmark(bookmark: Omit<BookmarkEntry, 'id' | 'createdAt' | 'synced'>): Promise<string> {
  const id = `bookmark-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const entry: BookmarkEntry = {
    ...bookmark,
    id,
    createdAt: Date.now(),
    synced: false,
  };
  await addItem(STORES.BOOKMARKS, entry);
  await addToSyncQueue(STORES.BOOKMARKS, 'create', entry);
  return id;
}

export async function getBookmarks(): Promise<BookmarkEntry[]> {
  return getAllItems(STORES.BOOKMARKS);
}

export async function deleteBookmark(id: string): Promise<void> {
  await deleteItem(STORES.BOOKMARKS, id);
  await addToSyncQueue(STORES.BOOKMARKS, 'delete', { id });
}

// Notes functions
export async function saveNote(note: Omit<NoteEntry, 'id' | 'createdAt' | 'updatedAt' | 'synced'>): Promise<string> {
  const id = `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();
  const entry: NoteEntry = {
    ...note,
    id,
    createdAt: now,
    updatedAt: now,
    synced: false,
  };
  await addItem(STORES.NOTES, entry);
  await addToSyncQueue(STORES.NOTES, 'create', entry);
  return id;
}

export async function updateNote(id: string, content: string): Promise<void> {
  const existing = await getItem<NoteEntry>(STORES.NOTES, id);
  if (existing) {
    const updated: NoteEntry = {
      ...existing,
      content,
      updatedAt: Date.now(),
      synced: false,
    };
    await addItem(STORES.NOTES, updated);
    await addToSyncQueue(STORES.NOTES, 'update', updated);
  }
}

export async function getNotes(): Promise<NoteEntry[]> {
  return getAllItems(STORES.NOTES);
}

export async function getNotesByReference(reference: string): Promise<NoteEntry[]> {
  return getItemsByIndex(STORES.NOTES, 'reference', reference);
}

export async function deleteNote(id: string): Promise<void> {
  await deleteItem(STORES.NOTES, id);
  await addToSyncQueue(STORES.NOTES, 'delete', { id });
}

// Reading progress functions
export async function saveReadingProgress(
  planId: string,
  day: number,
  completed: boolean
): Promise<void> {
  const id = `progress-${planId}-${day}`;
  const entry: ReadingProgressEntry = {
    id,
    planId,
    day,
    completed,
    completedAt: completed ? Date.now() : undefined,
    synced: false,
  };
  await addItem(STORES.READING_PROGRESS, entry);
  await addToSyncQueue(STORES.READING_PROGRESS, 'update', entry);
}

export async function getReadingProgress(planId: string): Promise<ReadingProgressEntry[]> {
  return getItemsByIndex(STORES.READING_PROGRESS, 'planId', planId);
}

export async function getAllReadingProgress(): Promise<ReadingProgressEntry[]> {
  return getAllItems(STORES.READING_PROGRESS);
}

// Journal functions
export async function saveJournalEntry(
  entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt' | 'synced'>
): Promise<string> {
  const id = `journal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();
  const journalEntry: JournalEntry = {
    ...entry,
    id,
    createdAt: now,
    updatedAt: now,
    synced: false,
  };
  await addItem(STORES.JOURNAL_ENTRIES, journalEntry);
  await addToSyncQueue(STORES.JOURNAL_ENTRIES, 'create', journalEntry);
  return id;
}

export async function updateJournalEntry(
  id: string,
  updates: Partial<Omit<JournalEntry, 'id' | 'createdAt' | 'synced'>>
): Promise<void> {
  const existing = await getItem<JournalEntry>(STORES.JOURNAL_ENTRIES, id);
  if (existing) {
    const updated: JournalEntry = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
      synced: false,
    };
    await addItem(STORES.JOURNAL_ENTRIES, updated);
    await addToSyncQueue(STORES.JOURNAL_ENTRIES, 'update', updated);
  }
}

export async function getJournalEntries(): Promise<JournalEntry[]> {
  return getAllItems(STORES.JOURNAL_ENTRIES);
}

export async function deleteJournalEntry(id: string): Promise<void> {
  await deleteItem(STORES.JOURNAL_ENTRIES, id);
  await addToSyncQueue(STORES.JOURNAL_ENTRIES, 'delete', { id });
}

// Sync queue functions
export async function addToSyncQueue(
  store: string,
  action: 'create' | 'update' | 'delete',
  data: any
): Promise<void> {
  const item: SyncQueueItem = {
    id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    store,
    action,
    data,
    timestamp: Date.now(),
    retries: 0,
  };
  await addItem(STORES.SYNC_QUEUE, item);
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  return getAllItems(STORES.SYNC_QUEUE);
}

export async function clearSyncQueueItem(id: string): Promise<void> {
  await deleteItem(STORES.SYNC_QUEUE, id);
}

export async function clearAllSyncQueue(): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
    const store = transaction.objectStore(STORES.SYNC_QUEUE);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Get unsynced items count
export async function getUnsyncedCount(): Promise<number> {
  const queue = await getSyncQueue();
  return queue.length;
}

// Mark items as synced
export async function markAsSynced(storeName: string, ids: string[]): Promise<void> {
  const db = await initDB();
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);

  for (const id of ids) {
    const request = store.get(id);
    request.onsuccess = () => {
      const item = request.result;
      if (item) {
        item.synced = true;
        store.put(item);
      }
    };
  }
}

// Clear old cached data (older than 30 days)
export async function clearOldCache(daysOld: number = 30): Promise<void> {
  const db = await initDB();
  const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;

  const transaction = db.transaction(STORES.BIBLE_TEXT, 'readwrite');
  const store = transaction.objectStore(STORES.BIBLE_TEXT);
  const request = store.openCursor();

  request.onsuccess = (event) => {
    const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
    if (cursor) {
      const entry = cursor.value as BibleTextEntry;
      if (entry.cachedAt < cutoffTime) {
        cursor.delete();
      }
      cursor.continue();
    }
  };
}

// Get storage usage estimate
export async function getStorageEstimate(): Promise<{ used: number; quota: number } | null> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      used: estimate.usage || 0,
      quota: estimate.quota || 0,
    };
  }
  return null;
}

// Export all data for backup
export async function exportAllData(): Promise<{
  bookmarks: BookmarkEntry[];
  notes: NoteEntry[];
  readingProgress: ReadingProgressEntry[];
  journalEntries: JournalEntry[];
}> {
  const [bookmarks, notes, readingProgress, journalEntries] = await Promise.all([
    getBookmarks(),
    getNotes(),
    getAllReadingProgress(),
    getJournalEntries(),
  ]);

  return { bookmarks, notes, readingProgress, journalEntries };
}

// Import data from backup
export async function importData(data: {
  bookmarks?: BookmarkEntry[];
  notes?: NoteEntry[];
  readingProgress?: ReadingProgressEntry[];
  journalEntries?: JournalEntry[];
}): Promise<void> {
  if (data.bookmarks) {
    for (const bookmark of data.bookmarks) {
      await addItem(STORES.BOOKMARKS, { ...bookmark, synced: false });
    }
  }
  if (data.notes) {
    for (const note of data.notes) {
      await addItem(STORES.NOTES, { ...note, synced: false });
    }
  }
  if (data.readingProgress) {
    for (const progress of data.readingProgress) {
      await addItem(STORES.READING_PROGRESS, { ...progress, synced: false });
    }
  }
  if (data.journalEntries) {
    for (const entry of data.journalEntries) {
      await addItem(STORES.JOURNAL_ENTRIES, { ...entry, synced: false });
    }
  }
}
