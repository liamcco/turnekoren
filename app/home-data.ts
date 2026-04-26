import { prisma } from "@/lib/prisma";
import { ScheduleEvent } from "@/generated/prisma/client";
import {
  formatFloatingDateKey,
  getCurrentFloatingDate,
} from "@/lib/floating-date";

export interface ScheduleSnapshot {
  now: Date;
  currentEvent: ScheduleEvent | null;
  nextEvent: ScheduleEvent | null;
  todayEvents: ScheduleEvent[];
  nextEventDayEvents: ScheduleEvent[];
}

const MEETUP_DURATION_MS = 15 * 60_000;

function getEventDisplayEnd(event: ScheduleEvent) {
  return event.endTime ?? new Date(event.startTime.getTime() + MEETUP_DURATION_MS);
}

export async function getScheduleSnapshot(): Promise<ScheduleSnapshot> {
  const events = await prisma.scheduleEvent.findMany({
    orderBy: { startTime: "asc" },
  });

  const now = getCurrentFloatingDate();

  const currentEvent = events.find(
    (event) => event.startTime <= now && getEventDisplayEnd(event) > now
  ) ?? null;

  const nextEvent = events.find((event) => event.startTime > now) ?? null;

  const isSameDay = (a: Date, b: Date) =>
    formatFloatingDateKey(a) === formatFloatingDateKey(b);

  const todayEvents = events.filter((event) =>
    isSameDay(event.startTime, now)
  );
  const nextEventDayKey = nextEvent ? formatFloatingDateKey(nextEvent.startTime) : null;
  const nextEventDayEvents =
    todayEvents.length === 0 && nextEventDayKey
      ? events.filter((event) => formatFloatingDateKey(event.startTime) === nextEventDayKey)
      : [];

  return {
    now,
    currentEvent,
    nextEvent,
    todayEvents,
    nextEventDayEvents,
  };
}
