import React, { useState } from 'react';
import { Wifi, WifiOff, RefreshCw, Cloud, CloudOff, Check, AlertCircle, Database, HardDrive } from 'lucide-react';
import { useOfflineSync, useServiceWorker } from '@/hooks/useOfflineSync';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';

export const OfflineIndicator: React.FC = () => {
  const {
    isOnline,
    isInitialized,
    isSyncing,
    unsyncedCount,
    lastSyncTime,
    storageUsed,
    storageQuota,
    triggerSync,
  } = useOfflineSync();

  const { isRegistered, updateAvailable, updateServiceWorker } = useServiceWorker();
  const [isOpen, setIsOpen] = useState(false);

  if (!isInitialized) {
    return null;
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (timestamp: number | null): string => {
    if (!timestamp) return 'Never';
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const storagePercentage = storageQuota > 0 ? (storageUsed / storageQuota) * 100 : 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={`
            fixed bottom-20 left-4 z-40 p-3 rounded-full shadow-lg transition-all duration-300
            ${isOnline 
              ? 'bg-green-500/90 hover:bg-green-600 text-white' 
              : 'bg-amber-500/90 hover:bg-amber-600 text-white animate-pulse'
            }
            ${isSyncing ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
            backdrop-blur-sm
          `}
          title={isOnline ? 'Online' : 'Offline - Data saved locally'}
        >
          <div className="relative">
            {isOnline ? (
              <Wifi className="w-5 h-5" />
            ) : (
              <WifiOff className="w-5 h-5" />
            )}
            {unsyncedCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {unsyncedCount > 9 ? '9+' : unsyncedCount}
              </span>
            )}
            {isSyncing && (
              <RefreshCw className="absolute -bottom-1 -right-1 w-3 h-3 animate-spin text-blue-200" />
            )}
          </div>
        </button>
      </PopoverTrigger>
      
      <PopoverContent 
        side="top" 
        align="start" 
        className="w-80 p-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl overflow-hidden"
      >
        {/* Header */}
        <div className={`p-4 ${isOnline ? 'bg-green-500' : 'bg-amber-500'} text-white`}>
          <div className="flex items-center gap-3">
            {isOnline ? (
              <Cloud className="w-6 h-6" />
            ) : (
              <CloudOff className="w-6 h-6" />
            )}
            <div>
              <h3 className="font-semibold text-lg">
                {isOnline ? 'Connected' : 'Offline Mode'}
              </h3>
              <p className="text-sm opacity-90">
                {isOnline 
                  ? 'Your data is syncing with the cloud' 
                  : 'Your progress is saved locally'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Sync Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-blue-500' : ''}`} />
              <span className="text-sm">Sync Status</span>
            </div>
            <div className="flex items-center gap-2">
              {isSyncing ? (
                <span className="text-sm text-blue-500 font-medium">Syncing...</span>
              ) : unsyncedCount > 0 ? (
                <span className="text-sm text-amber-500 font-medium">
                  {unsyncedCount} pending
                </span>
              ) : (
                <span className="flex items-center gap-1 text-sm text-green-500 font-medium">
                  <Check className="w-4 h-4" /> Up to date
                </span>
              )}
            </div>
          </div>

          {/* Last Sync */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Last synced</span>
            <span className="text-gray-700 dark:text-gray-200">{formatTime(lastSyncTime)}</span>
          </div>

          {/* Storage Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <HardDrive className="w-4 h-4" />
                <span>Local Storage</span>
              </div>
              <span className="text-gray-700 dark:text-gray-200">
                {formatBytes(storageUsed)} / {formatBytes(storageQuota)}
              </span>
            </div>
            <Progress value={storagePercentage} className="h-2" />
          </div>

          {/* Service Worker Status */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Database className="w-4 h-4" />
              <span>Offline Ready</span>
            </div>
            {isRegistered ? (
              <span className="flex items-center gap-1 text-green-500">
                <Check className="w-4 h-4" /> Enabled
              </span>
            ) : (
              <span className="flex items-center gap-1 text-gray-400">
                <AlertCircle className="w-4 h-4" /> Not available
              </span>
            )}
          </div>

          {/* Update Available */}
          {updateAvailable && (
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Update available</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={updateServiceWorker}
                  className="text-xs"
                >
                  Update
                </Button>
              </div>
            </div>
          )}

          {/* Sync Button */}
          {isOnline && unsyncedCount > 0 && (
            <Button
              onClick={triggerSync}
              disabled={isSyncing}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Now
                </>
              )}
            </Button>
          )}

          {/* Offline Message */}
          {!isOnline && (
            <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                You can continue reading and taking notes. Everything will sync automatically when you're back online.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Your Bible study progress is always saved locally
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default OfflineIndicator;
