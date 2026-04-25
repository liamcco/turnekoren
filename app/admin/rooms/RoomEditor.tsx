"use client";

import { useMemo, useState, useTransition } from "react";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { Participant, Room, Stay } from "@/generated/prisma/client";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  copyRoomsFromStayAction,
  createRoomAction,
  deleteRoomAction,
  RoomEditorData,
  RoomActionState,
  updateRoomAction,
} from "./admin-data";

type RoomWithParticipantsAndStay = Room & {
  participants: Participant[];
  stay: Stay | null;
};

const initialState: RoomActionState = {
  ok: false,
  message: "",
};

function ActionMessage({ state }: { state: RoomActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p className={state.ok ? "text-sm text-green-600" : "text-sm text-destructive"}>
      {state.message}
    </p>
  );
}

function getParticipantLabel(participant: Participant) {
  return `${participant.name} · ${participant.choir} ${participant.voice}`;
}

function getSelectedStayName(stays: Stay[], selectedStayId: number | null) {
  return stays.find((stay) => stay.id === selectedStayId)?.name ?? "No stay selected";
}

export function getParticipantIdsInStayRooms(rooms: RoomWithParticipantsAndStay[]) {
  return new Set(rooms.flatMap((room) => room.participants.map((participant) => participant.id)));
}

export function StaySelector({
  stays,
  selectedStayId,
  onSelectStay,
}: {
  stays: Stay[];
  selectedStayId: number | null;
  onSelectStay: (stayId: number) => void;
}) {
  if (stays.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No stays yet</CardTitle>
          <CardDescription>Create a stay before editing rooms.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <a href="/admin/stays">Create stays</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Select
      value={selectedStayId?.toString() ?? ""}
      onValueChange={(value) => onSelectStay(Number(value))}
    >
      <SelectTrigger className="max-w-md">
        <SelectValue placeholder="Choose stay" />
      </SelectTrigger>
      <SelectContent>
        {stays.map((stay) => (
          <SelectItem key={stay.id} value={stay.id.toString()}>
            {stay.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function CopyRoomsDialog({
  open,
  onOpenChange,
  stays,
  selectedStayId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stays: Stay[];
  selectedStayId: number | null;
}) {
  const router = useRouter();
  const [state, setState] = useState<RoomActionState>(initialState);
  const [isPending, startTransition] = useTransition();
  const copyFromOptions = stays.filter((stay) => stay.id !== selectedStayId);

  if (!selectedStayId) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Copy rooms</DialogTitle>
          <DialogDescription>
            Duplicate all rooms from another stay into {getSelectedStayName(stays, selectedStayId)}.
          </DialogDescription>
        </DialogHeader>

        <form
          action={(formData) =>
            startTransition(async () => {
              const nextState = await copyRoomsFromStayAction(initialState, formData);
              setState(nextState);
              if (nextState.ok) {
                onOpenChange(false);
                router.refresh();
              }
            })
          }
          className="grid gap-4"
        >
          <input name="targetStayId" type="hidden" value={selectedStayId} />

          <div className="grid gap-2">
            <Label>Copy all rooms from</Label>
            <Select name="sourceStayId" required>
              <SelectTrigger>
                <SelectValue placeholder="Choose stay" />
              </SelectTrigger>
              <SelectContent>
                {copyFromOptions.map((stay) => (
                  <SelectItem key={stay.id} value={stay.id.toString()}>
                    {stay.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {copyFromOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              There are no other stays to copy rooms from.
            </p>
          ) : null}

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
            <Button disabled={isPending || copyFromOptions.length === 0} type="submit">
              <Copy className="size-4" />
              {isPending ? "Copying..." : "Copy rooms"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ParticipantPicker({
  participants,
  unavailableParticipantIds,
  selectedParticipantIds,
  onToggleParticipant,
}: {
  participants: Participant[];
  unavailableParticipantIds: Set<number>;
  selectedParticipantIds: number[];
  onToggleParticipant: (participantId: number) => void;
}) {
  const [search, setSearch] = useState("");
  const selectedSet = new Set(selectedParticipantIds);
  const filteredParticipants = participants
    .filter((participant) =>
      getParticipantLabel(participant).toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aIsSelected = selectedSet.has(a.id);
      const bIsSelected = selectedSet.has(b.id);

      if (aIsSelected !== bIsSelected) {
        return aIsSelected ? -1 : 1;
      }

      return a.name.localeCompare(b.name);
    });

  return (
    <div className="grid gap-3">
      <div className="grid gap-2">
        <Label htmlFor="participant-search">Participants</Label>
        <Input
          id="participant-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search participants"
        />
      </div>

      <div className="max-h-64 overflow-y-auto rounded-md border">
        {filteredParticipants.length === 0 ? (
          <p className="p-3 text-sm text-muted-foreground">No participants found.</p>
        ) : (
          filteredParticipants.map((participant) => {
            const isSelected = selectedSet.has(participant.id);
            const isUnavailable = unavailableParticipantIds.has(participant.id) && !isSelected;

            return (
              <button
                key={participant.id}
                className={
                  isSelected
                    ? "flex w-full items-center justify-between gap-3 border-b bg-accent px-3 py-2 text-left text-sm last:border-b-0"
                    : "flex w-full items-center justify-between gap-3 border-b px-3 py-2 text-left text-sm hover:bg-accent last:border-b-0"
                }
                disabled={isUnavailable}
                onClick={() => onToggleParticipant(participant.id)}
                type="button"
              >
                <span className={isUnavailable ? "text-muted-foreground line-through" : ""}>
                  {getParticipantLabel(participant)}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {isSelected ? "Selected" : isUnavailable ? "Already in room" : "Add"}
                </span>
              </button>
            );
          })
        )}
      </div>

      {selectedParticipantIds.map((participantId) => (
        <input key={participantId} name="participantIds" type="hidden" value={participantId} />
      ))}
    </div>
  );
}

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
          <DialogTitle>{isCreating ? "Create room" : "Edit room"}</DialogTitle>
          <DialogDescription>
            {isCreating
              ? "Add a room and assign participants."
              : "Update the room details and participants."}
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
            <Label htmlFor="room-name">Room name</Label>
            <Input
              id="room-name"
              name="name"
              defaultValue={room?.name ?? ""}
              placeholder="Room 101"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="room-notes">Notes</Label>
            <Textarea
              id="room-notes"
              name="notes"
              defaultValue={room?.notes ?? ""}
              placeholder="Optional notes"
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
              Cancel
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? "Saving..." : "Save room"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
              ? "1 participant"
              : `${room.participants.length} participants`}
          </CardDescription>
        </div>

        <div className="flex shrink-0 gap-1">
          <Button aria-label={`Edit ${room.name}`} onClick={onEdit} size="icon" type="button" variant="ghost">
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
              aria-label={`Delete ${room.name}`}
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
          <p className="text-sm text-muted-foreground">No participants assigned.</p>
        )}

        <ActionMessage state={deleteState} />
      </CardContent>
    </Card>
  );
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
            <CardTitle>Rooms</CardTitle>
          </div>

          {selectedStayId ? (
            <div className="flex shrink-0 gap-2">
              <Button
                aria-label="Copy rooms"
                onClick={() => setIsCopyDialogOpen(true)}
                size="icon"
                type="button"
                variant="outline"
              >
                <Copy className="size-4" />
              </Button>
              <Button aria-label="Create room" onClick={() => setSelectedRoom(null)} size="icon" type="button">
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
                <CardTitle>No rooms yet</CardTitle>
                <CardDescription>
                  Add a room or copy rooms from another stay.
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
