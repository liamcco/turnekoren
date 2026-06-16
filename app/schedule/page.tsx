import { getScheduleData } from './actions'
import {
	getInitialSelectedDay,
	isValidDayKey,
} from './utils'

interface SchedulePageProps {
	searchParams?: Promise<{
		week?: string
	}>
}

export default async function AdminSchedulePage({
	searchParams,
}: SchedulePageProps) {
	const events =
		await getScheduleData()
	const resolvedSearchParams =
		await searchParams
	const requestedWeek =
		resolvedSearchParams?.week
	const initialSelectedDay =
		isValidDayKey(requestedWeek)
			? requestedWeek
			: getInitialSelectedDay(
					events,
				)

	return (
		<div>
			<h2>Under arbete</h2>
			<p>
				Tills kalendern på
				hemsidan fungerar igen
				kan du alltid se det
				aktuella schemat på
				Google Calendar
			</p>
			<a
				href={
					'#'
					// GOOGLE_CALENDAR_URL
				}
				target='_blank'
				rel='noopener noreferrer'
			>
				Google Calendar
			</a>
		</div>
	)
}
