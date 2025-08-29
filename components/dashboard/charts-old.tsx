/**
 * Dashboard charts component displaying business analytics
 * Uses Recharts for interactive data visualizations
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

// Mock data for charts - replace with real KiotViet API data
const revenueData = [
  { month: "Jan", revenue: 12000000, orders: 890 },
  { month: "Feb", revenue: 14500000, orders: 1020 },
  { month: "Mar", revenue: 13200000, orders: 945 },
  { month: "Apr", revenue: 15800000, orders: 1150 },
  { month: "May", revenue: 16200000, orders: 1180 },
  { month: "Jun", revenue: 15750000, orders: 1247 },
];

const categoryData = [
  { name: "Skincare", value: 35, color: "#0088FE" },
  { name: "Haircare", value: 25, color: "#00C49F" },
  { name: "Makeup", value: 20, color: "#FFBB28" },
  { name: "Fragrance", value: 15, color: "#FF8042" },
  { name: "Others", value: 5, color: "#8884D8" },
];

const topProducts = [
  { name: "Dầu massage Relaxing", sales: 145, revenue: 17400000 },
  { name: "Kem dưỡng da mặt", sales: 89, revenue: 12450000 },
  { name: "Sữa rửa mặt organic", sales: 76, revenue: 9880000 },
  { name: "Serum vitamin C", sales: 65, revenue: 13000000 },
  { name: "Mặt nạ collagen", sales: 58, revenue: 8700000 },
];

const customerGrowth = [
  { month: "Jan", new: 245, returning: 1200 },
  { month: "Feb", new: 320, returning: 1350 },
  { month: "Mar", new: 280, returning: 1280 },
  { month: "Apr", new: 410, returning: 1450 },
  { month: "May", new: 380, returning: 1520 },
  { month: "Jun", new: 450, returning: 1680 },
];

export function DashboardCharts() {
  const { t } = useLanguage();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Revenue Trend Chart */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>
            Monthly revenue and order count over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value, name) => [
                  name === "revenue"
                    ? `${(value as number).toLocaleString("vi-VN")} VND`
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
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                stroke="#82ca9d"
                strokeWidth={2}
                dot={{ fill: "#82ca9d" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Category Distribution</CardTitle>
          <CardDescription>Sales by product category</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
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
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
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
          <CardDescription>Best selling products this month</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topProducts} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip formatter={(value) => [`${value} units`, "Sales"]} />
              <Bar dataKey="sales" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Customer Growth */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Customer Growth</CardTitle>
          <CardDescription>
            New vs returning customers over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={customerGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="returning"
                stackId="1"
                stroke="#8884d8"
                fill="#8884d8"
                name="Returning Customers"
              />
              <Area
                type="monotone"
                dataKey="new"
                stackId="1"
                stroke="#82ca9d"
                fill="#82ca9d"
                name="New Customers"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
