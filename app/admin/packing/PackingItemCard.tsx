"use effect"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PackingItem } from "@/generated/prisma/client";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState, useTransition } from "react";
import { deletePackingItemAction, updatePackingItemAction } from "./actions";
import { initialState, ActionMessage } from "./PackingEditor";
import { Label } from "@/components/ui/label";

export function PackingItemCard({
  item,
  editingItemId,
  setEditingItemId,
}: {
  item: PackingItem;
  editingItemId: number | null;
  setEditingItemId: Dispatch<SetStateAction<number | null>>;
}) {
  const router = useRouter();
  const isEditing = editingItemId === item.id;
  const [updateState, setUpdateState] = useState(initialState);
  const [deleteState, setDeleteState] = useState(initialState);
  const [isUpdating, startUpdateTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  if (!isEditing) {
    return (
      <div className="grid items-center gap-3 rounded-md border px-4 py-3 md:grid-cols-[minmax(14rem,1fr)_minmax(14rem,2fr)_auto]">
        <div className="min-w-0">
          <p className="truncate font-medium">{item.label}</p>
        </div>

        <div className="min-w-0 text-sm text-muted-foreground">
          {item.notes ? <p className="line-clamp-1">{item.notes}</p> : <span>—</span>}
        </div>

        <div className="flex justify-end gap-1">
          <Button
            aria-label={`Edit ${item.label}`}
            onClick={() => setEditingItemId(item.id)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Pencil className="size-4" />
          </Button>

          <form
            action={(formData) =>
              startDeleteTransition(async () => {
                const nextState = await deletePackingItemAction(initialState, formData);
                setDeleteState(nextState);

                if (nextState.ok) {
                  router.refresh();
                }
              })
            }
          >
            <input name="id" type="hidden" value={item.id} />
            <Button
              aria-label={`Delete ${item.label}`}
              disabled={isDeleting}
              size="icon"
              type="submit"
              variant="ghost"
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </form>
        </div>

        {deleteState.message ? (
          <div className="md:col-span-3">
            <ActionMessage state={deleteState} />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card p-4">
      <form
        action={(formData) =>
          startUpdateTransition(async () => {
            const nextState = await updatePackingItemAction(initialState, formData);
            setUpdateState(nextState);

            if (!nextState.ok) {
              return;
            }

            setEditingItemId(null);
            router.refresh();
          })
        }
        className="grid gap-4 lg:grid-cols-[minmax(14rem,1fr)_minmax(10rem,16rem)_auto] lg:items-end"
      >
        <input name="id" type="hidden" value={item.id} />

        <div className="grid gap-2">
          <Label htmlFor={`label-${item.id}`}>Label</Label>
          <Input id={`label-${item.id}`} name="label" defaultValue={item.label} required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`category-${item.id}`}>Category</Label>
          <Input id={`category-${item.id}`} name="category" defaultValue={item.category} required />
        </div>

        <div className="flex gap-2 lg:justify-end">
          <Button disabled={isUpdating} type="submit">
            {isUpdating ? "Saving..." : "Save"}
          </Button>
          <Button
            disabled={isUpdating}
            onClick={() => setEditingItemId(null)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
        </div>

        <div className="grid gap-2 lg:col-span-3">
          <Label htmlFor={`notes-${item.id}`}>Notes</Label>
          <Textarea id={`notes-${item.id}`} name="notes" defaultValue={item.notes ?? ""} />
        </div>

        {updateState.message ? (
          <div className="lg:col-span-3">
            <ActionMessage state={updateState} />
          </div>
        ) : null}
      </form>
    </div>
  );
}