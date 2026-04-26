"use client"

import { ScheduleEvent } from "@/generated/prisma/client";
import { formatDateKey, getInitialSelectedDay, groupEventsByDay } from "../accesstonepal/schedule/utils";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScheduleTimeline } from "@/components/schedule/ScheduleTimeline";
import { DaySelector } from "../accesstonepal/schedule/Selectors";
import { getCurrentFloatingDate } from "@/lib/floating-date";

interface ScheduleProps {
  events: ScheduleEvent[];
  initialSelectedDay: string;
}

export function ScheduleView({ events, initialSelectedDay }: ScheduleProps) {
  const router = useRouter();
  const eventsByDay = useMemo(() => groupEventsByDay(events), [events]);
  const days = useMemo(() => {
    const eventDays = Object.keys(eventsByDay).sort();
    return eventDays.length > 0 ? eventDays : [formatDateKey(getCurrentFloatingDate())];
  }, [eventsByDay]);

  const [selectedDay, setSelectedDay] = useState(
    days.includes(initialSelectedDay) ? initialSelectedDay : getInitialSelectedDay(events)
  );
  const selectedDayEvents = eventsByDay[selectedDay] ?? [];

  function handleSelectDay(day: string) {
    setSelectedDay(day);
    router.replace(`/schedule?day=${day}`, { scroll: false });
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>
              View the trip schedule day by day.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
              <DaySelector
                days={days}
                selectedDay={selectedDay}
                onSelectDay={handleSelectDay}
              />

              <ScheduleTimeline
                events={selectedDayEvents}
                selectedDay={selectedDay}
                onSelectEvent={() => {}}
              />
        </CardContent>
      </Card>
    </div>
  );
}
