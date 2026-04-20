import { PageHeader } from "@/components/page-header";
import { listRows } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default function ContactsPage() {
  const contacts = listRows("contacts");

  return (
    <main className="shell">
      <PageHeader
        description="Organising group contact info in one place for quick calls and messages."
        title="Contacts"
      />

      <div className="stack-lg">
        {contacts.map((contact) => (
          <section className="panel" key={contact.id}>
            <span className="section-kicker">{contact.role}</span>
            <h2>{contact.name}</h2>
            <div className="contact-links">
              {contact.phone ? (
                <a className="button secondary" href={`tel:${contact.phone}`}>
                  {contact.phone}
                </a>
              ) : null}
              {contact.email ? (
                <a className="button secondary" href={`mailto:${contact.email}`}>
                  {contact.email}
                </a>
              ) : null}
            </div>
          </section>
        ))}

        {contacts.length === 0 ? (
          <p className="empty-state">No contacts added yet. Use the admin page to add them.</p>
        ) : null}
      </div>
    </main>
  );
}
