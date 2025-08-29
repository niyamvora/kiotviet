/**
 * Product volume chart - based on working ProductsBarChart pattern
 * Shows products by sales volume (units) with vertical bars
 */

"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { ChartContainer } from "./chart-container";
import {
  formatChartCurrency,
  formatYAxisNumber,
} from "@/lib/data/chart-data-processor";
import { useTheme } from "next-themes";

interface ProductVolumeChartProps {
  data: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  dataKey?: "revenue" | "sales";
  title?: string;
  description?: string;
  isLoading?: boolean;
  className?: string;
  maxItems?: number;
}

export function ProductVolumeChart({
  data,
  dataKey = "sales",
  title = "Top Products by Volume",
  description = "Best selling products by unit count",
  isLoading = false,
  className = "",
  maxItems = 8,
}: ProductVolumeChartProps) {
  const { theme } = useTheme();

  // Theme-aware colors
  const isDark = theme === "dark";
  const gridColor = isDark ? "#374151" : "#e5e7eb";
  const textColor = isDark ? "#d1d5db" : "#374151";
  const barColor = dataKey === "revenue" ? "#8b5cf6" : "#f59e0b"; // Purple for revenue, amber for sales

  // Truncate long product names for better display
  const truncateProductName = (name: string, maxLength: number = 20) => {
    if (!name) return "Unknown Product";
    if (name.length <= maxLength) return name;

    const truncated = name.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");

    if (lastSpace > maxLength * 0.7) {
      return truncated.substring(0, lastSpace) + "...";
    }

    return truncated + "...";
  };

  // Process data with truncated names - SAME PATTERN AS WORKING CHART
  const processedData = data.slice(0, maxItems).map((item) => ({
    ...item,
    displayName: truncateProductName(item.name, 15), // Shorter for vertical layout
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const originalItem = data.find(
        (item) => truncateProductName(item.name, 15) === label
      );
      const fullName = originalItem?.name || label;

      return (
        <div
          className={`
          rounded-lg border p-3 shadow-md max-w-xs
          ${
            isDark
              ? "bg-gray-800 border-gray-700 text-gray-100"
              : "bg-white border-gray-200 text-gray-900"
          }
        `}
        >
          <p className="font-medium mb-2 text-xs leading-tight">{fullName}</p>
          {payload.map((entry: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="font-medium">
                  {entry.dataKey === "revenue" ? "Revenue:" : "Sales:"}
                </span>
              </div>
              <span className="ml-2">
                {entry.dataKey === "revenue"
                  ? formatChartCurrency(entry.value)
                  : `${entry.value} units`}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // VERTICAL LAYOUT (like working Top Products by Volume)
  return (
    <ChartContainer
      title={title}
      description={description}
      isLoading={isLoading}
      className={className}
    >
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={processedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={gridColor}
            opacity={0.6}
          />
          <XAxis
            dataKey="displayName"
            stroke={textColor}
            fontSize={10}
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            tickLine={{ stroke: gridColor }}
            axisLine={{ stroke: gridColor }}
          />
          <YAxis
            stroke={textColor}
            fontSize={12}
            tickFormatter={
              dataKey === "revenue" ? formatYAxisNumber : undefined
            }
            tickLine={{ stroke: gridColor }}
            axisLine={{ stroke: gridColor }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey={dataKey}
            fill={barColor}
            radius={[4, 4, 0, 0]}
            opacity={0.8}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
