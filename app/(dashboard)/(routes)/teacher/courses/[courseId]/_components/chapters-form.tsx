"use client";

import * as z from "zod";
import axios from "axios";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Loader2, PlusCircle } from "lucide-react";
import { useState } from "react";

import { Form, FormControl, FormMessage, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Chapter, Course } from "@prisma/client";
import { ChaptersList } from "./chapters-list";

interface ChaptersFormProps {
	initialData: Course & {
		chapters: Chapter[];
	};
	courseId: string;
}

const formSchema = z.object({
	title: z.string().min(1),
});

export const ChaptersForm = ({ initialData, courseId }: ChaptersFormProps) => {
	const router = useRouter();
	const { toast } = useToast();

	const [isCreating, setIsCreating] = useState(false);

	const [isUpdating, setIsUpdating] = useState(false);

	const toggleCreating = () => setIsCreating((prev) => !prev);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: "", // NO NEED FOR INITIAL VALUES AS IT IS ALWAYS USED TO CREATE A NEW ONE
		},
	});

	const { isSubmitting, isValid } = form.formState;

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		console.log("values", values);
		try {
			const res = await axios.post(`/api/courses/${courseId}/chapters`, values);

			toast({
				title: "Chapter created",
			});

			toggleCreating();

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

	const onReorder = async (updateData: { id: string; position: number }[]) => {
		try {
			setIsUpdating(true);
			await axios.put(`/api/courses/${courseId}/chapters/reorder`, {
				list: updateData,
			});
			toast({
				title: "Chapters reordered",
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
			setIsUpdating(false);
		}
	};

	const onEdit = (id: string) => {
		router.push(`/teacher/courses/${courseId}/chapters/${id}`);
	};
	return (
		<div className="mt-6 bg-slate-100 rounded-md p-4 relative">
			{isUpdating && (
				<div className="absolute h-full w-full bg-slate-500/20 top-0 right-0 rounded-md flex items-center justify-center">
					<Loader2 className="animate-spin h-6 w-6 text-sky-700" />
				</div>
			)}
			<div className="font-medium flex items-center justify-between">
				Course chapters
				<Button variant={"ghost"} onClick={toggleCreating}>
					{isCreating ? (
						<>Cancel</>
					) : (
						<>
							<PlusCircle className="h-4 w-4 mr-2" />
							Add a chapter
						</>
					)}
				</Button>
			</div>

			{isCreating && (
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											disabled={isSubmitting}
											placeholder="eg. 'Introduction to the course'"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button disabled={!isValid || isSubmitting} type="submit">
							Create
						</Button>
					</form>
				</Form>
			)}

			{!isCreating && (
				<div
					className={cn("text-sm mt-2", !initialData?.chapters?.length && "text-slate-500 italic")}
				>
					{!initialData.chapters.length && "No chapters"}
					<ChaptersList onEdit={onEdit} onReorder={onReorder} items={initialData?.chapters || []} />
				</div>
			)}

			{!isCreating && (
				<p className="text-xs text-muted-foreground mt-4">Drag and drop to reorder the chapters</p>
			)}
		</div>
	);
};
