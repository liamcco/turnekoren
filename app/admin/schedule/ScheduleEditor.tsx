"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { ScheduleEvent } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ScheduleEventActionState,
} from "./actions";
import { formatDateKey, getInitialSelectedDay, groupEventsByDay } from "./utils";
import { EventEditorDialog } from "./EventEditorDialog";
import { ScheduleTimeline } from "../../../components/schedule/ScheduleTimeline";
import { DaySelector } from "./Selectors";

export const initialActionState: ScheduleEventActionState = {
  ok: false,
  message: "",
};

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
