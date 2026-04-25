import { ScheduleEvent } from "@/generated/prisma/client";
import { useMemo } from "react";
import { PositionedScheduleEvent, EventColumn, MAX_OVERLAPPING_EVENTS, HOUR_HEIGHT, MIN_EVENT_HEIGHT } from "./ScheduleEditor";
import { getDayStart, getDayEnd, getTimelineStartHour, hasTimeOverlap, getMinutesFromDayStart, formatTime } from "./utils";

function positionEvents(events: ScheduleEvent[], selectedDay: string): PositionedScheduleEvent[] {
  const dayStart = getDayStart(selectedDay);
  const dayEnd = getDayEnd(selectedDay);
  const timelineStartHour = getTimelineStartHour(events, selectedDay);
  const timelineStartMinutes = timelineStartHour * 60;
  const sortedEvents = [...events].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  );
  const positionedEvents: PositionedScheduleEvent[] = [];

  for (const event of sortedEvents) {
    const previousOverlappingEvents = positionedEvents.filter((previousEvent) =>
      hasTimeOverlap(previousEvent, event)
    );
    const usedColumns = previousOverlappingEvents.map(
      (previousEvent) => previousEvent.column
    );
    const column: EventColumn = usedColumns.includes(0) ? 1 : 0;

    const hasTooManyOverlaps = previousOverlappingEvents.length >= MAX_OVERLAPPING_EVENTS;
    const hasOverlap = sortedEvents.some(
      (otherEvent) => otherEvent.id !== event.id && hasTimeOverlap(otherEvent, event)
    );

    const visibleStartTime = event.startTime < dayStart ? dayStart : event.startTime;
    const visibleEndTime = event.endTime > dayEnd ? dayEnd : event.endTime;
    const startMinutes = getMinutesFromDayStart(visibleStartTime);
    const endMinutes = getMinutesFromDayStart(visibleEndTime);
    const durationMinutes = Math.max(endMinutes - startMinutes, 15);

    positionedEvents.push({
      ...event,
      column,
      top: ((startMinutes - timelineStartMinutes) / 60) * HOUR_HEIGHT,
      height: Math.max((durationMinutes / 60) * HOUR_HEIGHT, MIN_EVENT_HEIGHT),
      hasOverlap,
      hasTooManyOverlaps,
    });
  }

  return positionedEvents;
}

export function ScheduleTimeline({
  events,
  selectedDay,
  onSelectEvent,
}: {
  events: ScheduleEvent[];
  selectedDay: string;
  onSelectEvent: (event: ScheduleEvent) => void;
}) {
  const positionedEvents = useMemo(
    () => positionEvents(events, selectedDay),
    [events, selectedDay]
  );
  const timelineStartHour = getTimelineStartHour(events, selectedDay);
  const hours = Array.from(
    { length: 24 - timelineStartHour },
    (_, index) => timelineStartHour + index
  );

  return (
    <div className="relative grid grid-cols-[4rem_1fr] overflow-hidden rounded-lg border bg-background">
      <div>
        {hours.map((hour) => (
          <div
            key={hour}
            className="border-b px-3 pt-1 text-xs text-muted-foreground"
            style={{ height: HOUR_HEIGHT }}
          >
            {hour.toString().padStart(2, "0")}:00
          </div>
        ))}
      </div>

      <div className="relative">
        {hours.map((hour) => (
          <div
            key={hour}
            className="border-b border-l"
            style={{ height: HOUR_HEIGHT }}
          />
        ))}

        {positionedEvents.map((event) => (
          <button
            key={event.id}
            className={
              event.hasTooManyOverlaps
                ? "absolute rounded-md border border-destructive bg-destructive/10 p-2 text-left shadow-sm transition hover:bg-destructive/20"
                : "absolute rounded-md border bg-card p-2 text-left shadow-sm transition hover:bg-accent"
            }
            onClick={() => onSelectEvent(event)}
            style={{
              top: event.top + 2,
              height: event.height - 4,
              left: !event.hasOverlap
                ? "0.5rem"
                : event.column === 0
                  ? "0.5rem"
                  : "calc(50% + 0.25rem)",
              width: !event.hasOverlap ? "calc(100% - 1rem)" : "calc(50% - 0.75rem)",
            }}
            type="button"
          >
            <div className="truncate text-sm font-medium">{event.title}</div>
            <div className="truncate text-xs text-muted-foreground md:hidden">
              {event.location}
            </div>
            <div className="hidden truncate text-xs text-muted-foreground md:block">
              {formatTime(event.startTime)}-{formatTime(event.endTime)}
              {event.location ? ` • ${event.location}` : ""}
            </div>
            {event.hasTooManyOverlaps ? (
              <div className="hidden text-xs text-destructive md:block">
                More than two events overlap here.
              </div>
            ) : event.notes ? (
              <div className="hidden line-clamp-2 text-xs text-muted-foreground md:block">
                {event.notes}
              </div>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}