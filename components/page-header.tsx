import Link from "next/link";
import { HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface PageHeaderProps {
  title: string;
  description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <Button asChild className="h-auto px-0 text-muted-foreground" size="sm" variant="ghost">
            <Link href="/">
              <HomeIcon className="size-4" />
              Hem
            </Link>
          </Button>
          <div className="space-y-2">
            <h1 className="font-serif text-4xl tracking-tight md:text-5xl">{title}</h1>
            <p className="max-w-2xl text-sm text-muted-foreground md:text-base">{description}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
        </div>
      </div>
      <Separator />
    </header>
  );
}
