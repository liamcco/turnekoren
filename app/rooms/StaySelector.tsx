"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Stay } from "@/generated/prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function StaySelector({
  stays,
  selectedStayId,
}: {
  stays: Stay[];
  selectedStayId: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedStayId.toString()}
        disabled={isPending}
        onValueChange={(value) =>
          startTransition(() => router.push(`/rooms?stayId=${value}`))
        }
      >
        <SelectTrigger className="max-w-md">
          <SelectValue placeholder="Choose stay" />
        </SelectTrigger>
        <SelectContent>
          {stays.map((stay) => (
            <SelectItem key={stay.id} value={stay.id.toString()}>
              {stay.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
    </div>
  );
}
