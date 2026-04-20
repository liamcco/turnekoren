import { CurrencyPanel } from "@/components/currency-panel";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";

export default function CurrencyPage() {
  return (
    <main className="shell">
      <PageHeader
        description="A quick live conversion between euro and Swedish krona."
        title="Currency Exchange"
      />
      <CurrencyPanel />
    </main>
  );
}
