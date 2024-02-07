import { Category, Course } from "@prisma/client";

import { CourseCard } from "@/components/course-card";

type CourseWithProgressWithCategory = Course & {
	category: Category | null;
	chapters: { id: string }[];
	progress: number | null;
};

interface CoursesListProps {
	items: CourseWithProgressWithCategory[];
}

export const CoursesList = ({ items }: CoursesListProps) => {
	console.log("items", items);
	return (
		<div>
			<div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
				{items?.map((el) => (
					<CourseCard
						key={el.id}
						id={el.id}
						title={el.title}
						imageUrl={el.imageUrl!} // we will have imageURL for published course
						chaptersLength={el.chapters.length}
						price={el.price!}
						category={el.category?.name!}
						progress={el.progress}
					/>
				))}
			</div>

			{items?.length === 0 && (
				<div className="text-muted-foreground text-sm text-center mt-10">No courses found</div>
			)}
		</div>
	);
};
