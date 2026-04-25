import { CheckCircle2 } from "lucide-react";
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
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Packlista</h1>
        <p className="text-sm text-muted-foreground">
          Bocka av sakerna medan du packar. Valen sparas så länge sidan är öppen.
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries(groups).map(([category, items]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{category}</CardTitle>
              <CardDescription>
                {items.length === 1 ? "1 sak att packa" : `${items.length} saker att packa`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item, index) => {
                const inputId = `packing-item-${item.id}`;

                return (
                  <div className="space-y-3" key={item.id}>
                    {index > 0 ? <Separator /> : null}
                    <label
                      htmlFor={inputId}
                      className="group flex cursor-pointer items-start gap-3 rounded-md p-2 transition hover:bg-muted"
                    >
                      <input
                        id={inputId}
                        type="checkbox"
                        className="peer sr-only"
                      />

                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border text-transparent transition peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground">
                        <CheckCircle2 className="size-4" />
                      </span>

                      <span className="min-w-0 space-y-1">
                        <span className="block font-medium transition peer-checked:text-muted-foreground peer-checked:line-through">
                          {item.label}
                        </span>
                        {item.notes ? (
                          <span className="block text-sm text-muted-foreground transition peer-checked:line-through">
                            {item.notes}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
