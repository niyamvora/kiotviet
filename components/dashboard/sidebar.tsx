/**
 * Dashboard sidebar navigation component
 * Provides navigation links and user account management
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  Settings,
  Home,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "nav.dashboard", href: "/dashboard", icon: Home },
  { name: "nav.sales", href: "/dashboard/sales", icon: TrendingUp },
  { name: "nav.products", href: "/dashboard/products", icon: Package },
  { name: "nav.customers", href: "/dashboard/customers", icon: Users },
  { name: "nav.orders", href: "/dashboard/orders", icon: ShoppingCart },
  { name: "nav.analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "nav.settings", href: "/dashboard/settings", icon: Settings },
];

interface DashboardSidebarProps {
  isCollapsed: boolean
}

export function DashboardSidebar({ isCollapsed }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <div className={cn(
      "hidden md:flex md:flex-col transition-all duration-300 bg-card border-r",
      isCollapsed ? "md:w-0 md:opacity-0" : "md:w-64 md:opacity-100"
    )}>
      <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <Store className="h-8 w-8 text-primary" />
          <span className="ml-2 text-xl font-bold text-foreground">
            KiotViet
          </span>
        </div>

        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isActive && "bg-secondary text-secondary-foreground"
                    )}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {t(item.name)}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
