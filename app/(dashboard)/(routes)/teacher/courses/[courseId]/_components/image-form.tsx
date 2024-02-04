"use client";

import * as z from "zod";
import axios from "axios";
import Image from "next/image";

import { useRouter } from "next/navigation";
import { ImageIcon, Pencil, PlusCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Course } from "@prisma/client";
import { FileUpload } from "@/components/file-upload";

interface ImageFormProps {
	initialData: Course;
	courseId: string;
}

const formSchema = z.object({
	imageUrl: z.string().min(1, {
		message: "Image is required",
	}),
});

export const ImageForm = ({ initialData, courseId }: ImageFormProps) => {
	const router = useRouter();
	const { toast } = useToast();

	const [isEditing, setIsEditing] = useState(false);

	const toggleEdit = () => setIsEditing((prev) => !prev);

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		console.log("values", values);
		try {
			const res = await axios.patch(`/api/courses/${courseId}`, values);

			toast({
				title: "Image updated",
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
				Course image
				<Button variant={"ghost"} onClick={toggleEdit}>
					{isEditing && <>Cancel</>}

					{!isEditing && !initialData?.imageUrl && (
						<>
							<PlusCircle className="h-4 w-4 mr-2" />
							Add an image
						</>
					)}
					{!isEditing && initialData?.imageUrl && (
						<>
							<Pencil className="h-4 w-4 mr-2" />
							Edit image
						</>
					)}
				</Button>
			</div>

			{!isEditing &&
				(!initialData?.imageUrl ? (
					<div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
						<ImageIcon className="w-10 h-10 text-slate-500" />
					</div>
				) : (
					<div className="relative aspect-video mt-2">
						<Image
							alt="upload"
							fill
							className="object-cover rounded-md"
							src={initialData?.imageUrl}
						/>
					</div>
				))}

			{isEditing && (
				<div>
					<FileUpload
						endpoint="courseImage"
						onChange={(url) => {
							if (url) {
								onSubmit({ imageUrl: url });
							}
						}}
					/>
					<div className="text-sm text-muted-foreground mt-4">16:9 aspect ratio recommended</div>
				</div>
			)}
		</div>
	);
};
