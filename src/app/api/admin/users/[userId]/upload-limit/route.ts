import { NextRequest, NextResponse } from "next/server";
import { db } from "~/lib/db";
import { user } from "~/lib/db/schema";
import { auth } from "~/lib/auth";
import { requireAdmin } from "~/lib/admin";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requireAdmin(session.user.id);

    const { uploadLimitBytes } = await req.json();
    const { userId } = params;

    if (typeof uploadLimitBytes !== "number" && uploadLimitBytes !== null) {
      return NextResponse.json(
        { error: "uploadLimitBytes must be a number or null" },
        { status: 400 },
      );
    }

    if (uploadLimitBytes !== null && uploadLimitBytes < 0) {
      return NextResponse.json(
        { error: "uploadLimitBytes cannot be negative" },
        { status: 400 },
      );
    }

    await db.update(user).set({ uploadLimitBytes }).where(eq(user.id, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Admin access required") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requireAdmin(session.user.id);

    const { userId } = params;

    const userData = await db
      .select({
        uploadLimitBytes: user.uploadLimitBytes,
        totalUploadedBytes: user.totalUploadedBytes,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (userData.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(userData[0]);
  } catch (error) {
    if (error instanceof Error && error.message === "Admin access required") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
