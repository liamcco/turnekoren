import { getInitialSelectedDay, isValidDayKey } from "../admin/schedule/utils";
import { getScheduleData } from "./actions";
import { ScheduleView } from "./ScheduleView";

interface SchedulePageProps {
  searchParams?: Promise<{
    day?: string;
  }>;
}

export default async function AdminSchedulePage({ searchParams }: SchedulePageProps) {
  const events = await getScheduleData();
  const resolvedSearchParams = await searchParams;
  const requestedDay = resolvedSearchParams?.day;
  const initialSelectedDay = isValidDayKey(requestedDay)
    ? requestedDay
    : getInitialSelectedDay(events);

  return <ScheduleView events={events} initialSelectedDay={initialSelectedDay} />;
}
