import { Skeleton } from "@/components/ui/skeleton";

export default function AdminFilesLoading() {
  return (
    <div className="grid gap-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-72 max-w-2xl" />
      <div className="grid max-w-5xl gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    </div>
  );
}
