import { Skeleton } from "@/components/ui/skeleton";

export default function AdminStaysLoading() {
  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-10 w-10 rounded-md" />
      </div>

      <div className="grid w-full gap-2">
        {[0, 1, 2].map((row) => (
          <div className="grid items-center gap-3 rounded-md border px-4 py-3 md:grid-cols-[minmax(10rem,1fr)_12rem_minmax(10rem,12rem)_auto]" key={row}>
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-4 w-28" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-8 w-16 rounded-md" />
            </div>
            <div className="flex justify-end gap-1">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
