import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { file } from "~/lib/db/schema";
import { createStorageProvider } from "~/lib/file-storage";
import { eq, and, inArray } from "drizzle-orm";
import JSZip from "jszip";

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

    if (filesToDownload.length === 1) {
      const singleFile = filesToDownload[0];
      const storageProvider = createStorageProvider();
      const fileUrl = storageProvider.getFileUrl(
        `${singleFile.userId}/${singleFile.id}`,
      );

      return NextResponse.json({
        type: "single",
        url: fileUrl,
        filename: singleFile.filename,
      });
    }

    const zip = new JSZip();
    const storageProvider = createStorageProvider();

    await Promise.all(
      filesToDownload.map(async (fileRecord) => {
        try {
          const fileKey = `${fileRecord.userId}/${fileRecord.id}`;
          const fileData = await storageProvider.getFileBuffer(fileKey);
          zip.file(fileRecord.filename, fileData);
        } catch (error) {
          console.error(
            `Failed to add file ${fileRecord.filename} to zip:`,
            error,
          );
        }
      }),
    );

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="files-${Date.now()}.zip"`,
      },
    });
  } catch (error) {
    console.error("Bulk file download error:", error);
    return NextResponse.json(
      { error: "Failed to download files" },
      { status: 500 },
    );
  }
}
