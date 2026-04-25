import { getRoomEditorData } from "./admin-data";
import { RoomEditor } from "./RoomEditor";

interface AdminRoomsPageProps {
  searchParams?: Promise<{
    stayId?: string;
  }>;
}

export default async function AdminRoomsPage({ searchParams }: AdminRoomsPageProps) {
  const resolvedSearchParams = await searchParams;
  const stayId = resolvedSearchParams?.stayId;

  const data = await getRoomEditorData();

  return <RoomEditor data={data} stayId={stayId} />;
}
