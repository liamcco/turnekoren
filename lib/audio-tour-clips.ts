import { prisma } from "@/lib/prisma";
import { AudioTourClipDto } from "@/lib/audio-tour";

type AudioTourClipRecord = {
  id: string;
  title: string;
  description: string | null;
  audioUrl: string;
  blobPathname: string;
  size: number;
  contentType: string;
  createdAt: Date;
};

export function serializeAudioTourClip(clip: AudioTourClipRecord): AudioTourClipDto {
  return {
    id: clip.id,
    title: clip.title,
    description: clip.description,
    audioUrl: clip.audioUrl,
    blobPathname: clip.blobPathname,
    size: clip.size,
    contentType: clip.contentType,
    createdAt: clip.createdAt.toISOString(),
  };
}

export async function getAudioTourClips() {
  const clips = await prisma.audioTourClip.findMany({
    orderBy: [{ createdAt: "desc" }],
  });

  return clips.map(serializeAudioTourClip);
}
