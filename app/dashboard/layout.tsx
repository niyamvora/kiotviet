/**
 * Dashboard layout with sidebar navigation and header
 * Provides consistent layout for all dashboard pages in the KiotViet Dashboard
 */

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { AIPanel } from "@/components/dashboard/ai-panel";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col">
          <DashboardHeader user={user} />

          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>

        <AIPanel />
      </div>
    </div>
  );
}
