"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const adminTabs = [
  { value: "schedule", label: "Schema", href: "/admin/schedule" },
  { value: "participants", label: "Deltagare", href: "/admin/participants" },
  { value: "rooms", label: "Rum", href: "/admin/rooms" },
  { value: "contacts", label: "Kontakter", href: "/admin/contacts" },
  { value: "packing", label: "Packning", href: "/admin/packing" },
  { value: "quotes", label: "Citat", href: "/admin/quotes" },
  { value: "places", label: "Platser", href: "/admin/places" },
  { value: "links", label: "Länkar", href: "/admin/links" },
  { value: "audio-tour", label: "Audio Tour", href: "/admin/audio-tour" },
  { value: "files", label: "Filer", href: "/admin/files" },
  { value: "stays", label: "Boenden", href: "/admin/stays" },
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
