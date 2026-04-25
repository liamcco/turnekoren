import { Skeleton } from "@/components/ui/skeleton";

export default function AdminContactsLoading() {
  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-10 w-10 rounded-md" />
      </div>

      <div className="grid w-full gap-2">
        <div className="hidden gap-3 px-4 md:grid md:grid-cols-[minmax(12rem,1fr)_minmax(10rem,14rem)_minmax(10rem,14rem)_5.5rem]">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="ml-auto h-4 w-16" />
        </div>
        {[0, 1, 2, 3].map((row) => (
          <div className="grid items-center gap-3 rounded-md border px-4 py-3 md:grid-cols-[minmax(12rem,1fr)_minmax(10rem,14rem)_minmax(10rem,14rem)_5.5rem]" key={row}>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
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
