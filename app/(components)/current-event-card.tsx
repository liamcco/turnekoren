import type { ScheduleSnapshot } from "@/app/home-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScheduleEvent } from "@/generated/prisma/client";
import { formatFloatingTime } from "@/lib/floating-date";
import { formatNow } from "@/lib/formatting";

interface CurrentEventCardProps {
  currentEvent: ScheduleEvent | null
  now: ScheduleSnapshot["now"];
}

export function CurrentEventCard({ currentEvent, now }: CurrentEventCardProps) {
  const startTime = currentEvent ? formatFloatingTime(currentEvent.startTime) : null;
  const isMeetup = currentEvent?.endTime === null;
  const endTime = currentEvent?.endTime
    ? formatFloatingTime(currentEvent.endTime)
    : null;
  return (
    <Card className="border-none bg-linear-to-br from-primary via-primary to-[oklch(0.58_0.18_28)] text-primary-foreground shadow-lg">
      <CardHeader>
        <Badge className="w-fit rounded-full bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/20">
          Right now
        </Badge>
        <CardTitle className="text-3xl md:text-4xl">
          {currentEvent ? currentEvent.title : "No active event"}
        </CardTitle>
        <CardDescription className="text-primary-foreground/80">
          {currentEvent
            ? isMeetup
              ? `${startTime} · ${currentEvent.location} · Samling`
              : `${startTime}-${endTime} · ${currentEvent.location}`
            : "The schedule is currently between activities."}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-primary-foreground/80">{formatNow(now)}</CardContent>
    </Card>
  );
}
