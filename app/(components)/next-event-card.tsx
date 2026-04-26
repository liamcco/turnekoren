import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScheduleEvent } from "@/generated/prisma/client";
import {
  differenceInFloatingCalendarDays,
  formatFloatingTime,
} from "@/lib/floating-date";

interface NextEventCardProps {
  nextEvent: ScheduleEvent | null;
  now: Date;
}

function getDayBadgeLabel(nextEvent: ScheduleEvent | null, now: Date) {
  if (!nextEvent) {
    return null;
  }

  const daysUntilEvent = differenceInFloatingCalendarDays(nextEvent.startTime, now);

  if (daysUntilEvent <= 0) {
    return null;
  }

  return daysUntilEvent === 1 ? "Tomorrow" : `in ${daysUntilEvent} days`;
}

export function NextEventCard({ nextEvent, now }: NextEventCardProps) {
  const startTime = nextEvent ? formatFloatingTime(nextEvent.startTime) : null;
  const dayBadgeLabel = getDayBadgeLabel(nextEvent, now);

  return (
    <Card className="bg-card/85">
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge className="w-fit rounded-full px-3 py-1 text-[10px] tracking-[0.24em] uppercase" variant="outline">
            Next meetup
          </Badge>
          {dayBadgeLabel ? (
            <Badge className="w-fit rounded-full px-3 py-1 text-[10px]" variant="secondary">
              {dayBadgeLabel}
            </Badge>
          ) : null}
        </div>
        <CardTitle>{nextEvent ? nextEvent.title : "Nothing else scheduled"}</CardTitle>
        <CardDescription>
          {nextEvent
            ? `${startTime} at ${nextEvent.location}`
            : "The current plan has no upcoming items yet."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Separator />
        <p className="text-sm text-muted-foreground">
          {nextEvent?.notes || "No extra notes for this meetup."}
        </p>
      </CardContent>
    </Card>
  );
}
