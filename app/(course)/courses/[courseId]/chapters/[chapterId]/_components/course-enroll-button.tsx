"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { formatPrice } from "@/lib/format";
import axios from "axios";
import { useState } from "react";

interface CouseEnrollButtonProps {
	price: number;
	courseId: string;
}

export const CouseEnrollButton = ({ price, courseId }: CouseEnrollButtonProps) => {
	const { toast } = useToast();

	const [isLoading, setIsLoading] = useState(false);

	const onClick = async () => {
		try {
			setIsLoading(true);
			const res = await axios.post(`/api/courses/${courseId}/checkout`);

			window.location.assign(res?.data?.url);
		} catch (error) {
			toast({
				title: "Uh oh! Something went wrong.",
				description: "There was a problem with your request.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};
	return (
		<Button className="w-full md:w-auto" size={"sm"} onClick={onClick} disabled={isLoading}>
			Enroll for {formatPrice(price)}
		</Button>
	);
};
