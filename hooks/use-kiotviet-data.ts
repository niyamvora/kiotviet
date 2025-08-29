/**
 * Custom hook for fetching and managing KiotViet data
 * Integrates with KiotViet API and provides filtered data based on dashboard state
 */

"use client";

import { useState, useEffect } from "react";
import { kiotVietAPI } from "@/lib/kiotviet-api";
import { DataType, TimeRange } from "./use-dashboard-filters";

interface DashboardData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    revenueGrowth: number;
    ordersGrowth: number;
    customersGrowth: number;
    productsGrowth: number;
  };
  sales: {
    revenueData: Array<{ month: string; revenue: number; orders: number }>;
    topProducts: Array<{ name: string; sales: number; revenue: number }>;
    categoryDistribution: Array<{ name: string; value: number; color: string }>;
  };
  products: {
    topSellingProducts: Array<{
      id: number;
      name: string;
      sales: number;
      revenue: number;
      stock: number;
    }>;
    categoryPerformance: Array<{
      name: string;
      products: number;
      sales: number;
      revenue: number;
    }>;
    lowStockItems: Array<{
      id: number;
      name: string;
      stock: number;
      reorderPoint: number;
    }>;
    priceAnalysis: Array<{
      range: string;
      count: number;
      totalRevenue: number;
    }>;
  };
  customers: {
    customerGrowth: Array<{ month: string; new: number; returning: number }>;
    topCustomers: Array<{
      id: number;
      name: string;
      totalSpent: number;
      orders: number;
      location: string;
    }>;
    geographicDistribution: Array<{
      city: string;
      customers: number;
      revenue: number;
    }>;
    customerSegments: Array<{
      segment: string;
      count: number;
      avgSpent: number;
    }>;
  };
  orders: {
    orderTrends: Array<{ date: string; orders: number; revenue: number }>;
    ordersByStatus: Array<{
      status: string;
      count: number;
      percentage: number;
    }>;
    averageOrderValue: Array<{ month: string; aov: number }>;
    ordersByBranch: Array<{ branch: string; orders: number; revenue: number }>;
  };
}

export function useKiotVietData(
  dataType: DataType,
  timeRange: TimeRange,
  dateRange: { startDate: Date | null; endDate: Date }
) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCredentials, setHasCredentials] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Check if user has credentials
        // This would normally check from Supabase
        setHasCredentials(true); // For now, assume they do

                 if (!hasCredentials) {
           // Return demo data
           setData(generateDemoData(timeRange));
           setLoading(false);
           return;
         }

        // Generate demo data for now - replace with real API calls
        const dashboardData = generateDemoData(timeRange);

        // Apply time filtering to the data
        const filteredData = filterDataByTimeRange(
          dashboardData,
          dateRange,
          timeRange
        );

        setData(filteredData);
        setLoading(false);
      } catch (err) {
                 setError(err instanceof Error ? err.message : "Unknown error");
         // Fallback to demo data
         setData(generateDemoData(timeRange));
         setLoading(false);
      }
    };

    fetchData();
  }, [dataType, timeRange, dateRange, hasCredentials]);

  return { data, loading, error, hasCredentials };
}

function generateDemoData(timeRange: TimeRange): DashboardData {
  const isWeek = timeRange === "week";
  const isMonth = timeRange === "month";
  const isYear = timeRange === "year";
  return {
    overview: {
      totalRevenue: 15750000,
      totalOrders: 1247,
      totalCustomers: 48759,
      totalProducts: 840,
      revenueGrowth: 28.1,
      ordersGrowth: 13.6,
      customersGrowth: 3.2,
      productsGrowth: 1.0,
    },
    sales: {
      revenueData: isWeek
        ? [
            { month: "Mon", revenue: 2200000, orders: 125 },
            { month: "Tue", revenue: 2850000, orders: 142 },
            { month: "Wed", revenue: 2100000, orders: 108 },
            { month: "Thu", revenue: 3200000, orders: 167 },
            { month: "Fri", revenue: 3850000, orders: 189 },
            { month: "Sat", revenue: 4200000, orders: 205 },
            { month: "Sun", revenue: 3100000, orders: 156 },
          ]
        : isMonth
        ? [
            { month: "Week 1", revenue: 12000000, orders: 890 },
            { month: "Week 2", revenue: 14500000, orders: 1020 },
            { month: "Week 3", revenue: 13200000, orders: 945 },
            { month: "Week 4", revenue: 15800000, orders: 1150 },
          ]
        : isYear
        ? [
            { month: "Q1", revenue: 45600000, orders: 3200 },
            { month: "Q2", revenue: 52300000, orders: 3680 },
            { month: "Q3", revenue: 48900000, orders: 3420 },
            { month: "Q4", revenue: 58200000, orders: 4100 },
          ]
        : [
            { month: "2022", revenue: 180000000, orders: 12500 },
            { month: "2023", revenue: 205000000, orders: 14200 },
            { month: "2024", revenue: 225000000, orders: 15800 },
          ],
      topProducts: [
        { name: "150ML Dầu massage Relaxing", sales: 145, revenue: 17400000 },
        { name: "Kem dưỡng da mặt", sales: 89, revenue: 12450000 },
        { name: "Sữa rửa mặt organic", sales: 76, revenue: 9880000 },
        { name: "Serum vitamin C", sales: 65, revenue: 13000000 },
        { name: "Mặt nạ collagen", sales: 58, revenue: 8700000 },
      ],
      categoryDistribution: [
        { name: "Skincare", value: 35, color: "#0088FE" },
        { name: "Haircare", value: 25, color: "#00C49F" },
        { name: "Makeup", value: 20, color: "#FFBB28" },
        { name: "Fragrance", value: 15, color: "#FF8042" },
        { name: "Others", value: 5, color: "#8884D8" },
      ],
    },
    products: {
      topSellingProducts: [
        {
          id: 1,
          name: "150ML Dầu massage Relaxing",
          sales: 145,
          revenue: 17400000,
          stock: 25,
        },
        {
          id: 2,
          name: "Kem dưỡng da mặt",
          sales: 89,
          revenue: 12450000,
          stock: 15,
        },
        {
          id: 3,
          name: "Sữa rửa mặt organic",
          sales: 76,
          revenue: 9880000,
          stock: 8,
        },
        {
          id: 4,
          name: "Serum vitamin C",
          sales: 65,
          revenue: 13000000,
          stock: 32,
        },
        {
          id: 5,
          name: "Mặt nạ collagen",
          sales: 58,
          revenue: 8700000,
          stock: 12,
        },
      ],
      categoryPerformance: [
        { name: "Skincare", products: 294, sales: 1205, revenue: 48500000 },
        { name: "Haircare", products: 168, sales: 890, revenue: 32200000 },
        { name: "Makeup", products: 142, sales: 654, revenue: 28900000 },
        { name: "Fragrance", products: 98, sales: 432, revenue: 19800000 },
      ],
      lowStockItems: [
        { id: 1, name: "Sữa rửa mặt organic", stock: 8, reorderPoint: 20 },
        { id: 2, name: "Mặt nạ collagen", stock: 12, reorderPoint: 25 },
        { id: 3, name: "Kem dưỡng da mặt", stock: 15, reorderPoint: 30 },
      ],
      priceAnalysis: [
        { range: "Under 100K", count: 234, totalRevenue: 12300000 },
        { range: "100K - 300K", count: 387, totalRevenue: 68900000 },
        { range: "300K - 500K", count: 156, totalRevenue: 62400000 },
        { range: "Over 500K", count: 63, totalRevenue: 45200000 },
      ],
    },
    customers: {
      customerGrowth: isWeek
        ? [
            { month: "Mon", new: 35, returning: 180 },
            { month: "Tue", new: 42, returning: 195 },
            { month: "Wed", new: 28, returning: 165 },
            { month: "Thu", new: 55, returning: 220 },
            { month: "Fri", new: 48, returning: 205 },
            { month: "Sat", new: 65, returning: 240 },
            { month: "Sun", new: 38, returning: 175 },
          ]
        : isMonth
        ? [
            { month: "Week 1", new: 245, returning: 1200 },
            { month: "Week 2", new: 320, returning: 1350 },
            { month: "Week 3", new: 280, returning: 1280 },
            { month: "Week 4", new: 410, returning: 1450 },
          ]
        : isYear
        ? [
            { month: "Q1", new: 1200, returning: 4800 },
            { month: "Q2", new: 1450, returning: 5200 },
            { month: "Q3", new: 1100, returning: 4600 },
            { month: "Q4", new: 1650, returning: 5800 },
          ]
        : [
            { month: "2022", new: 4500, returning: 18000 },
            { month: "2023", new: 5200, returning: 20500 },
            { month: "2024", new: 5800, returning: 22800 },
          ],
      topCustomers: [
        {
          id: 1,
          name: "Nguyễn Thị Mai",
          totalSpent: 5420000,
          orders: 12,
          location: "Hà Nội",
        },
        {
          id: 2,
          name: "Trần Văn Nam",
          totalSpent: 4890000,
          orders: 8,
          location: "TP.HCM",
        },
        {
          id: 3,
          name: "Phạm Thị Lan",
          totalSpent: 4320000,
          orders: 15,
          location: "Đà Nẵng",
        },
        {
          id: 4,
          name: "Lê Hoàng Minh",
          totalSpent: 3980000,
          orders: 9,
          location: "Hải Phòng",
        },
      ],
      geographicDistribution: [
        { city: "Hà Nội", customers: 15603, revenue: 48200000 },
        { city: "TP. Hồ Chí Minh", customers: 13652, revenue: 52100000 },
        { city: "Đà Nẵng", customers: 7315, revenue: 18900000 },
        { city: "Hải Phòng", customers: 5847, revenue: 14200000 },
        { city: "Cần Thơ", customers: 3901, revenue: 9800000 },
        { city: "Other Cities", customers: 2441, revenue: 6300000 },
      ],
      customerSegments: [
        { segment: "VIP", count: 234, avgSpent: 3420000 },
        { segment: "Regular", count: 1560, avgSpent: 890000 },
        { segment: "New", count: 2890, avgSpent: 320000 },
        { segment: "Inactive", count: 567, avgSpent: 150000 },
      ],
    },
    orders: {
      orderTrends: isWeek
        ? [
            { date: "Mon", orders: 125, revenue: 2200000 },
            { date: "Tue", orders: 142, revenue: 2850000 },
            { date: "Wed", orders: 108, revenue: 2100000 },
            { date: "Thu", orders: 167, revenue: 3200000 },
            { date: "Fri", orders: 189, revenue: 3850000 },
            { date: "Sat", orders: 205, revenue: 4200000 },
            { date: "Sun", orders: 156, revenue: 3100000 },
          ]
        : isMonth
        ? [
            { date: "Week 1", orders: 890, revenue: 12000000 },
            { date: "Week 2", orders: 1020, revenue: 14500000 },
            { date: "Week 3", orders: 945, revenue: 13200000 },
            { date: "Week 4", orders: 1150, revenue: 15800000 },
          ]
        : isYear
        ? [
            { date: "Q1", orders: 3200, revenue: 45600000 },
            { date: "Q2", orders: 3680, revenue: 52300000 },
            { date: "Q3", orders: 3420, revenue: 48900000 },
            { date: "Q4", orders: 4100, revenue: 58200000 },
          ]
        : [
            { date: "2022", orders: 12500, revenue: 180000000 },
            { date: "2023", orders: 14200, revenue: 205000000 },
            { date: "2024", orders: 15800, revenue: 225000000 },
          ],
      ordersByStatus: [
        { status: "Completed", count: 1089, percentage: 87.3 },
        { status: "Processing", count: 98, percentage: 7.9 },
        { status: "Cancelled", count: 45, percentage: 3.6 },
        { status: "Pending", count: 15, percentage: 1.2 },
      ],
      averageOrderValue: isWeek
        ? [
            { month: "Mon", aov: 1760000 },
            { month: "Tue", aov: 2007000 },
            { month: "Wed", aov: 1944000 },
            { month: "Thu", aov: 1917000 },
            { month: "Fri", aov: 2037000 },
            { month: "Sat", aov: 2049000 },
            { month: "Sun", aov: 1987000 },
          ]
        : isMonth
        ? [
            { month: "Week 1", aov: 1348000 },
            { month: "Week 2", aov: 1421000 },
            { month: "Week 3", aov: 1396000 },
            { month: "Week 4", aov: 1374000 },
          ]
        : isYear
        ? [
            { month: "Q1", aov: 1425000 },
            { month: "Q2", aov: 1421000 },
            { month: "Q3", aov: 1430000 },
            { month: "Q4", aov: 1419000 },
          ]
        : [
            { month: "2022", aov: 1440000 },
            { month: "2023", aov: 1444000 },
            { month: "2024", aov: 1424000 },
          ],
      ordersByBranch: [
        { branch: "Chi nhánh chính", orders: 567, revenue: 23400000 },
        { branch: "Chi nhánh Quận 1", orders: 389, revenue: 18900000 },
        { branch: "Chi nhánh Hà Nội", orders: 291, revenue: 14200000 },
      ],
    },
  };
}

function filterDataByTimeRange(
  data: DashboardData,
  dateRange: { startDate: Date | null; endDate: Date },
  timeRange: TimeRange
): DashboardData {
  // Adjust overview metrics based on time range
  const timeMultiplier = 
    timeRange === 'week' ? 0.15 : 
    timeRange === 'month' ? 1 : 
    timeRange === 'year' ? 12 : 
    36; // all time (3 years)

  const adjustedData = {
    ...data,
    overview: {
      ...data.overview,
      totalRevenue: Math.floor(data.overview.totalRevenue * timeMultiplier),
      totalOrders: Math.floor(data.overview.totalOrders * timeMultiplier),
      totalCustomers: timeRange === 'all' ? data.overview.totalCustomers : 
                     timeRange === 'year' ? Math.floor(data.overview.totalCustomers * 0.3) :
                     timeRange === 'month' ? Math.floor(data.overview.totalCustomers * 0.08) :
                     Math.floor(data.overview.totalCustomers * 0.02),
      totalProducts: data.overview.totalProducts, // Products don't change with time
    }
  }

  return adjustedData;
}
