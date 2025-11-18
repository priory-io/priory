import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { user } from "~/lib/db/schema";
import { eq } from "drizzle-orm";
import { createStorageProvider } from "~/lib/file-storage";

const storage = createStorageProvider();

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 },
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);

    const fileExtension = file.type.split("/")[1] || "jpg";
    const filename = `avatars/avatar-${session.user.id}-${Date.now()}.${fileExtension}`;

    await storage.uploadFile(filename, buffer, file.type);
    const avatarUrl = storage.getFileUrl(filename);

    const currentUser = await db
      .select({
        id: user.id,
        avatarUrl: user.avatarUrl,
      })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (currentUser[0]?.avatarUrl) {
      try {
        const oldFilename = currentUser[0].avatarUrl.split("/").pop();
        if (oldFilename) {
          await storage.deleteFile(`avatars/${oldFilename}`);
        }
      } catch (error) {
        console.error("Failed to delete old avatar:", error);
      }
    }

    await db
      .update(user)
      .set({
        avatarUrl: avatarUrl,
        image: avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id));

    return NextResponse.json({ avatarUrl });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await db
      .select({
        id: user.id,
        avatarUrl: user.avatarUrl,
      })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (currentUser[0]?.avatarUrl) {
      try {
        const filename = currentUser[0].avatarUrl.split("/").pop();
        if (filename) {
          await storage.deleteFile(`avatars/${filename}`);
        }
      } catch (error) {
        console.error("Failed to delete avatar file:", error);
      }
    }

    await db
      .update(user)
      .set({
        avatarUrl: null,
        image: null,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Avatar removal error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
