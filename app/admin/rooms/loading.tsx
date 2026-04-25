import { Skeleton } from "@/components/ui/skeleton";

export default function AdminRoomsLoading() {
  return (
    <div className="grid gap-6">
      <div className="rounded-3xl border p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
        <div className="mt-6 max-w-md space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>

      <div className="rounded-3xl border p-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-[minmax(12rem,20rem)_auto] md:items-end">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {[0, 1, 2, 3].map((card) => (
          <div className="rounded-3xl border p-6" key={card}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-7 w-28" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="flex gap-1">
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <Skeleton className="h-4 w-20" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-7 w-28 rounded-full" />
                <Skeleton className="h-7 w-24 rounded-full" />
                <Skeleton className="h-7 w-20 rounded-full" />
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
