"use server";

import { prisma } from "@/lib/prisma";
import { getStringValue } from "@/lib/api";
import { importParticipantsFromCsv } from "@/lib/import";

export async function getParticipantData() {
  return prisma.participant.findMany({
    orderBy: [{ name: "asc" }],
  });
}

export type ParticipantActionState = {
  ok: boolean;
  message: string;
};

const initialErrorState: ParticipantActionState = {
  ok: false,
  message: "Something went wrong.",
};

const allowedChoirs = ["MK", "DK", "KK"] as const;
const allowedVoices = ["B2", "B1", "T2", "T1", "A2", "A1", "S2", "S1"] as const;

function getParticipantFormData(formData: FormData) {
  const name = getStringValue(formData, "name");
  const choir = getStringValue(formData, "choir");
  const voice = getStringValue(formData, "voice");
  const mobile = getStringValue(formData, "mobile");

  if (!name || !choir || !voice) {
    return {
      ok: false as const,
      message: "Name, choir and voice are required.",
    };
  }

  if (!allowedChoirs.includes(choir as (typeof allowedChoirs)[number])) {
    return {
      ok: false as const,
      message: "Invalid choir.",
    };
  }

  if (!allowedVoices.includes(voice as (typeof allowedVoices)[number])) {
    return {
      ok: false as const,
      message: "Invalid voice.",
    };
  }

  return {
    ok: true as const,
    data: {
      name,
      choir,
      voice,
      mobile: mobile || null,
    },
  };
}

export async function createParticipantAction(
  _previousState: ParticipantActionState,
  formData: FormData
): Promise<ParticipantActionState> {
  const parsed = getParticipantFormData(formData);

  if (!parsed.ok) {
    return {
      ok: false,
      message: parsed.message,
    };
  }

  try {
    await prisma.participant.create({
      data: parsed.data,
    });

    return {
      ok: true,
      message: "Participant created.",
    };
  } catch {
    return initialErrorState;
  }
}

export async function updateParticipantAction(
  _previousState: ParticipantActionState,
  formData: FormData
): Promise<ParticipantActionState> {
  const id = Number(getStringValue(formData, "id"));

  if (!Number.isInteger(id) || id <= 0) {
    return {
      ok: false,
      message: "Invalid participant id.",
    };
  }

  const parsed = getParticipantFormData(formData);

  if (!parsed.ok) {
    return {
      ok: false,
      message: parsed.message,
    };
  }

  try {
    await prisma.participant.update({
      where: { id },
      data: parsed.data,
    });

    return {
      ok: true,
      message: "Participant updated.",
    };
  } catch {
    return initialErrorState;
  }
}

export async function deleteParticipantAction(
  _previousState: ParticipantActionState,
  formData: FormData
): Promise<ParticipantActionState> {
  const id = Number(getStringValue(formData, "id"));

  if (!Number.isInteger(id) || id <= 0) {
    return {
      ok: false,
      message: "Invalid participant id.",
    };
  }

  try {
    await prisma.participant.delete({
      where: { id },
    });

    return {
      ok: true,
      message: "Participant deleted.",
    };
  } catch {
    return initialErrorState;
  }
}

export async function importParticipantsFromCsvAction(
  _previousState: ParticipantActionState,
  formData: FormData
): Promise<ParticipantActionState> {
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return {
      ok: false,
      message: "Choose a CSV file to upload.",
    };
  }

  if (file.size === 0) {
    return {
      ok: false,
      message: "The selected file is empty.",
    };
  }

  try {
    const csvContent = await file.text();
    const result = await importParticipantsFromCsv(csvContent);

    if (result.errors.length > 0) {
      return {
        ok: false,
        message: result.errors.join(" "),
      };
    }

    return {
      ok: true,
      message: `Imported ${result.createdCount} participants.`,
    };
  } catch {
    return {
      ok: false,
      message: "Could not import participants from the selected file.",
    };
  }
}