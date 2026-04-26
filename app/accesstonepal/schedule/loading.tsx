import { Skeleton } from "@/components/ui/skeleton";

const HOUR_HEIGHT = 72;

export default function AdminScheduleLoading() {
  return (
    <div className="rounded-3xl border p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>

      <div className="mt-6">
        <Skeleton className="h-10 w-56 rounded-md" />
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border bg-background">
        <div className="grid grid-cols-[4rem_1fr]">
          <div>
            {Array.from({ length: 8 }).map((_, hour) => (
              <div className="border-b px-3 pt-1" key={hour} style={{ height: HOUR_HEIGHT }}>
                <Skeleton className="h-4 w-10" />
              </div>
            ))}
          </div>

          <div className="relative">
            {Array.from({ length: 8 }).map((_, hour) => (
              <div className="border-b border-l" key={hour} style={{ height: HOUR_HEIGHT }} />
            ))}
            <Skeleton className="absolute left-2 top-8 h-24 w-[calc(50%-0.75rem)] rounded-md" />
            <Skeleton className="absolute left-[calc(50%+0.25rem)] top-40 h-20 w-[calc(50%-0.75rem)] rounded-md" />
            <Skeleton className="absolute left-2 top-72 h-28 w-[calc(50%-0.75rem)] rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
