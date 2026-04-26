import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getContacts } from "@/app/contacts/contacts";

export default async function ContactsPage() {
  const contacts = await getContacts();

  if(contacts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No contacts added yet. Use the admin page to add them.</p>
    );
  }

  return (
      <div className="grid gap-4 md:grid-cols-2">
        {contacts.map((contact) => (
          <Card key={contact.id}>
            <CardHeader>
              <Badge className="w-fit px-3 py-1 text-[10px] tracking-[0.24em] uppercase" variant="outline">
                {contact.role}
              </Badge>
              <CardTitle>{contact.name}</CardTitle>
              <CardDescription>Quick call or message access for the organising group.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {contact.phone ? (
                <Button asChild variant="secondary">
                  <a href={`tel:${contact.phone}`}>
                    <Phone className="size-4" />
                    {contact.phone}
                  </a>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
  );
}
