"use client";

import Link from "next/link";
import { Dispatch, SetStateAction, useActionState, useCallback, useEffect, useState } from "react";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { Room, Stay } from "@/generated/prisma/client";
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
  createStayAction,
  deleteStayAction,
  getStayData,
  StayActionState,
  updateStayAction,
} from "./admin-data";

type StayWithRooms = Stay & {
  rooms: Room[];
};

const initialState: StayActionState = {
  ok: false,
  message: "",
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

function toDateInputValue(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function ActionMessage({ state }: { state: StayActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p className={state.ok ? "text-sm text-green-600" : "text-sm text-destructive"}>
      {state.message}
    </p>
  );
}

function CreateStayDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [state, formAction, isPending] = useActionState(createStayAction, initialState);

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
          <DialogTitle>Create stay</DialogTitle>
          <DialogDescription>Add an accommodation period to the trip.</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="new-name">Name</Label>
            <Input id="new-name" name="name" placeholder="Hotel / cabin / hostel" required />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="new-start-date">Start date</Label>
              <Input id="new-start-date" name="startDate" required type="date" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="new-end-date">End date</Label>
              <Input id="new-end-date" name="endDate" required type="date" />
            </div>
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

function StayCard({
  stay,
  editingStayId,
  setEditingStayId,
  onSaved,
}: {
  stay: StayWithRooms;
  editingStayId: number | null;
  setEditingStayId: Dispatch<SetStateAction<number | null>>;
  onSaved: () => void;
}) {
  const isEditing = editingStayId === stay.id;
  const [updateState, updateAction, isUpdating] = useActionState(updateStayAction, initialState);
  const [deleteState, deleteAction, isDeleting] = useActionState(deleteStayAction, initialState);
  const roomCount = stay.rooms.length;

  useEffect(() => {
    if (updateState.ok) {
      setEditingStayId(null);
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
      <div className="grid grid-cols-[1fr_8rem] items-center gap-3 rounded-md border px-4 py-3 md:grid-cols-[minmax(8rem,14rem)_minmax(12rem,1fr)_minmax(10rem,12rem)_7.5rem]">
        <div className="min-w-0">
          <p className="truncate font-medium">{stay.name}</p>
          {stay.notes ? (
            <p className="hidden line-clamp-1 text-sm text-muted-foreground md:block">{stay.notes}</p>
          ) : null}
        </div>

        <div className="hidden text-sm text-muted-foreground md:block">
          {formatDate(stay.startDate)} – {formatDate(stay.endDate)}
        </div>

        <div className="hidden items-center text-sm text-muted-foreground md:flex">
          <Button asChild size="sm" variant={roomCount > 0 ? "outline" : "default"}>
            <Link href={`/admin/rooms?stayId=${stay.id}`}>
              {roomCount > 0
                ? roomCount === 1
                  ? "1 room"
                  : `${roomCount} rooms`
                : "Add rooms"}
              <ExternalLink className="size-3" />
            </Link>
          </Button>
        </div>

        <div className="flex justify-end gap-1">
          <Button
            asChild
            aria-label={roomCount > 0 ? `View rooms for ${stay.name}` : `Add rooms to ${stay.name}`}
            size="icon"
            variant="ghost"
            className="md:hidden"
          >
            <Link href={`/admin/rooms?stayId=${stay.id}`}>
              <ExternalLink className="size-4" />
            </Link>
          </Button>

          <Button
            aria-label={`Edit ${stay.name}`}
            onClick={() => setEditingStayId(stay.id)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Pencil className="size-4" />
          </Button>

          <form action={deleteAction}>
            <input name="id" type="hidden" value={stay.id} />
            <Button
              aria-label={`Delete ${stay.name}`}
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
          <div className="col-span-2 md:col-span-4">
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
        className="grid gap-4 lg:grid-cols-[minmax(16rem,1fr)_12rem_12rem_auto] lg:items-end"
      >
        <input name="id" type="hidden" value={stay.id} />

        <div className="grid gap-2">
          <Label htmlFor={`name-${stay.id}`}>Name</Label>
          <Input id={`name-${stay.id}`} name="name" defaultValue={stay.name} required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`start-date-${stay.id}`}>Start date</Label>
          <Input
            id={`start-date-${stay.id}`}
            name="startDate"
            defaultValue={toDateInputValue(stay.startDate)}
            required
            type="date"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`end-date-${stay.id}`}>End date</Label>
          <Input
            id={`end-date-${stay.id}`}
            name="endDate"
            defaultValue={toDateInputValue(stay.endDate)}
            required
            type="date"
          />
        </div>

        <div className="flex gap-2 lg:justify-end">
          <Button disabled={isUpdating} type="submit">
            {isUpdating ? "Saving..." : "Save"}
          </Button>
          <Button
            disabled={isUpdating}
            onClick={() => setEditingStayId(null)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
        </div>

        <div className="grid gap-2 lg:col-span-4">
          <Label htmlFor={`notes-${stay.id}`}>Notes</Label>
          <Textarea id={`notes-${stay.id}`} name="notes" defaultValue={stay.notes ?? ""} />
        </div>

        {updateState.message ? (
          <div className="lg:col-span-4">
            <ActionMessage state={updateState} />
          </div>
        ) : null}
      </form>
    </div>
  );
}

export function StayEditor({ initialStays }: { initialStays: StayWithRooms[] }) {
  const [stays, setStays] = useState(initialStays);
  const [editingStayId, setEditingStayId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    setStays(initialStays);
  }, [initialStays]);

  const refreshStays = useCallback(async () => {
    const freshStays = await getStayData();
    setStays(freshStays);
  }, []);

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Stays</h2>
          <p className="text-sm text-muted-foreground">Create and edit accommodation periods for the trip.</p>
        </div>

        <Button onClick={() => setIsCreateDialogOpen(true)} size="icon" type="button">
          <Plus className="size-4" />
        </Button>
      </div>

      <CreateStayDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSaved={() => void refreshStays()}
      />

      <div className="grid w-full gap-2">
        {stays.length > 0 ? (
          <div className="hidden gap-3 px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid md:grid-cols-[minmax(8rem,14rem)_minmax(12rem,1fr)_minmax(10rem,12rem)_7.5rem]">
            <div>Name</div>
            <div>Dates</div>
            <div>Rooms</div>
            <div className="text-right">Actions</div>
          </div>
        ) : null}

        {stays.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No stays yet</CardTitle>
              <CardDescription>Create the first stay above.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          stays.map((stay) => (
            <StayCard
              key={stay.id}
              stay={stay}
              editingStayId={editingStayId}
              setEditingStayId={setEditingStayId}
              onSaved={() => void refreshStays()}
            />
          ))
        )}
      </div>
    </div>
  );
}