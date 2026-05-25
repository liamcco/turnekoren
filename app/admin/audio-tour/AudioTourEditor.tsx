"use client";

import { upload } from "@vercel/blob/client";
import {
  FileAudio,
  Loader2,
  Music2,
  Radio,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AUDIO_TOUR_MAX_FILE_SIZE_BYTES,
  AudioTourClipDto,
  AudioTourPlayEvent,
  isAllowedAudioContentType,
  isMp3Filename,
} from "@/lib/audio-tour";

type ApiMessage = {
  type: "success" | "error";
  text: string;
};

type ClipListResponse = {
  clips: AudioTourClipDto[];
};

type CreateClipResponse = {
  clip: AudioTourClipDto;
};

type TriggerResponse = {
  event: AudioTourPlayEvent;
};

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat("sv-SE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function normalizeMp3Filename(value: string) {
  const normalized = value
    .trim()
    .replace(/\\/g, "/")
    .split("/")
    .pop()
    ?.replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^\.+/, "")
    .toLowerCase();

  if (!normalized) {
    return "clip.mp3";
  }

  return normalized.endsWith(".mp3") ? normalized : `${normalized}.mp3`;
}

function getUploadId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function getErrorMessage(response: Response) {
  const body = (await response.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? "Request failed.";
}

function validateFile(file: File | null) {
  if (!file) {
    return "Choose an MP3 file.";
  }

  if (!isMp3Filename(file.name)) {
    return "Only .mp3 files are allowed.";
  }

  if (file.type && !isAllowedAudioContentType(file.type)) {
    return "Only audio/mpeg files are allowed.";
  }

  if (file.size <= 0 || file.size > AUDIO_TOUR_MAX_FILE_SIZE_BYTES) {
    return `MP3 files must be smaller than ${formatFileSize(
      AUDIO_TOUR_MAX_FILE_SIZE_BYTES,
    )}.`;
  }

  return null;
}

function UploadCard({
  onCreated,
}: {
  onCreated: (clip: AudioTourClipDto) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<ApiMessage | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const fileValue = formData.get("file");
    const file = fileValue instanceof File ? fileValue : null;
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const fileError = validateFile(file);

    if (!trimmedTitle) {
      setMessage({ type: "error", text: "Title is required." });
      return;
    }

    if (trimmedTitle.length > 140) {
      setMessage({ type: "error", text: "Title must be 140 characters or fewer." });
      return;
    }

    if (trimmedDescription.length > 1200) {
      setMessage({
        type: "error",
        text: "Description must be 1200 characters or fewer.",
      });
      return;
    }

    if (fileError || !file) {
      setMessage({ type: "error", text: fileError ?? "Choose an MP3 file." });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const pathname = `audio-tour/${getUploadId()}-${normalizeMp3Filename(file.name)}`;
      const blob = await upload(pathname, file, {
        access: "public",
        clientPayload: JSON.stringify({
          title: trimmedTitle,
          description: trimmedDescription,
          size: file.size,
        }),
        contentType: "audio/mpeg",
        handleUploadUrl: "/api/audio-tour/clips/upload",
        multipart: file.size > 8 * 1024 * 1024,
        onUploadProgress: ({ percentage }) => {
          setUploadProgress(Math.round(percentage));
        },
      });

      const response = await fetch("/api/audio-tour/clips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          description: trimmedDescription,
          size: file.size,
          blob,
        }),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const body = (await response.json()) as CreateClipResponse;
      onCreated(body.clip);
      setTitle("");
      setDescription("");
      formRef.current?.reset();
      setMessage({ type: "success", text: "Audio clip uploaded." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Upload failed.",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Upload className="size-4" />
          Upload MP3
        </CardTitle>
        <CardDescription>
          Stored in Vercel Blob and triggered to listeners through Ably.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form ref={formRef} className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="audio-title">Title</Label>
            <Input
              id="audio-title"
              maxLength={140}
              name="title"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Museum entrance"
              required
              value={title}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="audio-description">Description / location notes</Label>
            <Textarea
              id="audio-description"
              maxLength={1200}
              name="description"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Played when the group is gathered by the main doors."
              value={description}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="audio-file">MP3 file</Label>
            <Input
              accept="audio/mpeg,.mp3"
              disabled={isUploading}
              id="audio-file"
              name="file"
              required
              type="file"
            />
            <p className="text-xs text-muted-foreground">
              Maximum size: {formatFileSize(AUDIO_TOUR_MAX_FILE_SIZE_BYTES)}.
            </p>
          </div>

          {isUploading ? (
            <div className="grid gap-2" aria-live="polite">
              <div className="h-2 overflow-hidden rounded-lg bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Uploading {uploadProgress}%
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button disabled={isUploading} type="submit">
              {isUploading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Uploading
                </>
              ) : (
                <>
                  <Upload className="size-4" />
                  Upload
                </>
              )}
            </Button>

            {message ? (
              <p
                className={
                  message.type === "success"
                    ? "text-sm text-green-600"
                    : "text-sm text-destructive"
                }
              >
                {message.text}
              </p>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ClipCard({
  clip,
  actionClipId,
  onDelete,
  onTrigger,
}: {
  clip: AudioTourClipDto;
  actionClipId: string | null;
  onDelete: (clip: AudioTourClipDto) => void;
  onTrigger: (clip: AudioTourClipDto) => void;
}) {
  const isBusy = actionClipId === clip.id;

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <CardTitle className="flex min-w-0 items-center gap-2 text-base">
              <FileAudio className="size-4 shrink-0" />
              <span className="truncate">{clip.title}</span>
            </CardTitle>
            <CardDescription>
              {clip.description || "No location notes."}
            </CardDescription>
          </div>

          <Badge className="shrink-0" variant="outline">
            MP3
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>{formatFileSize(clip.size)}</span>
          <span>{formatCreatedAt(clip.createdAt)}</span>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4">
        <audio className="w-full" controls preload="metadata" src={clip.audioUrl}>
          <a href={clip.audioUrl}>Play locally / preview</a>
        </audio>

        <div className="flex flex-wrap items-center gap-2">
          <Button disabled={isBusy} onClick={() => onTrigger(clip)} type="button">
            {isBusy ? <Loader2 className="size-4 animate-spin" /> : <Radio className="size-4" />}
            Trigger for listeners
          </Button>

          <Button
            disabled={isBusy}
            onClick={() => onDelete(clip)}
            type="button"
            variant="destructive"
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function AudioTourEditor({
  initialClips,
}: {
  initialClips: AudioTourClipDto[];
}) {
  const [clips, setClips] = useState(initialClips);
  const [message, setMessage] = useState<ApiMessage | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionClipId, setActionClipId] = useState<string | null>(null);

  function handleCreated(clip: AudioTourClipDto) {
    setClips((current) => [clip, ...current.filter((item) => item.id !== clip.id)]);
  }

  async function refreshClips() {
    setIsRefreshing(true);
    setMessage(null);

    try {
      const response = await fetch("/api/audio-tour/clips", { cache: "no-store" });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const body = (await response.json()) as ClipListResponse;
      setClips(body.clips);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to refresh clips.",
      });
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleTrigger(clip: AudioTourClipDto) {
    setActionClipId(clip.id);
    setMessage(null);

    try {
      const response = await fetch(`/api/audio-tour/clips/${clip.id}/trigger`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const body = (await response.json()) as TriggerResponse;
      const seconds = Math.max(0, Math.ceil((body.event.startAt - Date.now()) / 1000));
      setMessage({
        type: "success",
        text: `Triggered "${body.event.title}". Listener playback starts in ${seconds} seconds.`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to trigger clip.",
      });
    } finally {
      setActionClipId(null);
    }
  }

  async function handleDelete(clip: AudioTourClipDto) {
    if (!window.confirm(`Delete "${clip.title}"?`)) {
      return;
    }

    setActionClipId(clip.id);
    setMessage(null);

    try {
      const response = await fetch(`/api/audio-tour/clips/${clip.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      setClips((current) => current.filter((item) => item.id !== clip.id));
      setMessage({ type: "success", text: "Audio clip deleted." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to delete clip.",
      });
    } finally {
      setActionClipId(null);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Audio Tour</h2>
          <p className="text-sm text-muted-foreground">
            Upload MP3 clips and trigger synchronized playback on listener phones.
          </p>
        </div>

        <Button
          disabled={isRefreshing}
          onClick={refreshClips}
          size="sm"
          type="button"
          variant="outline"
        >
          {isRefreshing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Refresh
        </Button>
      </div>

      <UploadCard onCreated={handleCreated} />

      {message ? (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid max-w-6xl gap-4 lg:grid-cols-2">
        {clips.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Music2 className="size-4" />
                No audio clips yet
              </CardTitle>
              <CardDescription>Upload the first MP3 above.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          clips.map((clip) => (
            <ClipCard
              key={clip.id}
              actionClipId={actionClipId}
              clip={clip}
              onDelete={handleDelete}
              onTrigger={handleTrigger}
            />
          ))
        )}
      </div>
    </div>
  );
}
