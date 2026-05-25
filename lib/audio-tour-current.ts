import { Redis } from "@upstash/redis";

const CURRENT_AUDIO_TOUR_PLAYBACK_KEY = "audio-tour:current-playback";

const redis = Redis.fromEnv();

export type CurrentAudioTourPlayback = {
  clipId: string;
  audioUrl: string;
  title: string;
  startedAt: number;
  durationSeconds: number;
};

export async function getCurrentAudioTourPlayback() {
  const playback = await redis.get<CurrentAudioTourPlayback>(
    CURRENT_AUDIO_TOUR_PLAYBACK_KEY,
  );

  if (!playback) {
    return null;
  }

  return playback;
}

export async function setCurrentAudioTourPlayback(
  playback: CurrentAudioTourPlayback,
) {
  const ttlSeconds = Math.max(60, playback.durationSeconds + 60);

  await redis.set(CURRENT_AUDIO_TOUR_PLAYBACK_KEY, playback, {
    ex: ttlSeconds,
  });
}

export async function clearCurrentAudioTourPlayback() {
  await redis.del(CURRENT_AUDIO_TOUR_PLAYBACK_KEY);
}