import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { file } from "~/lib/db/schema";
import { createStorageProvider } from "~/lib/file-storage";
import {
  isAllowedMimeType,
  sanitizeFilename,
  MAX_FILE_SIZE,
} from "~/types/file";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const uploadedFile = formData.get("file") as File;

    if (!uploadedFile) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (uploadedFile.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large" }, { status: 413 });
    }

    if (!isAllowedMimeType(uploadedFile.type)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 },
      );
    }

    const fileId = nanoid(8);
    const sanitizedFilename = sanitizeFilename(uploadedFile.name);
    const arrayBuffer = await uploadedFile.arrayBuffer();
    const fileKey = `${session.user.id}/${fileId}`;

    const storageProvider = createStorageProvider();
    await storageProvider.uploadFile(
      fileKey,
      new Uint8Array(arrayBuffer),
      uploadedFile.type,
    );

    const newFiles = await db
      .insert(file)
      .values({
        id: fileId,
        userId: session.user.id,
        filename: sanitizedFilename,
        originalFilename: uploadedFile.name,
        mimeType: uploadedFile.type,
        size: uploadedFile.size,
      })
      .returning();

    const newFile = newFiles[0]!;

    return NextResponse.json({
      id: newFile.id,
      filename: newFile.filename,
      originalFilename: newFile.originalFilename,
      mimeType: newFile.mimeType,
      size: newFile.size,
      url: storageProvider.getFileUrl(fileKey),
      createdAt: newFile.createdAt,
    });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const userFiles = await db.query.file.findMany({
      where: (files, { eq, and }) =>
        and(eq(files.userId, session.user.id), eq(files.isActive, true)),
      limit,
      offset,
      orderBy: (files, { desc }) => [desc(files.createdAt)],
    });

    const storageProvider = createStorageProvider();
    const filesWithUrls = userFiles.map((file) => ({
      ...file,
      url: storageProvider.getFileUrl(`${file.userId}/${file.id}`),
    }));

    return NextResponse.json({
      files: filesWithUrls,
      page,
      limit,
      hasMore: userFiles.length === limit,
    });
  } catch (error) {
    console.error("File fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 },
    );
  }
}
