import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { shortlink } from "~/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { originalUrl, customCode, title, description, password, expiresAt } =
      body;

    if (!originalUrl) {
      return NextResponse.json(
        { error: "Original URL is required" },
        { status: 400 },
      );
    }

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
        userId: session.user.id,
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
    console.error("Error creating shortlink:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
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
