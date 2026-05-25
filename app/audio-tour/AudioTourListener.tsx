"use client";

import { Headphones, Loader2, Pause, Play, Radio, Volume2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { InboundMessage, Realtime, RealtimeChannel } from "ably";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AUDIO_TOUR_CHANNEL,
  AudioTourPlayEvent,
  isAudioTourPlayEvent,
} from "@/lib/audio-tour";

type ConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "suspended"
  | "failed"
  | "closed";

function formatTime(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "0:00";
  }

  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function statusVariant(status: ConnectionStatus) {
  if (status === "connected") {
    return "default";
  }

  if (status === "failed" || status === "suspended") {
    return "destructive";
  }

  return "outline";
}

export function AudioTourListener() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCleanupRef = useRef<(() => void) | null>(null);
  const ablyRef = useRef<Realtime | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const startTimerRef = useRef<number | null>(null);

  const [hasJoined, setHasJoined] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("idle");
  const [currentClip, setCurrentClip] = useState<AudioTourPlayEvent | null>(null);
  const [pendingStartAt, setPendingStartAt] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ensureAudio = useCallback(() => {
    if (audioRef.current) {
      return audioRef.current;
    }

    const audio = new Audio();
    audio.preload = "auto";
    audio.controls = false;
    audio.setAttribute("playsinline", "true");
    audio.setAttribute("webkit-playsinline", "true");

    const handlePlay = () => {
      setIsPlaying(true);
      setAutoplayBlocked(false);
    };
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const handleDurationChange = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("loadedmetadata", handleDurationChange);
    audio.addEventListener("ended", handleEnded);

    audioCleanupRef.current = () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("loadedmetadata", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
    };

    audioRef.current = audio;
    return audio;
  }, []);

  const updateMediaSession = useCallback((clip: AudioTourPlayEvent) => {
    if (!("mediaSession" in navigator)) {
      return;
    }

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        artist: "Choir audio tour",
        album: "Helsinki sightseeing",
        title: clip.title,
        artwork: [
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      });
      navigator.mediaSession.setActionHandler("play", () => {
        void audioRef.current?.play();
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        audioRef.current?.pause();
      });
      navigator.mediaSession.setActionHandler("stop", () => {
        audioRef.current?.pause();
      });
      navigator.mediaSession.setActionHandler("seekbackward", (details) => {
        const audio = audioRef.current;
        if (!audio) {
          return;
        }

        audio.currentTime = Math.max(0, audio.currentTime - (details.seekOffset ?? 10));
      });
      navigator.mediaSession.setActionHandler("seekforward", (details) => {
        const audio = audioRef.current;
        if (!audio || !Number.isFinite(audio.duration)) {
          return;
        }

        audio.currentTime = Math.min(
          audio.duration,
          audio.currentTime + (details.seekOffset ?? 10),
        );
      });
    } catch {
      // Media Session support varies across mobile browsers.
    }
  }, []);

  const startPlayback = useCallback(
    async (clip: AudioTourPlayEvent) => {
      const audio = ensureAudio();
      const effectiveStartedAt = clip.startedAt ?? clip.startAt;
      const offsetSeconds = Math.max(0, (Date.now() - effectiveStartedAt) / 1000);

      if (clip.durationSeconds && offsetSeconds >= clip.durationSeconds) {
        return;
      }

      const seekToSyncedOffset = () => {
        if (offsetSeconds <= 0) {
          return;
        }

        try {
          if (!Number.isFinite(audio.duration) || offsetSeconds < audio.duration) {
            audio.currentTime = offsetSeconds;
          }
        } catch {
          // Some browsers reject seeking before metadata is fully ready.
        }
      };

      if (audio.readyState >= 1) {
        seekToSyncedOffset();
      } else {
        audio.addEventListener("loadedmetadata", seekToSyncedOffset, { once: true });
      }

      updateMediaSession(clip);

      try {
        await audio.play();
        setAutoplayBlocked(false);
      } catch {
        setAutoplayBlocked(true);
        setIsPlaying(false);
      }
    },
    [ensureAudio, updateMediaSession],
  );

  const schedulePlayback = useCallback(
    (clip: AudioTourPlayEvent) => {
      const audio = ensureAudio();

      if (startTimerRef.current) {
        window.clearTimeout(startTimerRef.current);
      }

      audio.pause();
      audio.src = clip.audioUrl;
      audio.load();
      setCurrentClip(clip);
      setCurrentTime(0);
      setDuration(0);
      setAutoplayBlocked(false);
      setError(null);

      const delay = clip.startAt - Date.now();

      if (delay > 0) {
        setPendingStartAt(clip.startAt);
        startTimerRef.current = window.setTimeout(() => {
          startTimerRef.current = null;
          setPendingStartAt(null);
          void startPlayback(clip);
        }, delay);
        return;
      }

      setPendingStartAt(null);
      void startPlayback(clip);
    },
    [ensureAudio, startPlayback],
  );

  const syncCurrentAudioTourPlayback = useCallback(async () => {
    try {
      const response = await fetch("/api/audio-tour/current", {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as {
        current: null | {
          clipId: string;
          audioUrl: string;
          title: string;
          startedAt: number;
          durationSeconds: number;
          elapsedSeconds?: number;
          serverNow?: number;
        };
      };

      if (!data.current) {
        return;
      }

      const elapsedSeconds = data.current.elapsedSeconds ?? 0;
      const syntheticStartedAt = Date.now() - elapsedSeconds * 1000;

      schedulePlayback({
        type: "play",
        clipId: data.current.clipId,
        audioUrl: data.current.audioUrl,
        title: data.current.title,
        startAt: syntheticStartedAt,
        startedAt: syntheticStartedAt,
        durationSeconds: data.current.durationSeconds,
      });
    } catch (syncError) {
      console.error("Failed to sync current audio tour playback", syncError);
    }
  }, [schedulePlayback]);

  async function handleJoin() {
    ensureAudio();
    setHasJoined(true);
    void syncCurrentAudioTourPlayback();
  }

  async function handleTogglePlayback() {
    const audio = ensureAudio();

    if (!currentClip) {
      return;
    }

    if (audio.paused) {
      try {
        await audio.play();
        setAutoplayBlocked(false);
      } catch {
        setAutoplayBlocked(true);
      }
      return;
    }

    audio.pause();
  }

  useEffect(() => {
    if (!hasJoined) {
      return;
    }

    let isActive = true;

    async function connect() {
      setConnectionStatus("connecting");
      setError(null);

      try {
        const { Realtime: AblyRealtime } = await import("ably");

        if (!isActive) {
          return;
        }

        const realtime = new AblyRealtime({
          authUrl: "/api/ably/auth",
        });

        ablyRef.current = realtime;

        realtime.connection.on((change) => {
          if (!isActive) {
            return;
          }

          setConnectionStatus(change.current as ConnectionStatus);

          if (change.current === "connected") {
            void syncCurrentAudioTourPlayback();
          }

          if (change.current === "failed") {
            setError(change.reason?.message ?? "Unable to connect to the audio tour.");
          }
        });

        const channel = realtime.channels.get(AUDIO_TOUR_CHANNEL);
        const handleMessage = (message: InboundMessage) => {
          if (!isAudioTourPlayEvent(message.data)) {
            setError("Received an unsupported audio tour event.");
            return;
          }

          schedulePlayback(message.data);
        };

        channelRef.current = channel;
        await channel.subscribe("play", handleMessage);
      } catch (connectError) {
        if (!isActive) {
          return;
        }

        setConnectionStatus("failed");
        setError(
          connectError instanceof Error
            ? connectError.message
            : "Unable to connect to the audio tour.",
        );
      }
    }

    void connect();

    return () => {
      isActive = false;

      if (startTimerRef.current) {
        window.clearTimeout(startTimerRef.current);
        startTimerRef.current = null;
      }

      channelRef.current?.unsubscribe();
      channelRef.current = null;
      ablyRef.current?.close();
      ablyRef.current = null;
    };
  }, [hasJoined, schedulePlayback, syncCurrentAudioTourPlayback]);

  useEffect(() => {
    if (!hasJoined) {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void syncCurrentAudioTourPlayback();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [hasJoined, syncCurrentAudioTourPlayback]);

  useEffect(() => {
    return () => {
      if (startTimerRef.current) {
        window.clearTimeout(startTimerRef.current);
      }

      audioRef.current?.pause();
      audioCleanupRef.current?.();
      audioRef.current = null;
    };
  }, []);

  const progress =
    duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  if (!hasJoined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Headphones className="size-4" />
            Ready to listen
          </CardTitle>
          <CardDescription>
            Tap once before the guide starts playback.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="h-12 w-full text-base" onClick={handleJoin} type="button">
            <Headphones className="size-5" />
            Join audio tour
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Radio className="size-4" />
              Listener
            </CardTitle>
            <Badge variant={statusVariant(connectionStatus)}>
              {connectionStatus}
            </Badge>
          </div>
          <CardDescription>
            {currentClip ? currentClip.title : "Waiting for the next clip."}
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-5">
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <Volume2 className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 space-y-1">
                <p className="truncate text-base font-medium">
                  {currentClip?.title ?? "No clip playing"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {pendingStartAt
                    ? "Starting shortly"
                    : isPlaying
                      ? "Playing"
                      : currentClip
                        ? "Paused"
                        : "Connected"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <div className="h-2 overflow-hidden rounded-lg bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              className="h-11"
              disabled={!currentClip}
              onClick={handleTogglePlayback}
              type="button"
            >
              {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
              {isPlaying ? "Pause" : "Play"}
            </Button>
            <Button
              className="h-11"
              disabled={connectionStatus === "connected"}
              onClick={() => {
                ablyRef.current?.connect();
                setConnectionStatus("connecting");
              }}
              type="button"
              variant="outline"
            >
              {connectionStatus === "connecting" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Radio className="size-4" />
              )}
              Reconnect
            </Button>
          </div>
        </CardContent>
      </Card>

      {autoplayBlocked ? (
        <Alert variant="destructive">
          <AlertTitle>Playback blocked</AlertTitle>
          <AlertDescription>
            Tap Play to start this clip on your phone.
          </AlertDescription>
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Audio tour error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
