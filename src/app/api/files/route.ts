import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { file } from "~/lib/db/schema";
import { createStorageProvider } from "~/lib/file-storage";
import { authenticateApiKey } from "~/lib/api-auth";
import {
  isAllowedMimeType,
  sanitizeFilename,
  MAX_FILE_SIZE,
} from "~/types/file";
import sizeOf from "image-size";
import {
  withRateLimit,
  getClientIp,
  defaultRateLimitConfigs,
} from "~/lib/rate-limit";
import { checkRequestSize } from "~/lib/request-size-limit";
import { getPaginationParams } from "~/lib/input-validation";

export async function POST(request: NextRequest) {
  try {
    const rateLimitCheck = await withRateLimit(
      request,
      defaultRateLimitConfigs.fileUpload,
      getClientIp(request),
    );
    if (rateLimitCheck) return rateLimitCheck;

    const sizeCheck = checkRequestSize(request, {
      maxFileSize: MAX_FILE_SIZE,
    });
    if (!sizeCheck.allowed) {
      return NextResponse.json({ error: sizeCheck.error }, { status: 413 });
    }

    let userId: string;

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (session?.user) {
      userId = session.user.id;
    } else {
      const apiKeyAuth = await authenticateApiKey(request, "files:upload");
      if (!apiKeyAuth.success || !apiKeyAuth.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      userId = apiKeyAuth.user.id;
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
    const fileKey = `${userId}/${fileId}`;

    let width: number | null = null;
    let height: number | null = null;

    if (uploadedFile.type.startsWith("image/")) {
      try {
        const buffer = Buffer.from(arrayBuffer);
        const dimensions = sizeOf(buffer);
        if (dimensions.width && dimensions.height) {
          width = dimensions.width;
          height = dimensions.height;
        }
      } catch (error) {
        console.warn("Failed to extract image dimensions:", error);
      }
    }

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
        userId: userId,
        filename: sanitizedFilename,
        originalFilename: uploadedFile.name,
        mimeType: uploadedFile.type,
        size: uploadedFile.size,
        width,
        height,
      })
      .returning();

    const newFile = newFiles[0]!;

    return NextResponse.json({
      id: newFile.id,
      filename: newFile.filename,
      originalFilename: newFile.originalFilename,
      mimeType: newFile.mimeType,
      size: newFile.size,
      width: newFile.width,
      height: newFile.height,
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
    const rateLimitCheck = await withRateLimit(
      request,
      defaultRateLimitConfigs.api,
      getClientIp(request),
    );
    if (rateLimitCheck) return rateLimitCheck;

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const { page, limit, offset } = getPaginationParams(url, 100);

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
