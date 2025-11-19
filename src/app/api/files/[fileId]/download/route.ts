import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { file } from "~/lib/db/schema";
import { createStorageProvider } from "~/lib/file-storage";
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

    const storageProvider = createStorageProvider();
    const fileUrl = storageProvider.getFileUrl(
      `${fileRecord.userId}/${fileRecord.id}`,
    );

    const fileResponse = await fetch(fileUrl);

    if (!fileResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch file" },
        { status: 500 },
      );
    }

    const buffer = await fileResponse.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": fileRecord.mimeType,
        "Content-Length": String(fileRecord.size),
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileRecord.originalFilename)}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("File download error:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 },
    );
  }
}
