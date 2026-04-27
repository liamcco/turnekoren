import { CurrencyPanel } from "@/components/currency-panel";
import { PageHeader } from "@/components/page-header";
import { getExchangeRate } from "@/app/currency/exchange";

export default async function CurrencyPage() {
  const data = await getExchangeRate();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <PageHeader
        description="Snabb aktuell omräkning mellan euro och svenska kronor."
        title="Valutaväxling"
      />
      <CurrencyPanel data={data} />
    </main>
  );
}
