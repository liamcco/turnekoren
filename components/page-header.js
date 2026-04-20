import Link from "next/link";

export function PageHeader({ title, description }) {
  return (
    <header className="page-header">
      <div>
        <Link className="eyebrow-link" href="/">
          Choir Tour Hub
        </Link>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <Link className="button secondary" href="/admin">
        Admin
      </Link>
    </header>
  );
}
