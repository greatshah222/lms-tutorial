"use client";

import * as z from "zod";
import axios from "axios";
import Image from "next/image";

import { useRouter } from "next/navigation";
import { File, ImageIcon, Loader2, PlusCircle, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Attachment, Course } from "@prisma/client";
import { FileUpload } from "@/components/file-upload";

interface AttachmentFormProps {
	initialData: Course & {
		attachments: Attachment[];
	};
	courseId: string;
}

const formSchema = z.object({
	url: z.string().min(1),
});

export const AttachmentForm = ({ initialData, courseId }: AttachmentFormProps) => {
	const router = useRouter();
	const { toast } = useToast();

	const [isEditing, setIsEditing] = useState(false);

	const [deletingId, setDeletingId] = useState<string | null>(null);

	const toggleEdit = () => setIsEditing((prev) => !prev);

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		console.log("values", values);
		try {
			const res = await axios.post(`/api/courses/${courseId}/attachments`, values);

			toast({
				title: "Attachment updated",
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

	const onDelete = async (id: string) => {
		try {
			setDeletingId(id);

			await axios.delete(`/api/courses/${courseId}/attachments/${id}`);
			toast({
				title: "Attachment deleted",
			});
			router.refresh();
		} catch (error) {
			console.log("Something went wrong");
			toast({
				title: "Uh oh! Something went wrong.",
				description: "There was a problem with your request.",
				variant: "destructive",
			});
		} finally {
			setDeletingId(null);
		}
	};
	return (
		<div className="mt-6 bg-slate-100 rounded-md p-4">
			<div className="font-medium flex items-center justify-between">
				Course attachments
				<Button variant={"ghost"} onClick={toggleEdit}>
					{isEditing ? (
						<>Cancel</>
					) : (
						<>
							<PlusCircle className="h-4 w-4 mr-2" />
							Add a file
						</>
					)}
				</Button>
			</div>

			{!isEditing && (
				<>
					{initialData?.attachments?.length === 0 && (
						<p className="text-sm mt-2 text-slate-500 italic">No attachments yet</p>
					)}

					{initialData?.attachments?.length > 0 && (
						<div className="space-y-2">
							{initialData?.attachments?.map((el) => (
								<div
									key={el.id}
									className="flex items-center p-3 w-full bg-sky-100 border-sky-200 border text-sky-700 rounded-md"
								>
									<File className="h-4 w-4 mr-2 flex-shrink-0" />
									<p className="text-xs  line-clamp-1">{el.name}</p>

									{deletingId === el.id ? (
										<div className="ml-auto">
											<Loader2 className="h-4 w-4 animate-spin" />
										</div>
									) : (
										<button
											className="ml-auto hover:opacity-75 transition"
											onClick={() => onDelete(el.id)}
										>
											<X className="h-4 w-4" />
										</button>
									)}
								</div>
							))}
						</div>
					)}
				</>
			)}

			{isEditing && (
				<div>
					<FileUpload
						endpoint="courseAttachment"
						onChange={(url) => {
							if (url) {
								onSubmit({ url: url });
							}
						}}
					/>
					<div className="text-sm text-muted-foreground mt-4">
						Add anything your student might need to complete the course.
					</div>
				</div>
			)}
		</div>
	);
};
