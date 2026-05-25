import { NextResponse } from "next/server";
import { getAblyRest } from "@/lib/ably";
import { AUDIO_TOUR_CHANNEL } from "@/lib/audio-tour";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const tokenRequest = await getAblyRest().auth.createTokenRequest({
      capability: { [AUDIO_TOUR_CHANNEL]: ["subscribe"] },
      ttl: 60 * 60 * 1000,
    });

    return NextResponse.json(tokenRequest);
  } catch (error) {
    console.error("Unable to create Ably token request", error);
    return NextResponse.json(
      { error: "Audio tour realtime auth is not configured." },
      { status: 500 },
    );
  }
}

export { GET as POST };
