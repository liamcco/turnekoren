import { PageHeader } from "@/components/page-header";
import { getRoomsByLocation } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default function RoomsPage() {
  const groupedRooms = getRoomsByLocation();

  return (
    <main className="shell">
      <PageHeader
        description="See who is sleeping where, both at the hotel and on the ferry."
        title="Rooming List"
      />

      <div className="stack-lg">
        {Object.entries(groupedRooms).map(([locationType, rooms]) => (
          <section className="panel" key={locationType}>
            <div className="panel-heading">
              <div>
                <span className="section-kicker">{locationType}</span>
                <h2>{locationType} rooms</h2>
              </div>
            </div>

            <div className="stack">
              {rooms.map((room) => (
                <article className="room-card" key={room.id}>
                  <div className="room-card-head">
                    <h3>{room.name}</h3>
                    <span className="pill">{room.locationType}</span>
                  </div>
                  <ul className="room-occupants">
                    {room.occupantsList.map((occupant) => (
                      <li key={occupant}>{occupant}</li>
                    ))}
                  </ul>
                  {room.notes ? <p className="muted-copy">{room.notes}</p> : null}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
