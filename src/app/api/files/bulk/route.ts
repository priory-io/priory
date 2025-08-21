import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { file } from "~/lib/db/schema";
import { createStorageProvider } from "~/lib/file-storage";
import { eq, and, inArray } from "drizzle-orm";

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileIds } = await request.json();

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json(
        { error: "File IDs are required" },
        { status: 400 },
      );
    }

    const filesToDelete = await db
      .select()
      .from(file)
      .where(
        and(
          inArray(file.id, fileIds),
          eq(file.userId, session.user.id),
          eq(file.isActive, true),
        ),
      );

    if (filesToDelete.length === 0) {
      return NextResponse.json({ error: "No files found" }, { status: 404 });
    }

    const storageProvider = createStorageProvider();

    await Promise.all(
      filesToDelete.map(async (fileRecord) => {
        const fileKey = `${fileRecord.userId}/${fileRecord.id}`;
        try {
          await storageProvider.deleteFile(fileKey);
        } catch (error) {
          console.error(
            `Failed to delete file ${fileKey} from storage:`,
            error,
          );
        }
      }),
    );

    await db
      .update(file)
      .set({ isActive: false })
      .where(and(inArray(file.id, fileIds), eq(file.userId, session.user.id)));

    return NextResponse.json({
      success: true,
      deletedCount: filesToDelete.length,
    });
  } catch (error) {
    console.error("Bulk file delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete files" },
      { status: 500 },
    );
  }
}
