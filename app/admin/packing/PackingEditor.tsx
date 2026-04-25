"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { PackingItem } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PackingItemActionState,
} from "./actions";
import { PackingItemCard } from "./PackingItemCard";
import { CreatePackingItemDialog } from "./CreatePackingItemDialog";

export const initialState: PackingItemActionState = {
  ok: false,
  message: "",
};

export function ActionMessage({ state }: { state: PackingItemActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p className={state.ok ? "text-sm text-green-600" : "text-sm text-destructive"}>
      {state.message}
    </p>
  );
}

function groupItemsByCategory(items: PackingItem[]) {
  return items.reduce<Record<string, PackingItem[]>>((acc, item) => {
    acc[item.category] = [...(acc[item.category] ?? []), item];
    return acc;
  }, {});
}

export function PackingItemEditor({ initialItems }: { initialItems: PackingItem[] }) {
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const itemsByCategory = groupItemsByCategory(initialItems);
  const categories = Object.keys(itemsByCategory).sort((a, b) => a.localeCompare(b));

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Packing</h2>
          <p className="text-sm text-muted-foreground">Create and edit packing items for the trip.</p>
        </div>

        <Button onClick={() => setIsCreateDialogOpen(true)} size="icon" type="button">
          <Plus className="size-4" />
        </Button>
      </div>

      <CreatePackingItemDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      <div className="grid w-full gap-6">
        {initialItems.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No packing items yet</CardTitle>
              <CardDescription>Create the first packing item above.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          categories.map((category) => (
            <section key={category} className="grid gap-2">
              <h2 className="px-1 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                {category}
              </h2>

              {itemsByCategory[category].map((item) => (
                <PackingItemCard
                  key={item.id}
                  item={item}
                  editingItemId={editingItemId}
                  setEditingItemId={setEditingItemId}
                />
              ))}
            </section>
          ))
        )}
      </div>
    </div>
  );
}
