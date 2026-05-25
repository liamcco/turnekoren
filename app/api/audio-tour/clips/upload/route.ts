import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin-auth";
import {
  AUDIO_TOUR_ALLOWED_CONTENT_TYPES,
  AUDIO_TOUR_MAX_FILE_SIZE_BYTES,
  isMp3Filename,
} from "@/lib/audio-tour";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type UploadPayload = {
  title?: unknown;
  description?: unknown;
  size?: unknown;
};

function parsePayload(value: string | null): UploadPayload {
  if (!value) {
    return {};
  }

  try {
    return JSON.parse(value) as UploadPayload;
  } catch {
    return {};
  }
}

export async function POST(request: NextRequest) {
  let body: HandleUploadBody;

  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }

  if (body.type === "blob.generate-client-token" && !(await isAdminRequest(request))) {
    return unauthorizedResponse();
  }

  try {
    const response = await handleUpload({
      request,
      body,
      // Required in Vercel: BLOB_READ_WRITE_TOKEN, created automatically by Vercel Blob.
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = parsePayload(clientPayload);
        const title = typeof payload.title === "string" ? payload.title.trim() : "";
        const description =
          typeof payload.description === "string" ? payload.description.trim() : "";
        const size = typeof payload.size === "number" ? payload.size : 0;

        if (!title || title.length > 140) {
          throw new Error("A title is required.");
        }

        if (description.length > 1200) {
          throw new Error("Description is too long.");
        }

        if (!Number.isInteger(size) || size <= 0 || size > AUDIO_TOUR_MAX_FILE_SIZE_BYTES) {
          throw new Error("Invalid MP3 file size.");
        }

        if (!pathname.startsWith("audio-tour/") || !isMp3Filename(pathname)) {
          throw new Error("Only MP3 uploads are allowed.");
        }

        return {
          addRandomSuffix: false,
          allowedContentTypes: [...AUDIO_TOUR_ALLOWED_CONTENT_TYPES],
          maximumSizeInBytes: AUDIO_TOUR_MAX_FILE_SIZE_BYTES,
          tokenPayload: JSON.stringify({ title, description, size }),
        };
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Unable to authorize audio tour upload", error);
    return NextResponse.json({ error: "Unable to authorize upload." }, { status: 400 });
  }
}
