"use client"

import { useRouter } from "next/navigation";
import { ActionMessage, initialState, RoomWithParticipantsAndStay } from "./RoomEditor";
import { useState, useTransition } from "react";
import { deleteRoomAction, RoomActionState } from "./actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export function RoomCard({
  room,
  onEdit,
}: {
  room: RoomWithParticipantsAndStay;
  onEdit: () => void;
}) {
  const router = useRouter();
  const [deleteState, setDeleteState] = useState<RoomActionState>(initialState);
  const [isDeleting, startTransition] = useTransition();

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="min-w-0">
          <CardTitle className="truncate text-base">{room.name}</CardTitle>
          <CardDescription>
            {room.participants.length === 1
              ? "1 deltagare"
              : `${room.participants.length} deltagare`}
          </CardDescription>
        </div>

        <div className="flex shrink-0 gap-1">
          <Button aria-label={`Redigera ${room.name}`} onClick={onEdit} size="icon" type="button" variant="ghost">
            <Pencil className="size-4" />
          </Button>

          <form
            action={(formData) =>
              startTransition(async () => {
                const nextState = await deleteRoomAction(initialState, formData);
                setDeleteState(nextState);
                if (nextState.ok) {
                  router.refresh();
                }
              })
            }
          >
            <input name="id" type="hidden" value={room.id} />
            <Button
              aria-label={`Radera ${room.name}`}
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

      <CardContent className="grid gap-3">
        {room.notes ? <p className="text-sm text-muted-foreground">{room.notes}</p> : null}

        {room.participants.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {room.participants.map((participant) => (
              <span
                key={participant.id}
                className="rounded-full border bg-muted px-2 py-1 text-xs text-muted-foreground"
              >
                {participant.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Inga deltagare placerade.</p>
        )}

        <ActionMessage state={deleteState} />
      </CardContent>
    </Card>
  );
}
