/**
 * KiotViet Data Synchronization Service
 * Handles incremental data syncing to avoid refetching all data on every refresh
 */

import { supabase } from '@/lib/supabase';
export { supabase } from '@/lib/supabase';
import { kiotVietAPI } from '@/lib/kiotviet-api';

interface SyncStatus {
  id: string;
  user_id: string;
  data_type: 'products' | 'customers' | 'orders' | 'invoices';
  last_sync_date: string;
  last_successful_sync: string;
  total_items_synced: number;
  sync_in_progress: boolean;
}

interface SyncResult {
  success: boolean;
  itemsProcessed: number;
  itemsAdded: number;
  itemsUpdated: number;
  itemsDeleted: number;
  duration: number;
  error?: string;
}

class DataSyncService {
  private userId: string | null = null;

  async initializeUser() {
    const { data: { user } } = await supabase.auth.getUser();
    this.userId = user?.id || null;
    return this.userId;
  }

  // Check if user needs initial full sync
  async needsInitialSync(): Promise<boolean> {
    if (!this.userId) return true;

    const { data: syncStatuses } = await supabase
      .from('sync_status')
      .select('*')
      .eq('user_id', this.userId);

    // If no sync records exist, needs initial sync
    if (!syncStatuses || syncStatuses.length === 0) {
      console.log('🆕 No sync history found - needs initial sync');
      return true;
    }

    // Check if all 4 data types have been synced
    const dataTypes = ['products', 'customers', 'orders', 'invoices'];
    const syncedTypes = syncStatuses.map(s => s.data_type);
    const missingTypes = dataTypes.filter(type => !syncedTypes.includes(type));

    if (missingTypes.length > 0) {
      console.log('📋 Missing sync for data types:', missingTypes);
      return true;
    }

    return false;
  }

  // Get cached data from Supabase (instant load)
  async getCachedData(timeRange?: string) {
    if (!this.userId) return null;

    console.log('⚡ Loading cached data from Supabase...');

    // Calculate date filter based on timeRange
    let dateFilter = '';
    if (timeRange && timeRange !== 'all') {
      const now = new Date();
      let daysBack = 30; // default to month
      
      switch (timeRange) {
        case 'week': daysBack = 7; break;
        case 'month': daysBack = 30; break;  
        case 'year': daysBack = 365; break;
      }
      
      const fromDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
      dateFilter = fromDate.toISOString();
    }

    const [products, customers, orders, invoices] = await Promise.all([
      supabase
        .from('kiotviet_products')
        .select('*')
        .eq('user_id', this.userId)
        .eq('is_active', true)
        .order('name'),

      supabase
        .from('kiotviet_customers')
        .select('*')
        .eq('user_id', this.userId)
        .eq('is_active', true)
        .order('name'),

      supabase
        .from('kiotviet_orders')
        .select('*')
        .eq('user_id', this.userId)
        .gte('order_date', dateFilter || '2020-01-01')
        .order('order_date', { ascending: false }),

      supabase
        .from('kiotviet_invoices')
        .select('*')
        .eq('user_id', this.userId)
        .gte('invoice_date', dateFilter || '2020-01-01')
        .order('invoice_date', { ascending: false })
    ]);

    console.log('✅ Cached data loaded:', {
      products: products.data?.length || 0,
      customers: customers.data?.length || 0,
      orders: orders.data?.length || 0,
      invoices: invoices.data?.length || 0
    });

    return {
      products: products.data || [],
      customers: customers.data || [],
      orders: orders.data || [],
      invoices: invoices.data || []
    };
  }

  // Perform full initial sync (first time only)
  async performInitialSync(): Promise<SyncResult> {
    if (!this.userId) {
      throw new Error('User not authenticated');
    }

    console.log('🚀 Starting initial full sync...');
    const startTime = Date.now();

    try {
      // Check if sync already in progress
      const { data: inProgressSync } = await supabase
        .from('sync_status')
        .select('*')
        .eq('user_id', this.userId)
        .eq('sync_in_progress', true);

      if (inProgressSync && inProgressSync.length > 0) {
        console.log('⏳ Sync already in progress');
        return { success: false, error: 'Sync already in progress', itemsProcessed: 0, itemsAdded: 0, itemsUpdated: 0, itemsDeleted: 0, duration: 0 };
      }

      let totalProcessed = 0;
      let totalAdded = 0;

      // Sync each data type
      const dataTypes = ['products', 'customers', 'orders', 'invoices'] as const;
      
      for (const dataType of dataTypes) {
        console.log(`📊 Syncing ${dataType}...`);
        
        // Mark sync as in progress
        await this.updateSyncStatus(dataType, { sync_in_progress: true });

        const result = await this.syncDataType(dataType, true);
        totalProcessed += result.itemsProcessed;
        totalAdded += result.itemsAdded;

        // Mark sync as complete
        await this.updateSyncStatus(dataType, {
          sync_in_progress: false,
          last_successful_sync: new Date().toISOString(),
          total_items_synced: result.itemsProcessed
        });
      }

      const duration = Date.now() - startTime;
      
      console.log(`✅ Initial sync complete! ${totalProcessed} items in ${duration}ms`);

      return {
        success: true,
        itemsProcessed: totalProcessed,
        itemsAdded: totalAdded,
        itemsUpdated: 0,
        itemsDeleted: 0,
        duration
      };

    } catch (error) {
      console.error('❌ Initial sync failed:', error);
      
      // Reset all sync_in_progress flags
      await supabase
        .from('sync_status')
        .update({ sync_in_progress: false })
        .eq('user_id', this.userId);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        itemsProcessed: 0,
        itemsAdded: 0,
        itemsUpdated: 0,
        itemsDeleted: 0,
        duration: Date.now() - startTime
      };
    }
  }

  // Perform incremental sync (daily/on-demand)
  async performIncrementalSync(): Promise<SyncResult> {
    if (!this.userId) {
      throw new Error('User not authenticated');
    }

    console.log('🔄 Starting incremental sync...');
    const startTime = Date.now();

    try {
      let totalProcessed = 0;
      let totalUpdated = 0;
      let totalAdded = 0;

      const dataTypes = ['products', 'customers', 'orders', 'invoices'] as const;
      
      for (const dataType of dataTypes) {
        const result = await this.syncDataType(dataType, false);
        totalProcessed += result.itemsProcessed;
        totalAdded += result.itemsAdded;
        totalUpdated += result.itemsUpdated;

        await this.updateSyncStatus(dataType, {
          last_successful_sync: new Date().toISOString(),
          total_items_synced: await this.getTotalItemsCount(dataType)
        });
      }

      const duration = Date.now() - startTime;
      
      console.log(`✅ Incremental sync complete! ${totalProcessed} items checked, ${totalAdded} added, ${totalUpdated} updated in ${duration}ms`);

      return {
        success: true,
        itemsProcessed: totalProcessed,
        itemsAdded: totalAdded,
        itemsUpdated: totalUpdated,
        itemsDeleted: 0,
        duration
      };

    } catch (error) {
      console.error('❌ Incremental sync failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        itemsProcessed: 0,
        itemsAdded: 0,
        itemsUpdated: 0,
        itemsDeleted: 0,
        duration: Date.now() - startTime
      };
    }
  }

  // Sync specific data type
  private async syncDataType(dataType: 'products' | 'customers' | 'orders' | 'invoices', isFullSync: boolean): Promise<SyncResult> {
    const startTime = Date.now();
    let itemsProcessed = 0;
    let itemsAdded = 0;
    let itemsUpdated = 0;

    try {
      // Get last sync date for incremental sync
      let lastSyncDate: string | undefined;
      if (!isFullSync) {
        const { data: syncStatus } = await supabase
          .from('sync_status')
          .select('last_successful_sync')
          .eq('user_id', this.userId)
          .eq('data_type', dataType)
          .single();

        lastSyncDate = syncStatus?.last_successful_sync;
      }

      // Fetch data from KiotViet API
      let apiData: any[] = [];
      
      if (dataType === 'products') {
        const result = await this.fetchEnhancedData('products', 500);
        apiData = result.data;
      } else if (dataType === 'customers') {
        const result = await this.fetchEnhancedData('customers', 200);
        apiData = result.data;
      } else if (dataType === 'orders') {
        const fromDate = lastSyncDate || (isFullSync ? undefined : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
        const result = await this.fetchEnhancedData('orders', 500, fromDate);
        apiData = result.data;
      } else if (dataType === 'invoices') {
        const fromDate = lastSyncDate || (isFullSync ? undefined : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
        const result = await this.fetchEnhancedData('invoices', 500, fromDate);
        apiData = result.data;
      }

      itemsProcessed = apiData.length;

      // Process and save data to Supabase
      for (const item of apiData) {
        const transformedItem = this.transformApiData(dataType, item);
        
        const { data: existingItem } = await supabase
          .from(`kiotviet_${dataType}`)
          .select('id')
          .eq('id', item.id)
          .eq('user_id', this.userId)
          .single();

        if (existingItem) {
          // Update existing item
          await supabase
            .from(`kiotviet_${dataType}`)
            .update({ ...transformedItem, synced_at: new Date().toISOString() })
            .eq('id', item.id)
            .eq('user_id', this.userId);
          itemsUpdated++;
        } else {
          // Insert new item
          await supabase
            .from(`kiotviet_${dataType}`)
            .insert(transformedItem);
          itemsAdded++;
        }
      }

      return {
        success: true,
        itemsProcessed,
        itemsAdded,
        itemsUpdated,
        itemsDeleted: 0,
        duration: Date.now() - startTime
      };

    } catch (error) {
      console.error(`❌ Error syncing ${dataType}:`, error);
      throw error;
    }
  }

  // Enhanced data fetching with pagination (same as your existing implementation)
  private async fetchEnhancedData(
    endpoint: "products" | "customers" | "orders" | "invoices",
    maxItems: number,
    fromDate?: string,
    toDate?: string
  ): Promise<{ data: any[]; total: number }> {
    const KIOTVIET_PAGE_SIZE = 20;
    const MAX_REQUESTS = Math.min(Math.ceil(maxItems / KIOTVIET_PAGE_SIZE), 25);

    let allData: any[] = [];
    let skip = 0;
    let requestCount = 0;

    while (requestCount < MAX_REQUESTS && allData.length < maxItems) {
      try {
        let batch;
        switch (endpoint) {
          case "products":
            batch = await kiotVietAPI.getProducts(skip, 20);
            break;
          case "customers":
            batch = await kiotVietAPI.getCustomers(skip, 20);
            break;
          case "orders":
            batch = await kiotVietAPI.getOrders(skip, 20, fromDate, toDate);
            break;
          case "invoices":
            batch = await kiotVietAPI.getInvoices(skip, 20, fromDate, toDate);
            break;
        }

        requestCount++;

        if (batch && batch.data && batch.data.length > 0) {
          allData = [...allData, ...batch.data];
          skip += KIOTVIET_PAGE_SIZE;

          if (batch.data.length < KIOTVIET_PAGE_SIZE) break;

          const delay = Math.min(150 + requestCount * 75, 800);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          break;
        }
      } catch (error) {
        console.error(`❌ Error fetching ${endpoint}:`, error);
        break;
      }
    }

    return { data: allData, total: allData.length };
  }

  // Transform API data to match Supabase schema
  private transformApiData(dataType: string, apiItem: any) {
    const baseItem = {
      id: apiItem.id,
      user_id: this.userId,
      synced_at: new Date().toISOString()
    };

    switch (dataType) {
      case 'products':
        return {
          ...baseItem,
          name: apiItem.name,
          full_name: apiItem.fullName,
          code: apiItem.code,
          barcode: apiItem.barcode,
          category_id: apiItem.categoryId,
          category_name: apiItem.categoryName,
          base_price: apiItem.basePrice,
          on_hand: apiItem.inventories?.[0]?.onHand || 0,
          committed: apiItem.inventories?.[0]?.committed || 0,
          available: apiItem.inventories?.[0]?.available || 0,
          is_active: apiItem.isActive !== false,
          kiotviet_created_date: apiItem.createdDate,
          kiotviet_modified_date: apiItem.modifiedDate
        };

      case 'customers':
        return {
          ...baseItem,
          name: apiItem.name,
          code: apiItem.code,
          email: apiItem.email,
          phone: apiItem.phone,
          address: apiItem.address,
          city: apiItem.city,
          district: apiItem.district,
          location_name: apiItem.locationName,
          total_invoice: apiItem.totalInvoiced || 0,
          total_revenue: apiItem.totalRevenue || 0,
          total_orders: apiItem.totalOrders || 0,
          is_active: apiItem.isActive !== false,
          kiotviet_created_date: apiItem.createdDate,
          kiotviet_modified_date: apiItem.modifiedDate
        };

      case 'orders':
        return {
          ...baseItem,
          code: apiItem.code,
          customer_id: apiItem.customerId,
          customer_name: apiItem.customerName,
          branch_id: apiItem.branchId,
          branch_name: apiItem.branchName,
          total: apiItem.total || 0,
          discount: apiItem.discount || 0,
          status: apiItem.status,
          order_date: apiItem.createdDate,
          total_items: apiItem.orderDetails?.length || 0,
          kiotviet_created_date: apiItem.createdDate,
          kiotviet_modified_date: apiItem.modifiedDate
        };

      case 'invoices':
        return {
          ...baseItem,
          code: apiItem.code,
          customer_id: apiItem.customerId,
          customer_name: apiItem.customerName,
          branch_id: apiItem.branchId,
          branch_name: apiItem.branchName,
          total: apiItem.total || 0,
          discount: apiItem.discount || 0,
          tax: apiItem.tax || 0,
          paid_amount: apiItem.paidAmount || 0,
          status: apiItem.status,
          invoice_date: apiItem.createdDate,
          payment_status: apiItem.paymentStatus,
          kiotviet_created_date: apiItem.createdDate,
          kiotviet_modified_date: apiItem.modifiedDate
        };

      default:
        return baseItem;
    }
  }

  // Update sync status
  private async updateSyncStatus(dataType: string, updates: Partial<SyncStatus>) {
    const { error } = await supabase
      .from('sync_status')
      .upsert({
        user_id: this.userId,
        data_type: dataType,
        ...updates,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error updating sync status:', error);
    }
  }

  // Get total items count for a data type
  private async getTotalItemsCount(dataType: string): Promise<number> {
    const { count } = await supabase
      .from(`kiotviet_${dataType}`)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', this.userId);

    return count || 0;
  }

  // Log sync operation
  async logSyncOperation(dataType: string, operation: string, result: SyncResult) {
    await supabase
      .from('sync_logs')
      .insert({
        user_id: this.userId,
        data_type: dataType,
        operation,
        items_processed: result.itemsProcessed,
        items_added: result.itemsAdded,
        items_updated: result.itemsUpdated,
        items_deleted: result.itemsDeleted,
        duration_ms: result.duration,
        success: result.success,
        error_message: result.error,
        completed_at: new Date().toISOString()
      });
  }
}

// Export singleton instance
export const dataSyncService = new DataSyncService();
