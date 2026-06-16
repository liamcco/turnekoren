'use client'

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { ScheduleEvent } from '@/generated/prisma/client'
import { useIsMobile } from '@/hooks/use-mobile'
import { parseFloatingDate } from '@/lib/floating-date'
import {
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import {
	formatTime,
	getDayEnd,
	getDayStart,
	getMinutesFromDayStart,
	getTimelineStartHour,
} from '../../app/schedule/utils'

const DESKTOP_HOUR_HEIGHT = 64
const POINT_IN_TIME_DURATION_MINUTES = 15

type EventColumn = 0 | 1

type PositionedEvent = ScheduleEvent & {
	column: EventColumn
	top: number
	height: number
	isPointInTime: boolean
	displayEndTime: Date
	hasOverlap: boolean
}

function getDisplayEndTime(
	event: ScheduleEvent,
): Date {
	return (
		event.endTime ??
		new Date(
			event.startTime.getTime() +
				POINT_IN_TIME_DURATION_MINUTES *
					60_000,
		)
	)
}

function eventsOverlap(
	a: ScheduleEvent,
	b: ScheduleEvent,
): boolean {
	return (
		a.startTime <
			getDisplayEndTime(b) &&
		b.startTime <
			getDisplayEndTime(a)
	)
}

function positionDayEvents(
	events: ScheduleEvent[],
	dayKey: string,
	timelineStartHour: number,
	hourHeight: number,
): PositionedEvent[] {
	const dayStart = getDayStart(dayKey)
	const dayEnd = getDayEnd(dayKey)
	const timelineStartMinutes =
		timelineStartHour * 60
	const minEventHeight = Math.max(
		14,
		(15 / 60) * hourHeight,
	)
	const pointHeight = Math.max(
		16,
		(POINT_IN_TIME_DURATION_MINUTES /
			60) *
			hourHeight,
	)
	const sorted = [...events].sort(
		(a, b) =>
			a.startTime.getTime() -
			b.startTime.getTime(),
	)
	const result: PositionedEvent[] = []

	for (const event of sorted) {
		const prevOverlapping =
			result.filter((p) =>
				eventsOverlap(p, event),
			)
		const usedCols =
			prevOverlapping.map(
				(p) => p.column,
			)
		const column: EventColumn =
			usedCols.includes(0) ? 1 : 0
		const eventHasOverlap =
			sorted.some(
				(o) =>
					o.id !== event.id &&
					eventsOverlap(
						o,
						event,
					),
			)
		const isPointInTime =
			event.endTime === null
		const displayEndTime =
			getDisplayEndTime(event)
		const visibleStart =
			event.startTime < dayStart
				? dayStart
				: event.startTime
		const visibleEnd =
			displayEndTime > dayEnd
				? dayEnd
				: displayEndTime
		const startMins =
			getMinutesFromDayStart(
				visibleStart,
			)
		const endMins =
			getMinutesFromDayStart(
				visibleEnd,
			)
		const durMins = Math.max(
			endMins - startMins,
			15,
		)

		result.push({
			...event,
			column,
			top:
				((startMins -
					timelineStartMinutes) /
					60) *
				hourHeight,
			height: isPointInTime
				? pointHeight
				: Math.max(
						(durMins / 60) *
							hourHeight,
						minEventHeight,
					),
			isPointInTime,
			displayEndTime,
			hasOverlap: eventHasOverlap,
		})
	}

	return result
}

const SHORT_WEEKDAYS = [
	'Mån',
	'Tis',
	'Ons',
	'Tor',
	'Fre',
	'Lör',
	'Sön',
]

function getDayLabel(
	dayKey: string,
): string {
	const date =
		parseFloatingDate(dayKey)
	if (!date) return dayKey
	return SHORT_WEEKDAYS[
		(date.getUTCDay() + 6) % 7
	]
}

function getDayNumber(
	dayKey: string,
): number | string {
	const date =
		parseFloatingDate(dayKey)
	return date ? date.getUTCDate() : ''
}

function EventDialog({
	event,
	open,
	onClose,
}: {
	event: ScheduleEvent | null
	open: boolean
	onClose: () => void
}) {
	if (!event) return null
	const displayEnd =
		getDisplayEndTime(event)
	const isPoint =
		event.endTime === null

	return (
		<Dialog
			open={open}
			onOpenChange={(o) =>
				!o && onClose()
			}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{event.title}
					</DialogTitle>
				</DialogHeader>
				<div className='grid gap-2 text-sm'>
					<p className='text-muted-foreground'>
						{formatTime(
							event.startTime,
						)}
						{!isPoint
							? ` – ${formatTime(displayEnd)}`
							: ''}
					</p>
					{event.location ? (
						<p className='text-muted-foreground'>
							{
								event.location
							}
						</p>
					) : null}
					{event.notes ? (
						<p>
							{
								event.notes
							}
						</p>
					) : null}
				</div>
			</DialogContent>
		</Dialog>
	)
}

export function WeekTimeline({
	eventsByDay,
	weekDays,
}: {
	eventsByDay: Record<
		string,
		ScheduleEvent[]
	>
	weekDays: string[]
}) {
	const [
		selectedEvent,
		setSelectedEvent,
	] = useState<ScheduleEvent | null>(
		null,
	)
	const isMobile = useIsMobile()
	// bodyRef measures the flex-allocated height of the timeline body on mobile.
	// ResizeObserver fires whenever layout changes, giving us the exact available
	// height so we can scale hourHeight to fill it precisely.
	const bodyRef =
		useRef<HTMLDivElement>(null)
	const [bodyHeight, setBodyHeight] =
		useState(0)

	useEffect(() => {
		const el = bodyRef.current
		if (!el) return
		const observer =
			new ResizeObserver(
				(entries) => {
					setBodyHeight(
						entries[0]
							.contentRect
							.height,
					)
				},
			)
		observer.observe(el)
		return () =>
			observer.disconnect()
	}, [])

	const timelineStartHour =
		useMemo(() => {
			let min = 8
			for (const dayKey of weekDays) {
				const dayEvents =
					eventsByDay[
						dayKey
					] ?? []
				if (
					dayEvents.length > 0
				) {
					const h =
						getTimelineStartHour(
							dayEvents,
							dayKey,
						)
					if (h < min) min = h
				}
			}
			return min
		}, [eventsByDay, weekDays])

	const hours = useMemo(
		() =>
			Array.from(
				{
					length:
						24 -
						timelineStartHour,
				},
				(_, i) =>
					timelineStartHour +
					i,
			),
		[timelineStartHour],
	)

	// On mobile: scale hourHeight to fill the CSS-allocated body height exactly.
	// On desktop: use fixed pixel height.
	const hourHeight = useMemo(() => {
		if (
			!isMobile ||
			bodyHeight === 0
		)
			return DESKTOP_HOUR_HEIGHT
		return Math.max(
			28,
			bodyHeight / hours.length,
		)
	}, [isMobile, bodyHeight, hours])

	const positionedByDay =
		useMemo(() => {
			return Object.fromEntries(
				weekDays.map(
					(dayKey) => [
						dayKey,
						positionDayEvents(
							eventsByDay[
								dayKey
							] ?? [],
							dayKey,
							timelineStartHour,
							hourHeight,
						),
					],
				),
			)
		}, [
			eventsByDay,
			weekDays,
			timelineStartHour,
			hourHeight,
		])

	const hasAnyEvents = weekDays.some(
		(d) =>
			(eventsByDay[d] ?? [])
				.length > 0,
	)
	const totalHeight =
		hours.length * hourHeight
	const colCount = weekDays.length
	// Wider columns on mobile so day content is more readable
	const colMinWidth = isMobile
		? '150px'
		: '80px'
	const gridCols = `4rem repeat(${colCount}, minmax(${colMinWidth}, 1fr))`

	return (
		<div
			className={`max-md:flex max-md:flex-col${hasAnyEvents ? ' max-md:h-full' : ''}`}
		>
			{/* Outer border wrapper — keeps the border around both header and body */}
			<div className='rounded-lg border max-md:flex max-md:flex-col max-md:flex-1 max-md:min-h-0'>
				{/* Scrollable area: header + timeline body scroll together horizontally */}
				<div className='overflow-x-auto max-md:flex-1 max-md:min-h-0 max-md:flex max-md:flex-col'>
					{/* Day header row — sticky on desktop so it stays visible when timeline overflows viewport height */}
					{/* max-md:min-w-max: forces the box width to match grid content width so bg/border aren't clipped at viewport edge */}
					<div
						className='grid border-b bg-muted/30 md:sticky md:top-0 md:z-10 max-md:flex-none max-md:min-w-max'
						style={{
							gridTemplateColumns:
								gridCols,
						}}
					>
						<div className='border-r' />
						{weekDays.map(
							(
								dayKey,
							) => {
								const hasEvents =
									(
										eventsByDay[
											dayKey
										] ??
										[]
									)
										.length >
									0
								return (
									<div
										key={
											dayKey
										}
										className={`border-r py-2 text-center last:border-r-0 ${
											hasEvents
												? ''
												: 'opacity-40'
										}`}
									>
										<div className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
											{getDayLabel(
												dayKey,
											)}
										</div>
										<div className='text-sm font-semibold'>
											{getDayNumber(
												dayKey,
											)}
										</div>
									</div>
								)
							},
						)}
					</div>

					{/* Body wrapper: on mobile, flex-1 so it fills remaining space.
               No overflow-hidden here — that would clip the grid's horizontal width and
               prevent the overflow-x-auto parent from creating a proper scroll range. */}
					<div
						ref={bodyRef}
						className='max-md:flex-1 max-md:min-h-0'
					>
						{/* Timeline grid — only rendered when there are events */}
						{hasAnyEvents && (
							<div
								className='grid'
								style={{
									gridTemplateColumns:
										gridCols,
								}}
							>
								{/* Time labels */}
								<div className='border-r bg-muted/30'>
									{hours.map(
										(
											hour,
										) => (
											<div
												key={
													hour
												}
												className='border-b px-2 pt-1 text-right text-xs text-muted-foreground'
												style={{
													height: hourHeight,
												}}
											>
												{hour
													.toString()
													.padStart(
														2,
														'0',
													)}
												:00
											</div>
										),
									)}
								</div>

								{/* Day columns */}
								{weekDays.map(
									(
										dayKey,
									) => {
										const dayEvents =
											positionedByDay[
												dayKey
											] ??
											[]
										return (
											<div
												key={
													dayKey
												}
												className='relative border-r last:border-r-0'
												style={{
													height: totalHeight,
												}}
											>
												{hours.map(
													(
														hour,
													) => (
														<div
															key={
																hour
															}
															className='border-b border-l'
															style={{
																height: hourHeight,
															}}
														/>
													),
												)}

												{dayEvents.map(
													(
														event,
													) => (
														<button
															key={
																event.id
															}
															type='button'
															className='absolute cursor-pointer overflow-hidden rounded border border-primary/50 bg-primary/30 px-1 py-0.5 text-left text-xs transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
															style={{
																top:
																	event.top +
																	1,
																height:
																	event.height -
																	2,
																left: !event.hasOverlap
																	? '1px'
																	: event.column ===
																		  0
																		? '1px'
																		: '50%',
																width: !event.hasOverlap
																	? 'calc(100% - 2px)'
																	: 'calc(50% - 2px)',
															}}
															onClick={() =>
																setSelectedEvent(
																	event,
																)
															}
														>
															<span className='block truncate font-medium leading-tight'>
																{
																	event.title
																}
															</span>
															{event.height >
																32 && (
																<span className='block truncate leading-tight text-muted-foreground'>
																	{formatTime(
																		event.startTime,
																	)}
																</span>
															)}
														</button>
													),
												)}
											</div>
										)
									},
								)}
							</div>
						)}
					</div>
					{/* end bodyRef wrapper */}
				</div>

				{/* Empty message lives OUTSIDE the scrollable div so it always stays centered */}
				{!hasAnyEvents && (
					<div className='flex h-24 items-center justify-center text-sm text-muted-foreground'>
						No events this
						week
					</div>
				)}
			</div>

			<EventDialog
				event={selectedEvent}
				open={
					selectedEvent !==
					null
				}
				onClose={() =>
					setSelectedEvent(
						null,
					)
				}
			/>
		</div>
	)
}
