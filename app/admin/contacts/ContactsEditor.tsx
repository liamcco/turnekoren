"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Contact } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ContactActionState,
} from "./actions";
import { CreateContactDialog } from "./CreateContactDialog";
import { ContactRow } from "./ContactRow";
import { ContactInfoDialog } from "./ContactInfoDialog";

export const initialState: ContactActionState = {
  ok: false,
  message: "",
};

export function ActionMessage({ state }: { state: ContactActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p className={state.ok ? "text-sm text-green-600" : "text-sm text-destructive"}>
      {state.message}
    </p>
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
