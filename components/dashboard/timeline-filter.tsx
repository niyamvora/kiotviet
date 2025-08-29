/**
 * Timeline filter component for the KiotViet Dashboard
 * Allows filtering data by time periods (week, month, year, all time)
 */

"use client";

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

interface TimelineFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function TimelineFilter({ value, onChange }: TimelineFilterProps) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={onChange}>
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
