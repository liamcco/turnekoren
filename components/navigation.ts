import type { LucideIcon } from "lucide-react";
import {
  Backpack,
  CalendarDays,
  Coins,
  ContactRound,
  Headphones,
  Hotel,
  Link,
  MessageSquareQuote
} from "lucide-react";

export interface MenuItem {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const MENU_ITEMS: MenuItem[] = [
  {
    href: "/currency",
    title: "Currency",
    description: "Live EUR to SEK exchange",
    icon: Coins,
  },
  {
    href: "/rooms",
    title: "Rooms",
    description: "Rooming list for all travel legs",
    icon: Hotel,
  },
  {
    href: "/quote",
    title: "Finnish Quote",
    description: "One daily phrase for the tour",
    icon: MessageSquareQuote,
  },
/*   {
    href: "/contacts",
    title: "Contacts",
    description: "Organising group details",
    icon: ContactRound,
  }, */
  {
    href: "/packing",
    title: "Packing",
    description: "What to bring before you leave",
    icon: Backpack,
  },
  {
    href: "/links",
    title: "Användbart",
    description: "Användbara länkar för resan",
    icon: Link,
  },
  {
    href: "/audio-tour",
    title: "Audio Tour",
    description: "Listen to shared tour clips",
    icon: Headphones,
  },
  {
    href: "/schedule",
    title: "Schedule",
    description: "View the trip schedule day by day",
    icon: CalendarDays
  }
];
