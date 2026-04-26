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
          <DialogTitle>Create stay</DialogTitle>
          <DialogDescription>Add an accommodation period to the trip.</DialogDescription>
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
            <Label htmlFor="new-name">Name</Label>
            <Input id="new-name" name="name" placeholder="Hotel / cabin / hostel" required />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="new-start-date">Start date</Label>
              <Input id="new-start-date" name="startDate" required type="date" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="new-end-date">End date</Label>
              <Input id="new-end-date" name="endDate" required type="date" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-notes">Notes</Label>
            <Textarea id="new-notes" name="notes" placeholder="Optional notes" />
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