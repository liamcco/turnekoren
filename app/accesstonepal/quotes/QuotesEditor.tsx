"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Quote } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  QuoteActionState,
} from "./actions";
import { QuoteCard } from "./QuoteCard";
import { CreateQuoteDialog } from "./CreateQuoteDialog";

export const initialState: QuoteActionState = {
  ok: false,
  message: "",
};

export function ActionMessage({ state }: { state: QuoteActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p className={state.ok ? "text-sm text-green-600" : "text-sm text-destructive"}>
      {state.message}
    </p>
  );
}

export function QuoteEditor({ initialQuotes }: { initialQuotes: Quote[] }) {
  const [editingQuoteId, setEditingQuoteId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const quotes = initialQuotes;

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Citat</h2>
          <p className="text-sm text-muted-foreground">Skapa och redigera citat för resehubben.</p>
        </div>

        <Button onClick={() => setIsCreateDialogOpen(true)} size="icon" type="button">
          <Plus className="size-4" />
        </Button>
      </div>

      <CreateQuoteDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      <div className="grid max-w-5xl gap-4 lg:grid-cols-2">
        {quotes.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Inga citat ännu</CardTitle>
              <CardDescription>Skapa det första citatet ovan.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          quotes.map((quote) => (
            <QuoteCard
              key={quote.id}
              quote={quote}
              editingQuoteId={editingQuoteId}
              setEditingQuoteId={setEditingQuoteId}
            />
          ))
        )}
      </div>
    </div>
  );
}
