import {
  formatFloatingFullDayLabel,
  formatFloatingNow,
  formatFloatingTime,
} from "@/lib/floating-date";

export function formatDateTime(value: string): string {
  const date = new Date(value);
  const day = formatFloatingFullDayLabel(value.slice(0, 10));

  return `${day} • ${formatFloatingTime(date)}`;
}

export function formatDate(value: string): string {
  return formatFloatingFullDayLabel(value.slice(0, 10));
}

export function formatTime(value: string): string {
  return formatFloatingTime(new Date(value));
}

export function formatNow(value: Date): string {
  return formatFloatingNow(value);
}

export const sekFormatter = new Intl.NumberFormat("sv-SE", {
  style: "currency",
  currency: "SEK",
  maximumFractionDigits: 2,
});

export const euroFormatter = new Intl.NumberFormat("fi-FI", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});
