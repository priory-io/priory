import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { apiKey } from "~/lib/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { createHash } from "crypto";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const keys = await db
      .select({
        id: apiKey.id,
        name: apiKey.name,
        key: apiKey.key,
        lastUsedAt: apiKey.lastUsedAt,
        expiresAt: apiKey.expiresAt,
        isActive: apiKey.isActive,
        permissions: apiKey.permissions,
        createdAt: apiKey.createdAt,
      })
      .from(apiKey)
      .where(eq(apiKey.userId, session.user.id));

    const maskedKeys = keys.map((k) => ({
      ...k,
      key: `${k.key.slice(0, 8)}...${k.key.slice(-4)}`,
    }));

    return NextResponse.json(maskedKeys);
  } catch (error) {
    console.error("Failed to fetch API keys:", error);
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, permissions, expiresAt } = body;

    if (!name || !permissions) {
      return NextResponse.json(
        { error: "Name and permissions are required" },
        { status: 400 },
      );
    }

    const newApiKey = `pk_${nanoid(32)}`;
    const hashedKey = createHash("sha256").update(newApiKey).digest("hex");

    const [newKey] = await db
      .insert(apiKey)
      .values({
        id: nanoid(),
        userId: session.user.id,
        name,
        key: newApiKey,
        hashedKey,
        permissions,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      })
      .returning();

    if (!newKey) {
      return NextResponse.json(
        { error: "Failed to create API key" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      id: newKey.id,
      name: newKey.name,
      key: newApiKey,
      permissions: newKey.permissions,
      expiresAt: newKey.expiresAt,
      createdAt: newKey.createdAt,
    });
  } catch (error) {
    console.error("Failed to create API key:", error);
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 },
    );
  }
}
