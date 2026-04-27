"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const adminTabs = [
  { value: "schedule", label: "Schema", href: "/accesstonepal/schedule" },
  { value: "participants", label: "Deltagare", href: "/accesstonepal/participants" },
  { value: "rooms", label: "Rum", href: "/accesstonepal/rooms" },
  { value: "packing", label: "Packning", href: "/accesstonepal/packing" },
  { value: "quotes", label: "Citat", href: "/accesstonepal/quotes" },
  { value: "places", label: "Platser", href: "/accesstonepal/places" },
  { value: "links", label: "Länkar", href: "/accesstonepal/links" },
  { value: "stays", label: "Boenden", href: "/accesstonepal/stays" },
] as const;

function getActiveTab(pathname: string) {
  const activeTab = adminTabs
    .filter((tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];

  return activeTab?.value;
}

export function AdminTabsNav() {
  const pathname = usePathname();

  return (
    <Tabs value={getActiveTab(pathname) ?? null}>
      <TabsList className="flex h-auto max-w-full flex-wrap justify-start gap-1">
        {adminTabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} asChild>
            <Link href={tab.href}>{tab.label}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
