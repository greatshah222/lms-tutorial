"use client";

import { Chapter } from "@prisma/client";
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Grip, Pencil } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ChaptersListProps {
	onEdit: (id: string) => void;
	onReorder: (updateData: { id: string; position: number }[]) => void;
	items: Chapter[];
}
export const ChaptersList = ({ onEdit, onReorder, items }: ChaptersListProps) => {
	const [isMounted, setIsMounted] = useState(false);
	const [chapters, setChapters] = useState(items);

	useEffect(() => {
		setChapters(items);
	}, [items]);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const onDragEnd = (result: DropResult) => {
		if (!result.destination) return;
		const items = Array.from(chapters);
		const [reorderedItem] = items.splice(result.source.index, 1);
		items.splice(result.destination.index, 0, reorderedItem);

		const startIndex = Math.min(result.source.index, result.destination.index);
		const endIndex = Math.max(result.source.index, result.destination.index);
		const updatedChapters = items.slice(startIndex, endIndex + 1);
		setChapters(items);
		const bulkUpdateData = updatedChapters.map((chapter) => ({
			id: chapter.id,
			position: items.findIndex((el) => el.id === chapter.id),
		}));
		onReorder(bulkUpdateData);
	};

	if (!isMounted) return null;

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<Droppable droppableId="chapters">
				{(provided) => (
					<div {...provided.droppableProps} ref={provided.innerRef}>
						{chapters?.map((el, index) => (
							<Draggable key={el.id} draggableId={el.id} index={index}>
								{(provided) => (
									<div
										className={cn(
											"flex items-center gap-x-2 bg-slate-200 border-slate-200 border text-slate-700 rounded-md mb-4 text-sm",
											el.isPublished && "bg-sky-100 border-sky-200 text-sky-700"
										)}
										ref={provided.innerRef}
										{...provided.draggableProps}
									>
										<div
											className={cn(
												"px-2 py-3 border-r border-r-slate-200 hover:bg-slate-300 rounded-l-md transition",
												el.isPublished && "border-r-sky-200 hover:bg-sky-200"
											)}
											{...provided.dragHandleProps}
										>
											<Grip className="h-5 w-5" />
										</div>

										{el.title}

										<div className="ml-auto pr-2 flex items-center gap-x-2">
											{el.isFree && <Badge>Free</Badge>}
											<Badge className={cn("bg-slate-500", el.isPublished && "bg-slate-700")}>
												{el.isPublished ? "Published" : "Draft"}
											</Badge>

											<Pencil
												onClick={() => onEdit(el.id)}
												className="w-4 h-4 cursor-pointer hover:opacity-75 transition"
											/>
										</div>
									</div>
								)}
							</Draggable>
						))}
						{provided.placeholder}
					</div>
				)}
			</Droppable>
		</DragDropContext>
	);
};
