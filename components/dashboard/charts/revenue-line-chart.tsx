/**
 * Revenue line chart with time filtering and dark/light mode support
 * Shows continuous revenue trends like finance applications
 */

"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { ChartContainer } from "./chart-container";
import {
  TimeFilter as TimeFilterType,
  formatChartCurrency,
  formatYAxisNumber,
} from "@/lib/data/chart-data-processor";
import { useTheme } from "next-themes";

interface RevenueLineChartProps {
  data: Array<{
    date: string;
    revenue: number;
    orders: number;
    label?: string;
  }>;
  isLoading?: boolean;
  showTimeFilter?: boolean;
  selectedTimeFilter?: TimeFilterType;
  onTimeFilterChange?: (filter: TimeFilterType) => void;
  className?: string;
}

export function RevenueLineChart({
  data,
  isLoading = false,
  showTimeFilter = true,
  selectedTimeFilter = "1y",
  onTimeFilterChange,
  className = "",
}: RevenueLineChartProps) {
  const { theme } = useTheme();

  // Theme-aware colors
  const isDark = theme === "dark";
  const gridColor = isDark ? "#374151" : "#e5e7eb";
  const textColor = isDark ? "#d1d5db" : "#374151";
  const lineColor = "#3b82f6"; // Primary blue
  const orderLineColor = "#10b981"; // Emerald

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
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
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="font-medium">{entry.dataKey}:</span>
              <span>
                {entry.dataKey === "revenue"
                  ? formatChartCurrency(entry.value)
                  : entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ChartContainer
      title="Revenue Trends"
      description="Revenue and order volume over time"
      isLoading={isLoading}
      showTimeFilter={showTimeFilter}
      selectedTimeFilter={selectedTimeFilter}
      onTimeFilterChange={onTimeFilterChange}
      className={className}
    >
      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
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
            yAxisId="revenue"
            orientation="left"
            stroke={textColor}
            fontSize={12}
            tickFormatter={formatYAxisNumber}
            tickLine={{ stroke: gridColor }}
            axisLine={{ stroke: gridColor }}
            width={60}
          />
          <YAxis
            yAxisId="orders"
            orientation="right"
            stroke={textColor}
            fontSize={12}
            tickLine={{ stroke: gridColor }}
            axisLine={{ stroke: gridColor }}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: textColor, fontSize: "12px" }} />
          <Line
            yAxisId="revenue"
            type="monotone"
            dataKey="revenue"
            stroke={lineColor}
            strokeWidth={3}
            dot={{ fill: lineColor, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: lineColor }}
            name="Revenue"
          />
          <Line
            yAxisId="orders"
            type="monotone"
            dataKey="orders"
            stroke={orderLineColor}
            strokeWidth={2}
            dot={{ fill: orderLineColor, strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, fill: orderLineColor }}
            name="Orders"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
