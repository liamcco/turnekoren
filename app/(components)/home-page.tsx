import type { ScheduleSnapshot } from "@/app/home-data";
import { HomeHero } from "@/app/(components)/home-hero";
import { HomeScheduleCard } from "@/app/(components)/home-schedule-card";
import { HomeStatusSection } from "@/app/(components)/home-status-section";

interface HomePageProps {
  snapshot: ScheduleSnapshot;
}

export function HomePage({ snapshot }: HomePageProps) {
  const { currentEvent, nextEvent, now, todayEvents, upcomingEvents } = snapshot;
  const visibleEvents = todayEvents.length ? todayEvents : upcomingEvents;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <HomeHero />
      <HomeStatusSection currentEvent={currentEvent} nextEvent={nextEvent} now={now} />
      <HomeScheduleCard currentEventId={currentEvent?.id ?? null} events={visibleEvents} />
    </main>
  );
}
