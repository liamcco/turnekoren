import { getStayData } from "./admin-data";
import { StayEditor } from "./StaysEditor";

export default async function AdminStaysEditor() {
  const freshStays = await getStayData();

  return <StayEditor initialStays={freshStays} />;
}