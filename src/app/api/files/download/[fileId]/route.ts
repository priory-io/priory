import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { file } from "~/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) {
  try {
    const { fileId } = await params;
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fileRecord = await db.query.file.findFirst({
      where: and(
        eq(file.id, fileId),
        eq(file.userId, session.user.id),
        eq(file.isActive, true),
      ),
    });

    if (!fileRecord) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: fileRecord.id,
      filename: fileRecord.filename,
      originalFilename: fileRecord.originalFilename,
      mimeType: fileRecord.mimeType,
      size: fileRecord.size,
    });
  } catch (error) {
    console.error("File download metadata error:", error);
    return NextResponse.json(
      { error: "Failed to fetch file" },
      { status: 500 },
    );
  }
}
