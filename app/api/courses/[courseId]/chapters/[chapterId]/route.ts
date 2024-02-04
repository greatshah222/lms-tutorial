import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import Mux from "@mux/mux-node";

const { Video } = new Mux(process.env.MUX_TOKEN_ID!, process.env.MUX_TOKEN_SECRET!);

export async function PATCH(
	req: Request,
	{ params }: { params: { courseId: string; chapterId: string } }
) {
	try {
		const { userId } = auth();
		const { courseId, chapterId } = params;

		const { isPublished, ...values } = await req.json();

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

		// FINDING LAST CHAPTER
		const chapter = await db.chapter.update({
			where: {
				id: chapterId,
				courseId,
			},
			data: {
				...values,
			},
		});

		// HANDLE VIDEO UPLOAD

		if (values.videoUrl) {
			const existingMuxData = await db.muxData.findFirst({
				where: {
					chapterId: chapterId,
				},
			});

			if (existingMuxData) {
				// DELETING VIDEO IF ALREADY EXISTS
				await Video.Assets.del(existingMuxData.assetId);

				await db.muxData.delete({
					where: {
						id: existingMuxData.assetId,
					},
				});
			}

			const asset = await Video.Assets.create({
				input: values.videoUrl,
				playback_policy: "public",
				test: false,
			});

			await db.muxData.create({
				data: {
					chapterId,
					assetId: asset.id,
					playbackId: asset.playback_ids?.[0]?.id,
				},
			});
		}

		return NextResponse.json(chapter);
	} catch (error) {
		console.log("[COURSES_CHAPTER_ID]", error);
		return new NextResponse("Internal Error", { status: 500 });
	}
}

export async function DELETE(
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

		const chapter = await db.chapter.findUnique({
			where: {
				id: params.chapterId,
				courseId,
			},
		});
		if (!chapter) {
			return new NextResponse("Not found", { status: 404 });
		}

		// checking if the chapter has a video url - we have to delete mux data as well in that case
		if (chapter?.videoUrl) {
			const existingMuxData = await db.muxData.findFirst({
				where: {
					chapterId,
				},
			});

			if (existingMuxData) {
				await Video.Assets.del(existingMuxData.assetId);

				await db.muxData.delete({
					where: {
						id: existingMuxData.id,
					},
				});
			}
		}

		const deletedChapter = await db.chapter.delete({
			where: {
				id: chapterId,
			},
		});

		// ATLEAST ONE CHAPTER NEED TO BE AT LEAST ONE CHAPTER ->IF THIS IS THE LAST CHAPTER THAT IS GOING TO BE DELETED AND COURSE IS MARKED AS PUBLIC THEN WE MUST REVERSE IT

		const publishedChapterInCourse = await db.chapter.findMany({
			where: {
				courseId,
				isPublished: true,
			},
		});

		if (!publishedChapterInCourse?.length) {
			await db.course.update({
				where: {
					id: courseId,
				},
				data: {
					isPublished: false,
				},
			});
		}

		return NextResponse.json(deletedChapter);
	} catch (error) {
		console.log("[COURSES_CHAPTER_ID_DELETE]", error);
		return new NextResponse("Internal Error", { status: 500 });
	}
}
