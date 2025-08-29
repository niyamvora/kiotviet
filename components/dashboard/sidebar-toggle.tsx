/**
 * Sidebar toggle component for collapsing/expanding the sidebar
 */

"use client";

import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarToggleProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function SidebarToggle({ isCollapsed, onToggle }: SidebarToggleProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onToggle}
      className={cn(
        "fixed top-4 z-50 transition-all duration-300",
        isCollapsed ? "left-4" : "left-4"
      )}
      style={{
        left: isCollapsed ? "1rem" : "17rem"
      }}
    >
      {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
    </Button>
  );
}
