import { AdminCollectionEditor } from "@/components/admin-collection-editor";
import { PageHeader } from "@/components/page-header";
import { getAdminData } from "@/lib/repository";

export const dynamic = "force-dynamic";

const scheduleFields = [
  { name: "title", label: "Activity", type: "text", placeholder: "Coach departs" },
  { name: "startTime", label: "Starts", type: "datetime-local" },
  { name: "endTime", label: "Ends", type: "datetime-local" },
  { name: "location", label: "Location", type: "text", placeholder: "Hotel lobby" },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    placeholder: "Anything singers should know",
  },
];

const roomFields = [
  { name: "name", label: "Room", type: "text", placeholder: "Hotel 312" },
  { name: "locationType", label: "Type", type: "select", options: ["Hotel", "Ferry", "Other"] },
  {
    name: "occupants",
    label: "Occupants",
    type: "textarea",
    placeholder: "One name per line",
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    placeholder: "Arrival notes, upper bunk info, etc.",
  },
];

const contactFields = [
  { name: "name", label: "Name", type: "text", placeholder: "Maria Holst" },
  { name: "role", label: "Role", type: "text", placeholder: "Tour lead" },
  { name: "phone", label: "Phone", type: "tel", placeholder: "+47 900 00 111" },
  { name: "email", label: "Email", type: "email", placeholder: "maria@example.com" },
];

const concertFields = [
  { name: "title", label: "Concert", type: "text", placeholder: "Main evening concert" },
  { name: "startTime", label: "Start", type: "datetime-local" },
  { name: "venue", label: "Venue", type: "text", placeholder: "Temppeliaukio Church" },
  { name: "address", label: "Address", type: "text", placeholder: "Street, city" },
  { name: "meetup", label: "Meetup", type: "datetime-local" },
  {
    name: "details",
    label: "Details",
    type: "textarea",
    placeholder: "Dress code, soundcheck, set notes",
  },
];

const packingFields = [
  { name: "label", label: "Item", type: "text", placeholder: "Concert outfit" },
  {
    name: "category",
    label: "Category",
    type: "select",
    options: ["Essentials", "Concert", "Music", "Personal", "Travel", "Other"],
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    placeholder: "Optional extra guidance",
  },
];

const quoteFields = [
  { name: "text", label: "Quote", type: "textarea", placeholder: "Hiljaa hyvä tulee." },
  {
    name: "translation",
    label: "Translation",
    type: "text",
    placeholder: "Slowly is how good things happen.",
  },
  {
    name: "context",
    label: "Context",
    type: "textarea",
    placeholder: "Why this quote fits the trip",
  },
];

const placeFields = [
  { name: "name", label: "Place", type: "text", placeholder: "Hotel" },
  { name: "address", label: "Address", type: "text", placeholder: "Street, city" },
  { name: "latitude", label: "Latitude", type: "number", placeholder: "60.1704" },
  { name: "longitude", label: "Longitude", type: "number", placeholder: "24.9410" },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Why this place matters",
  },
  { name: "mapLink", label: "Map link", type: "url", placeholder: "https://maps.google.com/?q=..." },
];

const linkFields = [
  { name: "title", label: "Title", type: "text", placeholder: "Ferry booking" },
  { name: "url", label: "URL", type: "url", placeholder: "https://example.com" },
  { name: "groupName", label: "Group", type: "text", placeholder: "Travel" },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Short explanation for singers",
  },
];

export default function AdminPage() {
  const data = getAdminData();

  return (
    <main className="shell">
      <PageHeader
        description="Edit every section shown in the mobile hub. This starter does not include authentication yet."
        title="Admin Portal"
      />

      <section className="panel warning-panel">
        <strong>Note:</strong> this admin portal is currently open by URL only. Add authentication before
        using it on a public deployment.
      </section>

      <div className="admin-grid">
        <AdminCollectionEditor
          addLabel="Add event"
          description="Controls the live schedule and the home page current/next meetup blocks."
          emptyItem={{
            title: "",
            startTime: "",
            endTime: "",
            location: "",
            notes: "",
          }}
          endpoint="/api/schedule"
          fields={scheduleFields}
          initialItems={data.schedule}
          title="Schedule"
        />

        <AdminCollectionEditor
          addLabel="Add room"
          description="Each row is one room or cabin. Put one person per line in the occupants box."
          emptyItem={{
            name: "",
            locationType: "Hotel",
            occupants: "",
            notes: "",
          }}
          endpoint="/api/rooms"
          fields={roomFields}
          initialItems={data.rooms}
          title="Rooms"
        />

        <AdminCollectionEditor
          addLabel="Add contact"
          description="Contacts shown on the organiser contacts page."
          emptyItem={{
            name: "",
            role: "",
            phone: "",
            email: "",
          }}
          endpoint="/api/contacts"
          fields={contactFields}
          initialItems={data.contacts}
          title="Contacts"
        />

        <AdminCollectionEditor
          addLabel="Add concert"
          description="Concert details, timings, meetups, and notes."
          emptyItem={{
            title: "",
            startTime: "",
            venue: "",
            address: "",
            meetup: "",
            details: "",
          }}
          endpoint="/api/concerts"
          fields={concertFields}
          initialItems={data.concerts}
          title="Concerts"
        />

        <AdminCollectionEditor
          addLabel="Add item"
          description="Packing checklist entries grouped by category."
          emptyItem={{
            label: "",
            category: "Essentials",
            notes: "",
          }}
          endpoint="/api/packing"
          fields={packingFields}
          initialItems={data.packing}
          title="Packing"
        />

        <AdminCollectionEditor
          addLabel="Add quote"
          description="The daily quote page rotates through this list."
          emptyItem={{
            text: "",
            translation: "",
            context: "",
          }}
          endpoint="/api/quotes"
          fields={quoteFields}
          initialItems={data.quotes}
          title="Finnish Quotes"
        />

        <AdminCollectionEditor
          addLabel="Add place"
          description="Map markers for hotels, venues, terminals, pharmacies, food stops, or anything useful."
          emptyItem={{
            name: "",
            address: "",
            latitude: "",
            longitude: "",
            description: "",
            mapLink: "",
          }}
          endpoint="/api/places"
          fields={placeFields}
          initialItems={data.places}
          title="Places"
        />

        <AdminCollectionEditor
          addLabel="Add link"
          description="Quick tap-out links shown below the map."
          emptyItem={{
            title: "",
            url: "",
            groupName: "",
            description: "",
          }}
          endpoint="/api/links"
          fields={linkFields}
          initialItems={data.links}
          title="Useful Links"
        />
      </div>
    </main>
  );
}
