import { prisma } from "@/lib/prisma";

function escapeICalText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function formatUtcDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

export async function GET() {
  const events = await prisma.scheduleEvent.findMany({
    orderBy: [{ startTime: "asc" }],
  });

  const generatedAt = formatUtcDate(new Date());
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//turnekoren//schedule//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  for (const event of events) {
    const endTime = event.endTime ?? new Date(event.startTime.getTime() + 15 * 60_000);

    lines.push(
      "BEGIN:VEVENT",
      `UID:schedule-${event.id}@turnekoren`,
      `DTSTAMP:${generatedAt}`,
      `DTSTART:${formatUtcDate(event.startTime)}`,
      `DTEND:${formatUtcDate(endTime)}`,
      `SUMMARY:${escapeICalText(event.title)}`,
      `LOCATION:${escapeICalText(event.location)}`,
      event.notes ? `DESCRIPTION:${escapeICalText(event.notes)}` : "",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");

  return new Response(lines.filter(Boolean).join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="schedule.ics"',
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
