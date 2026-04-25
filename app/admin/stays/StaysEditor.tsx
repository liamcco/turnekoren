"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Room, Stay } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  StayActionState,
} from "./actions";
import { StayCard } from "./StayCard";
import { CreateStayDialog } from "./CreateStayDialog";

export type StayWithRooms = Stay & {
  rooms: Room[];
};

export const initialState: StayActionState = {
  ok: false,
  message: "",
};

export function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export function toDateInputValue(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function ActionMessage({ state }: { state: StayActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p className={state.ok ? "text-sm text-green-600" : "text-sm text-destructive"}>
      {state.message}
    </p>
  );
}

export function StayEditor({ initialStays }: { initialStays: StayWithRooms[] }) {
  const [editingStayId, setEditingStayId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Stays</h2>
          <p className="text-sm text-muted-foreground">Create and edit accommodation periods for the trip.</p>
        </div>

        <Button onClick={() => setIsCreateDialogOpen(true)} size="icon" type="button">
          <Plus className="size-4" />
        </Button>
      </div>

      <CreateStayDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      <div className="grid w-full gap-2">
        {initialStays.length > 0 ? (
          <div className="hidden gap-3 px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid md:grid-cols-[minmax(8rem,14rem)_minmax(12rem,1fr)_minmax(10rem,12rem)_7.5rem]">
            <div>Name</div>
            <div>Dates</div>
            <div>Rooms</div>
            <div className="text-right">Actions</div>
          </div>
        ) : null}

        {initialStays.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No stays yet</CardTitle>
              <CardDescription>Create the first stay above.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          initialStays.map((stay) => (
            <StayCard
              key={stay.id}
              stay={stay}
              editingStayId={editingStayId}
              setEditingStayId={setEditingStayId}
            />
          ))
        )}
      </div>
    </div>
  );
}
