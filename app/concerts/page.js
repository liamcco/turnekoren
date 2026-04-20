import { PageHeader } from "@/components/page-header";
import { formatDateTime } from "@/lib/formatting";
import { getConcerts } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default function ConcertsPage() {
  const concerts = getConcerts();

  return (
    <main className="shell">
      <PageHeader
        description="All concert timings, venues, meetups, and practical notes."
        title="Concert Info"
      />

      <div className="stack-lg">
        {concerts.map((concert) => (
          <section className="panel" key={concert.id}>
            <span className="section-kicker">{formatDateTime(concert.startTime)}</span>
            <h2>{concert.title}</h2>
            <p className="detail-line">{concert.venue}</p>
            {concert.address ? <p className="muted-copy">{concert.address}</p> : null}
            {concert.meetup ? (
              <p className="detail-line">Meetup: {formatDateTime(concert.meetup)}</p>
            ) : null}
            {concert.details ? <p>{concert.details}</p> : null}
          </section>
        ))}

        {concerts.length === 0 ? (
          <p className="empty-state">No concert information yet. Add it from the admin portal.</p>
        ) : null}
      </div>
    </main>
  );
}
