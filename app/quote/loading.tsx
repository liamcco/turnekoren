import { Skeleton } from "@/components/ui/skeleton";

export default function QuoteLoading() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <header className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-8 w-36" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-80 max-w-full" />
              <Skeleton className="h-4 w-full max-w-2xl" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-px w-full" />
      </header>

      <div className="rounded-3xl border p-6 md:p-8">
        <div className="space-y-4">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-11/12" />
          <Skeleton className="h-6 w-3/4" />
        </div>
        <div className="mt-8 space-y-3">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-10/12" />
        </div>
        <div className="mt-8 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-9/12" />
        </div>
      </div>
    </main>
  );
}
