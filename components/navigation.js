import Link from "next/link";

export const MENU_ITEMS = [
  {
    href: "/currency",
    title: "Currency",
    description: "Live EUR to SEK exchange",
  },
  {
    href: "/rooms",
    title: "Rooms",
    description: "Hotel and ferry rooming list",
  },
  {
    href: "/quote",
    title: "Finnish Quote",
    description: "One daily phrase for the tour",
  },
  {
    href: "/contacts",
    title: "Contacts",
    description: "Organising group details",
  },
  {
    href: "/concerts",
    title: "Concerts",
    description: "All performance info in one place",
  },
  {
    href: "/packing",
    title: "Packing",
    description: "What to bring before you leave",
  },
  {
    href: "/map",
    title: "Map & Links",
    description: "Useful places and tap-out links",
  },
];

export function Navigation() {
  return (
    <div className="menu-grid">
      {MENU_ITEMS.map((item) => (
        <Link className="menu-card" href={item.href} key={item.href}>
          <span className="menu-card-title">{item.title}</span>
          <span className="menu-card-description">{item.description}</span>
        </Link>
      ))}
    </div>
  );
}
