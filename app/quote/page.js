import { PageHeader } from "@/components/page-header";
import { getDailyQuote } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default function QuotePage() {
  const quote = getDailyQuote();

  return (
    <main className="shell">
      <PageHeader
        description="One Finnish phrase each day for the road, the ferry, or the green room."
        title="Daily Finnish Quote"
      />

      <section className="quote-card">
        {quote ? (
          <>
            <span className="section-kicker">Today&apos;s line</span>
            <blockquote>{quote.text}</blockquote>
            {quote.translation ? <p className="quote-translation">{quote.translation}</p> : null}
            {quote.context ? <p className="muted-copy">{quote.context}</p> : null}
          </>
        ) : (
          <p className="empty-state">Add quotes in the admin portal to start the daily rotation.</p>
        )}
      </section>
    </main>
  );
}
