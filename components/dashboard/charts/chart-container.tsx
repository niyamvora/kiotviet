/**
 * Chart container component with consistent styling and dark/light mode support
 * Provides base structure for all chart components
 */

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TimeFilter } from "./time-filter";
import { TimeFilter as TimeFilterType } from "@/lib/data/chart-data-processor";

interface ChartContainerProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  showTimeFilter?: boolean;
  selectedTimeFilter?: TimeFilterType;
  onTimeFilterChange?: (filter: TimeFilterType) => void;
  className?: string;
}

export function ChartContainer({
  title,
  description,
  children,
  isLoading = false,
  showTimeFilter = false,
  selectedTimeFilter = "1y",
  onTimeFilterChange,
  className = "",
}: ChartContainerProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              {description && <Skeleton className="h-4 w-48" />}
            </div>
            {showTimeFilter && <Skeleton className="h-8 w-40" />}
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`${className} transition-all duration-200 hover:shadow-md border-border/50`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-foreground">
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="text-sm text-muted-foreground">
                {description}
              </CardDescription>
            )}
          </div>
          {showTimeFilter && selectedTimeFilter && onTimeFilterChange && (
            <TimeFilter
              selectedFilter={selectedTimeFilter}
              onFilterChange={onTimeFilterChange}
              className="flex-shrink-0"
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}
