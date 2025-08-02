import { NextRequest, NextResponse } from "next/server";
import { db } from "~/lib/db";
import { inviteCode, user } from "~/lib/db/schema";
import { auth } from "~/lib/auth";
import { requireAdmin } from "~/lib/admin";
import { desc, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requireAdmin(session.user.id);

    const invites = await db
      .select({
        id: inviteCode.id,
        code: inviteCode.code,
        maxUses: inviteCode.maxUses,
        currentUses: inviteCode.currentUses,
        expiresAt: inviteCode.expiresAt,
        isActive: inviteCode.isActive,
        description: inviteCode.description,
        createdAt: inviteCode.createdAt,
        createdBy: {
          name: user.name,
          email: user.email,
        },
      })
      .from(inviteCode)
      .leftJoin(user, eq(inviteCode.createdById, user.id))
      .orderBy(desc(inviteCode.createdAt));

    return NextResponse.json(invites);
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

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requireAdmin(session.user.id);

    const { maxUses, expiresInDays, description } = await req.json();

    const code = generateInviteCode();
    const id = generateId();

    let expiresAt: Date | null = null;
    if (expiresInDays && expiresInDays > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    }

    await db.insert(inviteCode).values({
      id,
      code,
      createdById: session.user.id,
      maxUses: maxUses || null,
      expiresAt,
      description: description || null,
    });

    return NextResponse.json({ code, id });
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

function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
