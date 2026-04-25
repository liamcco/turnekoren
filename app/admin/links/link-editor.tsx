"use client";

import { Dispatch, SetStateAction, useActionState, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { UsefulLink } from "@/generated/prisma/browser";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createLinkAction,
  deleteLinkAction,
  LinkActionState,
  updateLinkAction,
} from "./admin-data";

const initialState: LinkActionState = {
  ok: false,
  message: "",
};

function ActionMessage({ state }: { state: LinkActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p className={state.ok ? "text-sm text-green-600" : "text-sm text-destructive"}>
      {state.message}
    </p>
  );
}

function CreateLinkDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, isPending] = useActionState(
    createLinkAction,
    initialState
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create link</DialogTitle>
          <DialogDescription>Add a useful link to the trip hub.</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="new-title">Title</Label>
            <Input id="new-title" name="title" placeholder="Google Maps" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-url">URL</Label>
            <Input
              id="new-url"
              name="url"
              placeholder="https://example.com"
              required
              type="url"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-description">Description</Label>
            <Textarea
              id="new-description"
              name="description"
              placeholder="Optional description"
            />
          </div>

          <ActionMessage state={state} />

          <div className="flex justify-end gap-2">
            <Button
              disabled={isPending}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditLinkForm({
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
              aria-label={`Edit ${link.title}`}
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
                aria-label={`Delete ${link.title}`}
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
          <CardTitle>Edit link</CardTitle>
          <CardDescription>{link.title}</CardDescription>
        </div>

        <Button
          aria-label="Cancel editing"
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
            <Label htmlFor={`title-${link.id}`}>Title</Label>
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
            <Label htmlFor={`description-${link.id}`}>Description</Label>
            <Textarea
              id={`description-${link.id}`}
              name="description"
              defaultValue={link.description ?? ""}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button disabled={isUpdating} type="submit">
              {isUpdating ? "Saving..." : "Save changes"}
            </Button>
            <Button
              disabled={isUpdating}
              onClick={() => setEditingLinkId(null)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <ActionMessage state={updateState} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function LinkEditor({ links }: { links: UsefulLink[] }) {
  const [editingLinkId, setEditingLinkId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Links</h2>
          <p className="text-sm text-muted-foreground">Create and edit useful links for the trip hub.</p>
        </div>

        <Button onClick={() => setIsCreateDialogOpen(true)} size="icon" type="button">
          <Plus className="size-4" />
        </Button>
      </div>

      <CreateLinkDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      <div className="grid max-w-5xl gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {links.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No links yet</CardTitle>
              <CardDescription>Create the first useful link above.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          links.map((link) => (
            <EditLinkForm
              key={link.id}
              link={link}
              editingLinkId={editingLinkId}
              setEditingLinkId={setEditingLinkId}
            />
          ))
        )}
      </div>
    </div>
  );
}