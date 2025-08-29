/**
 * Main dashboard charts component
 * Orchestrates all chart components with unified data management and time filtering
 */

"use client";

import { useState, useEffect } from "react";
import { useKiotVietData } from "@/hooks/use-kiotviet-data";
import { DataType, TimeRange } from "@/hooks/use-dashboard-filters";
import {
  TimeFilter as TimeFilterType,
  generateDemoDataForTimeFilter,
  processLiveDataForCharts,
  ProcessedChartData,
} from "@/lib/data/chart-data-processor";
import {
  RevenueLineChart,
  ProductsBarChart,
  ProductVolumeChart,
  CategoryPieChart,
  CustomerAreaChart,
} from "./index";

interface DashboardChartsProps {
  dataType: DataType;
  timeRange: TimeRange;
  dateRange: { startDate: Date | null; endDate: Date };
}

// Convert between legacy TimeRange and new TimeFilter
const convertTimeRangeToFilter = (timeRange: TimeRange): TimeFilterType => {
  switch (timeRange) {
    case "week":
      return "1w";
    case "month":
      return "1m";
    case "year":
      return "1y";
    default:
      return "all";
  }
};

export function DashboardCharts({
  dataType,
  timeRange,
  dateRange,
}: DashboardChartsProps) {
  const [currentTimeFilter, setCurrentTimeFilter] = useState<TimeFilterType>(
    convertTimeRangeToFilter(timeRange)
  );
  const [processedData, setProcessedData] = useState<ProcessedChartData | null>(
    null
  );

  // Get data from the existing hook
  const { data, loading, error, hasCredentials } = useKiotVietData(
    dataType,
    timeRange,
    dateRange
  );

  // Process data when it changes
  useEffect(() => {
    if (data) {
      // If we have live data, process it
      if (hasCredentials && data.sales?.revenueData?.length > 0) {
        // Convert existing data structure to our format
        const chartData = processLiveDataForCharts(
          {
            products: { data: data.products?.topSellingProducts || [] },
            customers: { data: [] },
            orders: { data: data.sales?.revenueData || [] },
            invoices: { data: data.sales?.revenueData || [] },
          },
          currentTimeFilter
        );

        setProcessedData(chartData);
      } else {
        // Use demo data
        const demoData = generateDemoDataForTimeFilter(currentTimeFilter);
        setProcessedData(demoData);
      }
    }
  }, [data, currentTimeFilter, hasCredentials]);

  const handleTimeFilterChange = (filter: TimeFilterType) => {
    setCurrentTimeFilter(filter);
  };

  if (loading || !processedData) {
    return <DashboardChartsSkeleton />;
  }

  // Render charts based on data type
  switch (dataType) {
    case "overview":
      return (
        <div className="grid gap-6 md:grid-cols-2">
          <RevenueLineChart
            data={processedData.revenue as any}
            showTimeFilter={true}
            selectedTimeFilter={currentTimeFilter}
            onTimeFilterChange={handleTimeFilterChange}
            className="md:col-span-2"
          />
          <ProductVolumeChart
            data={processedData.topProducts}
            dataKey="revenue"
            title="Top Products by Revenue"
            description="Products generating highest revenue"
            maxItems={6}
          />
          <CategoryPieChart
            data={processedData.categoryDistribution}
            title="Sales by Category"
            description="Revenue distribution across product categories"
          />
        </div>
      );

    case "sales":
      return (
        <div className="grid gap-6 md:grid-cols-2">
          <RevenueLineChart
            data={processedData.revenue as any}
            showTimeFilter={true}
            selectedTimeFilter={currentTimeFilter}
            onTimeFilterChange={handleTimeFilterChange}
            className="md:col-span-2"
          />
          <ProductVolumeChart
            data={processedData.topProducts}
            dataKey="revenue"
            title="Revenue by Product"
            description="Products generating highest revenue"
            maxItems={8}
          />
          <CategoryPieChart
            data={processedData.categoryDistribution}
            title="Revenue by Category"
            description="Category performance breakdown"
          />
        </div>
      );

    case "products":
      return (
        <div className="grid gap-6 md:grid-cols-2">
          <ProductVolumeChart
            data={processedData.topProducts}
            dataKey="sales"
            title="Top Products by Volume"
            description="Best selling products by unit count"
            className="md:col-span-2"
            maxItems={10}
          />
          <ProductVolumeChart
            data={processedData.topProducts}
            dataKey="revenue"
            title="Top Products by Revenue"
            description="Products generating highest revenue"
            maxItems={6}
          />
          <CategoryPieChart
            data={processedData.categoryDistribution}
            title="Product Distribution"
            description="Products across categories"
          />
        </div>
      );

    case "customers":
      return (
        <div className="grid gap-6 md:grid-cols-2">
          <CustomerAreaChart
            data={processedData.customers as any}
            showTimeFilter={true}
            selectedTimeFilter={currentTimeFilter}
            onTimeFilterChange={handleTimeFilterChange}
            className="md:col-span-2"
          />
          <ProductVolumeChart
            data={processedData.topProducts}
            dataKey="revenue"
            title="Popular Products"
            description="Products driving customer engagement"
            maxItems={5}
          />
          <CategoryPieChart
            data={processedData.categoryDistribution}
            title="Customer Preferences"
            description="Category preferences by customers"
          />
        </div>
      );

    case "orders":
      return (
        <div className="grid gap-6 md:grid-cols-2">
          <RevenueLineChart
            data={processedData.orders as any}
            showTimeFilter={true}
            selectedTimeFilter={currentTimeFilter}
            onTimeFilterChange={handleTimeFilterChange}
            className="md:col-span-2"
          />
          <CustomerAreaChart
            data={processedData.customers as any}
            title="Order Volume"
            description="Order patterns over time"
            stacked={false}
          />
          <ProductVolumeChart
            data={processedData.topProducts}
            dataKey="sales"
            title="Most Ordered Products"
            description="Products with highest order frequency"
            maxItems={6}
          />
        </div>
      );

    default:
      return (
        <div className="grid gap-6 md:grid-cols-2">
          <RevenueLineChart
            data={processedData.revenue as any}
            showTimeFilter={true}
            selectedTimeFilter={currentTimeFilter}
            onTimeFilterChange={handleTimeFilterChange}
            className="md:col-span-2"
          />
          <CategoryPieChart data={processedData.categoryDistribution} />
          <ProductVolumeChart
            data={processedData.topProducts}
            dataKey="revenue"
            maxItems={6}
          />
        </div>
      );
  }
}

function DashboardChartsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className={`
            rounded-lg border bg-card p-6 animate-pulse
            ${i === 0 ? "md:col-span-2" : ""}
          `}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-6 w-32 bg-muted rounded" />
                <div className="h-4 w-48 bg-muted rounded" />
              </div>
              {i === 0 && <div className="h-8 w-40 bg-muted rounded" />}
            </div>
            <div className="h-[350px] bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
