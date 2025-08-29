/**
 * Dashboard overview component showing key business metrics
 * Displays total revenue, orders, customers, and products with trend indicators
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
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
} from "lucide-react";

// Mock data - replace with real data from KiotViet API
const mockMetrics = {
  revenue: {
    current: 15750000,
    previous: 12300000,
    trend: "up",
  },
  orders: {
    current: 1247,
    previous: 1098,
    trend: "up",
  },
  customers: {
    current: 48759,
    previous: 47234,
    trend: "up",
  },
  products: {
    current: 840,
    previous: 832,
    trend: "up",
  },
};

export function DashboardOverview() {
  const { t, language } = useLanguage();

  const calculatePercentageChange = (current: number, previous: number) => {
    return ((current - previous) / previous) * 100;
  };

  const MetricCard = ({
    title,
    icon: Icon,
    current,
    previous,
    trend,
    format = "number",
  }: {
    title: string;
    icon: any;
    current: number;
    previous: number;
    trend: "up" | "down";
    format?: "number" | "currency";
  }) => {
    const percentage = calculatePercentageChange(current, previous);
    const formattedCurrent =
      format === "currency"
        ? formatCurrency(current, language === "vi" ? "vi-VN" : "en-US")
        : formatNumber(current, language === "vi" ? "vi-VN" : "en-US");

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formattedCurrent}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {trend === "up" ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span
              className={trend === "up" ? "text-green-500" : "text-red-500"}
            >
              {Math.abs(percentage).toFixed(1)}%
            </span>
            <span>from last period</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title={t("dashboard.revenue")}
        icon={DollarSign}
        current={mockMetrics.revenue.current}
        previous={mockMetrics.revenue.previous}
        trend={mockMetrics.revenue.trend}
        format="currency"
      />
      <MetricCard
        title={t("dashboard.orders")}
        icon={ShoppingCart}
        current={mockMetrics.orders.current}
        previous={mockMetrics.orders.previous}
        trend={mockMetrics.orders.trend}
      />
      <MetricCard
        title={t("dashboard.customers")}
        icon={Users}
        current={mockMetrics.customers.current}
        previous={mockMetrics.customers.previous}
        trend={mockMetrics.customers.trend}
      />
      <MetricCard
        title={t("dashboard.products")}
        icon={Package}
        current={mockMetrics.products.current}
        previous={mockMetrics.products.previous}
        trend={mockMetrics.products.trend}
      />
    </div>
  );
}
