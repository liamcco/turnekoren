import { NextResponse } from "next/server";

import { getCurrentAudioTourPlayback } from "@/lib/audio-tour-current";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const currentPlayback = await getCurrentAudioTourPlayback();

    if (!currentPlayback) {
      return NextResponse.json({ current: null });
    }

    const now = Date.now();
    const elapsedSeconds = Math.max(
      0,
      Math.floor((now - currentPlayback.startedAt) / 1000),
    );
    const hasKnownDuration = currentPlayback.durationSeconds > 0;
    const hasEnded =
      hasKnownDuration && elapsedSeconds >= currentPlayback.durationSeconds;

    if (hasEnded) {
      return NextResponse.json({ current: null });
    }

    return NextResponse.json({
      current: {
        ...currentPlayback,
        elapsedSeconds,
        serverNow: now,
      },
    });
  } catch (error) {
    console.error("Failed to load current audio tour playback", error);

    return NextResponse.json(
      { error: "Failed to load current audio tour playback" },
      { status: 500 },
    );
  }
}
