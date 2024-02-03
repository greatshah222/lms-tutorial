"use client";

import * as z from "zod";
import axios from "axios";
import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import {
	Form,
	FormLabel,
	FormControl,
	FormDescription,
	FormMessage,
	FormField,
	FormItem,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
	title: z.string().min(1, {
		message: "Title is required",
	}),
});

const CreatePage = () => {
	const router = useRouter();
	const { toast } = useToast();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: "",
		},
	});

	const { isSubmitting, isValid } = form.formState;

	const onSumbit = async (values: z.infer<typeof formSchema>) => {
		console.log("values", values);

		try {
			const res = await axios.post("/api/course", values);
			router.push(`/teacher/courses/${res?.data?.id}`);
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
		<div className="max-w-5xl mx-auto flex md:items-center md:justify-center h-full p-6">
			<div>
				<h1 className="text-2xl">Name your course</h1>
				<p className="text-sm text-slate-600">
					What would you like to name your course? Don&apos;t worry, you can change this later
				</p>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSumbit)} className="space-y-8 mt-8">
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Course title</FormLabel>

									<FormControl>
										<Input
											disabled={isSubmitting}
											placeholder="e.g. 'Advanced web development"
											{...field}
										/>
									</FormControl>
									<FormDescription>What will you teach in this course?</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="flex items-center gap-x-2">
							<Link href={"/"}>
								<Button variant={"ghost"} type="button">
									Cancel
								</Button>
							</Link>

							<Button type="submit" disabled={!isValid || isSubmitting}>
								Continue
							</Button>
						</div>
					</form>
				</Form>
			</div>
		</div>
	);
};

export default CreatePage;
