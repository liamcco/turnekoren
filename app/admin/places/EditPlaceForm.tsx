import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Place } from "@/generated/prisma/client";
import { Pencil, Trash2, X } from "lucide-react";
import { Dispatch, SetStateAction, useActionState } from "react";
import { updatePlaceAction, deletePlaceAction } from "./actions";
import { ActionMessage, initialState } from "./PlaceEditor";
import { Label } from "@/components/ui/label";

export function EditPlaceForm({
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