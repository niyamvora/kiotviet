/**
 * Filter tabs component for the KiotViet Dashboard
 * Allows filtering by different data types (sales, products, customers, etc.)
 */

"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/components/providers/language-provider";
import {
  TrendingUp,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
} from "lucide-react";

const filterOptions = [
  { value: "overview", label: "dashboard.overview", icon: BarChart3 },
  { value: "sales", label: "nav.sales", icon: TrendingUp },
  { value: "products", label: "nav.products", icon: Package },
  { value: "customers", label: "nav.customers", icon: Users },
  { value: "orders", label: "nav.orders", icon: ShoppingCart },
];

interface FilterTabsProps {
  value: string;
  onChange: (value: string) => void;
}

export function FilterTabs({ value, onChange }: FilterTabsProps) {
  const { t } = useLanguage();

  return (
    <Tabs value={value} onValueChange={onChange} className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        {filterOptions.map((option) => {
          const Icon = option.icon;
          return (
            <TabsTrigger
              key={option.value}
              value={option.value}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{t(option.label)}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
