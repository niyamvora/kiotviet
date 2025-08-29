/**
 * Beautiful Sync Progress Modal 
 * Shows detailed progress during KiotViet data synchronization
 */

"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  Receipt, 
  CheckCircle2, 
  Clock,
  Database,
  Zap
} from 'lucide-react';

interface SyncProgress {
  currentStep: 'products' | 'customers' | 'orders' | 'invoices' | 'complete';
  totalSteps: number;
  currentStepIndex: number;
  currentStepProgress: number;
  overallProgress: number;
  itemsProcessed: number;
  totalEstimatedItems: number;
  currentStepItems: number;
  stepEstimatedItems: number;
  timeElapsed: number;
  estimatedTimeRemaining: number;
  message: string;
}

interface SyncProgressModalProps {
  isVisible: boolean;
  progress: SyncProgress | null;
  onComplete?: () => void;
}

const stepIcons = {
  products: Package,
  customers: Users,
  orders: ShoppingCart,
  invoices: Receipt,
  complete: CheckCircle2
};

const stepNames = {
  products: 'Products',
  customers: 'Customers', 
  orders: 'Orders',
  invoices: 'Invoices',
  complete: 'Complete'
};

const stepDescriptions = {
  products: 'Syncing your product catalog...',
  customers: 'Importing customer database...',
  orders: 'Processing order history...',
  invoices: 'Analyzing revenue data...',
  complete: 'Finalizing your dashboard...'
};

export function SyncProgressModal({ isVisible, progress, onComplete }: SyncProgressModalProps) {
  const [mounted, setMounted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setMounted(true);
    }
  }, [isVisible]);

  useEffect(() => {
    if (progress?.currentStep === 'complete' && progress?.overallProgress === 100) {
      setShowSuccess(true);
      setTimeout(() => {
        onComplete?.();
      }, 2000);
    }
  }, [progress, onComplete]);

  if (!isVisible || !mounted || !progress) {
    return null;
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const formatItems = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={`w-full max-w-2xl mx-auto transform transition-all duration-500 ${showSuccess ? 'scale-105' : 'scale-100'}`}>
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-blue-100">
                <Database className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Setting Up Your Dashboard</h2>
                <p className="text-gray-600">Syncing data from your KiotViet store...</p>
              </div>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm text-gray-500">{Math.round(progress.overallProgress)}%</span>
            </div>
            <Progress 
              value={progress.overallProgress} 
              className="h-3 mb-2"
            />
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{formatItems(progress.itemsProcessed)} items synced</span>
              <span>{formatTime(progress.timeElapsed)} elapsed</span>
              {progress.estimatedTimeRemaining > 0 && (
                <span>{formatTime(progress.estimatedTimeRemaining)} remaining</span>
              )}
            </div>
          </div>

          {/* Steps Progress */}
          <div className="mb-8">
            <div className="grid grid-cols-4 gap-4 mb-6">
              {(['products', 'customers', 'orders', 'invoices'] as const).map((step, index) => {
                const Icon = stepIcons[step];
                const isActive = progress.currentStepIndex === index;
                const isCompleted = progress.currentStepIndex > index;
                const isPending = progress.currentStepIndex < index;

                return (
                  <div 
                    key={step}
                    className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-300 ${
                      isActive 
                        ? 'border-blue-200 bg-blue-50 shadow-md transform scale-105' 
                        : isCompleted 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className={`p-3 rounded-full mb-2 transition-colors ${
                      isActive 
                        ? 'bg-blue-500 text-white animate-pulse' 
                        : isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      isActive ? 'text-blue-700' : isCompleted ? 'text-green-700' : 'text-gray-600'
                    }`}>
                      {stepNames[step]}
                    </span>
                    {isActive && (
                      <div className="mt-2">
                        <Progress 
                          value={progress.currentStepProgress} 
                          className="h-1 w-16"
                        />
                        <span className="text-xs text-gray-500 mt-1">
                          {formatItems(progress.currentStepItems)}/{formatItems(progress.stepEstimatedItems)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Status */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              {showSuccess ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <Badge variant="default" className="bg-green-100 text-green-800 px-3 py-1">
                    Sync Complete
                  </Badge>
                </>
              ) : (
                <>
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <Badge variant="default" className="bg-blue-100 text-blue-800 px-3 py-1">
                    {stepNames[progress.currentStep]}
                  </Badge>
                </>
              )}
            </div>

            <p className={`text-sm transition-all duration-300 ${
              showSuccess ? 'text-green-700 font-medium' : 'text-gray-600'
            }`}>
              {progress.message}
            </p>

            {/* Performance Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm font-medium">Speed</span>
                </div>
                <span className="text-xs text-gray-500">
                  {progress.itemsProcessed > 0 && progress.timeElapsed > 0 
                    ? `${Math.round(progress.itemsProcessed / (progress.timeElapsed / 1000))} items/sec`
                    : 'Calculating...'
                  }
                </span>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                  <Database className="h-4 w-4" />
                  <span className="text-sm font-medium">Items</span>
                </div>
                <span className="text-xs text-gray-500">
                  {formatItems(progress.itemsProcessed)} synced
                </span>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Time</span>
                </div>
                <span className="text-xs text-gray-500">
                  {formatTime(progress.timeElapsed)}
                </span>
              </div>
            </div>
          </div>

          {showSuccess && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Your dashboard is ready!
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Successfully synced {formatItems(progress.itemsProcessed)} items from your KiotViet store. 
                    Redirecting to your live dashboard...
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Progress component if not available
const ProgressComponent = ({ value, className }: { value: number; className?: string }) => (
  <div className={`bg-gray-200 rounded-full overflow-hidden ${className}`}>
    <div 
      className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

// Use actual Progress component or fallback
const ProgressWrapper = typeof Progress !== 'undefined' ? Progress : ProgressComponent;
