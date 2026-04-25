"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { UsefulLink } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LinkActionState,
} from "./actions";
import { EditLinkForm } from "./EditLinkForm";
import { CreateLinkDialog } from "./CreateLinkDialog";

export const initialState: LinkActionState = {
  ok: false,
  message: "",
};

export function ActionMessage({ state }: { state: LinkActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p className={state.ok ? "text-sm text-green-600" : "text-sm text-destructive"}>
      {state.message}
    </p>
  );
}

export function LinkEditor({ links }: { links: UsefulLink[] }) {
  const [editingLinkId, setEditingLinkId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Links</h2>
          <p className="text-sm text-muted-foreground">Create and edit useful links for the trip hub.</p>
        </div>

        <Button onClick={() => setIsCreateDialogOpen(true)} size="icon" type="button">
          <Plus className="size-4" />
        </Button>
      </div>

      <CreateLinkDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      <div className="grid max-w-5xl gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {links.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No links yet</CardTitle>
              <CardDescription>Create the first useful link above.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          links.map((link) => (
            <EditLinkForm
              key={link.id}
              link={link}
              editingLinkId={editingLinkId}
              setEditingLinkId={setEditingLinkId}
            />
          ))
        )}
      </div>
    </div>
  );
}