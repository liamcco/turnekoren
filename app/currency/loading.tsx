import { Skeleton } from "@/components/ui/skeleton";

export default function CurrencyLoading() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <header className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-8 w-36" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-72 max-w-full" />
              <Skeleton className="h-4 w-full max-w-2xl" />
              <Skeleton className="h-4 w-80 max-w-full" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-px w-full" />
      </header>

      <section className="grid gap-4">
        <div className="rounded-3xl border p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-10 w-56" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-16 w-32 rounded-2xl" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1].map((index) => (
            <div className="rounded-3xl border p-6" key={index}>
              <div className="space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="mt-5 space-y-3">
                {[0, 1, 2, 3].map((row) => (
                  <div className="flex items-center justify-between gap-4" key={row}>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-28 rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
