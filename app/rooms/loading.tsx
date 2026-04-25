import { Skeleton } from "@/components/ui/skeleton";

export default function RoomsLoading() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <header className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-8 w-36" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-64 max-w-full" />
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

      <div className="space-y-4">
        {[0, 1].map((index) => (
          <div className="rounded-3xl border p-6" key={index}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-28 rounded-full" />
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-72 max-w-full" />
              </div>
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
            <div className="mt-6 space-y-3">
              {[0, 1, 2].map((row) => (
                <div className="grid gap-3 rounded-xl border p-4 md:grid-cols-[10rem_1fr_12rem]" key={row}>
                  <Skeleton className="h-5 w-20" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-7 w-24 rounded-full" />
                    <Skeleton className="h-7 w-28 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
