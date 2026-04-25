import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useActionState } from "react";
import { createPlaceAction } from "./actions";
import { ActionMessage, initialState } from "./PlaceEditor";
import { Label } from "@/components/ui/label";

export function CreatePlaceDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, isPending] = useActionState(
    createPlaceAction,
    initialState
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create place</DialogTitle>
          <DialogDescription>Add a place to the trip hub.</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="new-name">Name</Label>
            <Input id="new-name" name="name" placeholder="Google Maps" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-url">URL</Label>
            <Input
              id="new-url"
              name="url"
              placeholder="https://example.com"
              required
              type="url"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-address">Address</Label>
            <Input
              id="new-address"
              name="address"
              placeholder="Optional address"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-description">Description</Label>
            <Textarea
              id="new-description"
              name="description"
              placeholder="Optional description"
            />
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