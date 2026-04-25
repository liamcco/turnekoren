import { prisma } from "@/lib/prisma";

export async function getScheduleData() {
  return prisma.scheduleEvent.findMany({
    orderBy: [{ startTime: "asc" }],
  });
}