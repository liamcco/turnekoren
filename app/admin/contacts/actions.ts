"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getStringValue } from "@/lib/api";

export async function getContactData() {
  return prisma.contact.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });
}

export type ContactActionState = {
  ok: boolean;
  message: string;
};

const initialErrorState: ContactActionState = {
  ok: false,
  message: "Something went wrong.",
};

function getContactFormData(formData: FormData) {
  const name = getStringValue(formData, "name");
  const role = getStringValue(formData, "role");
  const phone = getStringValue(formData, "phone");

  if (!name || !role || !phone) {
    return {
      ok: false as const,
      message: "Name, role and phone are required.",
    };
  }

  return {
    ok: true as const,
    data: {
      name,
      role,
      phone,
    },
  };
}

export async function createContactAction(
  _prev: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const parsed = getContactFormData(formData);

  if (!parsed.ok) {
    return { ok: false, message: parsed.message };
  }

  try {
    await prisma.contact.create({ data: parsed.data });

    revalidatePath("/");

    return { ok: true, message: "Contact created." };
  } catch {
    return initialErrorState;
  }
}

export async function updateContactAction(
  _prev: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const id = Number(getStringValue(formData, "id"));

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: "Invalid contact id." };
  }

  const parsed = getContactFormData(formData);

  if (!parsed.ok) {
    return { ok: false, message: parsed.message };
  }

  try {
    await prisma.contact.update({
      where: { id },
      data: parsed.data,
    });

    revalidatePath("/");

    return { ok: true, message: "Contact updated." };
  } catch {
    return initialErrorState;
  }
}

export async function deleteContactAction(
  _prev: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const id = Number(getStringValue(formData, "id"));

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: "Invalid contact id." };
  }

  try {
    await prisma.contact.delete({ where: { id } });

    revalidatePath("/");

    return { ok: true, message: "Contact deleted." };
  } catch {
    return initialErrorState;
  }
}