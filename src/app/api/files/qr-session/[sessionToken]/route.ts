import { NextRequest, NextResponse } from "next/server";
import { db } from "~/lib/db";
import { file, qrUploadSession } from "~/lib/db/schema";
import { createStorageProvider } from "~/lib/file-storage";
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
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionToken: string }> },
) {
  try {
    const { sessionToken } = await params;

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

    const qrSessions = await db.query.qrUploadSession.findMany({
      where: (sessions, { eq, and, gt }) =>
        and(
          eq(sessions.sessionToken, sessionToken),
          eq(sessions.isActive, true),
          gt(sessions.expiresAt, new Date()),
        ),
    });

    if (qrSessions.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired QR session" },
        { status: 401 },
      );
    }

    const session = qrSessions[0]!;

    if (!session) {
      return NextResponse.json(
        { error: "Invalid or expired QR session" },
        { status: 401 },
      );
    }

    const userId = session.userId;

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

    const newFile = newFiles[0];

    if (!newFile) {
      return NextResponse.json(
        { error: "Failed to create file record" },
        { status: 500 },
      );
    }

    if (session) {
      await db
        .update(qrUploadSession)
        .set({ uploadCount: (session.uploadCount || 0) + 1 })
        .where(eq(qrUploadSession.id, session.id));
    }

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
    console.error("QR file upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionToken: string }> },
) {
  try {
    const { sessionToken } = await params;

    const rateLimitCheck = await withRateLimit(
      request,
      defaultRateLimitConfigs.api,
      getClientIp(request),
    );
    if (rateLimitCheck) return rateLimitCheck;

    const qrSessions = await db.query.qrUploadSession.findMany({
      where: (sessions, { eq }) => eq(sessions.sessionToken, sessionToken),
    });

    if (qrSessions.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const session = qrSessions[0]!;
    const isExpired = session.expiresAt < new Date();

    if (isExpired || !session.isActive) {
      return NextResponse.json(
        { error: "Session expired or inactive" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      id: session.id,
      sessionToken: session.sessionToken,
      expiresAt: session.expiresAt,
      uploadCount: session.uploadCount,
      isActive: session.isActive,
    });
  } catch (error) {
    console.error("QR session status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch session status" },
      { status: 500 },
    );
  }
}
