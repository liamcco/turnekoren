import { NextRequest, NextResponse } from "next/server";
import { getAblyRest } from "@/lib/ably";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin-auth";
import { AUDIO_TOUR_CHANNEL, AudioTourPlayEvent } from "@/lib/audio-tour";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clipId: string }> },
) {
  if (!(await isAdminRequest(request))) {
    return unauthorizedResponse();
  }

  const { clipId } = await params;

  try {
    const clip = await prisma.audioTourClip.findUnique({
      where: { id: clipId },
    });

    if (!clip) {
      return NextResponse.json({ error: "Audio clip not found." }, { status: 404 });
    }

    const payload: AudioTourPlayEvent = {
      type: "play",
      clipId: clip.id,
      audioUrl: clip.audioUrl,
      title: clip.title,
      startAt: Date.now() + 2000,
    };

    await getAblyRest().channels.get(AUDIO_TOUR_CHANNEL).publish("play", payload);

    return NextResponse.json({ event: payload });
  } catch (error) {
    console.error("Unable to trigger audio tour clip", error);
    return NextResponse.json(
      { error: "Unable to trigger listener playback." },
      { status: 500 },
    );
  }
}
