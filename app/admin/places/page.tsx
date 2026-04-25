import { PlaceEditor } from "./place-editor";
import { getPlaces } from "./admin-data";

export default async function AdminPlacesEditor() {
  const places = await getPlaces();

  return <PlaceEditor places={places} />;
}