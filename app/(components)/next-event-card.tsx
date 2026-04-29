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

  return daysUntilEvent === 1 ? "Imorgon" : `om ${daysUntilEvent} dagar`;
}

export function NextEventCard({ nextEvent, now }: NextEventCardProps) {
  const startTime = nextEvent ? formatFloatingTime(nextEvent.startTime) : null;
  const dayBadgeLabel = getDayBadgeLabel(nextEvent, now);

  return (
    <Card className="bg-card/85">
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge className="w-fit rounded-full px-3 py-1 text-[10px] tracking-[0.24em] uppercase" variant="outline">
            Nästa samling
          </Badge>
          {dayBadgeLabel ? (
            <Badge className="w-fit rounded-full px-3 py-1 text-[10px]" variant="secondary">
              {dayBadgeLabel}
            </Badge>
          ) : null}
        </div>
        <CardTitle>{nextEvent ? nextEvent.title : "Inget mer schemalagt"}</CardTitle>
        <CardDescription>
          {nextEvent
            ? `${startTime} på ${nextEvent.location}`
            : "Planen har inga kommande punkter ännu."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Separator />
        <p className="text-sm text-muted-foreground">
          {nextEvent?.notes || "Inga extra anteckningar för den här samlingen."}
        </p>
      </CardContent>
    </Card>
  );
}
