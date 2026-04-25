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
import { getRoomsByStay } from "@/app/rooms/rooms";

export default async function RoomsPage() {
  const groupedRooms = await getRoomsByStay();

  if (Object.keys(groupedRooms).length === 0) {
    return <p className="text-sm text-muted-foreground">No rooming information available yet.</p>
  }

  return (
      <div className="space-y-4">
        {Object.entries(groupedRooms).map(([label, rooms]) => (
          <Card key={label}>
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <Badge className="w-fit rounded-full px-3 py-1 text-[10px] tracking-[0.24em] uppercase" variant="outline">
                    {label}
                  </Badge>
                  <CardTitle className="flex items-center gap-2">
                    <Hotel className="size-5 text-muted-foreground" />
                    {label} rooms
                  </CardTitle>
                  <CardDescription>Check assignments, cabin splits, and any extra notes.</CardDescription>
                </div>
                <Badge variant="secondary">{rooms.length} rooms</Badge>
              </div>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        ))}
      </div>
  );
}
