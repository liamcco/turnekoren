"use client"

import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createParticipantAction } from "./actions";
import { ActionMessage, initialState } from "./ParticipantsEditor";
import { Label } from "@/components/ui/label";
import { ChoirSelect, VoiceSelect } from "./Selectors";

export function CreateParticipantDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [state, setState] = useState(initialState);
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Skapa deltagare</DialogTitle>
          <DialogDescription>Lägg till en sångare på resan.</DialogDescription>
        </DialogHeader>

        <form
          action={(formData) =>
            startTransition(async () => {
              const nextState = await createParticipantAction(initialState, formData);
              setState(nextState);

              if (!nextState.ok) {
                return;
              }

              onOpenChange(false);
              router.refresh();
            })
          }
          className="grid gap-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="new-name">Namn</Label>
            <Input id="new-name" name="name" placeholder="Ada Lovelace" required />
          </div>

          <div className="grid gap-2">
            <Label>Kör / stämma</Label>
            <div className="grid grid-cols-2 gap-2">
              <ChoirSelect />
              <VoiceSelect />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-mobile">Mobil</Label>
            <Input id="new-mobile" name="mobile" placeholder="Valfritt telefonnummer" type="tel" />
          </div>

          <ActionMessage state={state} />

          <div className="flex justify-end gap-2">
            <Button
              disabled={isPending}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Avbryt
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? "Skapar..." : "Skapa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
