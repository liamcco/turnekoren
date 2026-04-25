import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SelectTrigger, SelectValue, SelectContent, SelectItem, Select } from "@/components/ui/select";
import { Stay } from "@/generated/prisma/client";

export function StaySelector({
  stays,
  selectedStayId,
  onSelectStay,
}: {
  stays: Stay[];
  selectedStayId: number | null;
  onSelectStay: (stayId: number) => void;
}) {
  if (stays.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No stays yet</CardTitle>
          <CardDescription>Create a stay before editing rooms.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <a href="/admin/stays">Create stays</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Select
      value={selectedStayId?.toString() ?? ""}
      onValueChange={(value) => onSelectStay(Number(value))}
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