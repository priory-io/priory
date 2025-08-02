import { NextRequest, NextResponse } from "next/server";
import { db } from "~/lib/db";
import { user, shortlink, shortlinkClick } from "~/lib/db/schema";
import { auth } from "~/lib/auth";
import { requireAdmin } from "~/lib/admin";
import { count, eq, gte, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requireAdmin(session.user.id);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsersResult,
      verifiedUsersResult,
      adminUsersResult,
      totalShortlinksResult,
      activeShortlinksResult,
      totalClicksResult,
      newUsersTodayResult,
      newShortlinksTodayResult,
      clicksTodayResult,
    ] = await Promise.all([
      db.select({ count: count() }).from(user),
      db
        .select({ count: count() })
        .from(user)
        .where(eq(user.emailVerified, true)),
      db.select({ count: count() }).from(user).where(eq(user.isAdmin, true)),
      db.select({ count: count() }).from(shortlink),
      db
        .select({ count: count() })
        .from(shortlink)
        .where(eq(shortlink.isActive, true)),
      db
        .select({
          total: sql<number>`COALESCE(SUM(${shortlink.clickCount}), 0)`,
        })
        .from(shortlink),
      db
        .select({ count: count() })
        .from(user)
        .where(gte(user.createdAt, today)),
      db
        .select({ count: count() })
        .from(shortlink)
        .where(gte(shortlink.createdAt, today)),
      db
        .select({ count: count() })
        .from(shortlinkClick)
        .where(gte(shortlinkClick.clickedAt, today)),
    ]);

    const stats = {
      totalUsers: totalUsersResult[0]?.count || 0,
      verifiedUsers: verifiedUsersResult[0]?.count || 0,
      adminUsers: adminUsersResult[0]?.count || 0,
      totalShortlinks: totalShortlinksResult[0]?.count || 0,
      activeShortlinks: activeShortlinksResult[0]?.count || 0,
      totalClicks: totalClicksResult[0]?.total || 0,
      recentActivity: {
        newUsersToday: newUsersTodayResult[0]?.count || 0,
        newShortlinksToday: newShortlinksTodayResult[0]?.count || 0,
        clicksToday: clicksTodayResult[0]?.count || 0,
      },
    };

    return NextResponse.json(stats);
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
