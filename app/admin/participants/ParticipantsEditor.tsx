"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Participant } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ParticipantActionState,
} from "./admin-data";
import { ParticipantCard } from "./ParticipantCard";
import { CreateParticipantDialog } from "./CreateParticipantDialog";

export const initialState: ParticipantActionState = {
  ok: false,
  message: "",
};

export type SortKey = "name" | "choir" | "voice";
export type SortDirection = "asc" | "desc";

export function getSortIndicator(sortKey: SortKey, activeSortKey: SortKey, sortDirection: SortDirection) {
  if (sortKey !== activeSortKey) {
    return "";
  }

  return sortDirection === "asc" ? " ↑" : " ↓";
}

export function sortParticipants(
  participants: Participant[],
  sortKey: SortKey,
  sortDirection: SortDirection
) {
  return [...participants].sort((a, b) => {
    const result = a[sortKey].localeCompare(b[sortKey]);
    return sortDirection === "asc" ? result : -result;
  });
}

export const participantTableColumns = "minmax(12rem,1fr) 6rem 6rem minmax(10rem,14rem) 5.5rem";

export function ActionMessage({ state }: { state: ParticipantActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p className={state.ok ? "text-sm text-green-600" : "text-sm text-destructive"}>
      {state.message}
    </p>
  );
}

export function ParticipantEditor({ initialParticipants }: { initialParticipants: Participant[] }) {
  const [editingParticipantId, setEditingParticipantId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const sortedParticipants = sortParticipants(initialParticipants, sortKey, sortDirection);

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
      />

      <div className="grid w-full gap-2">
        {initialParticipants.length > 0 ? (
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
        {initialParticipants.length === 0 ? (
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
            />
          ))
        )}
      </div>
    </div>
  );
}
