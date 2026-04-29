"use client"

import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useActionState } from "react";
import { createQuoteAction } from "./actions";
import { ActionMessage, initialState } from "./QuotesEditor";
import { Label } from "@/components/ui/label";

export function CreateQuoteDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, isPending] = useActionState(createQuoteAction, initialState);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Skapa citat</DialogTitle>
          <DialogDescription>Lägg till ett citat och valfri kontext.</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="new-text">Citat</Label>
            <Textarea id="new-text" name="text" placeholder="Originalcitat" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-translation">Översättning</Label>
            <Textarea id="new-translation" name="translation" placeholder="Översättning" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-context">Kontext</Label>
            <Textarea id="new-context" name="context" placeholder="Valfri kontext" />
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
