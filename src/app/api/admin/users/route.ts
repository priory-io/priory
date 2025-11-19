import { NextRequest, NextResponse } from "next/server";
import { db } from "~/lib/db";
import { user } from "~/lib/db/schema";
import { auth } from "~/lib/auth";
import { requireAdmin } from "~/lib/admin";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requireAdmin(session.user.id);

    const users = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        uploadLimitBytes: user.uploadLimitBytes,
        totalUploadedBytes: user.totalUploadedBytes,
      })
      .from(user)
      .orderBy(user.createdAt);

    return NextResponse.json(users);
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
