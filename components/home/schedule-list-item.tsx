import { Clock3 } from "lucide-react"
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/formatting";
import { cn } from "@/lib/utils";
import { ScheduleEvent } from "@/generated/prisma/client";
import { TRIP_LOCALE } from "@/lib/constants";

interface ScheduleListItemProps {
  event: ScheduleEvent;
  isCurrent: boolean;
}

export function ScheduleListItem({ event, isCurrent }: ScheduleListItemProps) {
    const startTime = event.startTime.toLocaleTimeString(TRIP_LOCALE, { hour: "2-digit", minute: "2-digit" });
    const endTime = event.endTime.toLocaleTimeString(TRIP_LOCALE, { hour: "2-digit", minute: "2-digit" });

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
            `${startTime}-${endTime}`
          </span>
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="font-medium">{event.title}</h3>
        <p className="text-sm text-muted-foreground">
          {event.location}
          {event.notes ? ` · ${event.notes}` : ""}
        </p>
      </div>
      <div className="flex items-start justify-start md:justify-end">
        <Badge variant={isCurrent ? "default" : "outline"}>{isCurrent ? "Now" : "Upcoming"}</Badge>
      </div>
    </div>
  );
}
