import { getAudioTourClips } from "@/lib/audio-tour-clips";
import { AudioTourEditor } from "./AudioTourEditor";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function AdminAudioTourPage() {
  const clips = await getAudioTourClips();

  return <AudioTourEditor initialClips={clips} />;
}
