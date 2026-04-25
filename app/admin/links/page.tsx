import { LinkEditor } from "./link-editor";
import { getLinkData } from "./admin-data";

export default async function AdminLinksEditor() {
  const links = await getLinkData();

  return <LinkEditor links={links} />;
}