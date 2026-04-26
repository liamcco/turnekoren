"use client"

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, X } from "lucide-react";
import { Dispatch, SetStateAction, useActionState } from "react";
import { updateLinkAction, deleteLinkAction } from "./actions";
import { UsefulLink } from "@/generated/prisma/client";
import { Label } from "@/components/ui/label";
import { ActionMessage, initialState } from "./LinkEditor";

export function EditLinkForm({
  link,
  editingLinkId,
  setEditingLinkId,
}: {
  link: UsefulLink;
  editingLinkId: number | null;
  setEditingLinkId: Dispatch<SetStateAction<number | null>>;
}) {
  const isEditing = editingLinkId === link.id;
  const [updateState, updateAction, isUpdating] = useActionState(
    updateLinkAction,
    initialState
  );
  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteLinkAction,
    initialState
  );

  if (!isEditing) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 py-4">
          <div className="min-w-0 space-y-1">
            <CardTitle className="truncate text-base">{link.title}</CardTitle>
            <CardDescription className="truncate">{link.url}</CardDescription>
            {link.description ? (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {link.description}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Button
              aria-label={`Redigera ${link.title}`}
              onClick={() => setEditingLinkId(link.id)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Pencil className="size-4" />
            </Button>

            <form action={deleteAction}>
              <input name="id" type="hidden" value={link.id} />
              <Button
                aria-label={`Radera ${link.title}`}
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
          <CardTitle>Redigera länk</CardTitle>
          <CardDescription>{link.title}</CardDescription>
        </div>

        <Button
          aria-label="Avbryt redigering"
          disabled={isUpdating}
          onClick={() => setEditingLinkId(null)}
          size="icon"
          type="button"
          variant="ghost"
        >
          <X className="size-4" />
        </Button>
      </CardHeader>

      <CardContent className="grid gap-4">
        <form action={updateAction} className="grid gap-4">
          <input name="id" type="hidden" value={link.id} />

          <div className="grid gap-2">
            <Label htmlFor={`title-${link.id}`}>Titel</Label>
            <Input
              id={`title-${link.id}`}
              name="title"
              defaultValue={link.title}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`url-${link.id}`}>URL</Label>
            <Input
              id={`url-${link.id}`}
              name="url"
              defaultValue={link.url}
              required
              type="url"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`description-${link.id}`}>Beskrivning</Label>
            <Textarea
              id={`description-${link.id}`}
              name="description"
              defaultValue={link.description ?? ""}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button disabled={isUpdating} type="submit">
              {isUpdating ? "Sparar..." : "Spara ändringar"}
            </Button>
            <Button
              disabled={isUpdating}
              onClick={() => setEditingLinkId(null)}
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
