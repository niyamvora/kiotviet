/**
 * Timeline filter component for the KiotViet Dashboard
 * Allows filtering data by time periods (week, month, year, all time)
 */

"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/components/providers/language-provider";
import { Calendar } from "lucide-react";

const timelineOptions = [
  { value: "week", label: "time.week" },
  { value: "month", label: "time.month" },
  { value: "year", label: "time.year" },
  { value: "all", label: "time.all" },
];

export function TimelineFilter() {
  const [selectedTimeline, setSelectedTimeline] = useState("month");
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <Select value={selectedTimeline} onValueChange={setSelectedTimeline}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {timelineOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {t(option.label)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
