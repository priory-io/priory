import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { file } from "~/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";

export async function POST(request: NextRequest) {
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

    const filesToDownload = await db
      .select()
      .from(file)
      .where(
        and(
          inArray(file.id, fileIds),
          eq(file.userId, session.user.id),
          eq(file.isActive, true),
        ),
      );

    if (filesToDownload.length === 0) {
      return NextResponse.json({ error: "No files found" }, { status: 404 });
    }

    const filesWithUrls = filesToDownload.map((fileRecord) => ({
      id: fileRecord.id,
      filename: fileRecord.filename,
      originalFilename: fileRecord.originalFilename,
      downloadUrl: `/api/files/${fileRecord.id}/download`,
    }));

    return NextResponse.json({
      files: filesWithUrls,
    });
  } catch (error) {
    console.error("Bulk file download error:", error);
    return NextResponse.json(
      { error: "Failed to prepare files for download" },
      { status: 500 },
    );
  }
}
