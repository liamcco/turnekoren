"use client"

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { createContactAction } from "./actions";
import { Label } from "@/components/ui/label";
import { ActionMessage, initialState } from "./ContactsEditor";

export function CreateContactDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, isPending] = useActionState(createContactAction, initialState);

  useEffect(() => {
    if (state.ok) {
      onOpenChange(false);
    }
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Skapa kontakt</DialogTitle>
          <DialogDescription>Lägg till en viktig kontakt för resan.</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="new-name">Namn</Label>
            <Input id="new-name" name="name" placeholder="Namn" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-role">Roll</Label>
            <Input id="new-role" name="role" placeholder="Roll" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-phone">Telefon</Label>
            <Input id="new-phone" name="phone" placeholder="Telefonnummer" required type="tel" />
          </div>

          {!state.ok && <ActionMessage state={state} />}

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
              {isPending ? <><Loader2 className="mr-2 size-4 animate-spin" />Skapar...</> : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
