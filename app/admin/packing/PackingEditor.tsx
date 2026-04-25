"use client";

import { Dispatch, SetStateAction, useActionState, useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { PackingItem } from "@/generated/prisma/browser";
import { Button } from "@/components/ui/button";
import {
  Card,
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
  createPackingItemAction,
  deletePackingItemAction,
  getPackingItemData,
  PackingItemActionState,
  updatePackingItemAction,
} from "./admin-data";

const initialState: PackingItemActionState = {
  ok: false,
  message: "",
};

function ActionMessage({ state }: { state: PackingItemActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p className={state.ok ? "text-sm text-green-600" : "text-sm text-destructive"}>
      {state.message}
    </p>
  );
}

function CreatePackingItemDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [state, formAction, isPending] = useActionState(createPackingItemAction, initialState);

  useEffect(() => {
    if (state.ok) {
      onOpenChange(false);
      onSaved();
    }
  }, [state.ok]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create packing item</DialogTitle>
          <DialogDescription>Add something people should remember to pack.</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="new-label">Label</Label>
            <Input id="new-label" name="label" placeholder="Passport" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-category">Category</Label>
            <Input id="new-category" name="category" placeholder="Documents" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-notes">Notes</Label>
            <Textarea id="new-notes" name="notes" placeholder="Optional notes" />
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

function PackingItemCard({
  item,
  editingItemId,
  setEditingItemId,
  onSaved,
}: {
  item: PackingItem;
  editingItemId: number | null;
  setEditingItemId: Dispatch<SetStateAction<number | null>>;
  onSaved: () => void;
}) {
  const isEditing = editingItemId === item.id;
  const [updateState, updateAction, isUpdating] = useActionState(updatePackingItemAction, initialState);
  const [deleteState, deleteAction, isDeleting] = useActionState(deletePackingItemAction, initialState);

  useEffect(() => {
    if (updateState.ok) {
      setEditingItemId(null);
      onSaved();
    }
  }, [updateState.ok]);

  useEffect(() => {
    if (deleteState.ok) {
      onSaved();
    }
  }, [deleteState.ok]);

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

          <form action={deleteAction}>
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
        action={updateAction}
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

function groupItemsByCategory(items: PackingItem[]) {
  return items.reduce<Record<string, PackingItem[]>>((acc, item) => {
    acc[item.category] = [...(acc[item.category] ?? []), item];
    return acc;
  }, {});
}

export function PackingItemEditor({ initialItems }: { initialItems: PackingItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const refreshItems = useCallback(async () => {
    const freshItems = await getPackingItemData();
    setItems(freshItems);
  }, []);

  const itemsByCategory = groupItemsByCategory(items);
  const categories = Object.keys(itemsByCategory).sort((a, b) => a.localeCompare(b));

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Packing</h2>
          <p className="text-sm text-muted-foreground">Create and edit packing items for the trip.</p>
        </div>

        <Button onClick={() => setIsCreateDialogOpen(true)} size="icon" type="button">
          <Plus className="size-4" />
        </Button>
      </div>

      <CreatePackingItemDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSaved={() => void refreshItems()}
      />

      <div className="grid w-full gap-6">
        {items.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No packing items yet</CardTitle>
              <CardDescription>Create the first packing item above.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          categories.map((category) => (
            <section key={category} className="grid gap-2">
              <h2 className="px-1 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                {category}
              </h2>

              {itemsByCategory[category].map((item) => (
                <PackingItemCard
                  key={item.id}
                  item={item}
                  editingItemId={editingItemId}
                  setEditingItemId={setEditingItemId}
                  onSaved={() => void refreshItems()}
                />
              ))}
            </section>
          ))
        )}
      </div>
    </div>
  );
}