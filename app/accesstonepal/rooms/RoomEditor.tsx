"use client";

import { useMemo, useState } from "react";
import { Copy, Plus } from "lucide-react";
import { Participant, Room, Stay } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  RoomEditorData,
  RoomActionState,
} from "./actions";
import { RoomDialog } from "./RoomDialog";
import { CopyRoomsDialog } from "./CopyRoomsDialog";
import { StaySelector } from "./Selectors";
import { RoomCard } from "./RoomCard";

export type RoomWithParticipantsAndStay = Room & {
  participants: Participant[];
  stay: Stay | null;
};

export const initialState: RoomActionState = {
  ok: false,
  message: "",
};

export function ActionMessage({ state }: { state: RoomActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p className={state.ok ? "text-sm text-green-600" : "text-sm text-destructive"}>
      {state.message}
    </p>
  );
}

export function getParticipantLabel(participant: Participant) {
  return `${participant.name} · ${participant.choir} ${participant.voice}`;
}

export function getSelectedStayName(stays: Stay[], selectedStayId: number | null) {
  return stays.find((stay) => stay.id === selectedStayId)?.name ?? "Inget boende valt";
}

export function getParticipantIdsInStayRooms(rooms: RoomWithParticipantsAndStay[]) {
  return new Set(rooms.flatMap((room) => room.participants.map((participant) => participant.id)));
}

export function getDefaultStayId(stays: Stay[]) {
  return stays[0]?.id ?? null;
}

export function RoomEditor({ data, stayId }: { data: RoomEditorData; stayId: string | undefined }) {
  const [selectedStayId, setSelectedStayId] = useState<number | null>(stayId ? parseInt(stayId) : getDefaultStayId(data.stays));
  const [selectedRoom, setSelectedRoom] = useState<RoomWithParticipantsAndStay | null | undefined>(undefined);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);

  const selectedStayRooms = useMemo(
    () => data.rooms.filter((room) => room.stayId === selectedStayId),
    [data.rooms, selectedStayId]
  );
  const unavailableParticipantIds = useMemo(
    () => getParticipantIdsInStayRooms(selectedStayRooms),
    [selectedStayRooms]
  );

  return (
    <div className="grid gap-6">
        <div className="grid gap-4">
          <StaySelector
            stays={data.stays}
            selectedStayId={selectedStayId}
            onSelectStay={setSelectedStayId}
          />
        </div>
        <div className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Rum</CardTitle>
          </div>

          {selectedStayId ? (
            <div className="flex shrink-0 gap-2">
              <Button
                aria-label="Kopiera rum"
                onClick={() => setIsCopyDialogOpen(true)}
                size="icon"
                type="button"
                variant="outline"
              >
                <Copy className="size-4" />
              </Button>
              <Button aria-label="Skapa rum" onClick={() => setSelectedRoom(null)} size="icon" type="button">
                <Plus className="size-4" />
              </Button>
            </div>
          ) : null}
        </div>

      <CopyRoomsDialog
        open={isCopyDialogOpen}
        onOpenChange={setIsCopyDialogOpen}
        stays={data.stays}
        selectedStayId={selectedStayId}
      />

      {selectedStayId ? (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {selectedStayRooms.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Inga rum ännu</CardTitle>
                <CardDescription>
                  Lägg till ett rum eller kopiera rum från ett annat boende.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            selectedStayRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onEdit={() => setSelectedRoom(room)}
              />
            ))
          )}
        </div>
      ) : null}

      {selectedStayId && selectedRoom !== undefined ? (
        <RoomDialog
          room={selectedRoom}
          selectedStayId={selectedStayId}
          participants={data.participants}
          unavailableParticipantIds={
            selectedRoom
              ? new Set(
                  [...unavailableParticipantIds].filter(
                    (participantId) =>
                      !selectedRoom.participants.some((participant) => participant.id === participantId)
                  )
                )
              : unavailableParticipantIds
          }
          onClose={() => setSelectedRoom(undefined)}
        />
      ) : null}
    </div>
  );
}
