import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { DateTime } from "luxon";
import { TRIP_TIMEZONE } from "./constants";

const dataDirectory = path.join(process.cwd(), "data");
const databasePath = path.join(dataDirectory, "choir-tour.db");

fs.mkdirSync(dataDirectory, { recursive: true });

const db = new Database(databasePath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS schedule_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    location TEXT NOT NULL,
    notes TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location_type TEXT NOT NULL,
    occupants TEXT NOT NULL,
    notes TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    phone TEXT DEFAULT '',
    email TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS concerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    start_time TEXT NOT NULL,
    venue TEXT NOT NULL,
    address TEXT DEFAULT '',
    meetup TEXT DEFAULT '',
    details TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS packing_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL,
    category TEXT NOT NULL,
    notes TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    translation TEXT DEFAULT '',
    context TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS places (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT DEFAULT '',
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    description TEXT DEFAULT '',
    map_link TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS useful_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT DEFAULT '',
    group_name TEXT DEFAULT ''
  );
`);

function tableIsEmpty(tableName) {
  const result = db.prepare(`SELECT COUNT(*) AS count FROM ${tableName}`).get();
  return result.count === 0;
}

function seedSchedule() {
  if (!tableIsEmpty("schedule_events")) {
    return;
  }

  const base = DateTime.now().setZone(TRIP_TIMEZONE).startOf("day").plus({ days: 1 });
  const events = [
    {
      title: "Coach departs",
      start_time: base.plus({ hours: 7, minutes: 30 }).toISO({ suppressSeconds: true, includeOffset: false }),
      end_time: base.plus({ hours: 9 }).toISO({ suppressSeconds: true, includeOffset: false }),
      location: "Choir rehearsal room",
      notes: "Bring passport and packed lunch.",
    },
    {
      title: "Ferry check-in",
      start_time: base.plus({ hours: 10, minutes: 15 }).toISO({ suppressSeconds: true, includeOffset: false }),
      end_time: base.plus({ hours: 11 }).toISO({ suppressSeconds: true, includeOffset: false }),
      location: "Viking Line terminal",
      notes: "Meet in front of the main entrance.",
    },
    {
      title: "Warm-up on board",
      start_time: base.plus({ hours: 14 }).toISO({ suppressSeconds: true, includeOffset: false }),
      end_time: base.plus({ hours: 15 }).toISO({ suppressSeconds: true, includeOffset: false }),
      location: "Deck conference room",
      notes: "Light rehearsal only.",
    },
    {
      title: "Hotel arrival",
      start_time: base.plus({ days: 1, hours: 9 }).toISO({ suppressSeconds: true, includeOffset: false }),
      end_time: base.plus({ days: 1, hours: 10 }).toISO({ suppressSeconds: true, includeOffset: false }),
      location: "Hotel lobby",
      notes: "Pick up room cards from the organisers.",
    },
    {
      title: "Evening concert",
      start_time: base.plus({ days: 1, hours: 18 }).toISO({ suppressSeconds: true, includeOffset: false }),
      end_time: base.plus({ days: 1, hours: 20 }).toISO({ suppressSeconds: true, includeOffset: false }),
      location: "St. John's Church",
      notes: "Concert blacks and tour scarf.",
    },
  ];

  const insert = db.prepare(`
    INSERT INTO schedule_events (title, start_time, end_time, location, notes)
    VALUES (@title, @start_time, @end_time, @location, @notes)
  `);

  const transaction = db.transaction((rows) => rows.forEach((row) => insert.run(row)));
  transaction(events);
}

function seedRooms() {
  if (!tableIsEmpty("rooms")) {
    return;
  }

  const rows = [
    {
      name: "Hotel 312",
      location_type: "Hotel",
      occupants: "Anna Lind\nJonas Berg\nMaja Solheim",
      notes: "Late-arrival key card at reception.",
    },
    {
      name: "Hotel 415",
      location_type: "Hotel",
      occupants: "Lina Nordin\nErik Sunde",
      notes: "",
    },
    {
      name: "Ferry B4-112",
      location_type: "Ferry",
      occupants: "Kari Olsen\nNils Holm\nSofia Berg",
      notes: "Upper bunks are assigned already.",
    },
  ];

  const insert = db.prepare(`
    INSERT INTO rooms (name, location_type, occupants, notes)
    VALUES (@name, @location_type, @occupants, @notes)
  `);

  const transaction = db.transaction((items) => items.forEach((item) => insert.run(item)));
  transaction(rows);
}

function seedContacts() {
  if (!tableIsEmpty("contacts")) {
    return;
  }

  const rows = [
    { name: "Maria Holst", role: "Tour lead", phone: "+47 900 00 111", email: "maria@example.com" },
    { name: "Elias Nord", role: "Transport", phone: "+47 900 00 222", email: "elias@example.com" },
    { name: "Sara Virtanen", role: "Concert coordinator", phone: "+358 40 555 0101", email: "sara@example.com" },
  ];

  const insert = db.prepare(`
    INSERT INTO contacts (name, role, phone, email)
    VALUES (@name, @role, @phone, @email)
  `);

  const transaction = db.transaction((items) => items.forEach((item) => insert.run(item)));
  transaction(rows);
}

function seedConcerts() {
  if (!tableIsEmpty("concerts")) {
    return;
  }

  const base = DateTime.now().setZone(TRIP_TIMEZONE).startOf("day").plus({ days: 2 });
  const rows = [
    {
      title: "Afternoon Plaza Pop-up",
      start_time: base.plus({ hours: 14 }).toISO({ suppressSeconds: true, includeOffset: false }),
      venue: "Market Square stage",
      address: "Kauppatori, Helsinki",
      meetup: base.plus({ hours: 13, minutes: 15 }).toISO({ suppressSeconds: true, includeOffset: false }),
      details: "Arrive in red tour jackets. No folders on stage.",
    },
    {
      title: "Main Evening Concert",
      start_time: base.plus({ hours: 19 }).toISO({ suppressSeconds: true, includeOffset: false }),
      venue: "Temppeliaukio Church",
      address: "Lutherinkatu 3, Helsinki",
      meetup: base.plus({ hours: 17, minutes: 45 }).toISO({ suppressSeconds: true, includeOffset: false }),
      details: "Soundcheck at 18:00. Black concert wear, water bottle backstage.",
    },
  ];

  const insert = db.prepare(`
    INSERT INTO concerts (title, start_time, venue, address, meetup, details)
    VALUES (@title, @start_time, @venue, @address, @meetup, @details)
  `);

  const transaction = db.transaction((items) => items.forEach((item) => insert.run(item)));
  transaction(rows);
}

function seedPacking() {
  if (!tableIsEmpty("packing_items")) {
    return;
  }

  const rows = [
    { label: "Passport / ID", category: "Essentials", notes: "Keep it in your hand luggage." },
    { label: "Concert outfit", category: "Concert", notes: "Pressed and ready to wear." },
    { label: "Black shoes", category: "Concert", notes: "" },
    { label: "Choir folder", category: "Music", notes: "Include updated running order." },
    { label: "Water bottle", category: "Personal", notes: "" },
    { label: "Phone charger", category: "Personal", notes: "" },
  ];

  const insert = db.prepare(`
    INSERT INTO packing_items (label, category, notes)
    VALUES (@label, @category, @notes)
  `);

  const transaction = db.transaction((items) => items.forEach((item) => insert.run(item)));
  transaction(rows);
}

function seedQuotes() {
  if (!tableIsEmpty("quotes")) {
    return;
  }

  const rows = [
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
      translation: "Let’s go together.",
      context: "A fitting choir motto for tour week.",
    },
  ];

  const insert = db.prepare(`
    INSERT INTO quotes (text, translation, context)
    VALUES (@text, @translation, @context)
  `);

  const transaction = db.transaction((items) => items.forEach((item) => insert.run(item)));
  transaction(rows);
}

function seedPlaces() {
  if (!tableIsEmpty("places")) {
    return;
  }

  const rows = [
    {
      name: "Hotel",
      address: "Mannerheimintie 10, Helsinki",
      latitude: 60.1704,
      longitude: 24.941,
      description: "Primary meeting point and luggage drop.",
      map_link: "https://maps.google.com/?q=60.1704,24.941",
    },
    {
      name: "Concert venue",
      address: "Lutherinkatu 3, Helsinki",
      latitude: 60.1739,
      longitude: 24.925,
      description: "Main performance venue.",
      map_link: "https://maps.google.com/?q=60.1739,24.925",
    },
    {
      name: "Ferry terminal",
      address: "Katajanokanlaituri 8, Helsinki",
      latitude: 60.1647,
      longitude: 24.9737,
      description: "Outbound and return crossing.",
      map_link: "https://maps.google.com/?q=60.1647,24.9737",
    },
  ];

  const insert = db.prepare(`
    INSERT INTO places (name, address, latitude, longitude, description, map_link)
    VALUES (@name, @address, @latitude, @longitude, @description, @map_link)
  `);

  const transaction = db.transaction((items) => items.forEach((item) => insert.run(item)));
  transaction(rows);
}

function seedLinks() {
  if (!tableIsEmpty("useful_links")) {
    return;
  }

  const rows = [
    {
      title: "Ferry booking",
      url: "https://www.vikingline.com",
      description: "Check cabin details and baggage rules.",
      group_name: "Travel",
    },
    {
      title: "Weather in Helsinki",
      url: "https://www.ilmatieteenlaitos.fi",
      description: "Useful before packing each morning.",
      group_name: "Practical",
    },
    {
      title: "Choir Google Drive",
      url: "https://drive.google.com",
      description: "Music PDFs and last-minute notes.",
      group_name: "Music",
    },
  ];

  const insert = db.prepare(`
    INSERT INTO useful_links (title, url, description, group_name)
    VALUES (@title, @url, @description, @group_name)
  `);

  const transaction = db.transaction((items) => items.forEach((item) => insert.run(item)));
  transaction(rows);
}

seedSchedule();
seedRooms();
seedContacts();
seedConcerts();
seedPacking();
seedQuotes();
seedPlaces();
seedLinks();

export { db };
