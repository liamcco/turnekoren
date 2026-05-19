"use client";

import { FileText, Pencil, Plus, Trash2, X } from "lucide-react";
import { Dispatch, SetStateAction, useActionState, useState } from "react";
import { FileAsset } from "@/generated/prisma/client";
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
import {
  deleteFileAction,
  FileActionState,
  updateFileAction,
  uploadFileAction,
} from "./actions";

export const initialState: FileActionState = {
  ok: false,
  message: "",
};

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function ActionMessage({ state }: { state: FileActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p className={state.ok ? "text-sm text-green-600" : "text-sm text-destructive"}>
      {state.message}
    </p>
  );
}

function UploadFileCard() {
  const [state, formAction, isPending] = useActionState(
    uploadFileAction,
    initialState
  );

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Plus className="size-4" />
          Ladda upp PDF
        </CardTitle>
        <CardDescription>
          Filen blir tillgänglig på /files/filnamn.pdf.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="file">PDF</Label>
            <Input id="file" name="file" required type="file" accept="application/pdf,.pdf" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="filename">Filnamn</Label>
            <Input
              id="filename"
              name="filename"
              placeholder="program.pdf"
            />
            <p className="text-xs text-muted-foreground">
              Lämna tomt för att använda filens originalnamn.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button disabled={isPending} type="submit">
              {isPending ? "Laddar upp..." : "Ladda upp"}
            </Button>
            <ActionMessage state={state} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function FileCard({
  file,
  editingFileId,
  setEditingFileId,
}: {
  file: FileAsset;
  editingFileId: number | null;
  setEditingFileId: Dispatch<SetStateAction<number | null>>;
}) {
  const isEditing = editingFileId === file.id;
  const [updateState, updateAction, isUpdating] = useActionState(
    updateFileAction,
    initialState
  );
  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteFileAction,
    initialState
  );

  if (!isEditing) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 py-4">
          <div className="min-w-0 space-y-1">
            <CardTitle className="flex min-w-0 items-center gap-2 text-base">
              <FileText className="size-4 shrink-0" />
              <span className="truncate">{file.filename}</span>
            </CardTitle>
            <CardDescription className="truncate">
              /files/{file.filename}
            </CardDescription>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(file.size)}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Button asChild size="icon" type="button" variant="ghost">
              <a aria-label={`Öppna ${file.filename}`} href={`/files/${file.filename}`} target="_blank">
                <FileText className="size-4" />
              </a>
            </Button>

            <Button
              aria-label={`Redigera ${file.filename}`}
              onClick={() => setEditingFileId(file.id)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Pencil className="size-4" />
            </Button>

            <form action={deleteAction}>
              <input name="id" type="hidden" value={file.id} />
              <Button
                aria-label={`Radera ${file.filename}`}
                disabled={isDeleting}
                size="icon"
                type="submit"
                variant="ghost"
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </form>
          </div>
        </CardHeader>

        {deleteState.message ? (
          <CardContent className="pt-0">
            <ActionMessage state={deleteState} />
          </CardContent>
        ) : null}
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>Redigera filnamn</CardTitle>
          <CardDescription>{file.filename}</CardDescription>
        </div>

        <Button
          aria-label="Avbryt redigering"
          disabled={isUpdating}
          onClick={() => setEditingFileId(null)}
          size="icon"
          type="button"
          variant="ghost"
        >
          <X className="size-4" />
        </Button>
      </CardHeader>

      <CardContent>
        <form action={updateAction} className="grid gap-4">
          <input name="id" type="hidden" value={file.id} />

          <div className="grid gap-2">
            <Label htmlFor={`filename-${file.id}`}>Filnamn</Label>
            <Input
              id={`filename-${file.id}`}
              name="filename"
              defaultValue={file.filename}
              required
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button disabled={isUpdating} type="submit">
              {isUpdating ? "Sparar..." : "Spara ändringar"}
            </Button>
            <Button
              disabled={isUpdating}
              onClick={() => setEditingFileId(null)}
              type="button"
              variant="outline"
            >
              Avbryt
            </Button>
            <ActionMessage state={updateState} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function FileEditor({ files }: { files: FileAsset[] }) {
  const [editingFileId, setEditingFileId] = useState<number | null>(null);

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-lg font-semibold">Filer</h2>
        <p className="text-sm text-muted-foreground">
          Ladda upp PDF-filer och redigera deras publika filnamn.
        </p>
      </div>

      <UploadFileCard />

      <div className="grid max-w-5xl gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {files.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Inga filer ännu</CardTitle>
              <CardDescription>Ladda upp den första PDF-filen ovan.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          files.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              editingFileId={editingFileId}
              setEditingFileId={setEditingFileId}
            />
          ))
        )}
      </div>
    </div>
  );
}
