import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { apiKey } from "~/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { keyId: string } },
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { keyId } = params;

    const deletedKey = await db
      .delete(apiKey)
      .where(and(eq(apiKey.id, keyId), eq(apiKey.userId, session.user.id)))
      .returning();

    if (deletedKey.length === 0) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete API key:", error);
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { keyId: string } },
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { keyId } = params;
    const body = await request.json();
    const { isActive } = body;

    const [updatedKey] = await db
      .update(apiKey)
      .set({
        isActive,
        updatedAt: new Date(),
      })
      .where(and(eq(apiKey.id, keyId), eq(apiKey.userId, session.user.id)))
      .returning();

    if (!updatedKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: updatedKey.id,
      name: updatedKey.name,
      isActive: updatedKey.isActive,
      updatedAt: updatedKey.updatedAt,
    });
  } catch (error) {
    console.error("Failed to update API key:", error);
    return NextResponse.json(
      { error: "Failed to update API key" },
      { status: 500 },
    );
  }
}
