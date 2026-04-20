import { DateTime } from "luxon";
import { TRIP_LOCALE, TRIP_TIMEZONE } from "./constants";

export function formatDateTime(value) {
  return DateTime.fromISO(value, { zone: TRIP_TIMEZONE })
    .setLocale(TRIP_LOCALE)
    .toFormat("ccc d LLL • HH:mm");
}

export function formatDate(value) {
  return DateTime.fromISO(value, { zone: TRIP_TIMEZONE })
    .setLocale(TRIP_LOCALE)
    .toFormat("cccc d LLLL");
}

export function formatTime(value) {
  return DateTime.fromISO(value, { zone: TRIP_TIMEZONE })
    .setLocale(TRIP_LOCALE)
    .toFormat("HH:mm");
}

export function formatNow(value) {
  return value.setLocale(TRIP_LOCALE).toFormat("cccc d LLLL • HH:mm");
}
