import { prisma } from "@/lib/prisma";

export async function getContacts() {
  return prisma.contact.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });
}
