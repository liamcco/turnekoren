import { prisma } from "@/lib/prisma";
import { addFloatingDays, addFloatingHours, getCurrentFloatingDate } from "@/lib/floating-date";
import { ContactCreateInput, PackingItemCreateInput, ParticipantCreateInput, PlaceCreateInput, QuoteCreateInput, RoomCreateInput, ScheduleEventCreateInput, StayCreateInput, UsefulLinkCreateInput } from "@/generated/prisma/models";

function createSeedData() {
  const base = addFloatingDays(getCurrentFloatingDate(), 1);
  base.setUTCHours(0, 0, 0, 0);

  return {
    schedule: [
      {
        title: "Coach departs",
        startTime: new Date(addFloatingHours(base, 7).getTime() + 30 * 60_000),
        endTime: addFloatingHours(base, 9),
        location: "Choir rehearsal room",
        notes: "Bring passport and packed lunch.",
      },
      {
        title: "Ferry check-in",
        startTime: new Date(addFloatingHours(base, 10).getTime() + 15 * 60_000),
        endTime: addFloatingHours(base, 11),
        location: "Viking Line terminal",
        notes: "Meet in front of the main entrance.",
      },
      {
        title: "Warm-up on board",
        startTime: addFloatingHours(base, 14),
        endTime: addFloatingHours(base, 15),
        location: "Deck conference room",
        notes: "Light rehearsal only.",
      },
      {
        title: "Hotel arrival",
        startTime: addFloatingHours(addFloatingDays(base, 1), 9),
        endTime: addFloatingHours(addFloatingDays(base, 1), 10),
        location: "Hotel lobby",
        notes: "Pick up room cards from the organisers.",
      },
      {
        title: "Evening concert",
        startTime: addFloatingHours(addFloatingDays(base, 1), 18),
        endTime: addFloatingHours(addFloatingDays(base, 1), 20),
        location: "St. John's Church",
        notes: "Concert blacks and tour scarf.",
      },
    ] as ScheduleEventCreateInput[],
    stays: [
      {
        name: "Helsinki Hotel",
        startDate: addFloatingDays(base, 1),
        endDate: addFloatingDays(base, 2),
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
