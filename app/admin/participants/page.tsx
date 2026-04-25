import { getParticipantData } from "./admin-data";
import { ParticipantEditor } from "./ParticipantsEditor";

export default async function AdminParticipantsEditor() {
  const freshParticipants = await getParticipantData();

  return <ParticipantEditor initialParticipants={freshParticipants} />;
}
