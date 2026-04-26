import { getDailyQuote } from "@/app/quote/quote";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator"

export default async function QuotePage() {
  const quote = await getDailyQuote();

  if (!quote) {
    return <p className="text-sm text-muted-foreground">No daily quote available.</p>
  }

  return (
      <Card className="overflow-hidden border-none bg-linear-to-br from-card to-accent/50 shadow-md">
          <CardHeader>
            <Badge className="w-fit px-3 py-1 text-[10px] tracking-[0.24em] uppercase">
              Today&apos;s line
            </Badge>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              Finnish phrase of the day
            </CardTitle>
            <CardDescription>One small line for the road, rehearsal room, or ferry queue.</CardDescription>
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
