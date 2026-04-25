import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CalendarDays } from "lucide-react";
import { formatFullDayLabel } from "./utils";

export function DaySelector({
  days,
  selectedDay,
  onSelectDay,
}: {
  days: string[];
  selectedDay: string;
  onSelectDay: (day: string) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="w-fit justify-start gap-2" type="button" variant="outline">
          <CalendarDays className="size-4" />
          {formatFullDayLabel(selectedDay)}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="grid w-64 gap-2 p-2">
        {days.map((dayKey) => {
          const isSelected = dayKey === selectedDay;

          return (
            <Button
              key={dayKey}
              className="justify-start"
              onClick={() => onSelectDay(dayKey)}
              type="button"
              variant={isSelected ? "default" : "ghost"}
            >
              {formatFullDayLabel(dayKey)}
            </Button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}