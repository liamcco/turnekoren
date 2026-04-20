import { EXCHANGE_SOURCE_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await fetch(EXCHANGE_SOURCE_URL, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Exchange provider request failed.");
    }

    const payload = await response.json();
    const rate = payload?.rates?.SEK;

    if (!rate) {
      throw new Error("Exchange provider did not return EUR/SEK.");
    }

    return Response.json(
      {
        base: "EUR",
        quote: "SEK",
        rate,
        inverse: 1 / rate,
        updatedAt: payload.date,
        source: "Frankfurter",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unable to load exchange rate.",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
