import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Contact } from "@/generated/prisma/client";

export function ContactInfoDialog({
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
          <DialogDescription>Kontaktuppgifter</DialogDescription>
        </DialogHeader>

        {contact ? (
          <div className="grid gap-4">
            <div className="grid gap-1">
              <p className="text-sm font-medium">Roll</p>
              <p className="text-sm text-muted-foreground">{contact.role}</p>
            </div>

            <div className="grid gap-1">
              <p className="text-sm font-medium">Telefon</p>
              <p className="text-sm text-muted-foreground">{contact.phone}</p>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
