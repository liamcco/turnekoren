"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getStringValue } from "@/lib/api";

export async function getPackingItemData() {
  return prisma.packingItem.findMany({
    orderBy: [{ category: "asc" }, { label: "asc" }],
  });
}

export type PackingItemActionState = {
  ok: boolean;
  message: string;
};

const initialErrorState: PackingItemActionState = {
  ok: false,
  message: "Something went wrong.",
};

function getPackingItemFormData(formData: FormData) {
  const label = getStringValue(formData, "label");
  const category = getStringValue(formData, "category");
  const notes = getStringValue(formData, "notes");

  if (!label || !category) {
    return {
      ok: false as const,
      message: "Label and category are required.",
    };
  }

  return {
    ok: true as const,
    data: {
      label,
      category,
      notes: notes || null,
    },
  };
}

export async function createPackingItemAction(
  _prev: PackingItemActionState,
  formData: FormData
): Promise<PackingItemActionState> {
  const parsed = getPackingItemFormData(formData);

  if (!parsed.ok) {
    return { ok: false, message: parsed.message };
  }

  try {
    await prisma.packingItem.create({ data: parsed.data });

    revalidatePath("/");

    return { ok: true, message: "Packing item created." };
  } catch {
    return initialErrorState;
  }
}

export async function updatePackingItemAction(
  _prev: PackingItemActionState,
  formData: FormData
): Promise<PackingItemActionState> {
  const id = Number(getStringValue(formData, "id"));

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: "Invalid packing item id." };
  }

  const parsed = getPackingItemFormData(formData);

  if (!parsed.ok) {
    return { ok: false, message: parsed.message };
  }

  try {
    await prisma.packingItem.update({
      where: { id },
      data: parsed.data,
    });

    revalidatePath("/");

    return { ok: true, message: "Packing item updated." };
  } catch {
    return initialErrorState;
  }
}

export async function deletePackingItemAction(
  _prev: PackingItemActionState,
  formData: FormData
): Promise<PackingItemActionState> {
  const id = Number(getStringValue(formData, "id"));

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: "Invalid packing item id." };
  }

  try {
    await prisma.packingItem.delete({ where: { id } });

    revalidatePath("/");

    return { ok: true, message: "Packing item deleted." };
  } catch {
    return initialErrorState;
  }
}