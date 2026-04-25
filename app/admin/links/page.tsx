import { LinkEditor } from "./link-editor";
import { getLinkData } from "./actions";

export default async function AdminLinksEditor() {
  const links = await getLinkData();

  return <LinkEditor links={links} />;
}