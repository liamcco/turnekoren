"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getRequiredDateValue, getStringValue } from "@/lib/api";

export async function getScheduleData() {
  return prisma.scheduleEvent.findMany({
    orderBy: [{ startTime: "asc" }],
  });
}

export type ScheduleEventActionState = {
  ok: boolean;
  message: string;
};

const initialErrorState: ScheduleEventActionState = {
  ok: false,
  message: "Something went wrong.",
};

function getEventFormData(formData: FormData) {
  const title = getStringValue(formData, "title");
  const startTime = getRequiredDateValue(formData, "startTime");
  const endTime = getRequiredDateValue(formData, "endTime");
  const location = getStringValue(formData, "location");
  const notes = getStringValue(formData, "notes");

  if (!title || !startTime || !endTime || !location) {
    return {
      ok: false as const,
      message: "Title, start time, end time and location are required.",
    };
  }

  if (endTime <= startTime) {
    return {
      ok: false as const,
      message: "End time must be after start time.",
    };
  }

  return {
    ok: true as const,
    data: {
      title,
      startTime,
      endTime,
      location,
      notes: notes || null,
    },
  };
}

export async function createScheduleEventAction(
  _previousState: ScheduleEventActionState,
  formData: FormData
): Promise<ScheduleEventActionState> {
  const parsed = getEventFormData(formData);

  if (!parsed.ok) {
    return {
      ok: false,
      message: parsed.message,
    };
  }

  try {
    await prisma.scheduleEvent.create({
      data: parsed.data,
    });

    revalidatePath("/admin/schedule");

    return {
      ok: true,
      message: "Event created.",
    };
  } catch {
    return initialErrorState;
  }
}

export async function updateScheduleEventAction(
  _previousState: ScheduleEventActionState,
  formData: FormData
): Promise<ScheduleEventActionState> {
  const id = Number(getStringValue(formData, "id"));

  if (!Number.isInteger(id) || id <= 0) {
    return {
      ok: false,
      message: "Invalid event id.",
    };
  }

  const parsed = getEventFormData(formData);

  if (!parsed.ok) {
    return {
      ok: false,
      message: parsed.message,
    };
  }

  try {
    await prisma.scheduleEvent.update({
      where: { id },
      data: parsed.data,
    });

    revalidatePath("/admin/schedule");

    return {
      ok: true,
      message: "Event updated.",
    };
  } catch {
    return initialErrorState;
  }
}

export async function deleteScheduleEventAction(
  _previousState: ScheduleEventActionState,
  formData: FormData
): Promise<ScheduleEventActionState> {
  const id = Number(getStringValue(formData, "id"));

  if (!Number.isInteger(id) || id <= 0) {
    return {
      ok: false,
      message: "Invalid event id.",
    };
  }

  try {
    await prisma.scheduleEvent.delete({
      where: { id },
    });

    revalidatePath("/admin/schedule");

    return {
      ok: true,
      message: "Event deleted.",
    };
  } catch {
    return initialErrorState;
  }
}
