import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScheduleListItem } from "@/app/(components)/schedule-list-item";
import { ScheduleEvent } from "@/generated/prisma/client";

interface HomeScheduleCardProps {
  currentEventId: number | null;
  dayLabel: string;
  events: ScheduleEvent[];
}

export function HomeScheduleCard({ currentEventId, dayLabel, events }: HomeScheduleCardProps) {
  return (
    <Card className="bg-card/85">
      <CardHeader>
        <Badge className="w-fit rounded-full px-3 py-1 text-[10px] tracking-[0.24em] uppercase" variant="outline">
          {dayLabel}
        </Badge>
        <CardTitle>Live schedule</CardTitle>
        <CardDescription>Current and upcoming items in the running order.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.map((event) => (
          <ScheduleListItem event={event} isCurrent={currentEventId === event.id} key={event.id} />
        ))}

        {events.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No schedule entries yet. Add them in the admin portal.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
