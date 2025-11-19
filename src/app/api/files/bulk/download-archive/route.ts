import { NextRequest, NextResponse } from "next/server";
import archiver from "archiver";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { file } from "~/lib/db/schema";
import { createStorageProvider } from "~/lib/file-storage";
import { eq, and, inArray } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileIds, format = "zip" } = await request.json();

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json(
        { error: "File IDs are required" },
        { status: 400 },
      );
    }

    if (!["zip", "tar"].includes(format)) {
      return NextResponse.json(
        { error: "Invalid archive format" },
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

    const storageProvider = createStorageProvider();
    const archiveStream = archiver(format, {
      zlib: { level: 9 },
    });

    const chunks: Buffer[] = [];

    archiveStream.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    archiveStream.on("error", (err: Error) => {
      console.error("Archive error:", err);
    });

    for (const fileRecord of filesToDownload) {
      try {
        const fileUrl = storageProvider.getFileUrl(
          `${fileRecord.userId}/${fileRecord.id}`,
        );

        const fileResponse = await fetch(fileUrl);

        if (!fileResponse.ok) {
          console.error(`Failed to fetch file ${fileRecord.id}`);
          continue;
        }

        const buffer = await fileResponse.arrayBuffer();
        archiveStream.append(Buffer.from(buffer), {
          name: fileRecord.originalFilename,
        });
      } catch (error) {
        console.error(`Error adding file ${fileRecord.id} to archive:`, error);
        continue;
      }
    }

    await archiveStream.finalize();

    const archiveBuffer = Buffer.concat(chunks);
    const fileExtension = format === "tar" ? "tar" : "zip";
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `files-${timestamp}.${fileExtension}`;

    return new NextResponse(archiveBuffer, {
      headers: {
        "Content-Type":
          format === "tar" ? "application/x-tar" : "application/zip",
        "Content-Length": String(archiveBuffer.length),
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Bulk archive download error:", error);
    return NextResponse.json(
      { error: "Failed to create archive" },
      { status: 500 },
    );
  }
}
