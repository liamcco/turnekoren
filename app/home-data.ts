import { prisma } from "@/lib/prisma";
import { ScheduleEvent } from "@/generated/prisma/client";

export interface ScheduleSnapshot {
  now: Date;
  currentEvent: ScheduleEvent | null;
  nextEvent: ScheduleEvent | null;
  todayEvents: ScheduleEvent[];
  upcomingEvents: ScheduleEvent[];
}

export async function getScheduleSnapshot(): Promise<ScheduleSnapshot> {
  const events = await prisma.scheduleEvent.findMany({
    orderBy: { startTime: "asc" },
  });

  const now = new Date();

  const currentEvent = events.find(
    (event) => event.startTime <= now && event.endTime > now
  ) ?? null;

  const nextEvent = events.find((event) => event.startTime > now) ?? null;

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const todayEvents = events.filter((event) =>
    isSameDay(event.startTime, now)
  );

  return {
    now,
    currentEvent,
    nextEvent,
    todayEvents,
    upcomingEvents: events.filter((event) => event.endTime > now).slice(0, 5),
  };
}
