"use server";

import { del, put } from "@vercel/blob";
import { getStringValue } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type FileActionState = {
  ok: boolean;
  message: string;
};

const initialErrorState: FileActionState = {
  ok: false,
  message: "Something went wrong.",
};

function normalizePdfFilename(value: string) {
  const normalized = value
    .trim()
    .replace(/\\/g, "/")
    .split("/")
    .pop()
    ?.replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^\.+/, "")
    .toLowerCase();

  if (!normalized) {
    return "";
  }

  return normalized.endsWith(".pdf") ? normalized : `${normalized}.pdf`;
}

function getFileValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

export async function getFileData() {
  return prisma.fileAsset.findMany({
    orderBy: [{ filename: "asc" }],
  });
}

export async function uploadFileAction(
  _previousState: FileActionState,
  formData: FormData
): Promise<FileActionState> {
  const file = getFileValue(formData, "file");
  const requestedFilename = normalizePdfFilename(getStringValue(formData, "filename"));
  const originalFilename = file ? normalizePdfFilename(file.name) : "";
  const filename = requestedFilename || originalFilename;

  if (!file) {
    return {
      ok: false,
      message: "Choose a PDF file to upload.",
    };
  }

  if (!filename) {
    return {
      ok: false,
      message: "Filename is required.",
    };
  }

  if (!filename.endsWith(".pdf")) {
    return {
      ok: false,
      message: "Only PDF filenames are allowed.",
    };
  }

  if (file.type && file.type !== "application/pdf") {
    return {
      ok: false,
      message: "Only PDF files are allowed.",
    };
  }

  try {
    const existingFile = await prisma.fileAsset.findUnique({
      where: { filename },
    });

    if (existingFile) {
      return {
        ok: false,
        message: "A file with that filename already exists.",
      };
    }

    const blob = await put(`files/${crypto.randomUUID()}-${filename}`, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/pdf",
    });

    await prisma.fileAsset.create({
      data: {
        filename,
        pathname: blob.pathname,
        url: blob.url,
        downloadUrl: blob.downloadUrl,
        size: file.size,
        contentType: "application/pdf",
      },
    });

    revalidatePath("/admin/files");
    revalidatePath(`/files/${filename}`);

    return {
      ok: true,
      message: "File uploaded.",
    };
  } catch {
    return initialErrorState;
  }
}

export async function updateFileAction(
  _previousState: FileActionState,
  formData: FormData
): Promise<FileActionState> {
  const id = Number(getStringValue(formData, "id"));
  const filename = normalizePdfFilename(getStringValue(formData, "filename"));

  if (!Number.isInteger(id) || id <= 0) {
    return {
      ok: false,
      message: "Invalid file id.",
    };
  }

  if (!filename) {
    return {
      ok: false,
      message: "Filename is required.",
    };
  }

  if (!filename.endsWith(".pdf")) {
    return {
      ok: false,
      message: "Only PDF filenames are allowed.",
    };
  }

  try {
    const currentFile = await prisma.fileAsset.findUnique({
      where: { id },
    });

    if (!currentFile) {
      return {
        ok: false,
        message: "File not found.",
      };
    }

    const existingFile = await prisma.fileAsset.findUnique({
      where: { filename },
    });

    if (existingFile && existingFile.id !== id) {
      return {
        ok: false,
        message: "A file with that filename already exists.",
      };
    }

    await prisma.fileAsset.update({
      where: { id },
      data: { filename },
    });

    revalidatePath("/admin/files");
    revalidatePath(`/files/${currentFile.filename}`);
    revalidatePath(`/files/${filename}`);

    return {
      ok: true,
      message: "Filename updated.",
    };
  } catch {
    return initialErrorState;
  }
}

export async function deleteFileAction(
  _previousState: FileActionState,
  formData: FormData
): Promise<FileActionState> {
  const id = Number(getStringValue(formData, "id"));

  if (!Number.isInteger(id) || id <= 0) {
    return {
      ok: false,
      message: "Invalid file id.",
    };
  }

  try {
    const file = await prisma.fileAsset.findUnique({
      where: { id },
    });

    if (!file) {
      return {
        ok: false,
        message: "File not found.",
      };
    }

    await del(file.pathname);
    await prisma.fileAsset.delete({
      where: { id },
    });

    revalidatePath("/admin/files");
    revalidatePath(`/files/${file.filename}`);

    return {
      ok: true,
      message: "File deleted.",
    };
  } catch {
    return initialErrorState;
  }
}
