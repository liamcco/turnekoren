import { PageHeader } from "@/components/page-header";
import { PropsWithChildren } from "react";

export default function Layout({children}: PropsWithChildren) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <PageHeader
        description="One Finnish phrase each day for the road, the ferry, or the green room."
        title="Daily Finnish Quote"
      />
        {children}
    </main>
  );
}