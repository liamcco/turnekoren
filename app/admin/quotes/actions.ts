"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getStringValue } from "@/lib/api";

export async function getQuoteData() {
  return prisma.quote.findMany({
    orderBy: [{ text: "asc" }],
  });
}

export type QuoteActionState = {
  ok: boolean;
  message: string;
};

const initialErrorState: QuoteActionState = {
  ok: false,
  message: "Something went wrong.",
};

function getQuoteFormData(formData: FormData) {
  const text = getStringValue(formData, "text");
  const translation = getStringValue(formData, "translation");
  const context = getStringValue(formData, "context");

  if (!text || !translation) {
    return {
      ok: false as const,
      message: "Quote and translation are required.",
    };
  }

  return {
    ok: true as const,
    data: {
      text,
      translation,
      context: context || null,
    },
  };
}

export async function createQuoteAction(
  _prev: QuoteActionState,
  formData: FormData
): Promise<QuoteActionState> {
  const parsed = getQuoteFormData(formData);

  if (!parsed.ok) {
    return { ok: false, message: parsed.message };
  }

  try {
    await prisma.quote.create({ data: parsed.data });

    revalidatePath("/");

    return { ok: true, message: "Quote created." };
  } catch {
    return initialErrorState;
  }
}

export async function updateQuoteAction(
  _prev: QuoteActionState,
  formData: FormData
): Promise<QuoteActionState> {
  const id = Number(getStringValue(formData, "id"));

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: "Invalid quote id." };
  }

  const parsed = getQuoteFormData(formData);

  if (!parsed.ok) {
    return { ok: false, message: parsed.message };
  }

  try {
    await prisma.quote.update({
      where: { id },
      data: parsed.data,
    });

    revalidatePath("/");

    return { ok: true, message: "Quote updated." };
  } catch {
    return initialErrorState;
  }
}

export async function deleteQuoteAction(
  _prev: QuoteActionState,
  formData: FormData
): Promise<QuoteActionState> {
  const id = Number(getStringValue(formData, "id"));

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: "Invalid quote id." };
  }

  try {
    await prisma.quote.delete({ where: { id } });

    revalidatePath("/");

    return { ok: true, message: "Quote deleted." };
  } catch {
    return initialErrorState;
  }
}