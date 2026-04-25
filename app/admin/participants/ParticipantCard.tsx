"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Participant } from "@/generated/prisma/client";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState, useTransition } from "react";
import { deleteParticipantAction, updateParticipantAction } from "./admin-data";
import { initialState, participantTableColumns, ActionMessage } from "./ParticipantsEditor";
import { Label } from "@/components/ui/label";
import { ChoirSelect, VoiceSelect } from "./Selectors";

export function ParticipantCard({
  participant,
  editingParticipantId,
  setEditingParticipantId,
}: {
  participant: Participant;
  editingParticipantId: number | null;
  setEditingParticipantId: Dispatch<SetStateAction<number | null>>;
}) {
  const router = useRouter();
  const isEditing = editingParticipantId === participant.id;
  const [updateState, setUpdateState] = useState(initialState);
  const [deleteState, setDeleteState] = useState(initialState);
  const [isUpdating, startUpdateTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

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

          <form
            action={(formData) =>
              startDeleteTransition(async () => {
                const nextState = await deleteParticipantAction(initialState, formData);
                setDeleteState(nextState);

                if (nextState.ok) {
                  router.refresh();
                }
              })
            }
          >
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
        action={(formData) =>
          startUpdateTransition(async () => {
            const nextState = await updateParticipantAction(initialState, formData);
            setUpdateState(nextState);

            if (!nextState.ok) {
              return;
            }

            setEditingParticipantId(null);
            router.refresh();
          })
        }
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