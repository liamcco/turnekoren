"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Place } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PlaceActionState,
} from "./actions";
import { EditPlaceForm } from "./EditPlaceForm";
import { CreatePlaceDialog } from "./CreatePlaceDialog";

export const initialState: PlaceActionState = {
  ok: false,
  message: "",
};

export function ActionMessage({ state }: { state: PlaceActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p className={state.ok ? "text-sm text-green-600" : "text-sm text-destructive"}>
      {state.message}
    </p>
  );
}

export function PlaceEditor({ places }: { places: Place[] }) {
  const [editingPlaceId, setEditingPlaceId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Places</h2>
          <p className="text-sm text-muted-foreground">Create and edit useful places for the trip hub.</p>
        </div>

        <Button onClick={() => setIsCreateDialogOpen(true)} size="icon" type="button">
          <Plus className="size-4" />
        </Button>
      </div>

      <CreatePlaceDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      <div className="grid max-w-5xl gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {places.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No places yet</CardTitle>
              <CardDescription>Create the first place above.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          places.map((place) => (
            <EditPlaceForm
              key={place.id}
              place={place}
              editingPlaceId={editingPlaceId}
              setEditingPlaceId={setEditingPlaceId}
            />
          ))
        )}
      </div>
    </div>
  );
}