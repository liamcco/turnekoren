import { EXCHANGE_SOURCE_URL } from "@/lib/constants";

export interface ExchangeRatePayload {
  base: string;
  quote: string;
  rate: number;
  inverse: number;
  updatedAt: string;
  source: string;
}

interface ExchangeResponsePayload {
  rates?: {
    SEK?: number;
  };
  date?: string;
}

export async function getExchangeRate(): Promise<ExchangeRatePayload> {
  const response = await fetch(EXCHANGE_SOURCE_URL, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Exchange provider request failed.");
  }

  const payload = (await response.json()) as ExchangeResponsePayload;
  const rate = payload?.rates?.SEK;

  if (!rate) {
    throw new Error("Exchange provider did not return EUR/SEK.");
  }

  return {
    base: "EUR",
    quote: "SEK",
    rate,
    inverse: 1 / rate,
    updatedAt: payload.date ?? "",
    source: "Frankfurter",
  };
}
