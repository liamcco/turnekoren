const DATE_TIME_LOCAL_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;
const DATE_LOCAL_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SHORT_MONTH_LABELS = MONTH_LABELS.map((month) => month.slice(0, 3));
const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function parseNumber(value: string) {
  return Number.parseInt(value, 10);
}

function isValidUtcDate(date: Date, year: number, month: number, day: number) {
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function parseFloatingDateTime(value: string) {
  const match = DATE_TIME_LOCAL_PATTERN.exec(value.trim());
  if (!match) {
    return null;
  }

  const [, yearValue, monthValue, dayValue, hourValue, minuteValue, secondValue] =
    match;
  const year = parseNumber(yearValue);
  const month = parseNumber(monthValue);
  const day = parseNumber(dayValue);
  const hour = parseNumber(hourValue);
  const minute = parseNumber(minuteValue);
  const second = secondValue ? parseNumber(secondValue) : 0;

  const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));

  if (
    !isValidUtcDate(date, year, month, day) ||
    date.getUTCHours() !== hour ||
    date.getUTCMinutes() !== minute ||
    date.getUTCSeconds() !== second
  ) {
    return null;
  }

  return date;
}

export function parseFloatingDate(value: string) {
  const match = DATE_LOCAL_PATTERN.exec(value.trim());
  if (!match) {
    return null;
  }

  const [, yearValue, monthValue, dayValue] = match;
  const year = parseNumber(yearValue);
  const month = parseNumber(monthValue);
  const day = parseNumber(dayValue);
  const date = new Date(Date.UTC(year, month - 1, day));

  return isValidUtcDate(date, year, month, day) ? date : null;
}

export function parseFloatingDateInput(value: string) {
  return value.includes("T")
    ? parseFloatingDateTime(value)
    : parseFloatingDate(value);
}

export function addFloatingDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

export function addFloatingHours(date: Date, hours: number) {
  const nextDate = new Date(date);
  nextDate.setUTCHours(nextDate.getUTCHours() + hours);
  return nextDate;
}

export function formatFloatingDateKey(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatFloatingDateInput(date: Date) {
  return formatFloatingDateKey(date);
}

export function formatFloatingDateTimeInput(date: Date) {
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${formatFloatingDateKey(date)}T${hours}:${minutes}`;
}

export function formatFloatingTime(date: Date) {
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function getFloatingMinutesFromDayStart(date: Date) {
  return date.getUTCHours() * 60 + date.getUTCMinutes();
}

export function getFloatingDayStart(dayKey: string) {
  return parseFloatingDate(dayKey);
}

export function getFloatingDayEnd(dayKey: string) {
  const dayStart = getFloatingDayStart(dayKey);
  if (!dayStart) {
    return null;
  }

  return new Date(dayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
}

export function formatFloatingFullDayLabel(dayKey: string) {
  const date = parseFloatingDate(dayKey);
  if (!date) {
    return dayKey;
  }

  const weekday = WEEKDAY_LABELS[date.getUTCDay()];
  const month = MONTH_LABELS[date.getUTCMonth()];

  return `${weekday} ${month} ${date.getUTCDate()}`;
}

export function formatFloatingShortDate(date: Date) {
  const month = SHORT_MONTH_LABELS[date.getUTCMonth()];

  return `${month} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

export function formatFloatingNow(date: Date) {
  const weekday = WEEKDAY_LABELS[date.getUTCDay()];
  const month = MONTH_LABELS[date.getUTCMonth()];
  const day = date.getUTCDate();
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${weekday} ${day} ${month} • ${hours}:${minutes}`;
}

export function getCurrentFloatingDate() {
  const now = new Date();

  return new Date(
    Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds()
    )
  );
}
