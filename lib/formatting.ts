import { DateTime } from "luxon";
import { TRIP_LOCALE, TRIP_TIMEZONE } from "@/lib/constants";

export function formatDateTime(value: string): string {
  return DateTime.fromISO(value, { zone: TRIP_TIMEZONE })
    .setLocale(TRIP_LOCALE)
    .toFormat("ccc d LLL • HH:mm");
}

export function formatDate(value: string): string {
  return DateTime.fromISO(value, { zone: TRIP_TIMEZONE })
    .setLocale(TRIP_LOCALE)
    .toFormat("cccc d LLLL");
}

export function formatTime(value: string): string {
  return DateTime.fromISO(value, { zone: TRIP_TIMEZONE })
    .setLocale(TRIP_LOCALE)
    .toFormat("HH:mm");
}

export function formatNow(value: Date): string {
  const formatter = new Intl.DateTimeFormat(TRIP_LOCALE, {
    timeZone: TRIP_TIMEZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(value);

  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";

  return `${get("weekday")} ${get("day")} ${get("month")} • ${get("hour")}:${get("minute")}`;
}
