/**
 * Customer growth area chart with stacking and dark/light mode support
 * Shows new vs returning customer trends over time
 */

"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { ChartContainer } from "./chart-container";
import {
  TimeFilter as TimeFilterType,
  formatYAxisNumber,
} from "@/lib/data/chart-data-processor";
import { useTheme } from "next-themes";

interface CustomerAreaChartProps {
  data: Array<{
    date: string;
    customers: number;
    new?: number;
    returning?: number;
  }>;
  title?: string;
  description?: string;
  isLoading?: boolean;
  showTimeFilter?: boolean;
  selectedTimeFilter?: TimeFilterType;
  onTimeFilterChange?: (filter: TimeFilterType) => void;
  className?: string;
  stacked?: boolean;
}

export function CustomerAreaChart({
  data,
  title = "Customer Growth",
  description = "New vs returning customers over time",
  isLoading = false,
  showTimeFilter = false,
  selectedTimeFilter = "1y",
  onTimeFilterChange,
  className = "",
  stacked = true,
}: CustomerAreaChartProps) {
  const { theme } = useTheme();

  // Theme-aware colors
  const isDark = theme === "dark";
  const gridColor = isDark ? "#374151" : "#e5e7eb";
  const textColor = isDark ? "#d1d5db" : "#374151";
  const newCustomerColor = "#3b82f6"; // Blue
  const returningCustomerColor = "#10b981"; // Green

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce(
        (sum: number, item: any) => sum + (item.value || 0),
        0
      );

      return (
        <div
          className={`
          rounded-lg border p-3 shadow-md
          ${
            isDark
              ? "bg-gray-800 border-gray-700 text-gray-100"
              : "bg-white border-gray-200 text-gray-900"
          }
        `}
        >
          <p className="font-medium mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm min-w-[150px]"
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="font-medium capitalize">
                    {entry.dataKey}:
                  </span>
                </div>
                <span className="ml-2">{entry.value?.toLocaleString()}</span>
              </div>
            ))}
            {stacked && payload.length > 1 && (
              <div className="flex items-center justify-between text-sm font-medium pt-1 border-t border-gray-300 dark:border-gray-600">
                <span>Total:</span>
                <span>{total.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartContainer
      title={title}
      description={description}
      isLoading={isLoading}
      showTimeFilter={showTimeFilter}
      selectedTimeFilter={selectedTimeFilter}
      onTimeFilterChange={onTimeFilterChange}
      className={className}
    >
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            <linearGradient
              id="newCustomerGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor={newCustomerColor}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={newCustomerColor}
                stopOpacity={0.1}
              />
            </linearGradient>
            <linearGradient
              id="returningCustomerGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor={returningCustomerColor}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={returningCustomerColor}
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={gridColor}
            opacity={0.6}
          />
          <XAxis
            dataKey="date"
            stroke={textColor}
            fontSize={12}
            tickLine={{ stroke: gridColor }}
            axisLine={{ stroke: gridColor }}
          />
          <YAxis
            stroke={textColor}
            fontSize={12}
            tickFormatter={formatYAxisNumber}
            tickLine={{ stroke: gridColor }}
            axisLine={{ stroke: gridColor }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: textColor, fontSize: "12px" }} />

          {data.some((d) => d.new !== undefined) ? (
            <>
              <Area
                type="monotone"
                dataKey="new"
                stackId={stacked ? "1" : undefined}
                stroke={newCustomerColor}
                fill="url(#newCustomerGradient)"
                strokeWidth={2}
                name="New Customers"
              />
              <Area
                type="monotone"
                dataKey="returning"
                stackId={stacked ? "1" : undefined}
                stroke={returningCustomerColor}
                fill="url(#returningCustomerGradient)"
                strokeWidth={2}
                name="Returning Customers"
              />
            </>
          ) : (
            <Area
              type="monotone"
              dataKey="customers"
              stroke={newCustomerColor}
              fill="url(#newCustomerGradient)"
              strokeWidth={2}
              name="Total Customers"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
