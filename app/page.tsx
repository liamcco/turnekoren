import { HomePage as HomePageContent } from "@/components/home/home-page";
import { getScheduleSnapshot } from "@/app/home-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const snapshot = await getScheduleSnapshot();

  return <HomePageContent snapshot={snapshot} />;
}
