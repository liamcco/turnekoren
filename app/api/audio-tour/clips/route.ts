import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin-auth";
import {
  AUDIO_TOUR_MAX_FILE_SIZE_BYTES,
  isAllowedAudioContentType,
  isMp3Filename,
} from "@/lib/audio-tour";
import { getAudioTourClips, serializeAudioTourClip } from "@/lib/audio-tour-clips";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CreateClipBody = {
  title?: unknown;
  description?: unknown;
  size?: unknown;
  blob?: {
    url?: unknown;
    pathname?: unknown;
    contentType?: unknown;
  };
};

function getTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

async function hasMp3Header(audioUrl: string) {
  try {
    const response = await fetch(audioUrl, {
      headers: { Range: "bytes=0-3" },
    });

    if (!response.ok) {
      return false;
    }

    const bytes = new Uint8Array(await response.arrayBuffer());
    const hasId3Header = bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33;
    const hasFrameSync = bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0;

    return hasId3Header || hasFrameSync;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return unauthorizedResponse();
  }

  return NextResponse.json({ clips: await getAudioTourClips() });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return unauthorizedResponse();
  }

  let body: CreateClipBody;

  try {
    body = (await request.json()) as CreateClipBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const title = getTrimmedString(body.title);
  const description = getTrimmedString(body.description);
  const size = typeof body.size === "number" ? body.size : 0;
  const audioUrl = getTrimmedString(body.blob?.url);
  const blobPathname = getTrimmedString(body.blob?.pathname);
  const contentType = getTrimmedString(body.blob?.contentType) || "audio/mpeg";

  if (!title || title.length > 140) {
    return NextResponse.json(
      { error: "Title is required and must be 140 characters or fewer." },
      { status: 400 },
    );
  }

  if (description.length > 1200) {
    return NextResponse.json(
      { error: "Description must be 1200 characters or fewer." },
      { status: 400 },
    );
  }

  if (!Number.isInteger(size) || size <= 0 || size > AUDIO_TOUR_MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "Invalid MP3 file size." }, { status: 400 });
  }

  if (!audioUrl || !isHttpsUrl(audioUrl)) {
    return NextResponse.json({ error: "Invalid audio URL." }, { status: 400 });
  }

  if (!blobPathname.startsWith("audio-tour/") || !isMp3Filename(blobPathname)) {
    return NextResponse.json({ error: "Invalid MP3 pathname." }, { status: 400 });
  }

  if (!isAllowedAudioContentType(contentType)) {
    return NextResponse.json({ error: "Only MP3 audio is allowed." }, { status: 400 });
  }

  if (!(await hasMp3Header(audioUrl))) {
    return NextResponse.json({ error: "The uploaded file is not a valid MP3." }, { status: 400 });
  }

  try {
    const clip = await prisma.audioTourClip.upsert({
      where: { blobPathname },
      update: {
        title,
        description: description || null,
        audioUrl,
        size,
        contentType,
      },
      create: {
        title,
        description: description || null,
        audioUrl,
        blobPathname,
        size,
        contentType,
      },
    });

    revalidatePath("/admin/audio-tour");
    return NextResponse.json({ clip: serializeAudioTourClip(clip) }, { status: 201 });
  } catch (error) {
    console.error("Unable to create audio tour clip", error);
    return NextResponse.json({ error: "Unable to save audio clip." }, { status: 500 });
  }
}
