import { Skeleton } from "@/components/ui/skeleton";

export default function ContactsLoading() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <header className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-8 w-36" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-56 max-w-full" />
              <Skeleton className="h-4 w-full max-w-2xl" />
              <Skeleton className="h-4 w-96 max-w-full" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-px w-full" />
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1, 2, 3].map((index) => (
          <div className="rounded-3xl border p-6" key={index}>
            <div className="space-y-4">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="mt-6 flex gap-2">
              <Skeleton className="h-10 w-36 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
