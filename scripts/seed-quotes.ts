import "dotenv/config";
import { readFileSync } from "fs";
import { join } from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString,
    ssl: { rejectUnauthorized: false },
  }),
});

interface QuoteEntry {
  quote: string;
  translation: string;
  context?: string;
}

async function main() {
  const filePath = join(process.cwd(), "scripts", "quotes.json");
  const raw = readFileSync(filePath, "utf-8");
  const entries: QuoteEntry[] = JSON.parse(raw);

  const data = entries.map((entry) => ({
    text: entry.quote,
    translation: entry.translation,
    context: entry.context ?? null,
  }));

  const result = await prisma.quote.createMany({ data, skipDuplicates: true });
  console.log(`Inserted ${result.count} quote(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
