import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <section className="rounded-[2rem] border p-6 md:p-8">
        <div className="space-y-4">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-14 w-full max-w-3xl" />
          <Skeleton className="h-5 w-full max-w-2xl" />
          <Skeleton className="h-5 w-3/4 max-w-xl" />
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Skeleton className="h-10 w-32 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {[0, 1].map((index) => (
          <div className="rounded-3xl border p-6" key={index}>
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-40" />
              <Skeleton className="h-4 w-full max-w-xs" />
            </div>
            <div className="mt-6 space-y-3">
              <Skeleton className="h-12 w-full rounded-2xl" />
              <Skeleton className="h-12 w-11/12 rounded-2xl" />
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-9 w-56" />
          </div>
          <Skeleton className="h-9 w-32 rounded-full" />
        </div>
        <div className="mt-6 space-y-3">
          {[0, 1, 2, 3].map((row) => (
            <div className="rounded-2xl border p-4" key={row}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-64 max-w-full" />
                </div>
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
