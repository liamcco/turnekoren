"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScheduleEvent } from "@/generated/prisma/client";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createScheduleEventAction, updateScheduleEventAction, deleteScheduleEventAction } from "./actions";
import { initialActionState } from "./ScheduleEditor";
import { formatDateKey, toDateTimeLocalValue, wouldExceedMaxOverlaps } from "./utils";
import { Label } from "@/components/ui/label";
import { parseFloatingDateTime } from "@/lib/floating-date";

export function EventEditorDialog({
  event,
  selectedDay,
  events,
  onClose,
}: {
  event: ScheduleEvent | null;
  selectedDay: string;
  events: ScheduleEvent[];
  onClose: () => void;
}) {
  const router = useRouter();
  const isCreating = event === null;
  const [state, setState] = useState(initialActionState);
  const [deleteState, setDeleteState] = useState(initialActionState);
  const [isPending, startSaveTransition] = useTransition();
  const [isDeletingPending, startDeleteTransition] = useTransition();
  const formAction = async (formData: FormData) => {
    startSaveTransition(async () => {
      const nextState = isCreating
        ? await createScheduleEventAction(initialActionState, formData)
        : await updateScheduleEventAction(initialActionState, formData);

      setState(nextState);
      if (!nextState.ok) {
        return;
      }

      const formStartTimeValue = formData.get("startTime");
      const formStartTime =
        typeof formStartTimeValue === "string"
          ? parseFloatingDateTime(formStartTimeValue)
          : null;
      const nextDay =
        formStartTime !== null
          ? formatDateKey(formStartTime)
          : selectedDay;

      router.replace(`/admin/schedule?day=${nextDay}`, { scroll: false });
      router.refresh();
      onClose();
    });
  };

  const deleteFormAction = async (formData: FormData) => {
    startDeleteTransition(async () => {
      const nextState = await deleteScheduleEventAction(initialActionState, formData);
      setDeleteState(nextState);
      if (!nextState.ok) {
        return;
      }

      router.replace(`/admin/schedule?day=${selectedDay}`, { scroll: false });
      router.refresh();
      onClose();
    });
  };

  const defaultStartTime = event?.startTime ?? parseFloatingDateTime(`${selectedDay}T09:00`) ?? new Date(NaN);
  const defaultEndTime = event?.endTime ?? parseFloatingDateTime(`${selectedDay}T10:00`) ?? new Date(NaN);
  const defaultIsMeetup = event?.endTime === null;

  const [startTimeValue, setStartTimeValue] = useState(
    toDateTimeLocalValue(defaultStartTime)
  );
  const [endTimeValue, setEndTimeValue] = useState(
    toDateTimeLocalValue(defaultEndTime)
  );
  const [isMeetup, setIsMeetup] = useState(defaultIsMeetup);

  const proposedStartTime = parseFloatingDateTime(startTimeValue);
  const proposedEndTime = isMeetup ? null : parseFloatingDateTime(endTimeValue);
  const hasValidDraftTimes =
    proposedStartTime !== null &&
    (isMeetup ||
      (proposedEndTime !== null &&
        proposedEndTime > proposedStartTime));
  const exceedsOverlapLimit =
    hasValidDraftTimes &&
    proposedStartTime !== null &&
    wouldExceedMaxOverlaps({
      events,
      startTime: proposedStartTime,
      endTime: proposedEndTime,
      ignoredEventId: event?.id,
    });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isCreating ? "Skapa schemapunkt" : "Redigera schemapunkt"}</DialogTitle>
          <DialogDescription>
            {isCreating
              ? "Lägg till en ny punkt i resans schema."
              : "Uppdatera den här schemapunkten."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="grid gap-4">
          {!isCreating ? <input name="id" type="hidden" value={event.id} /> : null}
          {isMeetup ? <input name="endTime" type="hidden" value="" /> : null}

          <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="isMeetup"
                checked={isMeetup}
                onCheckedChange={(checked: boolean) => setIsMeetup(checked === true)}
              />
              <Label htmlFor="isMeetup" className="cursor-pointer">
                Samling / tidpunkt
              </Label>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                name="title"
                defaultValue={event?.title ?? ""}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  value={startTimeValue}
                  onChange={(nextEvent) => setStartTimeValue(nextEvent.target.value)}
                  required
                  type="datetime-local"
                />
              </div>

              {!isMeetup ? (
                <div className="grid gap-2">
                  <Label htmlFor="endTime">Slut</Label>
                  <Input
                    id="endTime"
                    name="endTime"
                    value={endTimeValue}
                    onChange={(nextEvent) => setEndTimeValue(nextEvent.target.value)}
                    required
                    type="datetime-local"
                  />
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">Plats</Label>
            <Input
              id="location"
              name="location"
              defaultValue={event?.location ?? ""}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Anteckningar</Label>
            <Textarea id="notes" name="notes" defaultValue={event?.notes ?? ""} />
          </div>

          {state.message ? (
            <p className={state.ok ? "text-sm text-green-600" : "text-sm text-destructive"}>
              {state.message}
            </p>
          ) : null}

          {exceedsOverlapLimit ? (
            <p className="text-sm text-destructive">
              Det här skulle skapa fler än två överlappande programpunkter. Flytta eller korta ner punkten innan du sparar.
            </p>
          ) : null}

          {!isCreating && deleteState.message ? (
            <p className={deleteState.ok ? "text-sm text-green-600" : "text-sm text-destructive"}>
              {deleteState.message}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-between gap-2">
            {!isCreating ? (
              <Button
                form="delete-schedule-event-form"
                disabled={isPending || isDeletingPending}
                type="submit"
                variant="destructive"
              >
                <Trash2 className="size-4" />
                {isDeletingPending ? "Raderar..." : "Radera"}
              </Button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <Button disabled={isPending || isDeletingPending} onClick={onClose} type="button" variant="outline">
                Avbryt
              </Button>
              <Button disabled={isPending || isDeletingPending || exceedsOverlapLimit} type="submit">
                {isPending ? "Sparar..." : "Spara ändringar"}
              </Button>
            </div>
          </div>
        </form>

        {!isCreating ? (
          <form id="delete-schedule-event-form" action={deleteFormAction}>
            <input name="id" type="hidden" value={event.id} />
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
