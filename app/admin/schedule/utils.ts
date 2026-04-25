import { ScheduleEvent } from "@/generated/prisma/client";

function getEventEffectiveEnd(event: ScheduleEvent) {
  return event.endTime ?? event.startTime;
}

function getEventDisplayEnd(event: ScheduleEvent) {
  return event.endTime ?? new Date(event.startTime.getTime() + 15 * 60_000);
}

export function isValidDayKey(value: string | undefined): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function wouldExceedMaxOverlaps({
  events,
  startTime,
  endTime,
  ignoredEventId,
}: {
  events: ScheduleEvent[];
  startTime: Date;
  endTime: Date | null;
  ignoredEventId?: number;
}) {
  const proposedEvent = {
    id: ignoredEventId ?? -1,
    title: "Proposed event",
    startTime,
    endTime,
    location: "",
    notes: null,
  } as ScheduleEvent;

  const relevantEvents = events.filter((event) => event.id !== ignoredEventId);
  const overlappingEvents = relevantEvents.filter((event) =>
    hasTimeOverlap(event, proposedEvent)
  );

  return overlappingEvents.length >= 2;
}

export function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function getDayStart(dayKey: string) {
  return new Date(`${dayKey}T00:00:00`);
}

export function getDayEnd(dayKey: string) {
  return new Date(`${dayKey}T23:59:59.999`);
}

export function getEventDayKeys(event: ScheduleEvent) {
  const dayKeys: string[] = [];
  let cursor = new Date(event.startTime);
  cursor.setHours(0, 0, 0, 0);

  const lastDay = new Date(getEventEffectiveEnd(event));
  lastDay.setHours(0, 0, 0, 0);

  while (cursor <= lastDay) {
    const dayKey = formatDateKey(cursor);

    const eventEnd = getEventEffectiveEnd(event);
    if (event.startTime <= getDayEnd(dayKey) && eventEnd >= getDayStart(dayKey)) {
      dayKeys.push(dayKey);
    }

    cursor = addDays(cursor, 1);
  }

  return dayKeys;
}

export function groupEventsByDay(events: ScheduleEvent[]) {
  return events.reduce<Record<string, ScheduleEvent[]>>((acc, event) => {
    for (const dayKey of getEventDayKeys(event)) {
      acc[dayKey] = [...(acc[dayKey] ?? []), event];
    }

    return acc;
  }, {});
}

export function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getInitialSelectedDay(events: ScheduleEvent[]) {
  const todayKey = formatDateKey(new Date());
  const days = Object.keys(groupEventsByDay(events)).sort();

  if (days.includes(todayKey)) {
    return todayKey;
  }

  const futureDay = days.find((day) => day > todayKey);
  if (futureDay) {
    return futureDay;
  }

  return days.at(-1) ?? todayKey;
}

export function formatFullDayLabel(dayKey: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(`${dayKey}T00:00:00`));
}

export function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function toDateTimeLocalValue(value: Date) {
  const offset = value.getTimezoneOffset();
  const localDate = new Date(value.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

export function getMinutesFromDayStart(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

export function getTimelineStartHour(events: ScheduleEvent[], selectedDay: string) {
  const dayStart = getDayStart(selectedDay);
  const hasEventsBeforeEight = events.some((event) => event.startTime < addHours(dayStart, 8));

  return hasEventsBeforeEight ? 0 : 8;
}

export function addHours(date: Date, hours: number) {
  const nextDate = new Date(date);
  nextDate.setHours(nextDate.getHours() + hours);
  return nextDate;
}

export function hasTimeOverlap(a: ScheduleEvent, b: ScheduleEvent) {
  const aEnd = a.endTime ?? new Date(a.startTime.getTime() + 15 * 60_000);
  const bEnd = b.endTime ?? new Date(b.startTime.getTime() + 15 * 60_000);

  return a.startTime < bEnd && b.startTime < aEnd;
}