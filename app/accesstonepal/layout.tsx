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
        description="Redigera alla delar som visas i mobilhubben. Autentisering är inte aktiverad ännu."
        title="Adminportal"
      />

      <Alert>
        <ShieldAlert className="size-4" />
        <AlertTitle>Autentisering är inte aktiverad ännu</AlertTitle>
        <AlertDescription>
          Den här adminportalen är just nu öppen via URL. Lägg till autentisering innan den används publikt.
        </AlertDescription>
      </Alert>

      <AdminTabsNav />

      <section>{children}</section>
    </main>
  );
}
