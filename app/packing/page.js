import { PageHeader } from "@/components/page-header";
import { getPackingByCategory } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default function PackingPage() {
  const groups = getPackingByCategory();

  return (
    <main className="shell">
      <PageHeader
        description="The trip packing list, grouped so people can check things off quickly."
        title="What To Pack"
      />

      <div className="stack-lg">
        {Object.entries(groups).map(([category, items]) => (
          <section className="panel" key={category}>
            <span className="section-kicker">{category}</span>
            <h2>{category}</h2>
            <div className="checklist">
              {items.map((item) => (
                <article className="checklist-item" key={item.id}>
                  <div className="checklist-dot" />
                  <div>
                    <strong>{item.label}</strong>
                    {item.notes ? <p className="muted-copy">{item.notes}</p> : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}

        {Object.keys(groups).length === 0 ? (
          <p className="empty-state">No packing items yet. Add them from the admin portal.</p>
        ) : null}
      </div>
    </main>
  );
}
