"use client";

import { Dispatch, SetStateAction, useActionState, useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { Participant } from "@/generated/prisma/browser";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createParticipantAction,
  deleteParticipantAction,
  getParticipantData,
  ParticipantActionState,
  updateParticipantAction,
} from "./admin-data";

const choirs = ["MK", "DK", "KK"] as const;
const voices = ["B2", "B1", "T2", "T1", "A2", "A1", "S2", "S1"] as const;

const initialState: ParticipantActionState = {
  ok: false,
  message: "",
};

type SortKey = "name" | "choir" | "voice";
type SortDirection = "asc" | "desc";

function getSortIndicator(sortKey: SortKey, activeSortKey: SortKey, sortDirection: SortDirection) {
  if (sortKey !== activeSortKey) {
    return "";
  }

  return sortDirection === "asc" ? " ↑" : " ↓";
}

function sortParticipants(
  participants: Participant[],
  sortKey: SortKey,
  sortDirection: SortDirection
) {
  return [...participants].sort((a, b) => {
    const result = a[sortKey].localeCompare(b[sortKey]);
    return sortDirection === "asc" ? result : -result;
  });
}

const participantTableColumns = "minmax(12rem,1fr) 6rem 6rem minmax(10rem,14rem) 5.5rem";

function ActionMessage({ state }: { state: ParticipantActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p className={state.ok ? "text-sm text-green-600" : "text-sm text-destructive"}>
      {state.message}
    </p>
  );
}

function ChoirSelect({ defaultValue }: { defaultValue?: string }) {
  return (
    <Select name="choir" defaultValue={defaultValue ?? choirs[0]} required>
      <SelectTrigger>
        <SelectValue placeholder="Choose choir" />
      </SelectTrigger>
      <SelectContent>
        {choirs.map((choir) => (
          <SelectItem key={choir} value={choir}>
            {choir}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function VoiceSelect({ defaultValue }: { defaultValue?: string }) {
  return (
    <Select name="voice" defaultValue={defaultValue ?? voices[0]} required>
      <SelectTrigger>
        <SelectValue placeholder="Choose voice" />
      </SelectTrigger>
      <SelectContent>
        {voices.map((voice) => (
          <SelectItem key={voice} value={voice}>
            {voice}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function CreateParticipantDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [state, formAction, isPending] = useActionState(
    createParticipantAction,
    initialState
  );

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
          <DialogTitle>Create participant</DialogTitle>
          <DialogDescription>Add a singer to the trip.</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="new-name">Name</Label>
            <Input id="new-name" name="name" placeholder="Ada Lovelace" required />
          </div>

          <div className="grid gap-2">
            <Label>Choir / Voice</Label>
            <div className="grid grid-cols-2 gap-2">
              <ChoirSelect />
              <VoiceSelect />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-mobile">Mobile</Label>
            <Input id="new-mobile" name="mobile" placeholder="Optional phone number" type="tel" />
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

function ParticipantCard({
  participant,
  editingParticipantId,
  setEditingParticipantId,
  onSaved,
}: {
  participant: Participant;
  editingParticipantId: number | null;
  setEditingParticipantId: Dispatch<SetStateAction<number | null>>;
  onSaved: () => void;
}) {
  const isEditing = editingParticipantId === participant.id;
  const [updateState, updateAction, isUpdating] = useActionState(
    updateParticipantAction,
    initialState
  );
  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteParticipantAction,
    initialState
  );

  useEffect(() => {
    if (updateState.ok) {
      setEditingParticipantId(null);
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
      <div
        className="grid items-center gap-3 rounded-md border px-4 py-3 md:grid-cols-[var(--participant-table-columns)]"
        style={{ "--participant-table-columns": participantTableColumns } as React.CSSProperties}
      >
        <div className="min-w-0">
          <p className="truncate font-medium">{participant.name}</p>
        </div>

        <div className="text-sm text-muted-foreground">{participant.choir}</div>

        <div className="text-sm text-muted-foreground">{participant.voice}</div>

        <div className="truncate text-sm text-muted-foreground">
          {participant.mobile || "—"}
        </div>

        <div className="flex justify-end gap-1">
          <Button
            aria-label={`Edit ${participant.name}`}
            onClick={() => setEditingParticipantId(participant.id)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Pencil className="size-4" />
          </Button>

          <form action={deleteAction}>
            <input name="id" type="hidden" value={participant.id} />
            <Button
              aria-label={`Delete ${participant.name}`}
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
          <div className="md:col-span-5">
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
        className="grid gap-4 lg:grid-cols-[minmax(16rem,1fr)_auto_minmax(12rem,16rem)_auto] lg:items-end"
      >
        <input name="id" type="hidden" value={participant.id} />

        <div className="grid gap-2">
          <Label htmlFor={`name-${participant.id}`}>Name</Label>
          <Input
            id={`name-${participant.id}`}
            name="name"
            defaultValue={participant.name}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label>Choir / Voice</Label>
          <div className="grid grid-cols-2 gap-2">
            <ChoirSelect defaultValue={participant.choir} />
            <VoiceSelect defaultValue={participant.voice} />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`mobile-${participant.id}`}>Mobile</Label>
          <Input
            id={`mobile-${participant.id}`}
            name="mobile"
            defaultValue={participant.mobile ?? ""}
            placeholder="Optional phone number"
            type="tel"
          />
        </div>

        <div className="flex gap-2 lg:justify-end">
          <Button disabled={isUpdating} type="submit">
            {isUpdating ? "Saving..." : "Save"}
          </Button>
          <Button
            disabled={isUpdating}
            onClick={() => setEditingParticipantId(null)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
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

export function ParticipantEditor({ initialParticipants }: { initialParticipants: Participant[] }) {
  const [participants, setParticipants] = useState(initialParticipants);
  const [editingParticipantId, setEditingParticipantId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const sortedParticipants = sortParticipants(participants, sortKey, sortDirection);

  function toggleSort(nextSortKey: SortKey) {
    if (nextSortKey === sortKey) {
      setSortDirection((currentDirection) =>
        currentDirection === "asc" ? "desc" : "asc"
      );
      return;
    }

    setSortKey(nextSortKey);
    setSortDirection("asc");
  }

  useEffect(() => {
    setParticipants(initialParticipants);
  }, [initialParticipants]);

  const refreshParticipants = useCallback(async () => {
    const freshParticipants = await getParticipantData();
    setParticipants(freshParticipants);
  }, []);

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Participants</h2>
          <p className="text-sm text-muted-foreground">Create and edit the singers joining the trip.</p>
        </div>

        <Button onClick={() => setIsCreateDialogOpen(true)} size="icon" type="button">
          <Plus className="size-4" />
        </Button>
      </div>

      <CreateParticipantDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSaved={() => void refreshParticipants()}
      />

      <div className="grid w-full gap-2">
        {participants.length > 0 ? (
          <div
            className="hidden gap-3 px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid md:grid-cols-[var(--participant-table-columns)]"
            style={{ "--participant-table-columns": participantTableColumns } as React.CSSProperties}
          >
            <button
              className="text-left hover:text-foreground"
              onClick={() => toggleSort("name")}
              type="button"
            >
              Name{getSortIndicator("name", sortKey, sortDirection)}
            </button>
            <button
              className="text-left hover:text-foreground"
              onClick={() => toggleSort("choir")}
              type="button"
            >
              Choir{getSortIndicator("choir", sortKey, sortDirection)}
            </button>
            <button
              className="text-left hover:text-foreground"
              onClick={() => toggleSort("voice")}
              type="button"
            >
              Voice{getSortIndicator("voice", sortKey, sortDirection)}
            </button>
            <div>Mobile</div>
            <div className="text-right">Actions</div>
          </div>
        ) : null}
        {participants.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No participants yet</CardTitle>
              <CardDescription>Create the first participant above.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          sortedParticipants.map((participant) => (
            <ParticipantCard
              key={participant.id}
              participant={participant}
              editingParticipantId={editingParticipantId}
              setEditingParticipantId={setEditingParticipantId}
              onSaved={() => void refreshParticipants()}
            />
          ))
        )}
      </div>
    </div>
  );
}