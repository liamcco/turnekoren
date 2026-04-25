"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { ScheduleEvent } from "@/generated/prisma/browser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createScheduleEventAction,
  deleteScheduleEventAction,
  ScheduleEventActionState,
  updateScheduleEventAction,
} from "./admin-data";
import { formatDateKey, getInitialSelectedDay, groupEventsByDay, wouldExceedMaxOverlaps } from "./utils";

const HOUR_HEIGHT = 72;
const MIN_EVENT_HEIGHT = 44;
const MAX_OVERLAPPING_EVENTS = 2;

const initialActionState: ScheduleEventActionState = {
  ok: false,
  message: "",
};

type EventColumn = 0 | 1;

type PositionedScheduleEvent = ScheduleEvent & {
  column: EventColumn;
  top: number;
  height: number;
  hasOverlap: boolean;
  hasTooManyOverlaps: boolean;
};

function formatFullDayLabel(dayKey: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(`${dayKey}T00:00:00`));
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function toDateTimeLocalValue(value: Date) {
  const offset = value.getTimezoneOffset();
  const localDate = new Date(value.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function getMinutesFromDayStart(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

function getTimelineStartHour(events: ScheduleEvent[], selectedDay: string) {
  const dayStart = getDayStart(selectedDay);
  const hasEventsBeforeEight = events.some((event) => event.startTime < addHours(dayStart, 8));

  return hasEventsBeforeEight ? 0 : 8;
}

function addHours(date: Date, hours: number) {
  const nextDate = new Date(date);
  nextDate.setHours(nextDate.getHours() + hours);
  return nextDate;
}

function getDayStart(dayKey: string) {
  return new Date(`${dayKey}T00:00:00`);
}

function getDayEnd(dayKey: string) {
  return new Date(`${dayKey}T23:59:59.999`);
}

function hasTimeOverlap(a: ScheduleEvent, b: ScheduleEvent) {
  return a.startTime < b.endTime && b.startTime < a.endTime;
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

function DaySelector({
  days,
  selectedDay,
  onSelectDay,
}: {
  days: string[];
  selectedDay: string;
  onSelectDay: (day: string) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="w-fit justify-start gap-2" type="button" variant="outline">
          <CalendarDays className="size-4" />
          {formatFullDayLabel(selectedDay)}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="grid w-64 gap-2 p-2">
        {days.map((dayKey) => {
          const isSelected = dayKey === selectedDay;

          return (
            <Button
              key={dayKey}
              className="justify-start"
              onClick={() => onSelectDay(dayKey)}
              type="button"
              variant={isSelected ? "default" : "ghost"}
            >
              {formatFullDayLabel(dayKey)}
            </Button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

function ScheduleTimeline({
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
              {formatTime(event.startTime)}–{formatTime(event.endTime)}
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

function EventEditorDialog({
  event,
  selectedDay,
  events,
  onClose,
}: {
  event: ScheduleEvent | null;
  selectedDay: string;
  events: ScheduleEvent[];
  onClose: () => void;
}) {
  const router = useRouter();
  const isCreating = event === null;
  const [state, setState] = useState(initialActionState);
  const [deleteState, setDeleteState] = useState(initialActionState);
  const [isPending, startSaveTransition] = useTransition();
  const [isDeletingPending, startDeleteTransition] = useTransition();
  const formAction = async (formData: FormData) => {
    startSaveTransition(async () => {
      const nextState = isCreating
        ? await createScheduleEventAction(initialActionState, formData)
        : await updateScheduleEventAction(initialActionState, formData);

      setState(nextState);
      if (!nextState.ok) {
        return;
      }

      const formStartTimeValue = formData.get("startTime");
      const nextDay =
        typeof formStartTimeValue === "string"
          ? formatDateKey(new Date(formStartTimeValue))
          : selectedDay;

      router.replace(`/admin/schedule?day=${nextDay}`, { scroll: false });
      router.refresh();
      onClose();
    });
  };

  const deleteFormAction = async (formData: FormData) => {
    startDeleteTransition(async () => {
      const nextState = await deleteScheduleEventAction(initialActionState, formData);
      setDeleteState(nextState);
      if (!nextState.ok) {
        return;
      }

      router.replace(`/admin/schedule?day=${selectedDay}`, { scroll: false });
      router.refresh();
      onClose();
    });
  };

  const defaultStartTime = event?.startTime ?? new Date(`${selectedDay}T09:00:00`);
  const defaultEndTime = event?.endTime ?? new Date(`${selectedDay}T10:00:00`);

  const [startTimeValue, setStartTimeValue] = useState(
    toDateTimeLocalValue(defaultStartTime)
  );
  const [endTimeValue, setEndTimeValue] = useState(
    toDateTimeLocalValue(defaultEndTime)
  );

  const proposedStartTime = new Date(startTimeValue);
  const proposedEndTime = new Date(endTimeValue);
  const hasValidDraftTimes =
    !Number.isNaN(proposedStartTime.getTime()) &&
    !Number.isNaN(proposedEndTime.getTime()) &&
    proposedEndTime > proposedStartTime;
  const exceedsOverlapLimit =
    hasValidDraftTimes &&
    wouldExceedMaxOverlaps({
      events,
      startTime: proposedStartTime,
      endTime: proposedEndTime,
      ignoredEventId: event?.id,
    });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isCreating ? "Create event" : "Edit event"}</DialogTitle>
          <DialogDescription>
            {isCreating
              ? "Add a new item to the trip schedule."
              : "Update this schedule item."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="grid gap-4">
          {!isCreating ? <input name="id" type="hidden" value={event.id} /> : null}

          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={event?.title ?? ""}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="startTime">Start</Label>
              <Input
                id="startTime"
                name="startTime"
                value={startTimeValue}
                onChange={(nextEvent) => setStartTimeValue(nextEvent.target.value)}
                required
                type="datetime-local"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="endTime">End</Label>
              <Input
                id="endTime"
                name="endTime"
                value={endTimeValue}
                onChange={(nextEvent) => setEndTimeValue(nextEvent.target.value)}
                required
                type="datetime-local"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              defaultValue={event?.location ?? ""}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" defaultValue={event?.notes ?? ""} />
          </div>

          {state.message ? (
            <p className={state.ok ? "text-sm text-green-600" : "text-sm text-destructive"}>
              {state.message}
            </p>
          ) : null}

          {exceedsOverlapLimit ? (
            <p className="text-sm text-destructive">
              This would create more than two overlapping events. Move the event or shorten it before saving.
            </p>
          ) : null}

          {!isCreating && deleteState.message ? (
            <p className={deleteState.ok ? "text-sm text-green-600" : "text-sm text-destructive"}>
              {deleteState.message}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-between gap-2">
            {!isCreating ? (
              <Button
                form="delete-schedule-event-form"
                disabled={isPending || isDeletingPending}
                type="submit"
                variant="destructive"
              >
                <Trash2 className="size-4" />
                {isDeletingPending ? "Deleting..." : "Delete"}
              </Button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <Button disabled={isPending || isDeletingPending} onClick={onClose} type="button" variant="outline">
                Cancel
              </Button>
              <Button disabled={isPending || isDeletingPending || exceedsOverlapLimit} type="submit">
                {isPending ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </form>

        {!isCreating ? (
          <form id="delete-schedule-event-form" action={deleteFormAction}>
            <input name="id" type="hidden" value={event.id} />
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

interface ScheduleEditorProps {
  events: ScheduleEvent[];
  initialSelectedDay: string;
}

export function ScheduleEditor({ events, initialSelectedDay }: ScheduleEditorProps) {
  const router = useRouter();
  const eventsByDay = useMemo(() => groupEventsByDay(events), [events]);
  const days = useMemo(() => {
    const eventDays = Object.keys(eventsByDay).sort();
    return eventDays.length > 0 ? eventDays : [formatDateKey(new Date())];
  }, [eventsByDay]);

  const [selectedDay, setSelectedDay] = useState(
    days.includes(initialSelectedDay) ? initialSelectedDay : getInitialSelectedDay(events)
  );
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null | undefined>(undefined);
  const [hasDismissedInitialCreate, setHasDismissedInitialCreate] = useState(false);
  const selectedDayEvents = eventsByDay[selectedDay] ?? [];
  const hasEvents = events.length > 0;

  function handleSelectDay(day: string) {
    setSelectedDay(day);
    router.replace(`/admin/schedule?day=${day}`, { scroll: false });
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>
              View the trip schedule day by day. Tap an event to edit it.
            </CardDescription>
          </div>

          {hasEvents ? (
            <Button
              aria-label="Create event"
              onClick={() => setSelectedEvent(null)}
              size="icon"
              type="button"
            >
              <Plus className="size-4" />
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="grid gap-4">
          {hasEvents ? (
            <>
              <DaySelector
                days={days}
                selectedDay={selectedDay}
                onSelectDay={handleSelectDay}
              />

              <ScheduleTimeline
                events={selectedDayEvents}
                selectedDay={selectedDay}
                onSelectEvent={(event) => setSelectedEvent(event)}
              />
            </>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center">
              <div>
                <h3 className="text-lg font-medium">No events yet</h3>
                <p className="text-sm text-muted-foreground">
                  Create your first event to start building the schedule.
                </p>
              </div>

              <Button
                onClick={() => {
                  setHasDismissedInitialCreate(false);
                  setSelectedEvent(null);
                }}
                type="button"
              >
                <Plus className="size-4" />
                Create your first event
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {(selectedEvent !== undefined || (!hasEvents && !hasDismissedInitialCreate)) ? (
        <EventEditorDialog
          event={selectedEvent ?? null}
          selectedDay={selectedDay}
          events={events}
          onClose={() => {
            if (!hasEvents) {
              setHasDismissedInitialCreate(true);
            }

            setSelectedEvent(undefined);
          }}
        />
      ) : null}
    </div>
  );
}
