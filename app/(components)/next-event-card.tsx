import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScheduleEvent } from "@/generated/prisma/client";
import { formatFloatingTime } from "@/lib/floating-date";

interface NextEventCardProps {
  nextEvent: ScheduleEvent | null;
}

export function NextEventCard({ nextEvent }: NextEventCardProps) {
  const startTime = nextEvent ? formatFloatingTime(nextEvent.startTime) : null;

  return (
    <Card className="bg-card/85">
      <CardHeader>
        <Badge className="w-fit rounded-full px-3 py-1 text-[10px] tracking-[0.24em] uppercase" variant="outline">
          Next meetup
        </Badge>
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
