import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PATCH(
	req: Request,
	{ params }: { params: { courseId: string; chapterId: string } }
) {
	try {
		const { userId } = auth();
		const { courseId, chapterId } = params;

		if (!userId) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		const courseOwner = await db.course.findUnique({
			where: {
				id: courseId,
				userId,
			},
		});

		if (!courseOwner) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		const unPublishedChapter = await db.chapter.update({
			where: {
				id: chapterId,
				courseId,
			},
			data: {
				isPublished: false,
			},
		});

		// IF THIS IS THE ONLY CHAPTER AND WE ARE UNPUBLISHING IT - WE ALSO HAVE TO UNPUBLISH THE WHOLE COURSE

		const publishedChapterInCourse = await db.chapter.findMany({
			where: {
				courseId,
				isPublished: true,
			},
		});

		if (!publishedChapterInCourse.length) {
			await db.course.update({
				where: {
					id: courseId,
				},
				data: {
					isPublished: false,
				},
			});
		}

		return NextResponse.json(unPublishedChapter);
	} catch (error) {
		console.log("[CHAPTER_UN_PUBLISH]", error);
		return new NextResponse("Internal Error", { status: 500 });
	}
}
