"use client";

import { Dispatch, SetStateAction, useActionState, useState } from "react";
import { Info, Pencil, Plus, Trash2 } from "lucide-react";
import { Contact } from "@/generated/prisma/browser";
import { Button } from "@/components/ui/button";
import {
  Card,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createContactAction,
  deleteContactAction,
  ContactActionState,
  updateContactAction,
} from "./admin-data";

const initialState: ContactActionState = {
  ok: false,
  message: "",
};

function ActionMessage({ state }: { state: ContactActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p className={state.ok ? "text-sm text-green-600" : "text-sm text-destructive"}>
      {state.message}
    </p>
  );
}

function CreateContactDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, isPending] = useActionState(createContactAction, initialState);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create contact</DialogTitle>
          <DialogDescription>Add an important contact for the trip.</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="new-name">Name</Label>
            <Input id="new-name" name="name" placeholder="Name" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-role">Role</Label>
            <Input id="new-role" name="role" placeholder="Role" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-phone">Phone</Label>
            <Input id="new-phone" name="phone" placeholder="Phone number" required type="tel" />
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

function ContactInfoDialog({
  contact,
  onClose,
}: {
  contact: Contact | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={contact !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{contact?.name}</DialogTitle>
          <DialogDescription>Contact details</DialogDescription>
        </DialogHeader>

        {contact ? (
          <div className="grid gap-4">
            <div className="grid gap-1">
              <p className="text-sm font-medium">Role</p>
              <p className="text-sm text-muted-foreground">{contact.role}</p>
            </div>

            <div className="grid gap-1">
              <p className="text-sm font-medium">Phone</p>
              <p className="text-sm text-muted-foreground">{contact.phone}</p>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ContactRow({
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
              <Trash2 className="size-4 text-destructive" />
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
            {isUpdating ? "Saving..." : "Save"}
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

export function ContactEditor({ initialContacts }: { initialContacts: Contact[] }) {
  const [editingContactId, setEditingContactId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [infoContact, setInfoContact] = useState<Contact | null>(null);
  const contacts = initialContacts;

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Contacts</h2>
          <p className="text-sm text-muted-foreground">Create and edit important trip contacts.</p>
        </div>

        <Button onClick={() => setIsCreateDialogOpen(true)} size="icon" type="button">
          <Plus className="size-4" />
        </Button>
      </div>

      <CreateContactDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      <ContactInfoDialog contact={infoContact} onClose={() => setInfoContact(null)} />

      <div className="grid w-full gap-2">
        {contacts.length > 0 ? (
          <div className="hidden gap-3 px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid md:grid-cols-[1fr_minmax(10rem,14rem)_minmax(10rem,14rem)_7.5rem]">
            <div>Name</div>
            <div>Role</div>
            <div>Phone</div>
            <div className="text-right">Actions</div>
          </div>
        ) : null}

        {contacts.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No contacts yet</CardTitle>
              <CardDescription>Create the first contact above.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          contacts.map((contact) => (
            <ContactRow
              key={contact.id}
              contact={contact}
              editingContactId={editingContactId}
              setEditingContactId={setEditingContactId}
              onShowInfo={setInfoContact}
            />
          ))
        )}
      </div>
    </div>
  );
}
