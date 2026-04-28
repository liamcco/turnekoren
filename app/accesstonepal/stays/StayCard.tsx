"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState, useTransition } from "react";
import { deleteStayAction, updateStayAction } from "./actions";
import { ActionMessage, formatDate, initialState, StayWithRooms, toDateInputValue } from "./StaysEditor";

export function StayCard({
  stay,
  editingStayId,
  setEditingStayId,
}: {
  stay: StayWithRooms;
  editingStayId: number | null;
  setEditingStayId: Dispatch<SetStateAction<number | null>>;
}) {
  const router = useRouter();
  const roomCount = stay.rooms.length;
  const isEditing = editingStayId === stay.id;

  const [updateState, setUpdateState] = useState(initialState);
  const [deleteState, setDeleteState] = useState(initialState);
  const [isUpdating, startUpdateTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

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
          {formatDate(stay.startDate)} - {formatDate(stay.endDate)}
        </div>

        <div className="hidden items-center text-sm text-muted-foreground md:flex">
          <Button asChild size="sm" variant={roomCount > 0 ? "outline" : "default"}>
            <Link className="inline-flex items-center gap-2" href={`/admin/rooms?stayId=${stay.id}`}>
              <span>
                {roomCount > 0
                  ? roomCount === 1
                    ? "1 rum"
                    : `${roomCount} rum`
                  : "Lägg till rum"}
              </span>
              <ExternalLink className="size-3.5" />
            </Link>
          </Button>
        </div>

        <div className="flex justify-end gap-1">
          <Button
            asChild
            aria-label={roomCount > 0 ? `Visa rum för ${stay.name}` : `Lägg till rum för ${stay.name}`}
            size="icon"
            variant="ghost"
            className="md:hidden"
          >
            <Link href={`/admin/rooms?stayId=${stay.id}`}>
              <ExternalLink className="size-4" />
            </Link>
          </Button>

          <Button
            aria-label={`Redigera ${stay.name}`}
            onClick={() => setEditingStayId(stay.id)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Pencil className="size-4" />
          </Button>

          <form
            action={(formData) =>
              startDeleteTransition(async () => {
                const nextState = await deleteStayAction(initialState, formData);
                setDeleteState(nextState);

                if (nextState.ok) {
                  router.refresh();
                }
              })
            }
          >
            <input name="id" type="hidden" value={stay.id} />
            <Button
              aria-label={`Radera ${stay.name}`}
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
        action={(formData) =>
          startUpdateTransition(async () => {
            const nextState = await updateStayAction(initialState, formData);
            setUpdateState(nextState);

            if (!nextState.ok) {
              return;
            }

            setEditingStayId(null);
            router.refresh();
          })
        }
        className="grid gap-4 lg:grid-cols-[minmax(16rem,1fr)_12rem_12rem_auto] lg:items-end"
      >
        <input name="id" type="hidden" value={stay.id} />

        <div className="grid gap-2">
          <Label htmlFor={`name-${stay.id}`}>Namn</Label>
          <Input id={`name-${stay.id}`} name="name" defaultValue={stay.name} required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`start-date-${stay.id}`}>Startdatum</Label>
          <Input
            id={`start-date-${stay.id}`}
            name="startDate"
            defaultValue={toDateInputValue(stay.startDate)}
            required
            type="date"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`end-date-${stay.id}`}>Slutdatum</Label>
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
            {isUpdating ? "Sparar..." : "Spara"}
          </Button>
          <Button
            disabled={isUpdating}
            onClick={() => setEditingStayId(null)}
            type="button"
            variant="outline"
          >
            Avbryt
          </Button>
        </div>

        <div className="grid gap-2 lg:col-span-4">
          <Label htmlFor={`notes-${stay.id}`}>Anteckningar</Label>
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
