/**
 * Utility functions for the KiotViet Dashboard
 * Contains common helper functions, class name merging, and formatting utilities
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  locale: string = "vi-VN"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: locale === "vi-VN" ? "VND" : "USD",
  }).format(amount);
}

export function formatNumber(num: number, locale: string = "vi-VN"): string {
  return new Intl.NumberFormat(locale).format(num);
}

export function formatDate(
  date: Date | string,
  locale: string = "vi-VN"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(dateObj);
}

export function formatDateTime(
  date: Date | string,
  locale: string = "vi-VN"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
}

export function getTimeRangeFilter(range: "week" | "month" | "year" | "all") {
  const now = new Date();
  const startDate = new Date();

  switch (range) {
    case "week":
      startDate.setDate(now.getDate() - 7);
      break;
    case "month":
      startDate.setMonth(now.getMonth() - 1);
      break;
    case "year":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    case "all":
      return { startDate: null, endDate: null };
  }

  return { startDate, endDate: now };
}

export function truncateText(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}
