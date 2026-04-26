import { getPackingItemData } from "./actions";
import { PackingItemEditor } from "./PackingEditor";

export default async function AdminPackingEditor() {
  const freshItems = await getPackingItemData();

  return <PackingItemEditor initialItems={freshItems} />;
}