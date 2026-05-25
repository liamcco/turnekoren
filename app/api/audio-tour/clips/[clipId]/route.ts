import { del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function DELETE(
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

    await del(clip.blobPathname);
    await prisma.audioTourClip.delete({
      where: { id: clip.id },
    });

    revalidatePath("/admin/audio-tour");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Unable to delete audio tour clip", error);
    return NextResponse.json({ error: "Unable to delete audio clip." }, { status: 500 });
  }
}
