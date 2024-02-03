"use client";

import { Compass, Layout } from "lucide-react";
import { SidebarItem } from "./sidebar-item";

const guestRoutes = [
	{
		icon: Layout,
		label: "Dashboard",
		href: "/",
	},
	{
		icon: Compass,
		label: "Browse",
		href: "/search",
	},
];

export const SidebarRoutes = () => {
	const routes = guestRoutes;
	return (
		<div className="flex flex-col w-full">
			{routes?.map((el) => (
				<SidebarItem key={el.href} label={el?.label} icon={el?.icon} href={el?.href} />
			))}
		</div>
	);
};
