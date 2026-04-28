import { ScheduleEvent } from "@/generated/prisma/client";
import { useMemo } from "react";
import { getDayStart, getDayEnd, getTimelineStartHour, getMinutesFromDayStart, formatTime } from "../../app/accesstonepal/schedule/utils";

type EventColumn = 0 | 1;

type PositionedScheduleEvent = ScheduleEvent & {
  column: EventColumn;
  top: number;
  height: number;
  isPointInTime: boolean;
  displayEndTime: Date;
  hasOverlap: boolean;
  hasTooManyOverlaps: boolean;
};

const HOUR_HEIGHT = 72;
const MIN_EVENT_HEIGHT = 44;
const MAX_OVERLAPPING_EVENTS = 2;

const POINT_IN_TIME_EVENT_DURATION_MINUTES = 15;
const POINT_IN_TIME_EVENT_HEIGHT = 36;

function getEventEndTime(event: ScheduleEvent) {
  return event.endTime ?? event.startTime;
}

function getEventDisplayEndTime(event: ScheduleEvent) {
  return event.endTime ?? new Date(event.startTime.getTime() + POINT_IN_TIME_EVENT_DURATION_MINUTES * 60_000);
}

function hasScheduleOverlap(a: ScheduleEvent, b: ScheduleEvent) {
  return a.startTime < getEventDisplayEndTime(b) && b.startTime < getEventDisplayEndTime(a);
}

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
      hasScheduleOverlap(previousEvent, event)
    );
    const usedColumns = previousOverlappingEvents.map(
      (previousEvent) => previousEvent.column
    );
    const column: EventColumn = usedColumns.includes(0) ? 1 : 0;

    const hasTooManyOverlaps = previousOverlappingEvents.length >= MAX_OVERLAPPING_EVENTS;
    const hasOverlap = sortedEvents.some(
      (otherEvent) => otherEvent.id !== event.id && hasScheduleOverlap(otherEvent, event)
    );
    const isPointInTime = event.endTime === null;
    const displayEndTime = getEventDisplayEndTime(event);

    const visibleStartTime = event.startTime < dayStart ? dayStart : event.startTime;
    const visibleEndTime = displayEndTime > dayEnd ? dayEnd : displayEndTime;
    const startMinutes = getMinutesFromDayStart(visibleStartTime);
    const endMinutes = getMinutesFromDayStart(visibleEndTime);
    const durationMinutes = Math.max(endMinutes - startMinutes, 15);

    positionedEvents.push({
      ...event,
      column,
      top: ((startMinutes - timelineStartMinutes) / 60) * HOUR_HEIGHT,
      height: isPointInTime
        ? POINT_IN_TIME_EVENT_HEIGHT
        : Math.max((durationMinutes / 60) * HOUR_HEIGHT, MIN_EVENT_HEIGHT),
      isPointInTime,
      displayEndTime,
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
                : event.isPointInTime
                  ? "absolute flex items-center gap-2 overflow-hidden rounded-full border-2 border-primary bg-primary/10 px-3 py-2 text-left shadow-sm transition hover:bg-primary/20"
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
            {event.isPointInTime ? (
              <>
                <div className="shrink-0 text-xs font-medium text-muted-foreground">
                  {formatTime(event.startTime)}
                </div>
                <div className="min-w-0 flex-1 truncate text-sm font-medium">
                  {event.title}
                </div>
                {event.location ? (
                  <div className="hidden shrink-0 truncate text-xs text-muted-foreground md:block">
                    {event.location}
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <div className="truncate text-sm font-medium">{event.title}</div>
                <div className="truncate text-xs text-muted-foreground md:hidden">
                  {event.location}
                </div>
                <div className="hidden truncate text-xs text-muted-foreground md:block">
                  {formatTime(event.startTime)}-{formatTime(event.displayEndTime)}
                  {event.location ? ` • ${event.location}` : ""}
                </div>
                {event.hasTooManyOverlaps ? (
                  <div className="hidden text-xs text-destructive md:block">
                    Fler än två programpunkter överlappar här.
                  </div>
                ) : event.notes ? (
                  <div className="hidden line-clamp-2 text-xs text-muted-foreground md:block">
                    {event.notes}
                  </div>
                ) : null}
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
