/**
 * Time filter component for finance-style chart filtering
 * Provides 1W, 1M, 1Y, 3Y, All time options
 */

"use client";

import { Button } from "@/components/ui/button";
import { TimeFilter } from "@/lib/data/chart-data-processor";

interface TimeFilterProps {
  selectedFilter: TimeFilter;
  onFilterChange: (filter: TimeFilter) => void;
  className?: string;
}

const TIME_FILTERS: Array<{
  value: TimeFilter;
  label: string;
  description: string;
}> = [
  { value: "1w", label: "1W", description: "Last 7 days" },
  { value: "1m", label: "1M", description: "Last 30 days" },
  { value: "1y", label: "1Y", description: "Last 12 months" },
  { value: "3y", label: "3Y", description: "Last 3 years" },
  { value: "all", label: "All", description: "All time data" },
];

export function TimeFilter({
  selectedFilter,
  onFilterChange,
  className = "",
}: TimeFilterProps) {
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {TIME_FILTERS.map((filter) => (
        <Button
          key={filter.value}
          variant={selectedFilter === filter.value ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(filter.value)}
          className={`
            px-3 py-1 text-xs font-medium transition-all duration-200
            ${
              selectedFilter === filter.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-background hover:bg-muted border-border hover:border-primary/50"
            }
          `}
          title={filter.description}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
