import { Rest } from "ably";

let ablyRest: Rest | null = null;

export function getAblyRest() {
  // Required in Vercel: ABLY_API_KEY. Browser clients receive scoped tokens only.
  const key = process.env.ABLY_API_KEY;

  if (!key) {
    throw new Error("ABLY_API_KEY must be set for audio tour realtime events.");
  }

  ablyRest ??= new Rest({ key });
  return ablyRest;
}
