"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getPositiveIntegerValue, getStringValue } from "@/lib/api";

export async function getRoomEditorData() {
  const [stays, participants, rooms] = await Promise.all([
    prisma.stay.findMany({
      orderBy: [{ startDate: "asc" }, { name: "asc" }],
    }),
    prisma.participant.findMany({
      orderBy: [{ name: "asc" }],
    }),
    prisma.room.findMany({
      include: {
        participants: true,
        stay: true,
      },
      orderBy: [{ name: "asc" }],
    }),
  ]);

  return {
    stays,
    participants,
    rooms,
  };
}

export type RoomEditorData = Awaited<ReturnType<typeof getRoomEditorData>>;

export type RoomActionState = {
  ok: boolean;
  message: string;
};

const initialErrorState: RoomActionState = {
  ok: false,
  message: "Something went wrong.",
};

function getParticipantIds(formData: FormData) {
  return formData
    .getAll("participantIds")
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);
}

async function hasParticipantsAlreadyAssignedToStay({
  stayId,
  participantIds,
  ignoredRoomId,
}: {
  stayId: number;
  participantIds: number[];
  ignoredRoomId?: number;
}) {
  if (participantIds.length === 0) {
    return false;
  }

  const existingRoom = await prisma.room.findFirst({
    where: {
      stayId,
      id: ignoredRoomId ? { not: ignoredRoomId } : undefined,
      participants: {
        some: {
          id: {
            in: participantIds,
          },
        },
      },
    },
  });

  return existingRoom !== null;
}

function getRoomFormData(formData: FormData) {
  const name = getStringValue(formData, "name");
  const stayId = getPositiveIntegerValue(formData, "stayId");
  const notes = getStringValue(formData, "notes");
  const participantIds = getParticipantIds(formData);

  if (!name || !stayId) {
    return {
      ok: false as const,
      message: "Room name and stay are required.",
    };
  }

  return {
    ok: true as const,
    data: {
      name,
      stayId,
      notes: notes || null,
      participantIds,
    },
  };
}

export async function createRoomAction(
  _previousState: RoomActionState,
  formData: FormData
): Promise<RoomActionState> {
  const parsed = getRoomFormData(formData);

  if (!parsed.ok) {
    return {
      ok: false,
      message: parsed.message,
    };
  }

  const hasConflict = await hasParticipantsAlreadyAssignedToStay({
    stayId: parsed.data.stayId,
    participantIds: parsed.data.participantIds,
  });

  if (hasConflict) {
    return {
      ok: false,
      message: "One or more participants are already assigned to another room for this stay.",
    };
  }

  try {
    await prisma.room.create({
      data: {
        name: parsed.data.name,
        stayId: parsed.data.stayId,
        notes: parsed.data.notes,
        participants: {
          connect: parsed.data.participantIds.map((id) => ({ id })),
        },
      },
    });

    revalidatePath("/rooms");

    return {
      ok: true,
      message: "Room created.",
    };
  } catch {
    return initialErrorState;
  }
}

export async function updateRoomAction(
  _previousState: RoomActionState,
  formData: FormData
): Promise<RoomActionState> {
  const id = getPositiveIntegerValue(formData, "id");

  if (!id) {
    return {
      ok: false,
      message: "Invalid room id.",
    };
  }

  const parsed = getRoomFormData(formData);

  if (!parsed.ok) {
    return {
      ok: false,
      message: parsed.message,
    };
  }

  const hasConflict = await hasParticipantsAlreadyAssignedToStay({
    stayId: parsed.data.stayId,
    participantIds: parsed.data.participantIds,
    ignoredRoomId: id,
  });

  if (hasConflict) {
    return {
      ok: false,
      message: "One or more participants are already assigned to another room for this stay.",
    };
  }

  try {
    await prisma.room.update({
      where: { id },
      data: {
        name: parsed.data.name,
        stayId: parsed.data.stayId,
        notes: parsed.data.notes,
        participants: {
          set: parsed.data.participantIds.map((participantId) => ({ id: participantId })),
        },
      },
    });

    revalidatePath("/rooms");

    return {
      ok: true,
      message: "Room updated.",
    };
  } catch {
    return initialErrorState;
  }
}

export async function deleteRoomAction(
  _previousState: RoomActionState,
  formData: FormData
): Promise<RoomActionState> {
  const id = getPositiveIntegerValue(formData, "id");

  if (!id) {
    return {
      ok: false,
      message: "Invalid room id.",
    };
  }

  try {
    await prisma.room.delete({
      where: { id },
    });

    revalidatePath("/rooms");

    return {
      ok: true,
      message: "Room deleted.",
    };
  } catch {
    return initialErrorState;
  }
}

export async function copyRoomsFromStayAction(
  _previousState: RoomActionState,
  formData: FormData
): Promise<RoomActionState> {
  const sourceStayId = getPositiveIntegerValue(formData, "sourceStayId");
  const targetStayId = getPositiveIntegerValue(formData, "targetStayId");

  if (!sourceStayId || !targetStayId || sourceStayId === targetStayId) {
    return {
      ok: false,
      message: "Choose two different stays.",
    };
  }

  try {
    const sourceRooms = await prisma.room.findMany({
      where: {
        stayId: sourceStayId,
      },
      include: {
        participants: true,
      },
      orderBy: [{ name: "asc" }],
    });

    if (sourceRooms.length === 0) {
      return {
        ok: false,
        message: "The selected stay has no rooms to copy.",
      };
    }

    await prisma.$transaction(
      sourceRooms.map((room) =>
        prisma.room.create({
          data: {
            name: room.name,
            notes: room.notes,
            stayId: targetStayId,
            participants: {
              connect: room.participants.map((participant) => ({ id: participant.id })),
            },
          },
        })
      )
    );

    revalidatePath("/rooms");

    return {
      ok: true,
      message: "Rooms copied.",
    };
  } catch {
    return initialErrorState;
  }
}
