/**
 * Main dashboard page showing business overview and analytics
 * Displays key metrics, charts, and business insights
 */

import { Suspense } from "react";
import { DashboardOverview } from "@/components/dashboard/overview";
import { DashboardCharts } from "@/components/dashboard/charts";
import { FilterTabs } from "@/components/dashboard/filter-tabs";
import { TimelineFilter } from "@/components/dashboard/timeline-filter";
import { DashboardSkeleton } from "@/components/dashboard/skeleton";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your business analytics center
          </p>
        </div>
        <TimelineFilter />
      </div>

      <FilterTabs />

      <Suspense fallback={<DashboardSkeleton />}>
        <div className="grid gap-6">
          <DashboardOverview />
          <DashboardCharts />
        </div>
      </Suspense>
    </div>
  );
}
