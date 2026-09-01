import { useState, useEffect, useCallback, useRef } from 'react';
import {
  initDB,
  getSyncQueue,
  clearSyncQueueItem,
  getUnsyncedCount,
  markAsSynced,
  STORES,
  SyncQueueItem,
  getStorageEstimate,
} from '@/lib/offlineDB';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export interface OfflineState {
  isOnline: boolean;
  isInitialized: boolean;
  isSyncing: boolean;
  unsyncedCount: number;
  lastSyncTime: number | null;
  storageUsed: number;
  storageQuota: number;
}

export function useOfflineSync() {
  const [state, setState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    isInitialized: false,
    isSyncing: false,
    unsyncedCount: 0,
    lastSyncTime: null,
    storageUsed: 0,
    storageQuota: 0,
  });

  const syncInProgress = useRef(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize IndexedDB
  useEffect(() => {
    const init = async () => {
      try {
        await initDB();
        const count = await getUnsyncedCount();
        const storage = await getStorageEstimate();
        const lastSync = localStorage.getItem('lastSyncTime');
        
        setState((prev) => ({
          ...prev,
          isInitialized: true,
          unsyncedCount: count,
          lastSyncTime: lastSync ? parseInt(lastSync, 10) : null,
          storageUsed: storage?.used || 0,
          storageQuota: storage?.quota || 0,
        }));
      } catch (error) {
        console.error('Failed to initialize offline DB:', error);
        setState((prev) => ({ ...prev, isInitialized: true }));
      }
    };

    init();
  }, []);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true }));
      toast({
        title: 'Back Online',
        description: 'Your connection has been restored. Syncing data...',
        duration: 3000,
      });
      // Trigger sync when coming back online
      syncData();
    };

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOnline: false }));
      toast({
        title: 'You\'re Offline',
        description: 'Don\'t worry! Your progress is saved locally and will sync when you\'re back online.',
        duration: 5000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen for service worker sync messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SYNC_AVAILABLE') {
        syncData();
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, []);

  // Sync data to server
  const syncData = useCallback(async () => {
    if (syncInProgress.current || !navigator.onLine) {
      return;
    }

    syncInProgress.current = true;
    setState((prev) => ({ ...prev, isSyncing: true }));

    try {
      const queue = await getSyncQueue();
      
      if (queue.length === 0) {
        setState((prev) => ({
          ...prev,
          isSyncing: false,
          unsyncedCount: 0,
          lastSyncTime: Date.now(),
        }));
        localStorage.setItem('lastSyncTime', Date.now().toString());
        syncInProgress.current = false;
        return;
      }

      let syncedCount = 0;
      const syncedIds: { [store: string]: string[] } = {};

      for (const item of queue) {
        try {
          const success = await processSyncItem(item);
          if (success) {
            await clearSyncQueueItem(item.id);
            syncedCount++;
            
            // Track synced items by store
            if (!syncedIds[item.store]) {
              syncedIds[item.store] = [];
            }
            if (item.data?.id) {
              syncedIds[item.store].push(item.data.id);
            }
          }
        } catch (error) {
          console.error('Failed to sync item:', item, error);
        }
      }

      // Mark items as synced in their respective stores
      for (const [store, ids] of Object.entries(syncedIds)) {
        if (ids.length > 0) {
          await markAsSynced(store, ids);
        }
      }

      const remainingCount = await getUnsyncedCount();
      const now = Date.now();
      localStorage.setItem('lastSyncTime', now.toString());

      setState((prev) => ({
        ...prev,
        isSyncing: false,
        unsyncedCount: remainingCount,
        lastSyncTime: now,
      }));

      if (syncedCount > 0) {
        toast({
          title: 'Sync Complete',
          description: `Successfully synced ${syncedCount} item${syncedCount > 1 ? 's' : ''}.`,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Sync failed:', error);
      setState((prev) => ({ ...prev, isSyncing: false }));
      toast({
        title: 'Sync Failed',
        description: 'Some data could not be synced. Will retry later.',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      syncInProgress.current = false;
    }
  }, []);

  // Process individual sync item
  const processSyncItem = async (item: SyncQueueItem): Promise<boolean> => {
    // For now, we'll just mark items as synced locally
    // In a full implementation, this would sync to Supabase
    
    switch (item.store) {
      case STORES.BOOKMARKS:
        // Sync bookmarks to server
        if (item.action === 'create' || item.action === 'update') {
          // In a real app, you'd call supabase here
          // await supabase.from('bookmarks').upsert(item.data);
          console.log('Syncing bookmark:', item.data);
        } else if (item.action === 'delete') {
          // await supabase.from('bookmarks').delete().eq('id', item.data.id);
          console.log('Deleting bookmark:', item.data.id);
        }
        return true;

      case STORES.NOTES:
        if (item.action === 'create' || item.action === 'update') {
          console.log('Syncing note:', item.data);
        } else if (item.action === 'delete') {
          console.log('Deleting note:', item.data.id);
        }
        return true;

      case STORES.READING_PROGRESS:
        if (item.action === 'update') {
          console.log('Syncing reading progress:', item.data);
        }
        return true;

      case STORES.JOURNAL_ENTRIES:
        if (item.action === 'create' || item.action === 'update') {
          console.log('Syncing journal entry:', item.data);
        } else if (item.action === 'delete') {
          console.log('Deleting journal entry:', item.data.id);
        }
        return true;

      default:
        return true;
    }
  };

  // Manual sync trigger
  const triggerSync = useCallback(() => {
    if (navigator.onLine) {
      syncData();
    } else {
      toast({
        title: 'Cannot Sync',
        description: 'You\'re currently offline. Data will sync when you\'re back online.',
        duration: 3000,
      });
    }
  }, [syncData]);

  // Update unsynced count
  const refreshUnsyncedCount = useCallback(async () => {
    const count = await getUnsyncedCount();
    setState((prev) => ({ ...prev, unsyncedCount: count }));
  }, []);

  // Update storage estimate
  const refreshStorageEstimate = useCallback(async () => {
    const storage = await getStorageEstimate();
    if (storage) {
      setState((prev) => ({
        ...prev,
        storageUsed: storage.used,
        storageQuota: storage.quota,
      }));
    }
  }, []);

  // Auto-sync periodically when online
  useEffect(() => {
    if (state.isOnline && state.isInitialized && state.unsyncedCount > 0) {
      // Sync after a short delay to batch multiple changes
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      syncTimeoutRef.current = setTimeout(() => {
        syncData();
      }, 5000); // Wait 5 seconds before syncing
    }

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [state.isOnline, state.isInitialized, state.unsyncedCount, syncData]);

  return {
    ...state,
    triggerSync,
    refreshUnsyncedCount,
    refreshStorageEstimate,
  };
}

// Hook for registering service worker
export function useServiceWorker() {
  const [swState, setSwState] = useState<{
    isSupported: boolean;
    isRegistered: boolean;
    updateAvailable: boolean;
    registration: ServiceWorkerRegistration | null;
  }>({
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    updateAvailable: false,
    registration: null,
  });

  useEffect(() => {
    if (!swState.isSupported) return;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        setSwState((prev) => ({
          ...prev,
          isRegistered: true,
          registration,
        }));

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setSwState((prev) => ({ ...prev, updateAvailable: true }));
                toast({
                  title: 'Update Available',
                  description: 'A new version is available. Refresh to update.',
                  duration: 10000,
                });
              }
            });
          }
        });

        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    registerSW();
  }, [swState.isSupported]);

  const updateServiceWorker = useCallback(() => {
    if (swState.registration?.waiting) {
      swState.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [swState.registration]);

  return {
    ...swState,
    updateServiceWorker,
  };
}
