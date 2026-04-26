import { getStayData } from "./actions";
import { StayEditor } from "./StaysEditor";

export default async function AdminStaysEditor() {
  const freshStays = await getStayData();

  return <StayEditor initialStays={freshStays} />;
}