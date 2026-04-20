import { MapView } from "@/components/map-view";
import { PageHeader } from "@/components/page-header";
import { getMapData } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default function MapPage() {
  const { places, links } = getMapData();

  const linksByGroup = links.reduce((groups, link) => {
    const key = link.groupName || "General";
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(link);
    return groups;
  }, {});

  return (
    <main className="shell">
      <PageHeader
        description="Important places on a map plus the tap-out links the choir needs most often."
        title="Map & Good-To-Know Links"
      />

      <section className="panel map-panel">
        {places.length ? (
          <MapView places={places} />
        ) : (
          <p className="empty-state">Add places in the admin portal to populate the map.</p>
        )}
      </section>

      <div className="split-grid">
        <section className="panel">
          <span className="section-kicker">Places</span>
          <h2>Saved locations</h2>
          <div className="stack">
            {places.map((place) => (
              <article className="place-card" key={place.id}>
                <h3>{place.name}</h3>
                {place.address ? <p>{place.address}</p> : null}
                {place.description ? <p className="muted-copy">{place.description}</p> : null}
                {place.mapLink ? (
                  <a className="button secondary" href={place.mapLink} rel="noreferrer" target="_blank">
                    Open in maps
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <span className="section-kicker">Links</span>
          <h2>Useful taps</h2>
          <div className="stack">
            {Object.entries(linksByGroup).map(([groupName, groupLinks]) => (
              <div key={groupName}>
                <h3>{groupName}</h3>
                <div className="stack">
                  {groupLinks.map((link) => (
                    <a
                      className="link-card"
                      href={link.url}
                      key={link.id}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <strong>{link.title}</strong>
                      <span>{link.description || link.url}</span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
