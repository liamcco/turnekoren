"use client"

import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, Dialog } from "@/components/ui/dialog";
import { SelectTrigger, SelectValue, SelectContent, SelectItem, Select } from "@/components/ui/select";
import { Stay } from "@/generated/prisma/client";
import { Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { RoomActionState, copyRoomsFromStayAction } from "./actions";
import { initialState, getSelectedStayName, ActionMessage } from "./RoomEditor";
import { Label } from "@/components/ui/label";

export function CopyRoomsDialog({
  open,
  onOpenChange,
  stays,
  selectedStayId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stays: Stay[];
  selectedStayId: number | null;
}) {
  const router = useRouter();
  const [state, setState] = useState<RoomActionState>(initialState);
  const [isPending, startTransition] = useTransition();
  const copyFromOptions = stays.filter((stay) => stay.id !== selectedStayId);

  if (!selectedStayId) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kopiera rum</DialogTitle>
          <DialogDescription>
            Kopiera alla rum från ett annat boende till {getSelectedStayName(stays, selectedStayId)}.
          </DialogDescription>
        </DialogHeader>

        <form
          action={(formData) =>
            startTransition(async () => {
              const nextState = await copyRoomsFromStayAction(initialState, formData);
              setState(nextState);
              if (nextState.ok) {
                onOpenChange(false);
                router.refresh();
              }
            })
          }
          className="grid gap-4"
        >
          <input name="targetStayId" type="hidden" value={selectedStayId} />

          <div className="grid gap-2">
            <Label>Kopiera alla rum från</Label>
            <Select name="sourceStayId" required>
              <SelectTrigger>
                <SelectValue placeholder="Välj boende" />
              </SelectTrigger>
              <SelectContent>
                {copyFromOptions.map((stay) => (
                  <SelectItem key={stay.id} value={stay.id.toString()}>
                    {stay.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {copyFromOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Det finns inga andra boenden att kopiera rum från.
            </p>
          ) : null}

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
            <Button disabled={isPending || copyFromOptions.length === 0} type="submit">
              <Copy className="size-4" />
              {isPending ? "Kopierar..." : "Kopiera rum"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
