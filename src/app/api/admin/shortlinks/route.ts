import { NextRequest, NextResponse } from "next/server";
import { db } from "~/lib/db";
import { shortlink, user } from "~/lib/db/schema";
import { auth } from "~/lib/auth";
import { requireAdmin } from "~/lib/admin";
import { desc, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requireAdmin(session.user.id);

    const shortlinks = await db
      .select({
        id: shortlink.id,
        shortCode: shortlink.shortCode,
        originalUrl: shortlink.originalUrl,
        title: shortlink.title,
        description: shortlink.description,
        isActive: shortlink.isActive,
        clickCount: shortlink.clickCount,
        createdAt: shortlink.createdAt,
        user: {
          name: user.name,
          email: user.email,
        },
      })
      .from(shortlink)
      .leftJoin(user, eq(shortlink.userId, user.id))
      .orderBy(desc(shortlink.createdAt));

    return NextResponse.json(shortlinks);
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
