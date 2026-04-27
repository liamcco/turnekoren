import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createStayAction } from "./actions";
import { initialState, ActionMessage } from "./StaysEditor";
import { Label } from "@/components/ui/label";

export function CreateStayDialog({
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
          <DialogTitle>Skapa boende</DialogTitle>
          <DialogDescription>Lägg till en boendeperiod för resan.</DialogDescription>
        </DialogHeader>

        <form
          action={(formData) =>
            startTransition(async () => {
              const nextState = await createStayAction(initialState, formData);
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
            <Input id="new-name" name="name" placeholder="Hotell / hytt / vandrarhem" required />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="new-start-date">Startdatum</Label>
              <Input id="new-start-date" name="startDate" required type="date" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="new-end-date">Slutdatum</Label>
              <Input id="new-end-date" name="endDate" required type="date" />
            </div>
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
