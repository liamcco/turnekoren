import { Clock3 } from "lucide-react"
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScheduleEvent } from "@/generated/prisma/client";
import { formatFloatingTime } from "@/lib/floating-date";

interface ScheduleListItemProps {
  event: ScheduleEvent;
  isCurrent: boolean;
}

export function ScheduleListItem({ event, isCurrent }: ScheduleListItemProps) {
    const startTime = formatFloatingTime(event.startTime);
    const isMeetup = event.endTime === null;
    const endTime = event.endTime
      ? formatFloatingTime(event.endTime)
      : null;

  return (
    <div
      className={cn(
        "grid gap-3 rounded-xl border p-4 md:grid-cols-[120px_1fr_auto] md:items-start",
        isCurrent ? "border-primary/30 bg-primary/5" : "border-border/60 bg-background/60",
      )}
    >
      <div className="space-y-1 text-sm font-medium text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock3 className="size-4" />
          <span>
            {isMeetup ? `${startTime}` : `${startTime}-${endTime}`}
          </span>
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="font-medium">{event.title}</h3>
        <p className="text-sm text-muted-foreground">
          {event.location}
          {isMeetup ? " · Samling" : ""}
          {event.notes ? ` · ${event.notes}` : ""}
        </p>
      </div>
      <div className="flex items-start justify-start md:justify-end">
        <Badge variant={isCurrent ? "default" : "outline"}>{isCurrent ? "Nu" : "Kommande"}</Badge>
      </div>
    </div>
  );
}
