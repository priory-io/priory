import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { file, shortlink, shortlinkClick } from "~/lib/db/schema";
import { eq, count, sql, gte, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

    const fileStats = await db
      .select({
        count: count(),
        totalSize: sql<string>`COALESCE(SUM(${file.size}), 0)`,
      })
      .from(file)
      .where(eq(file.userId, userId));

    const weeklyFileStats = await db
      .select({
        count: count(),
      })
      .from(file)
      .where(and(eq(file.userId, userId), gte(file.createdAt, oneWeekAgo)));

    const shortlinkStats = await db
      .select({
        count: count(),
      })
      .from(shortlink)
      .where(eq(shortlink.userId, userId));

    const weeklyShortlinkStats = await db
      .select({
        count: count(),
      })
      .from(shortlink)
      .where(
        and(eq(shortlink.userId, userId), gte(shortlink.createdAt, oneWeekAgo)),
      );

    const viewStats = await db
      .select({
        totalViews: sql<number>`COALESCE(COUNT(${shortlinkClick.id}), 0)`,
        uniqueLinks: sql<number>`COUNT(DISTINCT ${shortlinkClick.shortlinkId})`,
      })
      .from(shortlinkClick)
      .leftJoin(shortlink, eq(shortlinkClick.shortlinkId, shortlink.id))
      .where(eq(shortlink.userId, userId));

    const monthlyViewStats = await db
      .select({
        totalViews: sql<number>`COALESCE(COUNT(${shortlinkClick.id}), 0)`,
      })
      .from(shortlinkClick)
      .leftJoin(shortlink, eq(shortlinkClick.shortlinkId, shortlink.id))
      .where(
        and(
          eq(shortlink.userId, userId),
          gte(shortlinkClick.clickedAt, oneMonthAgo),
        ),
      );

    const filesCount = fileStats[0]?.count || 0;
    const weeklyFilesCount = weeklyFileStats[0]?.count || 0;
    const filesChange =
      weeklyFilesCount > 0 ? `+${weeklyFilesCount} this week` : "No new files";

    const shortlinksCount = shortlinkStats[0]?.count || 0;
    const weeklyShortlinksCount = weeklyShortlinkStats[0]?.count || 0;
    const shortlinksChange =
      weeklyShortlinksCount > 0
        ? `+${weeklyShortlinksCount} this week`
        : "No new links";

    const totalViews = viewStats[0]?.totalViews || 0;
    const monthlyViews = monthlyViewStats[0]?.totalViews || 0;
    const viewsChange =
      monthlyViews > 0
        ? `+${((monthlyViews / Math.max(totalViews - monthlyViews, 1)) * 100).toFixed(0)}% this month`
        : "No recent views";

    const activeLinks = viewStats[0]?.uniqueLinks || 0;
    const activePercentage =
      shortlinksCount > 0
        ? Math.round((activeLinks / shortlinksCount) * 100)
        : 0;

    const rawTotalSize = fileStats[0]?.totalSize;
    const filesStorage = Number(rawTotalSize || "0");
    const storageUsed = filesStorage;
    const storageLimit = 10737418240;

    return NextResponse.json({
      filesCount,
      shortlinksCount,
      totalViews,
      activeLinks,
      filesChange,
      shortlinksChange,
      viewsChange,
      activePercentage,
      storageUsed,
      storageLimit,
      filesStorage,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
