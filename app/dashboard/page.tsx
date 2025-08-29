/**
 * Main dashboard page showing business overview and analytics
 * Displays key metrics, charts, and business insights
 */

"use client";

import { Suspense } from "react";
import { DashboardOverview } from "@/components/dashboard/overview";
import { DashboardCharts } from "@/components/dashboard/charts";
import { FilterTabs } from "@/components/dashboard/filter-tabs";
import { TimelineFilter } from "@/components/dashboard/timeline-filter";
import { DashboardSkeleton } from "@/components/dashboard/skeleton";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("nav.dashboard")}
          </h1>
          <p className="text-muted-foreground">
            Welcome to your business analytics center
          </p>
        </div>
        <TimelineFilter value={timeRange} onChange={setTimeRange} />
      </div>

      <FilterTabs value={activeDataType} onChange={setActiveDataType} />

      <Suspense fallback={<DashboardSkeleton />}>
        <div className="grid gap-6">
          {loading ? (
            <DashboardSkeleton />
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive">Error loading data: {error}</p>
              <p className="text-muted-foreground mt-2">
                Showing demo data instead
              </p>
            </div>
          ) : null}

          <DashboardOverview data={data} dataType={activeDataType} />
          <DashboardCharts data={data} dataType={activeDataType} />
        </div>
      </Suspense>
    </div>
  );
}
