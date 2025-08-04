import { NextRequest, NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { file } from "~/lib/db/schema";
import { config } from "~/lib/config";
import { eq, and } from "drizzle-orm";
import { sanitizeFilename } from "~/types/file";

function createR2Client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${config.r2.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.r2.accessKeyId!,
      secretAccessKey: config.r2.secretAccessKey!,
    },
  });
}

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
      ...fileRecord,
      url: `${config.r2.publicUrl}/${fileRecord.userId}/${fileRecord.id}`,
    });
  } catch (error) {
    console.error("File fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch file" },
      { status: 500 },
    );
  }
}

export async function PATCH(
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

    const body = await request.json();
    const { filename } = body;

    if (!filename || typeof filename !== "string") {
      return NextResponse.json(
        { error: "Valid filename required" },
        { status: 400 },
      );
    }

    const sanitizedFilename = sanitizeFilename(filename);

    const updatedFiles = await db
      .update(file)
      .set({
        filename: sanitizedFilename,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(file.id, fileId),
          eq(file.userId, session.user.id),
          eq(file.isActive, true),
        ),
      )
      .returning();

    if (updatedFiles.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const updatedFile = updatedFiles[0]!;

    return NextResponse.json({
      ...updatedFile,
      url: `${config.r2.publicUrl}/${updatedFile.userId}/${updatedFile.id}`,
    });
  } catch (error) {
    console.error("File update error:", error);
    return NextResponse.json(
      { error: "Failed to update file" },
      { status: 500 },
    );
  }
}

export async function DELETE(
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

    try {
      const r2Client = createR2Client();
      const deleteCommand = new DeleteObjectCommand({
        Bucket: config.r2.bucketName!,
        Key: `${fileRecord.userId}/${fileId}`,
      });
      await r2Client.send(deleteCommand);
    } catch (r2Error) {
      console.error("R2 deletion error:", r2Error);
    }

    await db
      .update(file)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(and(eq(file.id, fileId), eq(file.userId, session.user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("File deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 },
    );
  }
}
