import { prisma } from "@/lib/prisma";
import { APP_NAME, TRIP_TIMEZONE } from "@/lib/constants";

export const revalidate = 300;

function escapeICalText(value: string | null) {
  return (value ?? "")
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

function formatFloatingDateTime(date: Date) {
  return formatUtcDate(date).replace(/Z$/, "");
}

function getTimeZoneLines() {
  if (TRIP_TIMEZONE !== "Europe/Oslo") {
    return [];
  }

  return [
    "BEGIN:VTIMEZONE",
    `TZID:${TRIP_TIMEZONE}`,
    `X-LIC-LOCATION:${TRIP_TIMEZONE}`,
    "BEGIN:DAYLIGHT",
    "TZOFFSETFROM:+0100",
    "TZOFFSETTO:+0200",
    "TZNAME:CEST",
    "DTSTART:19700329T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
    "END:DAYLIGHT",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:+0200",
    "TZOFFSETTO:+0100",
    "TZNAME:CET",
    "DTSTART:19701025T030000",
    "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
    "END:STANDARD",
    "END:VTIMEZONE",
  ];
}

function foldICalLine(line: string) {
  const encoder = new TextEncoder();
  const lines: string[] = [];
  let currentLine = "";
  let currentLength = 0;

  for (const character of line) {
    const characterLength = encoder.encode(character).length;
    if (currentLength + characterLength > 75) {
      lines.push(currentLine);
      currentLine = ` ${character}`;
      currentLength = 1 + characterLength;
    } else {
      currentLine += character;
      currentLength += characterLength;
    }
  }

  lines.push(currentLine);
  return lines;
}

function formatICal(lines: string[]) {
  return `${lines.flatMap(foldICalLine).join("\r\n")}\r\n`;
}

function getICalHeaders() {
  return {
    "Content-Type": "text/calendar; charset=utf-8; method=PUBLISH",
    "Content-Disposition": 'inline; filename="schedule.ics"',
    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
  };
}

export async function HEAD() {
  return new Response(null, {
    headers: getICalHeaders(),
  });
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
    `X-WR-CALNAME:${escapeICalText(`${APP_NAME} schedule`)}`,
    `X-WR-CALDESC:${escapeICalText("Schedule for the choir trip")}`,
    `X-WR-TIMEZONE:${TRIP_TIMEZONE}`,
    "REFRESH-INTERVAL;VALUE=DURATION:PT5M",
    "X-PUBLISHED-TTL:PT5M",
    ...getTimeZoneLines(),
  ];

  for (const event of events) {
    const endTime = event.endTime ?? new Date(event.startTime.getTime() + 15 * 60_000);

    lines.push(
      "BEGIN:VEVENT",
      `UID:schedule-${event.id}@turnekoren`,
      `DTSTAMP:${generatedAt}`,
      `DTSTART;TZID=${TRIP_TIMEZONE}:${formatFloatingDateTime(event.startTime)}`,
      `DTEND;TZID=${TRIP_TIMEZONE}:${formatFloatingDateTime(endTime)}`,
      `SUMMARY:${escapeICalText(event.title)}`,
      `LOCATION:${escapeICalText(event.location)}`,
      "STATUS:CONFIRMED",
      "TRANSP:OPAQUE",
      event.notes ? `DESCRIPTION:${escapeICalText(event.notes)}` : "",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");

  return new Response(formatICal(lines.filter(Boolean)), {
    headers: getICalHeaders(),
  });
}
