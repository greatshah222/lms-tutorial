"use client";
import React, { useState } from "react";
import { Trash } from "lucide-react";
import axios from "axios";

import { ConfirmModal } from "@/components/modals/confirm-modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface ChapterActionsProps {
	disabled: boolean;
	courseId: string;
	chapterId: string;
	isPublished: boolean;
}

export const ChapterActions = ({
	disabled,
	courseId,
	chapterId,
	isPublished,
}: ChapterActionsProps) => {
	const { toast } = useToast();
	const router = useRouter();

	const [isLoading, setIsLoading] = useState(false);

	const onClick = async () => {
		try {
			setIsLoading(true);

			if (isPublished) {
				await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}/unpublish`);
				toast({
					title: "Chapter unpublished",
				});
			} else {
				await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}/publish`);
				toast({
					title: "Chapter published",
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

	const onDelete = async () => {
		try {
			setIsLoading(true);
			await axios.delete(`/api/courses/${courseId}/chapters/${chapterId}`);
			toast({
				title: "Chapter deleted",
			});
			router.refresh();
			router.push(`/teacher/courses/${courseId}`);
		} catch (error) {
			console.log("Something went wrong");
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
		<div className="flex items-center gap-x-2">
			<Button onClick={onClick} variant={"outline"} size={"sm"} disabled={disabled || isLoading}>
				{isPublished ? "Unpublish" : "Publish"}
			</Button>

			<ConfirmModal onConfirm={onDelete}>
				<Button size={"sm"} disabled={isLoading}>
					<Trash className="w-4 h-4" />
				</Button>
			</ConfirmModal>
		</div>
	);
};
