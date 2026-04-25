import { CheckCircle2 } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getLinksAndPlaces } from "./links";

export default async function PackingPage() {
  const { links, places } = await getLinksAndPlaces();

  return (
    <div className="grid gap-6">
      <section className="grid gap-4">

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-full"
            >
              <Card className="h-full transition hover:bg-muted">
                <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                  <div className="min-w-0 space-y-1">
                    <CardTitle className="text-base">{link.title}</CardTitle>
                    {link.description ? (
                      <CardDescription className="line-clamp-3">
                        {link.description}
                      </CardDescription>
                    ) : null}
                  </div>
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                </CardHeader>
              </Card>
            </a>
          ))}
        </div>
      </section>

      {places.length > 0 ? (
        <section className="grid gap-4">
          <Separator />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {places.map((place) => (
              <a
                key={place.id}
                href={place.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full"
              >
                <Card className="h-full transition hover:bg-muted">
                  <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                    <div className="min-w-0 space-y-1">
                      <CardTitle className="text-base">{place.name}</CardTitle>
                      {place.address ? (
                        <CardDescription>{place.address}</CardDescription>
                      ) : null}
                      {place.description ? (
                        <p className="line-clamp-3 text-sm text-muted-foreground">
                          {place.description}
                        </p>
                      ) : null}
                    </div>
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                  </CardHeader>
                </Card>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );

}
