import { PackingItem } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function getPackingByCategory() {
  const rows = await prisma.packingItem.findMany({
    orderBy: [{ category: "asc" }, { label: "asc" }],
  });

  return rows.reduce<Record<string, PackingItem[]>>((groups, item) => {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
    return groups;
  }, {});
}
