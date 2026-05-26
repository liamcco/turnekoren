import { PageHeader } from "@/components/page-header";
import { PropsWithChildren } from "react";

export default function Layout({children}: PropsWithChildren) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8 max-md:h-[calc(100svh-4rem)] max-md:overflow-hidden max-md:py-3">
      <div className="hidden md:block">
        <PageHeader
          description="Se schemat för varje dag på resan."
          title="Schema"
        />
      </div>
      <div className="max-md:flex-1 max-md:min-h-0">
        {children}
      </div>
    </main>
  );
}
