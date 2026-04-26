import { Room, Stay } from "@/generated/prisma/client";
import { Participant } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type RoomWithParticipants = Room & {
  participants: Participant[];
};

export async function getStays(): Promise<Stay[]> {
  return prisma.stay.findMany({
    orderBy: [{ startDate: "asc" }],
  });
}

export function getNextUpcomingStayId(stays: Stay[]): number | null {
  if (stays.length === 0) return null;
  const now = new Date();
  const upcoming = stays.find((stay) => new Date(stay.endDate) >= now);
  return (upcoming ?? stays[stays.length - 1]).id;
}

export async function getRoomsForStay(stayId: number): Promise<RoomWithParticipants[]> {
  return prisma.room.findMany({
    where: { stayId },
    include: { participants: true },
    orderBy: [{ name: "asc" }],
  });
}