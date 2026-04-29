"use client"

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Quote } from "@/generated/prisma/client";
import { Pencil, Trash2, X } from "lucide-react";
import { Dispatch, SetStateAction, useActionState } from "react";
import { updateQuoteAction, deleteQuoteAction } from "./actions";
import { ActionMessage, initialState } from "./QuotesEditor";
import { Label } from "@/components/ui/label";

export function QuoteCard({
  quote,
  editingQuoteId,
  setEditingQuoteId,
}: {
  quote: Quote;
  editingQuoteId: number | null;
  setEditingQuoteId: Dispatch<SetStateAction<number | null>>;
}) {
  const isEditing = editingQuoteId === quote.id;
  const [updateState, updateAction, isUpdating] = useActionState(updateQuoteAction, initialState);
  const [deleteState, deleteAction, isDeleting] = useActionState(deleteQuoteAction, initialState);

  if (!isEditing) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="min-w-0 space-y-2">
            <CardTitle className="line-clamp-2 text-base">{quote.text}</CardTitle>
            <CardDescription className="line-clamp-2">{quote.translation}</CardDescription>
            {quote.context ? (
              <p className="line-clamp-2 text-sm text-muted-foreground">{quote.context}</p>
            ) : null}
          </div>

          <div className="flex shrink-0 gap-1">
            <Button
              aria-label="Redigera citat"
              onClick={() => setEditingQuoteId(quote.id)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Pencil className="size-4" />
            </Button>

            <form action={deleteAction}>
              <input name="id" type="hidden" value={quote.id} />
              <Button
                aria-label="Radera citat"
                disabled={isDeleting}
                size="icon"
                type="submit"
                variant="ghost"
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </form>
          </div>
        </CardHeader>

        {deleteState.message ? (
          <CardContent>
            <ActionMessage state={deleteState} />
          </CardContent>
        ) : null}
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>Redigera citat</CardTitle>
          <CardDescription>Uppdatera citat, översättning och kontext.</CardDescription>
        </div>

        <Button
          aria-label="Avbryt redigering"
          disabled={isUpdating}
          onClick={() => setEditingQuoteId(null)}
          size="icon"
          type="button"
          variant="ghost"
        >
          <X className="size-4" />
        </Button>
      </CardHeader>

      <CardContent>
        <form action={updateAction} className="grid gap-4">
          <input name="id" type="hidden" value={quote.id} />

          <div className="grid gap-2">
            <Label htmlFor={`text-${quote.id}`}>Citat</Label>
            <Textarea id={`text-${quote.id}`} name="text" defaultValue={quote.text} required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`translation-${quote.id}`}>Översättning</Label>
            <Textarea
              id={`translation-${quote.id}`}
              name="translation"
              defaultValue={quote.translation}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`context-${quote.id}`}>Kontext</Label>
            <Textarea id={`context-${quote.id}`} name="context" defaultValue={quote.context ?? ""} />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button disabled={isUpdating} type="submit">
              {isUpdating ? "Sparar..." : "Spara ändringar"}
            </Button>
            <Button
              disabled={isUpdating}
              onClick={() => setEditingQuoteId(null)}
              type="button"
              variant="outline"
            >
              Avbryt
            </Button>
            <ActionMessage state={updateState} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
