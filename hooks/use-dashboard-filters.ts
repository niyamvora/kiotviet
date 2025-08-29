/**
 * Custom hook for managing dashboard filters
 * Handles data type and timeline filtering with state management
 */

"use client";

import { useState, useMemo } from "react";
import { subDays, subMonths, subYears } from "date-fns";

export type DataType =
  | "overview"
  | "sales"
  | "products"
  | "customers"
  | "orders";
export type TimeRange = "week" | "month" | "year" | "all";

export function useDashboardFilters() {
  const [activeDataType, setActiveDataType] = useState<DataType>("overview");
  const [timeRange, setTimeRange] = useState<TimeRange>("month");

  const dateRange = useMemo(() => {
    const now = new Date();
    let startDate: Date | null = null;

    switch (timeRange) {
      case "week":
        startDate = subDays(now, 7);
        break;
      case "month":
        startDate = subMonths(now, 1);
        break;
      case "year":
        startDate = subYears(now, 1);
        break;
      case "all":
        startDate = null;
        break;
    }

    return {
      startDate,
      endDate: now,
    };
  }, [timeRange]);

  return {
    activeDataType,
    setActiveDataType,
    timeRange,
    setTimeRange,
    dateRange,
    filters: {
      dataType: activeDataType,
      timeRange,
      dateRange,
    },
  };
}
