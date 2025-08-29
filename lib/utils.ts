import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency formatting utilities for Vietnam (VND)
export function formatCurrency(
  amount: number,
  locale: string = "vi-VN"
): string {
  // Always format as VND since this is Vietnam-only app
  if (amount >= 1000000000) {
    return (amount / 1000000000).toFixed(1) + "B VND";
  } else if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1) + "M VND";
  } else if (amount >= 1000) {
    return (amount / 1000).toFixed(1) + "K VND";
  }
  return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
}

export function formatCurrencyFull(
  amount: number,
  locale: string = "vi-VN"
): string {
  // Always format as VND since this is Vietnam-only app
  return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
}

// Number formatting utilities
export function formatNumber(num: number, locale: string = "vi-VN"): string {
  return new Intl.NumberFormat(locale).format(num);
}
