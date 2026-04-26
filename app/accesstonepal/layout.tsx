import { ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { PageHeader } from "@/components/page-header";
import { AdminTabsNav } from "./admin-tabs-nav";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function AdminPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <PageHeader
        description="Edit every section shown in the mobile hub. This starter does not include authentication yet."
        title="Admin Portal"
      />

      <Alert>
        <ShieldAlert className="size-4" />
        <AlertTitle>Authentication is not enabled yet</AlertTitle>
        <AlertDescription>
          This admin portal is currently open by URL only. Add authentication before using it on a public deployment.
        </AlertDescription>
      </Alert>

      <AdminTabsNav />

      <section>{children}</section>
    </main>
  );
}
