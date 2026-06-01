export const AUDIO_TOUR_CHANNEL = "audio-tour";
export const AUDIO_TOUR_MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
export const AUDIO_TOUR_ALLOWED_CONTENT_TYPES = ["audio/mpeg"] as const;

export type AudioTourClipDto = {
  id: string;
  title: string;
  description: string | null;
  audioUrl: string;
  blobPathname: string;
  size: number;
  contentType: string;
  createdAt: string;
};

export type AudioTourPlayEvent = {
  type: "play";
  clipId: string;
  audioUrl: string;
  title: string;
  startAt: number;
  startedAt: number;
  durationSeconds: number;
};

export function isMp3Filename(filename: string) {
  return filename.trim().toLowerCase().endsWith(".mp3");
}

export function isAllowedAudioContentType(contentType: string) {
  return AUDIO_TOUR_ALLOWED_CONTENT_TYPES.includes(
    contentType as (typeof AUDIO_TOUR_ALLOWED_CONTENT_TYPES)[number],
  );
}

export function isAudioTourPlayEvent(value: unknown): value is AudioTourPlayEvent {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    payload.type === "play" &&
    typeof payload.clipId === "string" &&
    typeof payload.audioUrl === "string" &&
    typeof payload.title === "string" &&
    typeof payload.startAt === "number" &&
    typeof payload.startedAt === "number" &&
    typeof payload.durationSeconds === "number"
  );
}
