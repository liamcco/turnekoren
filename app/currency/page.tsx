import { CurrencyPanel } from "@/components/currency-panel";
import { PageHeader } from "@/components/page-header";
import { getExchangeRate } from "@/app/currency/exchange";

export default async function CurrencyPage() {
  const data = await getExchangeRate();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <PageHeader
        description="A quick live conversion between euro and Swedish krona."
        title="Currency Exchange"
      />
      <CurrencyPanel data={data} />
    </main>
  );
}
