"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useConfettiStore } from "@/hooks/use-confetti-store";
import axios from "axios";
import { CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CourseProgressButtonProps {
	chapterId: string;
	courseId: string;
	isCompleted?: boolean;
	nextChapterId?: string;
}
export const CourseProgressButton = ({
	chapterId,
	courseId,
	isCompleted,
	nextChapterId,
}: CourseProgressButtonProps) => {
	const router = useRouter();
	const confetti = useConfettiStore();
	const [isLoading, setIsLoading] = useState(false);
	const { toast } = useToast();

	const onClick = async () => {
		try {
			setIsLoading(true);
			const res = await axios.put(`/api/courses/${courseId}/chapters/${chapterId}/progress`, {
				isCompleted: !isCompleted,
			});

			if (!isCompleted && !nextChapterId) {
				// this is last chapter and user has finished the course

				confetti.onOpen();
			}

			if (!isCompleted && nextChapterId) {
				router.push(`/courses/${courseId}/chapters/${nextChapterId}`);

				toast({
					title: "Progress updated",
				});
			}
			router.refresh();
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

	const Icon = isCompleted ? XCircle : CheckCircle;
	return (
		<Button
			type="button"
			variant={isCompleted ? "outline" : "success"}
			className="w-full md:w-auto"
			onClick={onClick}
			disabled={isLoading}
		>
			{isCompleted ? "Not completed" : "Mark as complete"}

			<Icon className="h-4 w-4 ml-2" />
		</Button>
	);
};
