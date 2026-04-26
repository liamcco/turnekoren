import { PageHeader } from "@/components/page-header";
import { AdminTabsNav } from "./admin-tabs-nav";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function AdminPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <PageHeader
        description="Edit every section shown in the mobile hub."
        title="Admin Portal"
      />

      <AdminTabsNav />

      <section>{children}</section>
    </main>
  );
}
