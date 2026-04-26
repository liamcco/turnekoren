import { BedDouble, Hotel } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getStays, getNextUpcomingStayId, getRoomsForStay } from "@/app/rooms/rooms";
import { StaySelector } from "@/app/rooms/StaySelector";

interface RoomsPageProps {
  searchParams?: Promise<{ stayId?: string }>;
}

export default async function RoomsPage({ searchParams }: RoomsPageProps) {
  const stays = await getStays();

  if (stays.length === 0) {
    return <p className="text-sm text-muted-foreground">No rooming information available yet.</p>;
  }

  const resolvedParams = await searchParams;
  const requestedId = resolvedParams?.stayId ? parseInt(resolvedParams.stayId) : null;
  const selectedStayId =
    requestedId && stays.some((s) => s.id === requestedId)
      ? requestedId
      // Falls back to last stay if all stays are in the past; getNextUpcomingStayId
      // is guaranteed non-null because stays.length > 0 is checked above.
      : getNextUpcomingStayId(stays)!;

  const selectedStay = stays.find((s) => s.id === selectedStayId);
  if (!selectedStay) {
    return <p className="text-sm text-muted-foreground">Could not load stay information.</p>;
  };
  const rooms = await getRoomsForStay(selectedStayId);

  return (
    <div className="space-y-4">
      <StaySelector stays={stays} selectedStayId={selectedStayId} />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <Badge className="w-fit rounded-full px-3 py-1 text-[10px] tracking-[0.24em] uppercase" variant="outline">
                {selectedStay.name}
              </Badge>
              <CardTitle className="flex items-center gap-2">
                <Hotel className="size-5 text-muted-foreground" />
                {selectedStay.name} rooms
              </CardTitle>
              <CardDescription>Check assignments, cabin splits, and any extra notes.</CardDescription>
            </div>
            <Badge variant="secondary">{rooms.length} rooms</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {rooms.length === 0 ? (
            <p className="text-sm text-muted-foreground">No rooms assigned for this stay yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead className="whitespace-normal">Occupants</TableHead>
                  <TableHead className="whitespace-normal">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.name}</TableCell>
                    <TableCell className="whitespace-normal">
                      <div className="flex flex-wrap gap-2">
                        {room.participants.map((participant) => (
                          <Badge className="rounded-full" key={participant.id} variant="secondary">
                            <BedDouble className="size-3" />
                            {participant.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-normal text-muted-foreground">
                      {room.notes || "No extra notes."}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
