"use client";

import { useRouter } from "next/navigation";
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

  return (
    <Select
      value={selectedStayId.toString()}
      onValueChange={(value) => router.push(`/rooms?stayId=${value}`)}
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
  );
}
