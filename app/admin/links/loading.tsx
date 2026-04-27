import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLinksLoading() {
  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-10 w-10 rounded-md" />
      </div>

      <div className="grid max-w-5xl gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((card) => (
          <div className="rounded-3xl border p-6" key={card}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-10/12" />
              </div>
              <div className="flex gap-1">
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
