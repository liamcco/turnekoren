import { getInitialSelectedDay, isValidDayKey } from "../admin/schedule/utils";
import { getScheduleData } from "./actions";
import { ScheduleView } from "./ScheduleView";

interface SchedulePageProps {
  searchParams?: Promise<{
    week?: string;
  }>;
}

export default async function AdminSchedulePage({ searchParams }: SchedulePageProps) {
  const events = await getScheduleData();
  const resolvedSearchParams = await searchParams;
  const requestedWeek = resolvedSearchParams?.week;
  const initialSelectedDay = isValidDayKey(requestedWeek)
    ? requestedWeek
    : getInitialSelectedDay(events);

  return <ScheduleView events={events} initialSelectedDay={initialSelectedDay} />;
}
