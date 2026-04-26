"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Contact } from "@/generated/prisma/client";
import { Info, Loader2, Pencil, Trash2 } from "lucide-react";
import { Dispatch, SetStateAction, useActionState, useEffect } from "react";
import { updateContactAction, deleteContactAction } from "./actions";
import { ActionMessage, initialState } from "./ContactsEditor";
import { Label } from "@/components/ui/label";

export function ContactRow({
  contact,
  editingContactId,
  setEditingContactId,
  onShowInfo,
}: {
  contact: Contact;
  editingContactId: number | null;
  setEditingContactId: Dispatch<SetStateAction<number | null>>;
  onShowInfo: (contact: Contact) => void;
}) {
  const isEditing = editingContactId === contact.id;
  const [updateState, updateAction, isUpdating] = useActionState(updateContactAction, initialState);
  const [deleteState, deleteAction, isDeleting] = useActionState(deleteContactAction, initialState);

  useEffect(() => {
    if (updateState.ok) {
      setEditingContactId(null);
    }
  }, [updateState, setEditingContactId]);

  if (!isEditing) {
    return (
      <div className="grid items-center gap-3 rounded-md border px-4 py-3 grid-cols-[1fr_8rem] md:grid-cols-[1fr_minmax(10rem,14rem)_minmax(10rem,14rem)_7.5rem]">
        <div className="min-w-0">
          <p className="truncate font-medium">{contact.name}</p>
        </div>

        <div className="hidden truncate text-sm text-muted-foreground md:block">{contact.role}</div>
        <div className="hidden truncate text-sm text-muted-foreground md:block">{contact.phone}</div>

        <div className="flex justify-end gap-1">
          <Button
            aria-label={`Show details for ${contact.name}`}
            onClick={() => onShowInfo(contact)}
            size="icon"
            type="button"
            variant="ghost"
            className="md:hidden"
          >
            <Info className="size-4" />
          </Button>
          <Button
            aria-label={`Edit ${contact.name}`}
            onClick={() => setEditingContactId(contact.id)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Pencil className="size-4" />
          </Button>

          <form action={deleteAction}>
            <input name="id" type="hidden" value={contact.id} />
            <Button
              aria-label={`Delete ${contact.name}`}
              disabled={isDeleting}
              size="icon"
              type="submit"
              variant="ghost"
            >
              {isDeleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4 text-destructive" />
              )}
            </Button>
          </form>
        </div>

        {deleteState.message ? (
          <div className="col-span-2 md:col-span-4">
            <ActionMessage state={deleteState} />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card p-4">
      <form
        action={updateAction}
        className="grid gap-4 lg:grid-cols-[minmax(14rem,1fr)_minmax(10rem,16rem)_minmax(10rem,16rem)_auto] lg:items-end"
      >
        <input name="id" type="hidden" value={contact.id} />

        <div className="grid gap-2">
          <Label htmlFor={`name-${contact.id}`}>Name</Label>
          <Input id={`name-${contact.id}`} name="name" defaultValue={contact.name} required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`role-${contact.id}`}>Role</Label>
          <Input id={`role-${contact.id}`} name="role" defaultValue={contact.role} required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`phone-${contact.id}`}>Phone</Label>
          <Input
            id={`phone-${contact.id}`}
            name="phone"
            defaultValue={contact.phone}
            required
            type="tel"
          />
        </div>

        <div className="flex gap-2 lg:justify-end">
          <Button disabled={isUpdating} type="submit">
            {isUpdating ? <><Loader2 className="mr-2 size-4 animate-spin" />Saving...</> : "Save"}
          </Button>
          <Button
            disabled={isUpdating}
            onClick={() => setEditingContactId(null)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
        </div>

        {updateState.message ? (
          <div className="lg:col-span-4">
            <ActionMessage state={updateState} />
          </div>
        ) : null}
      </form>
    </div>
  );
}