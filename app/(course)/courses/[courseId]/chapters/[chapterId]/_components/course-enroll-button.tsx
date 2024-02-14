"use client";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

interface CouseEnrollButtonProps {
	price: number;
	courseId: string;
}

export const CouseEnrollButton = ({ price, courseId }: CouseEnrollButtonProps) => {
	return (
		<Button className="w-full md:w-auto" size={"sm"}>
			Enroll for {formatPrice(price)}
		</Button>
	);
};
