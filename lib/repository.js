import { DateTime } from "luxon";
import { db } from "./db";
import { TRIP_TIMEZONE } from "./constants";

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanOptionalString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function requireString(value, fieldName) {
  const text = cleanString(value);
  if (!text) {
    throw new Error(`${fieldName} is required.`);
  }
  return text;
}

function requireIsoDateTime(value, fieldName) {
  const text = requireString(value, fieldName);
  const parsed = DateTime.fromISO(text, { zone: TRIP_TIMEZONE });
  if (!parsed.isValid) {
    throw new Error(`${fieldName} must be a valid date and time.`);
  }
  return parsed.toISO({ suppressSeconds: true, includeOffset: false });
}

function requireLatitude(value) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    throw new Error("Latitude must be a valid number.");
  }
  return numberValue;
}

function requireLongitude(value) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    throw new Error("Longitude must be a valid number.");
  }
  return numberValue;
}

const collectionConfigs = {
  schedule: {
    table: "schedule_events",
    orderBy: "start_time ASC",
    columns: ["title", "start_time", "end_time", "location", "notes"],
    select: "SELECT id, title, start_time AS startTime, end_time AS endTime, location, notes FROM schedule_events ORDER BY start_time ASC",
    sanitize(item) {
      const startTime = requireIsoDateTime(item.startTime, "Start time");
      const endTime = requireIsoDateTime(item.endTime, "End time");
      if (
        DateTime.fromISO(endTime, { zone: TRIP_TIMEZONE }).toMillis() <=
        DateTime.fromISO(startTime, { zone: TRIP_TIMEZONE }).toMillis()
      ) {
        throw new Error("End time must be after start time.");
      }
      return {
        title: requireString(item.title, "Title"),
        start_time: startTime,
        end_time: endTime,
        location: requireString(item.location, "Location"),
        notes: cleanOptionalString(item.notes),
      };
    },
  },
  rooms: {
    table: "rooms",
    orderBy: "location_type ASC, name ASC",
    columns: ["name", "location_type", "occupants", "notes"],
    select: "SELECT id, name, location_type AS locationType, occupants, notes FROM rooms ORDER BY location_type ASC, name ASC",
    sanitize(item) {
      return {
        name: requireString(item.name, "Room name"),
        location_type: requireString(item.locationType, "Location type"),
        occupants: requireString(item.occupants, "Occupants"),
        notes: cleanOptionalString(item.notes),
      };
    },
  },
  contacts: {
    table: "contacts",
    orderBy: "role ASC, name ASC",
    columns: ["name", "role", "phone", "email"],
    select: "SELECT id, name, role, phone, email FROM contacts ORDER BY role ASC, name ASC",
    sanitize(item) {
      return {
        name: requireString(item.name, "Name"),
        role: requireString(item.role, "Role"),
        phone: cleanOptionalString(item.phone),
        email: cleanOptionalString(item.email),
      };
    },
  },
  concerts: {
    table: "concerts",
    orderBy: "start_time ASC",
    columns: ["title", "start_time", "venue", "address", "meetup", "details"],
    select:
      "SELECT id, title, start_time AS startTime, venue, address, meetup, details FROM concerts ORDER BY start_time ASC",
    sanitize(item) {
      return {
        title: requireString(item.title, "Title"),
        start_time: requireIsoDateTime(item.startTime, "Concert time"),
        venue: requireString(item.venue, "Venue"),
        address: cleanOptionalString(item.address),
        meetup: cleanOptionalString(item.meetup)
          ? requireIsoDateTime(item.meetup, "Meetup time")
          : "",
        details: cleanOptionalString(item.details),
      };
    },
  },
  packing: {
    table: "packing_items",
    orderBy: "category ASC, label ASC",
    columns: ["label", "category", "notes"],
    select: "SELECT id, label, category, notes FROM packing_items ORDER BY category ASC, label ASC",
    sanitize(item) {
      return {
        label: requireString(item.label, "Item"),
        category: requireString(item.category, "Category"),
        notes: cleanOptionalString(item.notes),
      };
    },
  },
  quotes: {
    table: "quotes",
    orderBy: "id ASC",
    columns: ["text", "translation", "context"],
    select: "SELECT id, text, translation, context FROM quotes ORDER BY id ASC",
    sanitize(item) {
      return {
        text: requireString(item.text, "Quote"),
        translation: cleanOptionalString(item.translation),
        context: cleanOptionalString(item.context),
      };
    },
  },
  places: {
    table: "places",
    orderBy: "name ASC",
    columns: ["name", "address", "latitude", "longitude", "description", "map_link"],
    select:
      "SELECT id, name, address, latitude, longitude, description, map_link AS mapLink FROM places ORDER BY name ASC",
    sanitize(item) {
      return {
        name: requireString(item.name, "Place name"),
        address: cleanOptionalString(item.address),
        latitude: requireLatitude(item.latitude),
        longitude: requireLongitude(item.longitude),
        description: cleanOptionalString(item.description),
        map_link: cleanOptionalString(item.mapLink),
      };
    },
  },
  links: {
    table: "useful_links",
    orderBy: "group_name ASC, title ASC",
    columns: ["title", "url", "description", "group_name"],
    select:
      "SELECT id, title, url, description, group_name AS groupName FROM useful_links ORDER BY group_name ASC, title ASC",
    sanitize(item) {
      return {
        title: requireString(item.title, "Title"),
        url: requireString(item.url, "URL"),
        description: cleanOptionalString(item.description),
        group_name: cleanOptionalString(item.groupName),
      };
    },
  },
};

export function listRows(collectionKey) {
  const config = collectionConfigs[collectionKey];
  if (!config) {
    throw new Error(`Unknown collection: ${collectionKey}`);
  }

  return db.prepare(config.select).all();
}

export function replaceRows(collectionKey, items) {
  const config = collectionConfigs[collectionKey];
  if (!config) {
    throw new Error(`Unknown collection: ${collectionKey}`);
  }
  if (!Array.isArray(items)) {
    throw new Error("Payload must contain an items array.");
  }

  const sanitizedItems = items
    .filter((item) => {
      if (!item || typeof item !== "object") {
        return false;
      }
      return Object.values(item).some((value) => cleanOptionalString(String(value ?? "")));
    })
    .map((item) => config.sanitize(item));

  const placeholders = config.columns.map((column) => `@${column}`).join(", ");
  const insert = db.prepare(
    `INSERT INTO ${config.table} (${config.columns.join(", ")}) VALUES (${placeholders})`,
  );
  const removeAll = db.prepare(`DELETE FROM ${config.table}`);

  const transaction = db.transaction((rows) => {
    removeAll.run();
    rows.forEach((row) => insert.run(row));
  });

  transaction(sanitizedItems);
  return listRows(collectionKey);
}

export function getScheduleSnapshot() {
  const events = listRows("schedule").map((event) => ({
    ...event,
    start: DateTime.fromISO(event.startTime, { zone: TRIP_TIMEZONE }),
    end: DateTime.fromISO(event.endTime, { zone: TRIP_TIMEZONE }),
  }));

  const now = DateTime.now().setZone(TRIP_TIMEZONE);
  const currentEvent = events.find((event) => event.start <= now && event.end > now) ?? null;
  const nextEvent = events.find((event) => event.start > now) ?? null;
  const todayEvents = events.filter((event) => event.start.hasSame(now, "day"));

  return {
    now,
    currentEvent,
    nextEvent,
    todayEvents,
    upcomingEvents: events.filter((event) => event.end > now).slice(0, 5),
  };
}

export function getRoomsByLocation() {
  const rows = listRows("rooms");
  return rows.reduce((groups, room) => {
    const key = room.locationType;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push({
      ...room,
      occupantsList: room.occupants
        .split("\n")
        .map((occupant) => occupant.trim())
        .filter(Boolean),
    });
    return groups;
  }, {});
}

export function getConcerts() {
  return listRows("concerts");
}

export function getPackingByCategory() {
  const rows = listRows("packing");
  return rows.reduce((groups, item) => {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
    return groups;
  }, {});
}

export function getDailyQuote() {
  const quotes = listRows("quotes");
  if (quotes.length === 0) {
    return null;
  }

  const today = DateTime.now().setZone(TRIP_TIMEZONE);
  const index = (today.ordinal + today.year) % quotes.length;
  return quotes[index];
}

export function getMapData() {
  return {
    places: listRows("places"),
    links: listRows("links"),
  };
}

export function getAdminData() {
  return {
    schedule: listRows("schedule"),
    rooms: listRows("rooms"),
    contacts: listRows("contacts"),
    concerts: listRows("concerts"),
    packing: listRows("packing"),
    quotes: listRows("quotes"),
    places: listRows("places"),
    links: listRows("links"),
  };
}
