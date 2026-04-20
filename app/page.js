import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { formatNow, formatTime } from "@/lib/formatting";
import { getScheduleSnapshot } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const { now, currentEvent, nextEvent, todayEvents, upcomingEvents } = getScheduleSnapshot();

  return (
    <main className="shell">
      <header className="home-header">
        <div>
          <span className="eyebrow">Live Trip Desk</span>
          <h1>Choir Tour Hub</h1>
          <p>
            Everything the choir needs during the trip, built for fast checking on a phone.
          </p>
        </div>
        <Link className="button secondary" href="/admin">
          Edit content
        </Link>
      </header>

      <section className="hero-grid">
        <article className="hero-card">
          <span className="section-kicker">Right now</span>
          <h2>{currentEvent ? currentEvent.title : "No active event"}</h2>
          <p>
            {currentEvent
              ? `${formatTime(currentEvent.startTime)}–${formatTime(currentEvent.endTime)} · ${currentEvent.location}`
              : "The schedule is currently between activities."}
          </p>
          <small>{formatNow(now)}</small>
        </article>

        <article className="panel next-panel">
          <span className="section-kicker">Next meetup</span>
          {nextEvent ? (
            <>
              <h2>{nextEvent.title}</h2>
              <p>
                {formatTime(nextEvent.startTime)} at {nextEvent.location}
              </p>
              <p className="muted-copy">{nextEvent.notes || "No extra notes for this meetup."}</p>
            </>
          ) : (
            <>
              <h2>Nothing else scheduled</h2>
              <p>The current plan has no upcoming items yet.</p>
            </>
          )}
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="section-kicker">Today</span>
            <h2>Live schedule</h2>
          </div>
        </div>

        <div className="timeline">
          {(todayEvents.length ? todayEvents : upcomingEvents).map((event) => {
            const isCurrent = currentEvent?.id === event.id;
            return (
              <article className={`timeline-item ${isCurrent ? "active" : ""}`} key={event.id}>
                <div className="timeline-time">
                  {formatTime(event.startTime)}–{formatTime(event.endTime)}
                </div>
                <div>
                  <h3>{event.title}</h3>
                  <p>
                    {event.location}
                    {event.notes ? ` · ${event.notes}` : ""}
                  </p>
                </div>
              </article>
            );
          })}

          {todayEvents.length === 0 && upcomingEvents.length === 0 ? (
            <p className="empty-state">No schedule entries yet. Add them in the admin portal.</p>
          ) : null}
        </div>
      </section>

      <section className="stack-lg">
        <div>
          <span className="section-kicker">Menu</span>
          <h2 className="section-title">Trip utilities</h2>
        </div>
        <Navigation />
      </section>
    </main>
  );
}
