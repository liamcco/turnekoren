"use server";

import { getStringValue } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPlaces() {
  const places = await
    prisma.place.findMany({
      orderBy: [ { name: "asc" } ],
    })

  return places
}

export type PlaceActionState = {
  ok: boolean;
  message: string;
};

const initialErrorState: PlaceActionState = {
  ok: false,
  message: "Something went wrong.",
};

export async function createPlaceAction(
  _previousState: PlaceActionState,
  formData: FormData
): Promise<PlaceActionState> {
  const name = getStringValue(formData, "name");
  const url = getStringValue(formData, "url");
  const description = getStringValue(formData, "description");
  const address = getStringValue(formData, "address");

  if (!name || !url) {
    return {
      ok: false,
      message: "Name and URL are required.",
    };
  }

  try {
    await prisma.place.create({
      data: {
        name,
        address: address || null,
        url,
        description: description || null,
      },
    });

    revalidatePath("/admin/places");

    return {
      ok: true,
      message: "Place created.",
    };
  } catch {
    return initialErrorState;
  }
}

export async function updatePlaceAction(
  _previousState: PlaceActionState,
  formData: FormData
): Promise<PlaceActionState> {
  const id = Number(getStringValue(formData, "id"));
  const name = getStringValue(formData, "name");
  const url = getStringValue(formData, "url");
  const description = getStringValue(formData, "description");

  if (!Number.isInteger(id) || id <= 0) {
    return {
      ok: false,
      message: "Invalid place id.",
    };
  }

  if (!name || !url) {
    return {
      ok: false,
      message: "Name and URL are required.",
    };
  }

  try {
    await prisma.place.update({
      where: { id },
      data: {
        name,
        url,
        description: description || null,
      },
    });

    revalidatePath("/admin/places");

    return {
      ok: true,
      message: "Place updated.",
    };
  } catch {
    return initialErrorState;
  }
}

export async function deletePlaceAction(
  _previousState: PlaceActionState,
  formData: FormData
): Promise<PlaceActionState> {
  const id = Number(getStringValue(formData, "id"));

  if (!Number.isInteger(id) || id <= 0) {
    return {
      ok: false,
      message: "Invalid place id.",
    };
  }

  try {
    await prisma.place.delete({
      where: { id },
    });

    revalidatePath("/admin/places");

    return {
      ok: true,
      message: "Place deleted.",
    };
  } catch {
    return initialErrorState;
  }
}