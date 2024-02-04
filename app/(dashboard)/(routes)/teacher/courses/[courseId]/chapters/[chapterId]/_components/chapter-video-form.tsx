"use client";

import * as z from "zod";
import axios from "axios";
import MuxPlayer from "@mux/mux-player-react";

import { useRouter } from "next/navigation";
import { Pencil, PlusCircle, VideoIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Chapter, MuxData } from "@prisma/client";
import { FileUpload } from "@/components/file-upload";

interface ChapterVideoFormProps {
	initialData: Chapter & {
		muxData?: MuxData | null;
	};
	courseId: string;
	chapterId: string;
}

const formSchema = z.object({
	videoUrl: z.string().min(1),
});

export const ChapterVideoForm = ({ initialData, courseId, chapterId }: ChapterVideoFormProps) => {
	const router = useRouter();
	const { toast } = useToast();

	const [isEditing, setIsEditing] = useState(false);

	const toggleEdit = () => setIsEditing((prev) => !prev);

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		console.log("values", values);
		try {
			const res = await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}`, values);

			toast({
				title: "Chapter updated",
			});

			toggleEdit();

			router.refresh();
		} catch (error) {
			console.log("Something went wrong");
			toast({
				title: "Uh oh! Something went wrong.",
				description: "There was a problem with your request.",
				variant: "destructive",
			});
		}
	};
	return (
		<div className="mt-6 bg-slate-100 rounded-md p-4">
			<div className="font-medium flex items-center justify-between">
				Chapter video
				<Button variant={"ghost"} onClick={toggleEdit}>
					{isEditing && <>Cancel</>}

					{!isEditing && !initialData?.videoUrl && (
						<>
							<PlusCircle className="h-4 w-4 mr-2" />
							Add an video
						</>
					)}
					{!isEditing && initialData?.videoUrl && (
						<>
							<Pencil className="h-4 w-4 mr-2" />
							Edit video
						</>
					)}
				</Button>
			</div>

			{!isEditing &&
				(!initialData?.videoUrl ? (
					<div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
						<VideoIcon className="w-10 h-10 text-slate-500" />
					</div>
				) : (
					<div className="relative aspect-video mt-2">
						<MuxPlayer playbackId={initialData?.muxData?.playbackId || ""} />
					</div>
				))}

			{isEditing && (
				<div>
					<FileUpload
						endpoint="chapterVideo"
						onChange={(url) => {
							if (url) {
								onSubmit({ videoUrl: url });
							}
						}}
					/>
					<div className="text-sm text-muted-foreground mt-4">Upload this chapter&apos;s video</div>
				</div>
			)}

			{initialData?.videoUrl && !isEditing && (
				<div className="text-sm text-muted-foreground mt-2">
					Videos can take a few minutes to process.Refreh the page if video does not process
				</div>
			)}
		</div>
	);
};
