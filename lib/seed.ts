import { DateTime } from "luxon";
import { TRIP_TIMEZONE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { ContactCreateInput, PackingItemCreateInput, ParticipantCreateInput, PlaceCreateInput, QuoteCreateInput, RoomCreateInput, ScheduleEventCreateInput, StayCreateInput, UsefulLinkCreateInput } from "@/generated/prisma/models";

function createSeedData() {
  const base = DateTime.now().setZone(TRIP_TIMEZONE).startOf("day").plus({ days: 1 });

  return {
    schedule: [
      {
        title: "Coach departs",
        startTime: base.plus({ hours: 7, minutes: 30 }).toISO({ suppressSeconds: true, includeOffset: false }) ?? "",
        endTime: base.plus({ hours: 9 }).toISO({ suppressSeconds: true, includeOffset: false }) ?? "",
        location: "Choir rehearsal room",
        notes: "Bring passport and packed lunch.",
      },
      {
        title: "Ferry check-in",
        startTime: base.plus({ hours: 10, minutes: 15 }).toISO({ suppressSeconds: true, includeOffset: false }) ?? "",
        endTime: base.plus({ hours: 11 }).toISO({ suppressSeconds: true, includeOffset: false }) ?? "",
        location: "Viking Line terminal",
        notes: "Meet in front of the main entrance.",
      },
      {
        title: "Warm-up on board",
        startTime: base.plus({ hours: 14 }).toISO({ suppressSeconds: true, includeOffset: false }) ?? "",
        endTime: base.plus({ hours: 15 }).toISO({ suppressSeconds: true, includeOffset: false }) ?? "",
        location: "Deck conference room",
        notes: "Light rehearsal only.",
      },
      {
        title: "Hotel arrival",
        startTime: base.plus({ days: 1, hours: 9 }).toISO({ suppressSeconds: true, includeOffset: false }) ?? "",
        endTime: base.plus({ days: 1, hours: 10 }).toISO({ suppressSeconds: true, includeOffset: false }) ?? "",
        location: "Hotel lobby",
        notes: "Pick up room cards from the organisers.",
      },
      {
        title: "Evening concert",
        startTime: base.plus({ days: 1, hours: 18 }).toISO({ suppressSeconds: true, includeOffset: false }) ?? "",
        endTime: base.plus({ days: 1, hours: 20 }).toISO({ suppressSeconds: true, includeOffset: false }) ?? "",
        location: "St. John's Church",
        notes: "Concert blacks and tour scarf.",
      },
    ] as ScheduleEventCreateInput[],
    stays: [
      {
        name: "Helsinki Hotel",
        startDate: base.plus({ days: 1 }).toISO({ suppressSeconds: true, includeOffset: false }) ?? "",
        endDate: base.plus({ days: 2 }).toISO({ suppressSeconds: true, includeOffset: false }) ?? "",
        notes: "Best hotel in Helsinki!"
      }
    ] as StayCreateInput[],
    rooms: [
      {
        name: "Helsinki Hotel 312",
        notes: "Late-arrival key card at reception.",
      },
      {
        name: "Helsinki Hotel 415",
        notes: "",
      },
      {
        name: "Ferry to Helsinki B4-112",
        notes: "Upper bunks are assigned already.",
      },
      {
        name: "Ferry to Stockholm C2-204",
        notes: "Upper bunks are assigned already.",
      },
    ] as RoomCreateInput[],
    contacts: [
      { name: "Maria Holst", role: "Tour lead", phone: "+47 900 00 111" },
      { name: "Elias Nord", role: "Transport", phone: "+47 900 00 222" },
      { name: "Sara Virtanen", role: "Concert coordinator", phone: "+358 40 555 0101" },
    ] as ContactCreateInput[],
    participants: [
      { name: "Anna Lind", choir: "KK", voice: "S1", mobile: "+47 900 10 101" },
      { name: "Jonas Berg", choir: "MK", voice: "T1", mobile: "+47 900 10 102" },
      { name: "Maja Solheim", choir: "DK", voice: "A1", mobile: "+47 900 10 103" },
      { name: "Lina Nordin", choir: "KK", voice: "S2", mobile: "+47 900 10 104" },
      { name: "Erik Sunde", choir: "MK", voice: "B1", mobile: "+47 900 10 105" },
      { name: "Kari Olsen", choir: "DK", voice: "A2", mobile: "+47 900 10 106" },
      { name: "Nils Holm", choir: "MK", voice: "B2", mobile: "+47 900 10 107" },
      { name: "Sofia Berg", choir: "KK", voice: "S1", mobile: "+47 900 10 108" },
    ] as ParticipantCreateInput[],
    packing: [
      { label: "Passport / ID", category: "Essentials", notes: "Keep it in your hand luggage." },
      { label: "Concert outfit", category: "Concert", notes: "Pressed and ready to wear." },
      { label: "Black shoes", category: "Concert", notes: "" },
      { label: "Choir folder", category: "Music", notes: "Include updated running order." },
      { label: "Water bottle", category: "Personal", notes: "" },
      { label: "Phone charger", category: "Personal", notes: "" },
    ] as PackingItemCreateInput[],
    quotes: [
      {
        text: "Hiljaa hyvä tulee.",
        translation: "Slowly is how good things happen.",
        context: "A reminder not to rush the trip.",
      },
      {
        text: "Sisu vie perille.",
        translation: "Grit gets you there.",
        context: "Useful on travel days.",
      },
      {
        text: "Mennään yhdessä.",
        translation: "Let's go together.",
        context: "A fitting choir motto for tour week.",
      },
    ] as QuoteCreateInput[],
    places: [
      {
        name: "Hotel",
        address: "Mannerheimintie 10, Helsinki",
        description: "Primary meeting point and luggage drop.",
        url: "https://maps.google.com/?q=60.1704,24.941",
      },
      {
        name: "Concert venue",
        address: "Lutherinkatu 3, Helsinki",
        description: "Main performance venue.",
        url: "https://maps.google.com/?q=60.1739,24.925",
      },
      {
        name: "Ferry terminal",
        address: "Katajanokanlaituri 8, Helsinki",
        description: "Outbound and return crossing.",
        url: "https://maps.google.com/?q=60.1647,24.9737",
      },
    ] as PlaceCreateInput[],
    links: [
      {
        title: "Ferry booking",
        url: "https://www.vikingline.com",
        description: "Check cabin details and baggage rules.",
      },
      {
        title: "Weather in Helsinki",
        url: "https://www.ilmatieteenlaitos.fi",
        description: "Useful before packing each morning.",
      },
      {
        title: "Choir Google Drive",
        url: "https://drive.google.com",
        description: "Music PDFs and last-minute notes.",
      },
    ] as UsefulLinkCreateInput[],
  };
}

export async function seedDatabaseIfEmpty(): Promise<void> {
  const seeds = createSeedData();

  if ((await prisma.scheduleEvent.count()) === 0) {
    await prisma.scheduleEvent.createMany({ data: seeds.schedule });
  }

  if ((await prisma.contact.count()) === 0) {
    await prisma.contact.createMany({ data: seeds.contacts });
  }

   if ((await prisma.stay.count()) === 0) {
    await prisma.stay.createMany({ data: seeds.stays });
  }

  if ((await prisma.room.count()) === 0) {
    await prisma.room.createMany({ data: seeds.rooms });
  }

  if ((await prisma.participant.count()) === 0) {
    await prisma.participant.createMany({ data: seeds.participants });
  }

  if ((await prisma.packingItem.count()) === 0) {
    await prisma.packingItem.createMany({ data: seeds.packing });
  }

  if ((await prisma.quote.count()) === 0) {
    await prisma.quote.createMany({ data: seeds.quotes });
  }

  if ((await prisma.place.count()) === 0) {
    await prisma.place.createMany({ data: seeds.places });
  }

  if ((await prisma.usefulLink.count()) === 0) {
    await prisma.usefulLink.createMany({ data: seeds.links });
  }
}