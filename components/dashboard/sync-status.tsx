/**
 * Data Sync Status Component
 * Shows current sync status and allows manual sync triggering
 */

"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { dataSyncService } from '@/lib/data-sync-service';
import { RefreshCw, CheckCircle, AlertCircle, Clock, Database } from 'lucide-react';

interface SyncStatusProps {
  syncStatus: 'idle' | 'syncing' | 'complete' | 'error';
  isInitialLoad: boolean;
  hasCredentials: boolean;
  onSyncComplete?: () => void;
}

export function SyncStatus({ 
  syncStatus, 
  isInitialLoad, 
  hasCredentials,
  onSyncComplete 
}: SyncStatusProps) {
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  const handleManualSync = async () => {
    if (!hasCredentials) return;
    
    setIsManualSyncing(true);
    try {
      await dataSyncService.initializeUser();
      const result = await dataSyncService.performIncrementalSync();
      
      if (result.success) {
        console.log('✅ Manual sync complete');
        onSyncComplete?.();
      } else {
        console.error('❌ Manual sync failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Manual sync error:', error);
    } finally {
      setIsManualSyncing(false);
    }
  };

  const getSyncStatusInfo = () => {
    if (!hasCredentials) {
      return {
        icon: Database,
        label: 'Demo Mode',
        description: 'Enter KiotViet credentials to sync live data',
        variant: 'secondary' as const,
        color: 'text-orange-600'
      };
    }

    if (isInitialLoad && syncStatus === 'syncing') {
      return {
        icon: RefreshCw,
        label: 'Initial Sync',
        description: 'Setting up your dashboard with KiotViet data...',
        variant: 'default' as const,
        color: 'text-blue-600',
        animate: true
      };
    }

    switch (syncStatus) {
      case 'syncing':
        return {
          icon: RefreshCw,
          label: 'Syncing',
          description: 'Updating data in background...',
          variant: 'default' as const,
          color: 'text-blue-600',
          animate: true
        };
        
      case 'complete':
        return {
          icon: CheckCircle,
          label: 'Synced',
          description: 'Data is up to date',
          variant: 'default' as const,
          color: 'text-green-600'
        };
        
      case 'error':
        return {
          icon: AlertCircle,
          label: 'Sync Error',
          description: 'Failed to sync data',
          variant: 'destructive' as const,
          color: 'text-red-600'
        };
        
      default:
        return {
          icon: Clock,
          label: 'Ready',
          description: 'Data loaded from cache',
          variant: 'secondary' as const,
          color: 'text-gray-600'
        };
    }
  };

  const statusInfo = getSyncStatusInfo();
  const Icon = statusInfo.icon;
  const isSpinning = statusInfo.animate || isManualSyncing;

  if (!hasCredentials) {
    return (
      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="flex items-center gap-3 p-3">
          <Database className="h-4 w-4 text-orange-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-800">Demo Mode</p>
            <p className="text-xs text-orange-600">Go to Settings to connect KiotViet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${isInitialLoad && syncStatus === 'syncing' ? 'bg-blue-50 border-blue-200' : ''}`}>
      <CardContent className="flex items-center gap-3 p-3">
        <Icon 
          className={`h-4 w-4 ${statusInfo.color} ${isSpinning ? 'animate-spin' : ''}`} 
        />
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{statusInfo.label}</p>
            <Badge variant={statusInfo.variant} className="text-xs">
              Live Data
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {statusInfo.description}
          </p>
        </div>

        {hasCredentials && syncStatus !== 'syncing' && !isInitialLoad && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleManualSync}
            disabled={isManualSyncing}
            className="h-8 px-3"
          >
            {isManualSyncing ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Badge component if not available
const BadgeComponent = ({ children, variant, className }: any) => (
  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

// Use actual Badge component or fallback
const BadgeWrapper = typeof Badge !== 'undefined' ? Badge : BadgeComponent;
