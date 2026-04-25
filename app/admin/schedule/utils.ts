import { ScheduleEvent } from "@/generated/prisma/client";

function hasTimeOverlap(a: ScheduleEvent, b: ScheduleEvent) {
  return a.startTime < b.endTime && b.startTime < a.endTime;
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
  endTime: Date;
  ignoredEventId?: number;
}) {
  const proposedEvent = {
    id: ignoredEventId ?? -1,
    title: "Proposed event",
    startTime,
    endTime,
    location: "",
    notes: null,
  } satisfies ScheduleEvent;

  const relevantEvents = events.filter((event) => event.id !== ignoredEventId);
  const overlappingEvents = relevantEvents.filter((event) =>
    hasTimeOverlap(event, proposedEvent)
  );

  return overlappingEvents.length >= 2;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function getDayStart(dayKey: string) {
  return new Date(`${dayKey}T00:00:00`);
}

function getDayEnd(dayKey: string) {
  return new Date(`${dayKey}T23:59:59.999`);
}

function getEventDayKeys(event: ScheduleEvent) {
  const dayKeys: string[] = [];
  let cursor = new Date(event.startTime);
  cursor.setHours(0, 0, 0, 0);

  const lastDay = new Date(event.endTime);
  lastDay.setHours(0, 0, 0, 0);

  while (cursor <= lastDay) {
    const dayKey = formatDateKey(cursor);

    if (event.startTime <= getDayEnd(dayKey) && event.endTime >= getDayStart(dayKey)) {
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