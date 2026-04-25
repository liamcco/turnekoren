import { prisma } from "@/lib/prisma";

export type ParticipantCsvImportResult = {
  createdCount: number;
  skippedCount: number;
  errors: string[];
};

type ParticipantCsvRow = {
  name: string;
  choir: string;
  voice: string;
  mobile: string | null;
};

const allowedChoirs = new Set(["MK", "DK", "KK"]);
const allowedVoices = new Set(["B2", "B1", "T2", "T1", "A2", "A1", "S2", "S1"]);

function parseCsvLine(line: string) {
  const values: string[] = [];
  let currentValue = "";
  let isInsideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"' && isInsideQuotes && nextCharacter === '"') {
      currentValue += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      isInsideQuotes = !isInsideQuotes;
      continue;
    }

    if (character === "," && !isInsideQuotes) {
      values.push(currentValue.trim());
      currentValue = "";
      continue;
    }

    currentValue += character;
  }

  values.push(currentValue.trim());

  return values;
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase();
}

function parseParticipantCsv(csvContent: string) {
  const errors: string[] = [];
  const lines = csvContent
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { rows: [], errors: ["CSV file is empty."] };
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const requiredHeaders = ["name", "choir", "voice", "mobile"];
  const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));

  if (missingHeaders.length > 0) {
    return {
      rows: [],
      errors: [`Missing required columns: ${missingHeaders.join(", ")}.`],
    };
  }

  const getColumnValue = (values: string[], columnName: string) => {
    const columnIndex = headers.indexOf(columnName);
    return values[columnIndex]?.trim() ?? "";
  };

  const rows = lines.slice(1).reduce<ParticipantCsvRow[]>((acc, line, index) => {
    const rowNumber = index + 2;
    const values = parseCsvLine(line);
    const name = getColumnValue(values, "name");
    const choir = getColumnValue(values, "choir").toUpperCase();
    const voice = getColumnValue(values, "voice").toUpperCase();
    const mobile = getColumnValue(values, "mobile");

    if (!name) {
      errors.push(`Row ${rowNumber}: name is required.`);
      return acc;
    }

    if (!allowedChoirs.has(choir)) {
      errors.push(`Row ${rowNumber}: choir must be MK, DK or KK.`);
      return acc;
    }

    if (!allowedVoices.has(voice)) {
      errors.push(`Row ${rowNumber}: voice must be B2, B1, T2, T1, A2, A1, S2 or S1.`);
      return acc;
    }

    acc.push({
      name,
      choir,
      voice,
      mobile: mobile || null,
    });

    return acc;
  }, []);

  return { rows, errors };
}

export async function importParticipantsFromCsv(
  csvContent: string
): Promise<ParticipantCsvImportResult> {
  const { rows, errors } = parseParticipantCsv(csvContent);

  if (errors.length > 0) {
    return {
      createdCount: 0,
      skippedCount: rows.length,
      errors,
    };
  }

  const result = await prisma.participant.createMany({
    data: rows,
  });

  return {
    createdCount: result.count,
    skippedCount: rows.length - result.count,
    errors: [],
  };
}