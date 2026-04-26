import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ExchangeRatePayload } from "@/app/currency/exchange";

const sekFormatter = new Intl.NumberFormat("sv-SE", {
  style: "currency",
  currency: "SEK",
  maximumFractionDigits: 2,
});

const euroFormatter = new Intl.NumberFormat("fi-FI", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

interface CurrencyPanelProps {
  data: ExchangeRatePayload | null;
  error?: string;
}

export function CurrencyPanel({ data, error = "" }: CurrencyPanelProps) {
  if (error || !data) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Unable to load exchange rate</AlertTitle>
        <AlertDescription>{error || "The exchange service did not return data."}</AlertDescription>
      </Alert>
    );
  }

  const examples = [10, 25, 50, 100];

  return (
    <section className="space-y-4">
      <Card className="border-none bg-primary text-primary-foreground shadow-lg">
        <CardHeader>
          <Badge className="w-fit bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/20">
            Live rate
          </Badge>
          <CardTitle className="text-3xl md:text-4xl">
            1 {data.base} = {sekFormatter.format(data.rate)}
          </CardTitle>
          <CardDescription className="text-primary-foreground/80">
            {data.source} published this rate for {data.updatedAt}.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>EUR to SEK</CardTitle>
            <CardDescription>Common amounts singers might convert on tour.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>EUR</TableHead>
                  <TableHead className="text-right">SEK</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {examples.map((amount) => (
                  <TableRow key={amount}>
                    <TableCell>{euroFormatter.format(amount)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {sekFormatter.format(amount * data.rate)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEK to EUR</CardTitle>
            <CardDescription>Reverse checks for menus, taxis, and tills.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SEK</TableHead>
                  <TableHead className="text-right">EUR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {examples.map((amount) => (
                  <TableRow key={`sek-${amount * 10}`}>
                    <TableCell>{sekFormatter.format(amount * 10)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {euroFormatter.format(amount * 10 * data.inverse)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
