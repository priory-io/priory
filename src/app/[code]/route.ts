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
      return new NextResponse(
        `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>404 - Shortlink Not Found</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <script>window.location.href = '/not-found-shortlink';</script>
  <noscript>
    <meta http-equiv="refresh" content="0; url=/not-found-shortlink">
  </noscript>
</body>
</html>`,
        {
          status: 404,
          headers: { "Content-Type": "text/html" },
        },
      );
    }

    const linkData = link[0]!;

    if (!linkData.isActive) {
      return new NextResponse(
        `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>410 - Shortlink Disabled</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <script>window.location.href = '/not-found-shortlink';</script>
  <noscript>
    <meta http-equiv="refresh" content="0; url=/not-found-shortlink">
  </noscript>
</body>
</html>`,
        {
          status: 410,
          headers: { "Content-Type": "text/html" },
        },
      );
    }

    if (linkData.expiresAt && new Date() > linkData.expiresAt) {
      return new NextResponse(
        `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>410 - Shortlink Expired</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <script>window.location.href = '/not-found-shortlink';</script>
  <noscript>
    <meta http-equiv="refresh" content="0; url=/not-found-shortlink">
  </noscript>
</body>
</html>`,
        {
          status: 410,
          headers: { "Content-Type": "text/html" },
        },
      );
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
    return new NextResponse(
      `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>500 - Server Error</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <script>window.location.href = '/not-found-shortlink';</script>
  <noscript>
    <meta http-equiv="refresh" content="0; url=/not-found-shortlink">
  </noscript>
</body>
</html>`,
      {
        status: 500,
        headers: { "Content-Type": "text/html" },
      },
    );
  }
}
