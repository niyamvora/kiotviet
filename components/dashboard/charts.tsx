/**
 * Dashboard charts component with proper formatting and language support
 * Fixed axis formatting, currency display, and language-aware text
 */

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLanguage } from "@/components/providers/language-provider";
import { formatCurrency, formatCurrencyFull } from "@/lib/utils";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DashboardChartsProps {
  data: any;
  dataType: string;
}

export function DashboardCharts({ data, dataType }: DashboardChartsProps) {
  const { t, language } = useLanguage();

  if (!data) {
    return <DashboardChartsSkeleton />;
  }

  switch (dataType) {
    case "overview":
      return <OverviewCharts data={data} language={language} />;
    case "sales":
      return <SalesCharts data={data} language={language} />;
    case "products":
      return <ProductsCharts data={data} language={language} />;
    case "customers":
      return <CustomersCharts data={data} language={language} />;
    case "orders":
      return <OrdersCharts data={data} language={language} />;
    default:
      return <OverviewCharts data={data} language={language} />;
  }
}

// Helper function to format large numbers for Y-axis
const formatYAxisTick = (value: number, language: string) => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  } else if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

// Helper function for currency tooltips - Always VND for Vietnam
const formatTooltipCurrency = (value: number, language: string) => {
  return `${value.toLocaleString("vi-VN")} VND`;
};

function OverviewCharts({ data, language }: { data: any; language: string }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Revenue Trend Chart */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Revenue and order count over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={data.sales.revenueData}
              margin={{ top: 20, right: 30, left: 50, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                yAxisId="left"
                tickFormatter={(value) => formatYAxisTick(value, language)}
                width={80}
              />
              <YAxis yAxisId="right" orientation="right" width={60} />
              <Tooltip
                formatter={(value, name) => [
                  name === "revenue"
                    ? formatTooltipCurrency(value as number, language)
                    : value,
                  name === "revenue" ? "Revenue" : "Orders",
                ]}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ fill: "#8884d8" }}
                name="Revenue"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                stroke="#82ca9d"
                strokeWidth={2}
                dot={{ fill: "#82ca9d" }}
                name="Orders"
              />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Sales by Category</CardTitle>
          <CardDescription>
            Revenue distribution across product categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.sales.categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.sales.categoryDistribution.map(
                  (entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  )
                )}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
          <CardDescription>Best selling products this period</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data.sales.topProducts}
              layout="horizontal"
              margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                tickFormatter={(value) => formatYAxisTick(value, language)}
              />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip
                formatter={(value) => [
                  formatTooltipCurrency(value as number, language),
                  "Revenue",
                ]}
              />
              <Bar dataKey="revenue" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function SalesCharts({ data, language }: { data: any; language: string }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Revenue Over Time */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Revenue Performance</CardTitle>
          <CardDescription>
            Revenue trends over the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart
              data={data.sales.revenueData}
              margin={{ top: 20, right: 30, left: 50, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                tickFormatter={(value) => formatYAxisTick(value, language)}
                width={80}
              />
              <Tooltip
                formatter={(value) => [
                  formatTooltipCurrency(value as number, language),
                  "Revenue",
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Products by Revenue */}
      <Card>
        <CardHeader>
          <CardTitle>Top Products by Revenue</CardTitle>
          <CardDescription>Highest revenue generating products</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data.sales.topProducts}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                fontSize={12}
              />
              <YAxis
                tickFormatter={(value) => formatYAxisTick(value, language)}
                width={80}
              />
              <Tooltip
                formatter={(value) => [
                  formatTooltipCurrency(value as number, language),
                  "Revenue",
                ]}
                labelStyle={{ fontSize: "12px" }}
              />
              <Bar dataKey="revenue" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Category Performance</CardTitle>
          <CardDescription>Sales distribution by category</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.sales.categoryDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {data.sales.categoryDistribution.map(
                  (entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  )
                )}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductsCharts({ data, language }: { data: any; language: string }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Top Selling Products */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Product Performance</CardTitle>
          <CardDescription>Top selling products by units sold</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={data.products.topSellingProducts}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                fontSize={12}
              />
              <YAxis width={60} />
              <Tooltip labelStyle={{ fontSize: "12px" }} />
              <Bar dataKey="sales" fill="#8884d8" name="Units Sold" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Category Performance</CardTitle>
          <CardDescription>Sales and revenue by category</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data.products.categoryPerformance}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis width={60} />
              <Tooltip />
              <Bar dataKey="sales" fill="#8884d8" name="Units Sold" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Price Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Price Distribution</CardTitle>
          <CardDescription>Product count by price range</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data.products.priceAnalysis}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis width={60} />
              <Tooltip />
              <Bar dataKey="count" fill="#FFBB28" name="Product Count" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function CustomersCharts({ data, language }: { data: any; language: string }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Customer Growth */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Customer Growth</CardTitle>
          <CardDescription>
            New vs returning customers over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart
              data={data.customers.customerGrowth}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis width={60} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="new"
                stackId="1"
                stroke="#8884d8"
                fill="#8884d8"
                name="New Customers"
              />
              <Area
                type="monotone"
                dataKey="returning"
                stackId="1"
                stroke="#82ca9d"
                fill="#82ca9d"
                name="Returning Customers"
              />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Geographic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
          <CardDescription>Customers by location</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data.customers.geographicDistribution}
              layout="horizontal"
              margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" width={60} />
              <YAxis dataKey="city" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="customers" fill="#00C49F" name="Customers" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Customer Segments */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Segments</CardTitle>
          <CardDescription>Customer distribution by type</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.customers.customerSegments}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                label={({ segment, count }) => `${segment}: ${count}`}
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function OrdersCharts({ data, language }: { data: any; language: string }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Order Trends */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Order Trends</CardTitle>
          <CardDescription>Orders and revenue over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={data.orders.orderTrends}
              margin={{ top: 20, right: 30, left: 50, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" width={60} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) => formatYAxisTick(value, language)}
                width={80}
              />
              <Tooltip
                formatter={(value, name) => [
                  name === "revenue"
                    ? formatTooltipCurrency(value as number, language)
                    : value,
                  name === "revenue" ? "Revenue" : "Orders",
                ]}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="orders"
                stroke="#8884d8"
                name="Orders"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="#82ca9d"
                name="Revenue"
              />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Average Order Value */}
      <Card>
        <CardHeader>
          <CardTitle>Average Order Value</CardTitle>
          <CardDescription>AOV trends over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={data.orders.averageOrderValue}
              margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                tickFormatter={(value) => formatYAxisTick(value, language)}
                width={80}
              />
              <Tooltip
                formatter={(value) => [
                  formatTooltipCurrency(value as number, language),
                  "AOV",
                ]}
              />
              <Area
                type="monotone"
                dataKey="aov"
                stroke="#FFBB28"
                fill="#FFBB28"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Orders by Branch */}
      <Card>
        <CardHeader>
          <CardTitle>Orders by Branch</CardTitle>
          <CardDescription>
            Performance across different locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data.orders.ordersByBranch}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="branch"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                fontSize={12}
              />
              <YAxis width={60} />
              <Tooltip />
              <Bar dataKey="orders" fill="#FF8042" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardChartsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="md:col-span-2">
        <CardHeader>
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>

      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="h-6 w-28 bg-muted rounded animate-pulse" />
            <div className="h-4 w-40 bg-muted rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-[250px] bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
