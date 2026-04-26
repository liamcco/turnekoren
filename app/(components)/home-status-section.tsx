import { CurrentEventCard } from "@/app/(components)/current-event-card";
import { NextEventCard } from "@/app/(components)/next-event-card";
import { ScheduleEvent } from "@/generated/prisma/client";

interface HomeStatusSectionProps {
  currentEvent: ScheduleEvent | null;
  nextEvent: ScheduleEvent | null;
  now: Date;
}

export function HomeStatusSection({ currentEvent, nextEvent, now }: HomeStatusSectionProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <CurrentEventCard currentEvent={currentEvent} now={now} />
      <NextEventCard nextEvent={nextEvent} now={now} />
    </section>
  );
}
