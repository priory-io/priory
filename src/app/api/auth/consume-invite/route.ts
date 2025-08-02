import { NextRequest, NextResponse } from "next/server";
import { db } from "~/lib/db";
import { inviteCode, user } from "~/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { code, userId } = await req.json();

    if (!code || !userId) {
      return NextResponse.json(
        { error: "Code and userId are required" },
        { status: 400 },
      );
    }

    const invite = await db
      .select()
      .from(inviteCode)
      .where(
        and(
          eq(inviteCode.code, code.toUpperCase()),
          eq(inviteCode.isActive, true),
        ),
      )
      .limit(1);

    if (invite.length === 0) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 400 },
      );
    }

    const inviteData = invite[0];
    if (!inviteData) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 400 },
      );
    }

    if (inviteData.expiresAt && new Date() > inviteData.expiresAt) {
      return NextResponse.json(
        { error: "Invite code has expired" },
        { status: 400 },
      );
    }

    if (inviteData.maxUses && inviteData.currentUses >= inviteData.maxUses) {
      return NextResponse.json(
        { error: "Invite code has reached maximum uses" },
        { status: 400 },
      );
    }

    await db
      .update(inviteCode)
      .set({ currentUses: inviteData.currentUses + 1 })
      .where(eq(inviteCode.id, inviteData.id));

    await db
      .update(user)
      .set({ inviteCodeId: inviteData.id })
      .where(eq(user.id, userId));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
