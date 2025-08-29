/**
 * Clean dashboard layout without sidebar
 * Full-width layout with header, main content, and AI panel
 */

"use client";

import { AuthGuard } from "@/components/auth-guard";
import { DashboardHeader } from "@/components/dashboard/header";
import { AIPanel } from "@/components/dashboard/ai-panel";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="h-screen bg-background flex flex-col">
        {/* Header */}
        <DashboardHeader />

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Dashboard Content */}
          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </main>

          {/* AI Panel */}
          <AIPanel />
        </div>
      </div>
    </AuthGuard>
  );
}
