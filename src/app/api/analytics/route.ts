import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { shortlink, shortlinkClick } from "~/lib/db/schema";
import { eq, desc, sql, and, gte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const shortlinkId = searchParams.get("shortlinkId");
    const days = parseInt(searchParams.get("days") || "30");

    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - days);

    if (shortlinkId) {
      const linkOwnership = await db
        .select()
        .from(shortlink)
        .where(
          and(
            eq(shortlink.id, shortlinkId),
            eq(shortlink.userId, session.user.id),
          ),
        )
        .limit(1);

      if (linkOwnership.length === 0) {
        return NextResponse.json(
          { error: "Shortlink not found" },
          { status: 404 },
        );
      }

      const clickData = await db
        .select({
          date: sql<string>`DATE(${shortlinkClick.clickedAt})`,
          clicks: sql<number>`COUNT(*)`,
        })
        .from(shortlinkClick)
        .where(
          and(
            eq(shortlinkClick.shortlinkId, shortlinkId),
            gte(shortlinkClick.clickedAt, dateFilter),
          ),
        )
        .groupBy(sql`DATE(${shortlinkClick.clickedAt})`)
        .orderBy(sql`DATE(${shortlinkClick.clickedAt})`);

      const recentClicks = await db
        .select({
          ipAddress: shortlinkClick.ipAddress,
          userAgent: shortlinkClick.userAgent,
          referer: shortlinkClick.referer,
          country: shortlinkClick.country,
          city: shortlinkClick.city,
          clickedAt: shortlinkClick.clickedAt,
        })
        .from(shortlinkClick)
        .where(eq(shortlinkClick.shortlinkId, shortlinkId))
        .orderBy(desc(shortlinkClick.clickedAt))
        .limit(50);

      return NextResponse.json({
        clickData,
        recentClicks,
      });
    } else {
      const totalClicks = await db
        .select({
          shortlinkId: shortlinkClick.shortlinkId,
          shortCode: shortlink.shortCode,
          title: shortlink.title,
          clicks: sql<number>`COUNT(*)`,
        })
        .from(shortlinkClick)
        .leftJoin(shortlink, eq(shortlinkClick.shortlinkId, shortlink.id))
        .where(
          and(
            eq(shortlink.userId, session.user.id),
            gte(shortlinkClick.clickedAt, dateFilter),
          ),
        )
        .groupBy(
          shortlinkClick.shortlinkId,
          shortlink.shortCode,
          shortlink.title,
        )
        .orderBy(desc(sql`COUNT(*)`))
        .limit(10);

      const dailyClicks = await db
        .select({
          date: sql<string>`DATE(${shortlinkClick.clickedAt})`,
          clicks: sql<number>`COUNT(*)`,
        })
        .from(shortlinkClick)
        .leftJoin(shortlink, eq(shortlinkClick.shortlinkId, shortlink.id))
        .where(
          and(
            eq(shortlink.userId, session.user.id),
            gte(shortlinkClick.clickedAt, dateFilter),
          ),
        )
        .groupBy(sql`DATE(${shortlinkClick.clickedAt})`)
        .orderBy(sql`DATE(${shortlinkClick.clickedAt})`);

      return NextResponse.json({
        totalClicks,
        dailyClicks,
      });
    }
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
