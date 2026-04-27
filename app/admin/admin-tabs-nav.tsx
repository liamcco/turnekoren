"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const adminTabs = [
  { value: "schedule", label: "Schedule", href: "/admin/schedule" },
  { value: "participants", label: "Participants", href: "/admin/participants" },
  { value: "rooms", label: "Rooms", href: "/admin/rooms" },
  { value: "contacts", label: "Contacts", href: "/admin/contacts" },
  { value: "packing", label: "Packing", href: "/admin/packing" },
  { value: "quotes", label: "Quotes", href: "/admin/quotes" },
  { value: "places", label: "Places", href: "/admin/places" },
  { value: "links", label: "Links", href: "/admin/links" },
  { value: "stays", label: "Stays", href: "/admin/stays" },
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