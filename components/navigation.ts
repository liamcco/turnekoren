import type { LucideIcon } from 'lucide-react'
import {
	Backpack,
	CalendarDays,
	Coins,
	File,
	Hotel,
	Link,
	MessageSquareQuote,
} from 'lucide-react'

export interface MenuItem {
	href: string
	title: string
	description: string
	icon: LucideIcon
}

export const MENU_ITEMS: MenuItem[] = [
	{
		href: '/currency',
		title: 'Currency',
		description:
			'Live EUR till SEK omvandlare och valutakurser',
		icon: Coins,
	},
	{
		href: '/rooms',
		title: 'Rumsfördelning',
		description:
			'Rumsfördelning för alla deltagare på resan',
		icon: Hotel,
	},
	{
		href: '/quote',
		title: 'Finska citat',
		description:
			'Inspirerande citat på finska att ha med sig på resan',
		icon: MessageSquareQuote,
	},
	{
		href: '/files/turnehafte.pdf',
		title: 'Turnehäftet',
		description:
			'All information about the tour in one PDF',
		icon: File,
	},
	{
		href: '/packing',
		title: 'Packing',
		description:
			'Vad du bör packa med dig på resan',
		icon: Backpack,
	},
	{
		href: '/links',
		title: 'Användbart',
		description:
			'Användbara länkar för resan',
		icon: Link,
	},
	{
		href: '/schedule',
		title: 'Schema',
		description:
			'Se resans schema dag för dag',
		icon: CalendarDays,
	},
]
