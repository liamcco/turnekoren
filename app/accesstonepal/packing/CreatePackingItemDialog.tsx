"use client"

import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createPackingItemAction } from "./actions";
import { ActionMessage, initialState } from "./PackingEditor";
import { Label } from "@/components/ui/label";

export function CreatePackingItemDialog({
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
          <DialogTitle>Skapa packningssak</DialogTitle>
          <DialogDescription>Lägg till något som deltagarna ska komma ihåg att packa.</DialogDescription>
        </DialogHeader>

        <form
          action={(formData) =>
            startTransition(async () => {
              const nextState = await createPackingItemAction(initialState, formData);
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
            <Label htmlFor="new-label">Etikett</Label>
            <Input id="new-label" name="label" placeholder="Pass" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-category">Kategori</Label>
            <Input id="new-category" name="category" placeholder="Dokument" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-notes">Anteckningar</Label>
            <Textarea id="new-notes" name="notes" placeholder="Valfria anteckningar" />
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
