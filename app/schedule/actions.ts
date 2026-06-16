import { prisma } from '@/lib/prisma'

export async function getScheduleData() {
	// TODO: Pull Schedule data from google calendar

	return []

	// Database Schema is depricated
	// return prisma.scheduleEvent.findMany(
	// 	{
	// 		orderBy: [
	// 			{ startTime: 'asc' },
	// 		],
	// 	},
	// )
}
