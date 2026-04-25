import { getScheduleData } from "./actions";
import { ScheduleEditor } from "./ScheduleEditor";
import { getInitialSelectedDay, isValidDayKey } from "./utils";

interface AdminSchedulePageProps {
  searchParams?: Promise<{
    day?: string;
  }>;
}

export default async function AdminSchedulePage({ searchParams }: AdminSchedulePageProps) {
  const events = await getScheduleData();
  const resolvedSearchParams = await searchParams;
  const requestedDay = resolvedSearchParams?.day;
  const initialSelectedDay = isValidDayKey(requestedDay)
    ? requestedDay
    : getInitialSelectedDay(events);

  return <ScheduleEditor events={events} initialSelectedDay={initialSelectedDay} />;
}
