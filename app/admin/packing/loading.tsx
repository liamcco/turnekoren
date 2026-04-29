import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPackingLoading() {
  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-10 w-10 rounded-md" />
      </div>

      <div className="grid w-full gap-6">
        {[0, 1].map((section) => (
          <section className="grid gap-2" key={section}>
            <Skeleton className="h-4 w-28" />
            {[0, 1].map((row) => (
              <div className="grid items-center gap-3 rounded-md border px-4 py-3 md:grid-cols-[minmax(14rem,1fr)_10rem_auto]" key={row}>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-4 w-20" />
                <div className="flex justify-end gap-1">
                  <Skeleton className="h-9 w-9 rounded-md" />
                  <Skeleton className="h-9 w-9 rounded-md" />
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
