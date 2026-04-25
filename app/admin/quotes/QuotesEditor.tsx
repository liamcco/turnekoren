"use client";

import { Dispatch, SetStateAction, useActionState, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { Quote } from "@/generated/prisma/browser";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createQuoteAction,
  deleteQuoteAction,
  QuoteActionState,
  updateQuoteAction,
} from "./admin-data";

const initialState: QuoteActionState = {
  ok: false,
  message: "",
};

function ActionMessage({ state }: { state: QuoteActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p className={state.ok ? "text-sm text-green-600" : "text-sm text-destructive"}>
      {state.message}
    </p>
  );
}

function CreateQuoteDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, isPending] = useActionState(createQuoteAction, initialState);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create quote</DialogTitle>
          <DialogDescription>Add a quote and optional context.</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="new-text">Quote</Label>
            <Textarea id="new-text" name="text" placeholder="Original quote" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-translation">Translation</Label>
            <Textarea id="new-translation" name="translation" placeholder="Translation" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-context">Context</Label>
            <Textarea id="new-context" name="context" placeholder="Optional context" />
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

function QuoteCard({
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
              aria-label="Edit quote"
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
                aria-label="Delete quote"
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
          <CardTitle>Edit quote</CardTitle>
          <CardDescription>Update quote, translation and context.</CardDescription>
        </div>

        <Button
          aria-label="Cancel editing"
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
            <Label htmlFor={`text-${quote.id}`}>Quote</Label>
            <Textarea id={`text-${quote.id}`} name="text" defaultValue={quote.text} required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`translation-${quote.id}`}>Translation</Label>
            <Textarea
              id={`translation-${quote.id}`}
              name="translation"
              defaultValue={quote.translation}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`context-${quote.id}`}>Context</Label>
            <Textarea id={`context-${quote.id}`} name="context" defaultValue={quote.context ?? ""} />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button disabled={isUpdating} type="submit">
              {isUpdating ? "Saving..." : "Save changes"}
            </Button>
            <Button
              disabled={isUpdating}
              onClick={() => setEditingQuoteId(null)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <ActionMessage state={updateState} />
          </div>
        </form>
      </CardContent>
    </Card>
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
          <h2 className="text-lg font-semibold">Quotes</h2>
          <p className="text-sm text-muted-foreground">Create and edit quotes for the trip hub.</p>
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
              <CardTitle>No quotes yet</CardTitle>
              <CardDescription>Create the first quote above.</CardDescription>
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