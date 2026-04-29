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
import { getCurrentFloatingDate } from "@/lib/floating-date";

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
    return eventDays.length > 0 ? eventDays : [formatDateKey(getCurrentFloatingDate())];
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
    router.replace(`/accesstonepal/schedule?day=${day}`, { scroll: false });
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Schema</CardTitle>
            <CardDescription>
              Visa resans schema dag för dag. Tryck på en programpunkt för att redigera den.
            </CardDescription>
          </div>

          {hasEvents ? (
            <Button
              aria-label="Skapa schemapunkt"
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
                <h3 className="text-lg font-medium">Inga schemapunkter ännu</h3>
                <p className="text-sm text-muted-foreground">
                  Skapa den första schemapunkten för att börja bygga schemat.
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
                Skapa din första schemapunkt
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
