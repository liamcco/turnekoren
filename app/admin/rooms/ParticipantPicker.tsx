"use client"

import { Participant } from "@/generated/prisma/client";
import { useState } from "react";
import { getParticipantLabel } from "./RoomEditor";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function ParticipantPicker({
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
        <Label htmlFor="participant-search">Deltagare</Label>
        <Input
          id="participant-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Sök deltagare"
        />
      </div>

      <div className="max-h-64 overflow-y-auto rounded-md border">
        {filteredParticipants.length === 0 ? (
          <p className="p-3 text-sm text-muted-foreground">Inga deltagare hittades.</p>
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
                  {isSelected ? "Vald" : isUnavailable ? "Redan i rum" : "Lägg till"}
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
