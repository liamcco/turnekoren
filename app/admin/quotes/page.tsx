import { getQuoteData } from "./actions";
import { QuoteEditor } from "./QuotesEditor";

export default async function AdminQuotesEditor() {
  const freshQuotes = await getQuoteData();

  return <QuoteEditor initialQuotes={freshQuotes} />;
}