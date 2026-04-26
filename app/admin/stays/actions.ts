"use server";

import { prisma } from "@/lib/prisma";
import { getStringValue, getRequiredDateValue } from "@/lib/api";

export async function getStayData() {
  return prisma.stay.findMany({
    include: {
      rooms: true,
    },
    orderBy: [{ startDate: "asc" }, { name: "asc" }],
  });
}

export type StayActionState = {
  ok: boolean;
  message: string;
};

const initialErrorState: StayActionState = {
  ok: false,
  message: "Something went wrong.",
};

function getStayFormData(formData: FormData) {
  const name = getStringValue(formData, "name");
  const startDate = getRequiredDateValue(formData, "startDate");
  const endDate = getRequiredDateValue(formData, "endDate");
  const notes = getStringValue(formData, "notes");

  if (!name || !startDate || !endDate) {
    return {
      ok: false as const,
      message: "Name, start date and end date are required.",
    };
  }

  if (endDate < startDate) {
    return {
      ok: false as const,
      message: "End date cannot be before start date.",
    };
  }

  return {
    ok: true as const,
    data: {
      name,
      startDate,
      endDate,
      notes: notes || null,
    },
  };
}

export async function createStayAction(
  _previousState: StayActionState,
  formData: FormData
): Promise<StayActionState> {
  const parsed = getStayFormData(formData);

  if (!parsed.ok) {
    return {
      ok: false,
      message: parsed.message,
    };
  }

  try {
    await prisma.stay.create({
      data: parsed.data,
    });

    return {
      ok: true,
      message: "Stay created.",
    };
  } catch {
    return initialErrorState;
  }
}

export async function updateStayAction(
  _previousState: StayActionState,
  formData: FormData
): Promise<StayActionState> {
  const id = Number(getStringValue(formData, "id"));

  if (!Number.isInteger(id) || id <= 0) {
    return {
      ok: false,
      message: "Invalid stay id.",
    };
  }

  const parsed = getStayFormData(formData);

  if (!parsed.ok) {
    return {
      ok: false,
      message: parsed.message,
    };
  }

  try {
    await prisma.stay.update({
      where: { id },
      data: parsed.data,
    });

    return {
      ok: true,
      message: "Stay updated.",
    };
  } catch {
    return initialErrorState;
  }
}

export async function deleteStayAction(
  _previousState: StayActionState,
  formData: FormData
): Promise<StayActionState> {
  const id = Number(getStringValue(formData, "id"));

  if (!Number.isInteger(id) || id <= 0) {
    return {
      ok: false,
      message: "Invalid stay id.",
    };
  }

  try {
    await prisma.stay.delete({
      where: { id },
    });

    return {
      ok: true,
      message: "Stay deleted.",
    };
  } catch {
    return initialErrorState;
  }
}
