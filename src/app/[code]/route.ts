import { NextRequest, NextResponse } from "next/server";
import { db } from "~/lib/db";
import { shortlink, shortlinkClick } from "~/lib/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;

    const link = await db
      .select()
      .from(shortlink)
      .where(eq(shortlink.shortCode, code))
      .limit(1);

    if (link.length === 0) {
      return new NextResponse("Shortlink not found", { status: 404 });
    }

    const linkData = link[0]!;

    if (!linkData.isActive) {
      return new NextResponse("Shortlink is disabled", { status: 410 });
    }

    if (linkData.expiresAt && new Date() > linkData.expiresAt) {
      return new NextResponse("Shortlink has expired", { status: 410 });
    }

    if (linkData.password) {
      const url = new URL(request.url);
      const passwordParam = url.searchParams.get("password");

      if (!passwordParam || passwordParam !== linkData.password) {
        return NextResponse.redirect(
          new URL(`/protected/${code}`, request.url),
        );
      }
    }

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    const referer = request.headers.get("referer") || null;

    await Promise.all([
      db.insert(shortlinkClick).values({
        id: nanoid(),
        shortlinkId: linkData.id,
        ipAddress,
        userAgent,
        referer,
        clickedAt: new Date(),
      }),
      db
        .update(shortlink)
        .set({
          clickCount: linkData.clickCount + 1,
          updatedAt: new Date(),
        })
        .where(eq(shortlink.id, linkData.id)),
    ]);

    return NextResponse.redirect(linkData.originalUrl, 302);
  } catch (error) {
    console.error("Error handling redirect:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
