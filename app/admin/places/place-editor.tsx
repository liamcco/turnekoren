"use client";

import { Dispatch, SetStateAction, useActionState, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { Place } from "@/generated/prisma/browser";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createPlaceAction,
  deletePlaceAction,
  PlaceActionState,
  updatePlaceAction,
} from "./admin-data";

const initialState: PlaceActionState = {
  ok: false,
  message: "",
};

function ActionMessage({ state }: { state: PlaceActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p className={state.ok ? "text-sm text-green-600" : "text-sm text-destructive"}>
      {state.message}
    </p>
  );
}

function CreatePlaceDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, isPending] = useActionState(
    createPlaceAction,
    initialState
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create place</DialogTitle>
          <DialogDescription>Add a place to the trip hub.</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="new-name">Name</Label>
            <Input id="new-name" name="name" placeholder="Google Maps" required />
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
            <Label htmlFor="new-address">Address</Label>
            <Input
              id="new-address"
              name="address"
              placeholder="Optional address"
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

function EditPlaceForm({
  place: place,
  editingPlaceId,
  setEditingPlaceId,
}: {
  place: Place;
  editingPlaceId: number | null;
  setEditingPlaceId: Dispatch<SetStateAction<number | null>>;
}) {
  const isEditing = editingPlaceId === place.id;
  const [updateState, updateAction, isUpdating] = useActionState(
    updatePlaceAction,
    initialState
  );
  const [deleteState, deleteAction, isDeleting] = useActionState(
    deletePlaceAction,
    initialState
  );

  if (!isEditing) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 py-4">
          <div className="min-w-0 space-y-1">
            <CardTitle className="truncate text-base">{place.name}</CardTitle>
            <CardDescription className="truncate">{place.url}</CardDescription>
            {place.address ? (
              <p className="truncate text-sm text-muted-foreground">
                {place.address}
              </p>
            ) : null}
            {place.description ? (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {place.description}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Button
              aria-label={`Edit ${place.name}`}
              onClick={() => setEditingPlaceId(place.id)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Pencil className="size-4" />
            </Button>

            <form action={deleteAction}>
              <input name="id" type="hidden" value={place.id} />
              <Button
                aria-label={`Delete ${place.name}`}
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
          <CardTitle>Edit place</CardTitle>
          <CardDescription>{place.name}</CardDescription>
        </div>

        <Button
          aria-label="Cancel editing"
          disabled={isUpdating}
          onClick={() => setEditingPlaceId(null)}
          size="icon"
          type="button"
          variant="ghost"
        >
          <X className="size-4" />
        </Button>
      </CardHeader>

      <CardContent className="grid gap-4">
        <form action={updateAction} className="grid gap-4">
          <input name="id" type="hidden" value={place.id} />

          <div className="grid gap-2">
            <Label htmlFor={`title-${place.id}`}>Title</Label>
            <Input
              id={`title-${place.id}`}
              name="title"
              defaultValue={place.name}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`url-${place.id}`}>URL</Label>
            <Input
              id={`url-${place.id}`}
              name="url"
              defaultValue={place.url}
              required
              type="url"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`address-${place.id}`}>Address</Label>
            <Input
              id={`address-${place.id}`}
              name="address"
              defaultValue={place.address ?? ""}
              placeholder="Optional address"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`description-${place.id}`}>Description</Label>
            <Textarea
              id={`description-${place.id}`}
              name="description"
              defaultValue={place.description ?? ""}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button disabled={isUpdating} type="submit">
              {isUpdating ? "Saving..." : "Save changes"}
            </Button>
            <Button
              disabled={isUpdating}
              onClick={() => setEditingPlaceId(null)}
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

export function PlaceEditor({ places }: { places: Place[] }) {
  const [editingPlaceId, setEditingPlaceId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Places</h2>
          <p className="text-sm text-muted-foreground">Create and edit useful places for the trip hub.</p>
        </div>

        <Button onClick={() => setIsCreateDialogOpen(true)} size="icon" type="button">
          <Plus className="size-4" />
        </Button>
      </div>

      <CreatePlaceDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      <div className="grid max-w-5xl gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {places.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No places yet</CardTitle>
              <CardDescription>Create the first place above.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          places.map((place) => (
            <EditPlaceForm
              key={place.id}
              place={place}
              editingPlaceId={editingPlaceId}
              setEditingPlaceId={setEditingPlaceId}
            />
          ))
        )}
      </div>
    </div>
  );
}