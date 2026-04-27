import { LinkEditor } from "./LinkEditor";
import { getLinkData } from "./actions";

export default async function AdminLinksEditor() {
  const links = await getLinkData();

  return <LinkEditor links={links} />;
}