"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const adminTabs = [
  { value: "schedule", label: "Schedule", href: "/accesstonepal/schedule" },
  { value: "participants", label: "Participants", href: "/accesstonepal/participants" },
  { value: "rooms", label: "Rooms", href: "/accesstonepal/rooms" },
  { value: "contacts", label: "Contacts", href: "/accesstonepal/contacts" },
  { value: "packing", label: "Packing", href: "/accesstonepal/packing" },
  { value: "quotes", label: "Quotes", href: "/accesstonepal/quotes" },
  { value: "places", label: "Places", href: "/accesstonepal/places" },
  { value: "links", label: "Links", href: "/accesstonepal/links" },
  { value: "stays", label: "Stays", href: "/accesstonepal/stays" },
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