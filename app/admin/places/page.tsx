import { PlaceEditor } from "./PlaceEditor";
import { getPlaces } from "./actions";

export default async function AdminPlacesEditor() {
  const places = await getPlaces();

  return <PlaceEditor places={places} />;
}