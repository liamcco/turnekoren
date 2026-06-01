"use client"

import { ScheduleEvent } from "@/generated/prisma/client";
import { groupEventsByDay } from "../admin/schedule/utils";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WeekTimeline } from "@/components/schedule/WeekTimeline";
import { addFloatingDays, formatFloatingDateKey, parseFloatingDate } from "@/lib/floating-date";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
} from "lucide-react";

const MONTHS = ["Jan","Feb","Mar","Apr","Maj","Jun","Jul","Aug","Sep","Okt","Nov","Dec"];
const CALENDAR_FEED_PATH = "/api/schedule/ical.ics";
const INITIAL_CALENDAR_LINKS = {
  canOpenInCalendar: false,
  feedUrl: CALENDAR_FEED_PATH,
  subscribeUrl: CALENDAR_FEED_PATH,
};

function isLocalHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "[::1]";
}

function getCalendarLinks(baseUrl: string) {
  const feedUrl = new URL(CALENDAR_FEED_PATH, baseUrl);
  const canOpenInCalendar = feedUrl.protocol === "https:" && !isLocalHost(feedUrl.hostname);
  const subscribeUrl = canOpenInCalendar
    ? feedUrl.toString().replace(/^https:/, "webcal:")
    : feedUrl.toString();

  return {
    canOpenInCalendar,
    feedUrl: feedUrl.toString(),
    subscribeUrl,
  };
}

function getWeekStart(dayKey: string): string {
  const date = parseFloatingDate(dayKey);
  if (!date) return dayKey;
  const daysFromMonday = (date.getUTCDay() + 6) % 7;
  const monday = new Date(date);
  monday.setUTCDate(monday.getUTCDate() - daysFromMonday);
  return formatFloatingDateKey(monday);
}

function getWeekDays(weekStart: string): string[] {
  const start = parseFloatingDate(weekStart);
  if (!start) return [];
  return Array.from({ length: 7 }, (_, i) =>
    formatFloatingDateKey(addFloatingDays(start, i))
  );
}

function formatWeekLabel(weekStart: string): string {
  const start = parseFloatingDate(weekStart);
  if (!start) return weekStart;
  const end = addFloatingDays(start, 6);
  const sm = MONTHS[start.getUTCMonth()];
  const em = MONTHS[end.getUTCMonth()];
  if (start.getUTCMonth() === end.getUTCMonth()) {
    return `${sm} ${start.getUTCDate()} \u2013 ${end.getUTCDate()}`;
  }
  return `${sm} ${start.getUTCDate()} \u2013 ${em} ${end.getUTCDate()}`;
}

interface ScheduleProps {
  events: ScheduleEvent[];
  initialSelectedDay: string;
}

export function ScheduleView({ events, initialSelectedDay }: ScheduleProps) {
  const router = useRouter();
  const [calendarLinks, setCalendarLinks] = useState(INITIAL_CALENDAR_LINKS);
  const [copyLabel, setCopyLabel] = useState("Kopiera");
  const eventsByDay = useMemo(() => groupEventsByDay(events), [events]);
  const allDays = useMemo(() => Object.keys(eventsByDay).sort(), [eventsByDay]);

  const [weekStart, setWeekStart] = useState(() => getWeekStart(initialSelectedDay));
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);

  const firstEventWeekStart = allDays.length > 0 ? getWeekStart(allDays[0]) : weekStart;
  const lastEventWeekStart = allDays.length > 0 ? getWeekStart(allDays[allDays.length - 1]) : weekStart;

  const canGoPrev = weekStart > firstEventWeekStart;
  const canGoNext = weekStart < lastEventWeekStart;

  useEffect(() => {
    setCalendarLinks(getCalendarLinks(window.location.href));
  }, []);

  function refreshCalendarLinks() {
    setCalendarLinks(getCalendarLinks(window.location.href));
  }

  useEffect(() => {
    if (copyLabel === "Kopiera") return;

    const timeoutId = window.setTimeout(() => setCopyLabel("Kopiera"), 2000);
    return () => window.clearTimeout(timeoutId);
  }, [copyLabel]);

  async function handleCopyCalendarUrl() {
    try {
      await navigator.clipboard.writeText(calendarLinks.feedUrl);
      setCopyLabel("Kopierad");
    } catch {
      setCopyLabel("Kunde inte kopiera");
    }
  }

  function handlePrevWeek() {
    const start = parseFloatingDate(weekStart);
    if (!start) return;
    const newStart = formatFloatingDateKey(addFloatingDays(start, -7));
    setWeekStart(newStart);
    router.replace(`/schedule?week=${newStart}`, { scroll: false });
  }

  function handleNextWeek() {
    const start = parseFloatingDate(weekStart);
    if (!start) return;
    const newStart = formatFloatingDateKey(addFloatingDays(start, 7));
    setWeekStart(newStart);
    router.replace(`/schedule?week=${newStart}`, { scroll: false });
  }

  return (
    <div className="grid gap-6 max-md:flex max-md:flex-col max-md:h-full">
      <Card className="max-md:flex-1 max-md:min-h-0">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Schema</CardTitle>
            <CardDescription className="hidden md:block">Visa resans schema dag för dag.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Popover
              onOpenChange={(open) => {
                if (open) refreshCalendarLinks();
              }}
            >
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" type="button">
                  <CalendarPlus className="size-3.5" />
                  Prenumerera
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[calc(100vw-2rem)] max-w-80">
                <PopoverHeader>
                  <PopoverTitle>Kalenderfeed</PopoverTitle>
                </PopoverHeader>
                <div className="grid gap-2">
                  {calendarLinks.canOpenInCalendar ? (
                    <Button asChild className="justify-start" variant="outline">
                      <a href={calendarLinks.subscribeUrl}>
                        <CalendarPlus className="size-4" />
                        Öppna i kalender
                      </a>
                    </Button>
                  ) : (
                    <Button className="justify-start" disabled type="button" variant="outline">
                      <CalendarPlus className="size-4" />
                      Öppna i kalender
                    </Button>
                  )}
                  <Button asChild className="justify-start" variant="outline">
                    <a download="schedule.ics" href={calendarLinks.feedUrl} type="text/calendar">
                      <Download className="size-4" />
                      Ladda ner .ics
                    </a>
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Input
                    aria-label="Kalenderfeed"
                    className="font-mono text-xs"
                    onFocus={(event) => event.currentTarget.select()}
                    readOnly
                    value={calendarLinks.feedUrl}
                  />
                  <Button
                    aria-label={copyLabel}
                    onClick={handleCopyCalendarUrl}
                    type="button"
                    variant="outline"
                  >
                    <Copy className="size-4" />
                    {copyLabel}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevWeek}
              disabled={!canGoPrev}
              type="button"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-32 text-center text-sm text-muted-foreground">
              {formatWeekLabel(weekStart)}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextWeek}
              disabled={!canGoNext}
              type="button"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="max-md:flex-1 max-md:min-h-0 max-md:overflow-hidden">
          <WeekTimeline eventsByDay={eventsByDay} weekDays={weekDays} />
        </CardContent>
      </Card>
    </div>
  );
}
