import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatCurrencyPerMonth(value: number) {
  return `${formatCurrency(value)}/mo`;
}

export function formatCurrencyPerYear(value: number) {
  return `${formatCurrency(value)}/yr`;
}
