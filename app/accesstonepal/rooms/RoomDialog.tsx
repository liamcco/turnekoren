"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Participant } from "@/generated/prisma/client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { RoomActionState, createRoomAction, updateRoomAction } from "./actions";
import { ParticipantPicker } from "./ParticipantPicker";
import { RoomWithParticipantsAndStay, initialState, ActionMessage } from "./RoomEditor";

export function RoomDialog({
  room,
  selectedStayId,
  participants,
  unavailableParticipantIds,
  onClose,
}: {
  room: RoomWithParticipantsAndStay | null;
  selectedStayId: number;
  participants: Participant[];
  unavailableParticipantIds: Set<number>;
  onClose: () => void;
}) {
  const router = useRouter();
  const isCreating = room === null;
  const [selectedParticipantIds, setSelectedParticipantIds] = useState(
    room?.participants.map((participant) => participant.id) ?? []
  );
  const [state, setState] = useState<RoomActionState>(initialState);
  const [isPending, startTransition] = useTransition();

  function toggleParticipant(participantId: number) {
    setSelectedParticipantIds((currentIds) =>
      currentIds.includes(participantId)
        ? currentIds.filter((id) => id !== participantId)
        : [...currentIds, participantId]
    );
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isCreating ? "Skapa rum" : "Redigera rum"}</DialogTitle>
          <DialogDescription>
            {isCreating
              ? "Lägg till ett rum och placera deltagare."
              : "Uppdatera rumsdetaljer och deltagare."}
          </DialogDescription>
        </DialogHeader>

        <form
          action={(formData) =>
            startTransition(async () => {
              const nextState = isCreating
                ? await createRoomAction(initialState, formData)
                : await updateRoomAction(initialState, formData);

              setState(nextState);
              if (nextState.ok) {
                onClose();
                router.refresh();
              }
            })
          }
          className="grid gap-4"
        >
          <input name="stayId" type="hidden" value={selectedStayId} />
          {!isCreating ? <input name="id" type="hidden" value={room.id} /> : null}

          <div className="grid gap-2">
            <Label htmlFor="room-name">Rumsnamn</Label>
            <Input
              id="room-name"
              name="name"
              defaultValue={room?.name ?? ""}
              placeholder="Rum 101"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="room-notes">Anteckningar</Label>
            <Textarea
              id="room-notes"
              name="notes"
              defaultValue={room?.notes ?? ""}
              placeholder="Valfria anteckningar"
            />
          </div>

          <ParticipantPicker
            participants={participants}
            unavailableParticipantIds={unavailableParticipantIds}
            selectedParticipantIds={selectedParticipantIds}
            onToggleParticipant={toggleParticipant}
          />

          <ActionMessage state={state} />

          <div className="flex justify-end gap-2">
            <Button disabled={isPending} onClick={onClose} type="button" variant="outline">
              Avbryt
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? "Sparar..." : "Spara rum"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
