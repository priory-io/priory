import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { shortlink } from "~/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { shortlinkIds } = await request.json();

    if (
      !shortlinkIds ||
      !Array.isArray(shortlinkIds) ||
      shortlinkIds.length === 0
    ) {
      return NextResponse.json(
        { error: "Shortlink IDs are required" },
        { status: 400 },
      );
    }

    const deletedShortlinks = await db
      .delete(shortlink)
      .where(
        and(
          inArray(shortlink.id, shortlinkIds),
          eq(shortlink.userId, session.user.id),
        ),
      )
      .returning();

    return NextResponse.json({
      success: true,
      deletedCount: deletedShortlinks.length,
    });
  } catch (error) {
    console.error("Bulk shortlink delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete shortlinks" },
      { status: 500 },
    );
  }
}
