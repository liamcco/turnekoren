import { DateTime } from "luxon";
import { prisma } from "@/lib/prisma";
import { TRIP_TIMEZONE } from "@/lib/constants";
import { Quote } from "@/generated/prisma/client";

export async function getDailyQuote(): Promise<Quote | null> {
  const quotes = await prisma.quote.findMany({
    orderBy: { id: "asc" },
  });

  if (quotes.length === 0) {
    return null;
  }

  const today = DateTime.now().setZone(TRIP_TIMEZONE);
  const index = (today.ordinal + today.year) % quotes.length;
  const quote = quotes[index];
  return quote ?? null;
}