import { getContactData } from "./admin-data";
import { ContactEditor } from "./ContactsEditor";

export default async function AdminContactsEditor() {
  const freshContacts = await getContactData();

  return <ContactEditor initialContacts={freshContacts} />;
}
