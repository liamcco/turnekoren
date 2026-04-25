import { prisma } from "@/lib/prisma";

export async function getLinksAndPlaces() {
  const links = await prisma.usefulLink.findMany({
    orderBy: [{ title: "asc" }],
  });

  const places = await prisma.place.findMany({
    orderBy: [{ name: "asc" }],
  });

  return { links, places };
}
