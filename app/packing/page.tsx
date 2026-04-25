import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getPackingByCategory } from "@/app/packing/packing";

export default async function PackingPage() {
  const groups = await getPackingByCategory();

  if (Object.keys(groups).length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No packing items yet. Add them from the admin portal.</p>
    );
  }

  return (
      <div className="space-y-4">
        {Object.entries(groups).map(([category, items]) => (
          <Card key={category}>
            <CardHeader>
              <Badge className="w-fit rounded-full px-3 py-1 text-[10px] tracking-[0.24em] uppercase" variant="outline">
                {category}
              </Badge>
              <CardTitle>{category}</CardTitle>
              <CardDescription>Everything grouped under this category for a quick pre-trip check.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item, index) => (
                <div className="space-y-3" key={item.id}>
                  {index > 0 ? <Separator /> : null}
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-4 text-primary" />
                    <div className="space-y-1">
                      <p className="font-medium">{item.label}</p>
                      {item.notes ? <p className="text-sm text-muted-foreground">{item.notes}</p> : null}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
  );
}
