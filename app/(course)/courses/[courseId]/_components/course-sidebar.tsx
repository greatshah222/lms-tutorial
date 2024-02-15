import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { Chapter, Course, UserProgress } from "@prisma/client";
import { redirect } from "next/navigation";
import { CourseSidebarItem } from "./course-sidebar-item";
import { CourseProgress } from "@/components/course-progress";

interface CourseSidebarProps {
	course: Course & {
		chapters: (Chapter & {
			userProgress: UserProgress[] | null;
		})[];
	};

	progressCount: number;
}

export const CourseSidebar = async ({ course, progressCount }: CourseSidebarProps) => {
	const { userId } = auth();

	if (!userId) {
		return redirect("/");
	}

	const purchase = await db.purchase.findUnique({
		where: {
			// THIS IS BECAUSE OF UNIQUE COMBINATION IN
			userId_courseId: {
				userId,
				courseId: course.id,
			},
		},
	});
	return (
		<div className="h-full border-r flex flex-col overflow-y-auto shadow-sm">
			<div className="p-8 flex flex-col border-b">
				<h1 className="font-semibold">{course.title}</h1>

				{/* CHECK PURCHASE AND ADD PROGRESS */}

				{purchase && (
					<div className="mt-10">
						<CourseProgress variant="success" value={progressCount} />
					</div>
				)}
			</div>

			<div className="flex flex-col w-full">
				{course.chapters.map((el) => (
					<CourseSidebarItem
						key={el.id}
						label={el.title}
						id={el.id}
						isCompleted={!!el.userProgress?.[0]?.isCompleted}
						courseId={course?.id}
						isLocked={!el.isFree && !purchase}
					/>
				))}
			</div>
		</div>
	);
};
