/**
 * Dashboard layout with collapsible sidebar and authentication protection
 * Clean and responsive layout with sidebar toggle functionality
 */

'use client'

import { useState } from 'react'
import { AuthGuard } from "@/components/auth-guard";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { AIPanel } from "@/components/dashboard/ai-panel";
import { SidebarToggle } from "@/components/dashboard/sidebar-toggle";
import { cn } from '@/lib/utils'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <SidebarToggle 
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        <div className="flex">
          <DashboardSidebar isCollapsed={sidebarCollapsed} />

          <div className={cn(
            "flex-1 flex flex-col transition-all duration-300"
          )}>
            <DashboardHeader />

            <main className={cn(
              "flex-1 p-6 overflow-y-auto transition-all duration-300",
              sidebarCollapsed ? "ml-16" : "ml-0"
            )}>
              {children}
            </main>
          </div>

          <AIPanel />
        </div>
      </div>
    </AuthGuard>
  );
}
