import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function LinkCardSkeleton({ hasExtraLine = false }: { hasExtraLine?: boolean }) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full max-w-56" />
          {hasExtraLine ? <Skeleton className="h-4 w-full max-w-48" /> : null}
        </div>
        <Skeleton className="mt-0.5 h-5 w-5 shrink-0 rounded-full" />
      </CardHeader>
    </Card>
  );
}

export default function LinksLoading() {
  return (
    <div className="grid gap-6">
      <section className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <LinkCardSkeleton key={item} hasExtraLine={item % 2 === 0} />
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        <Separator />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <LinkCardSkeleton key={item} hasExtraLine />
          ))}
        </div>
      </section>
    </div>
  );
}
