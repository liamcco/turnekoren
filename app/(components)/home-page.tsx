import type { ScheduleSnapshot } from "@/app/home-data";
import { HomeHero } from "@/app/(components)/home-hero";
import { HomeScheduleCard } from "@/app/(components)/home-schedule-card";
import { HomeStatusSection } from "@/app/(components)/home-status-section";
import {
  differenceInFloatingCalendarDays,
  formatFloatingShortDate,
} from "@/lib/floating-date";

interface HomePageProps {
  snapshot: ScheduleSnapshot;
}

export function HomePage({ snapshot }: HomePageProps) {
  const { currentEvent, nextEvent, now, todayEvents, nextEventDayEvents } = snapshot;
  const isShowingToday = todayEvents.length > 0;
  const visibleEvents = isShowingToday ? todayEvents : nextEventDayEvents;
  const visibleDay = visibleEvents[0]?.startTime ?? now;
  const daysUntilVisibleDay = differenceInFloatingCalendarDays(visibleDay, now);
  const dayLabel =
    daysUntilVisibleDay === 0
      ? "Today"
      : daysUntilVisibleDay === 1
        ? "Tomorrow"
        : formatFloatingShortDate(visibleDay);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <HomeHero />
      <HomeStatusSection currentEvent={currentEvent} nextEvent={nextEvent} now={now} />
      <HomeScheduleCard
        currentEventId={isShowingToday ? currentEvent?.id ?? null : null}
        dayLabel={dayLabel}
        events={visibleEvents}
      />
    </main>
  );
}
