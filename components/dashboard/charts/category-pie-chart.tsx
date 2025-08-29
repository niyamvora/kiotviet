/**
 * Category distribution pie chart with dark/light mode support
 * Shows sales/revenue distribution across product categories
 */

"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { ChartContainer } from "./chart-container";
import { useTheme } from "next-themes";

interface CategoryPieChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  title?: string;
  description?: string;
  isLoading?: boolean;
  className?: string;
  showPercentages?: boolean;
}

export function CategoryPieChart({
  data,
  title = "Sales by Category",
  description = "Revenue distribution across product categories",
  isLoading = false,
  className = "",
  showPercentages = true,
}: CategoryPieChartProps) {
  const { theme } = useTheme();

  // Theme-aware colors
  const isDark = theme === "dark";
  const textColor = isDark ? "#d1d5db" : "#374151";

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
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
          <div className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.payload.color }}
            />
            <span className="font-medium">{data.payload.name}</span>
          </div>
          <p className="text-sm mt-1">{data.value}% of total sales</p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    value,
    name,
  }: any) => {
    if (value < 5) return null; // Don't show labels for small slices

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill={textColor}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="500"
      >
        {showPercentages ? `${name} ${value}%` : name}
      </text>
    );
  };

  const CustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span style={{ color: textColor }}>
              {entry.value} (
              {data.find((d) => d.name === entry.value)?.value || 0}%)
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <ChartContainer
      title={title}
      description={description}
      isLoading={isLoading}
      className={className}
    >
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            strokeWidth={2}
            stroke={isDark ? "#374151" : "#f3f4f6"}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                style={{
                  filter: isDark ? "brightness(0.9)" : "brightness(1)",
                  transition: "all 0.2s ease-in-out",
                }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            content={<CustomLegend />}
            wrapperStyle={{ paddingTop: "20px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
