import { FileEditor } from "./FileEditor";
import { getFileData } from "./actions";

export default async function AdminFilesEditor() {
  const files = await getFileData();

  return <FileEditor files={files} />;
}
