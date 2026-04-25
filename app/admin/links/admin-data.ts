"use server";

import { getStringValue } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getLinkData() {
  const links = await
    prisma.usefulLink.findMany({
      orderBy: [{ title: "asc" }],
    })

  return links
}

export type LinkActionState = {
  ok: boolean;
  message: string;
};

const initialErrorState: LinkActionState = {
  ok: false,
  message: "Something went wrong.",
};

export async function createLinkAction(
  _previousState: LinkActionState,
  formData: FormData
): Promise<LinkActionState> {
  const title = getStringValue(formData, "title");
  const url = getStringValue(formData, "url");
  const description = getStringValue(formData, "description");

  if (!title || !url) {
    return {
      ok: false,
      message: "Title and URL are required.",
    };
  }

  try {
    await prisma.usefulLink.create({
      data: {
        title,
        url,
        description: description || null,
      },
    });

    revalidatePath("/admin/links");

    return {
      ok: true,
      message: "Link created.",
    };
  } catch {
    return initialErrorState;
  }
}

export async function updateLinkAction(
  _previousState: LinkActionState,
  formData: FormData
): Promise<LinkActionState> {
  const id = Number(getStringValue(formData, "id"));
  const title = getStringValue(formData, "title");
  const url = getStringValue(formData, "url");
  const description = getStringValue(formData, "description");

  if (!Number.isInteger(id) || id <= 0) {
    return {
      ok: false,
      message: "Invalid link id.",
    };
  }

  if (!title || !url) {
    return {
      ok: false,
      message: "Title and URL are required.",
    };
  }

  try {
    await prisma.usefulLink.update({
      where: { id },
      data: {
        title,
        url,
        description: description || null,
      },
    });

    revalidatePath("/admin/links");

    return {
      ok: true,
      message: "Link updated.",
    };
  } catch {
    return initialErrorState;
  }
}

export async function deleteLinkAction(
  _previousState: LinkActionState,
  formData: FormData
): Promise<LinkActionState> {
  const id = Number(getStringValue(formData, "id"));

  if (!Number.isInteger(id) || id <= 0) {
    return {
      ok: false,
      message: "Invalid link id.",
    };
  }

  try {
    await prisma.usefulLink.delete({
      where: { id },
    });

    revalidatePath("/admin/links");

    return {
      ok: true,
      message: "Link deleted.",
    };
  } catch {
    return initialErrorState;
  }
}