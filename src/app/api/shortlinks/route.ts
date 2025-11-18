import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { shortlink } from "~/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { authenticateApiKey } from "~/lib/api-auth";
import {
  withRateLimit,
  getClientIp,
  defaultRateLimitConfigs,
} from "~/lib/rate-limit";
import { checkRequestSize } from "~/lib/request-size-limit";
import { shortlinkCreateSchema } from "~/lib/input-validation";

export async function POST(request: NextRequest) {
  try {
    const rateLimitCheck = await withRateLimit(
      request,
      defaultRateLimitConfigs.shortlinkCreate,
      getClientIp(request),
    );
    if (rateLimitCheck) return rateLimitCheck;

    const sizeCheck = checkRequestSize(request, {
      maxJsonSize: 10 * 1024,
    });
    if (!sizeCheck.allowed) {
      return NextResponse.json({ error: sizeCheck.error }, { status: 413 });
    }

    let userId: string;

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (session?.user?.id) {
      userId = session.user.id;
    } else {
      const apiKeyAuth = await authenticateApiKey(request, "shortlinks:create");
      if (!apiKeyAuth.success || !apiKeyAuth.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      userId = apiKeyAuth.user.id;
    }

    const body = await request.json();
    const validatedData = shortlinkCreateSchema.parse(body);
    const { originalUrl, customCode, title, description, password, expiresAt } =
      validatedData;

    const shortCode = customCode || nanoid(6);

    const existingShortlink = await db
      .select()
      .from(shortlink)
      .where(eq(shortlink.shortCode, shortCode))
      .limit(1);

    if (existingShortlink.length > 0) {
      return NextResponse.json(
        { error: "Short code already exists" },
        { status: 400 },
      );
    }

    const newShortlink = await db
      .insert(shortlink)
      .values({
        id: nanoid(),
        userId: userId,
        shortCode,
        originalUrl,
        title,
        description,
        password,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      })
      .returning();

    return NextResponse.json({
      shortlink: newShortlink[0],
      shortUrl: `${process.env["NEXT_PUBLIC_BASE_URL"] || "http://localhost:3000"}/${shortCode}`,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("Validation error:")
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error creating shortlink:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const rateLimitCheck = await withRateLimit(
      request,
      defaultRateLimitConfigs.analytics,
      getClientIp(request),
    );
    if (rateLimitCheck) return rateLimitCheck;

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userShortlinks = await db
      .select()
      .from(shortlink)
      .where(eq(shortlink.userId, session.user.id))
      .orderBy(desc(shortlink.createdAt));

    return NextResponse.json({ shortlinks: userShortlinks });
  } catch (error) {
    console.error("Error fetching shortlinks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const rateLimitCheck = await withRateLimit(
      request,
      defaultRateLimitConfigs.api,
      getClientIp(request),
    );
    if (rateLimitCheck) return rateLimitCheck;

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const shortlinkId = searchParams.get("id");

    if (!shortlinkId) {
      return NextResponse.json(
        { error: "Shortlink ID is required" },
        { status: 400 },
      );
    }

    const deletedShortlink = await db
      .delete(shortlink)
      .where(
        and(
          eq(shortlink.id, shortlinkId),
          eq(shortlink.userId, session.user.id),
        ),
      )
      .returning();

    if (deletedShortlink.length === 0) {
      return NextResponse.json(
        { error: "Shortlink not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting shortlink:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
