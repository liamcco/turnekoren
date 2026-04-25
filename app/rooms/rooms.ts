import { Room, Stay } from "@/generated/prisma/browser";
import { Participant } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type RoomWithStay = Room & 
{ 
  participants: Participant[] 
} & {
  stay: Stay | null;
};

export async function getRoomsByStay(): Promise<Record<string, RoomWithStay[]>> {
  const rooms = await prisma.room.findMany({
    include: {
      stay: true,
      participants: true
    },
    orderBy: [{ name: "asc" }],
  });

  return rooms
    .filter((room) => room.stay !== null)
    .reduce<Record<string, RoomWithStay[]>>((acc, room) => {
      const stayName = room.stay?.name ?? "Uten opphold";

      if (!acc[stayName]) {
        acc[stayName] = [];
      }

      acc[stayName].push(room);
      return acc;
    }, {});
}