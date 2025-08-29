/**
 * Main dashboard page showing business overview and analytics
 * Displays key metrics, charts, and business insights
 */

"use client";

import { Suspense } from "react";
import { DashboardOverview } from "@/components/dashboard/overview";
import { DashboardCharts } from "@/components/dashboard/charts/dashboard-charts";
import { FilterTabs } from "@/components/dashboard/filter-tabs";
import { TimelineFilter } from "@/components/dashboard/timeline-filter";
import { DashboardSkeleton } from "@/components/dashboard/skeleton";

// Add skeleton components
function DashboardOverviewSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

function DashboardChartsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="md:col-span-2 h-[300px] bg-muted rounded-lg animate-pulse" />
      <div className="h-[250px] bg-muted rounded-lg animate-pulse" />
      <div className="h-[250px] bg-muted rounded-lg animate-pulse" />
    </div>
  );
}
import { useDashboardFilters } from "@/hooks/use-dashboard-filters";
import { useKiotVietData } from "@/hooks/use-kiotviet-data";
import { useLanguage } from "@/components/providers/language-provider";

export default function DashboardPage() {
  const {
    activeDataType,
    setActiveDataType,
    timeRange,
    setTimeRange,
    dateRange,
  } = useDashboardFilters();
  const { data, loading, error, hasCredentials } = useKiotVietData(
    activeDataType,
    timeRange,
    dateRange
  );
  const { t } = useLanguage();

  return (
    <div className="h-full">
      <div className="h-full overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {t("nav.dashboard")}
              </h1>
              <p className="text-muted-foreground">
                Welcome to your business analytics center
              </p>
            </div>
            <TimelineFilter
              value={timeRange}
              onChange={(value) => setTimeRange(value as typeof timeRange)}
            />
          </div>

          {/* Filter Tabs */}
          <FilterTabs
            value={activeDataType}
            onChange={(value) =>
              setActiveDataType(value as typeof activeDataType)
            }
          />

          {/* Overview Cards */}
          <Suspense fallback={<DashboardOverviewSkeleton />}>
            {loading ? (
              <DashboardOverviewSkeleton />
            ) : error ? (
              <div className="text-center py-4">
                <p className="text-destructive text-sm">
                  Error loading data: {error}
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  Showing demo data instead
                </p>
              </div>
            ) : (
              <DashboardOverview data={data} dataType={activeDataType} />
            )}
          </Suspense>

          {/* Charts Section */}
          <Suspense fallback={<DashboardChartsSkeleton />}>
            {loading ? (
              <DashboardChartsSkeleton />
            ) : (
              <DashboardCharts
                dataType={activeDataType}
                timeRange={timeRange}
                dateRange={dateRange}
              />
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
