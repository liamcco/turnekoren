import { getDailyQuote } from "@/app/quote/quote";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator"

export default async function QuotePage() {
  const quote = await getDailyQuote();

  if (!quote) {
    return <p className="text-sm text-muted-foreground">Inget dagens citat finns tillgängligt.</p>
  }

  return (
      <Card className="overflow-hidden border-none bg-linear-to-br from-card to-accent/50 shadow-md">
          <CardHeader>
            <Badge className="w-fit rounded-full px-3 py-1 text-[10px] tracking-[0.24em] uppercase">
              Dagens rad
            </Badge>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              Dagens finska fras
            </CardTitle>
            <CardDescription>En liten rad för vägen, repetitionsrummet eller färjekön.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <blockquote className="font-serif text-4xl leading-tight md:text-5xl">{quote.text}</blockquote>
            {quote.translation || quote.context ? <Separator /> : null}
            {quote.translation ? <p className="text-lg text-muted-foreground">{quote.translation}</p> : null}
            {quote.context ? <p className="text-sm text-muted-foreground">{quote.context}</p> : null}
          </CardContent>
    </Card>
    )
}
