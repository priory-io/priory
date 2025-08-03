import { NextRequest, NextResponse } from "next/server";
import { db } from "~/lib/db";
import { inviteCode, user } from "~/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { inviteCode: code, userId } = await req.json();

    if (!code || !userId) {
      return NextResponse.json(
        { error: "Invite code and user ID are required" },
        { status: 400 },
      );
    }

    const invite = await db
      .select()
      .from(inviteCode)
      .where(and(eq(inviteCode.code, code), eq(inviteCode.isActive, true)))
      .limit(1);

    if (invite.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired invite code" },
        { status: 400 },
      );
    }

    const inviteRecord = invite[0];
    if (!inviteRecord) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 400 },
      );
    }

    if (inviteRecord.expiresAt && new Date() > inviteRecord.expiresAt) {
      return NextResponse.json(
        { error: "Invite code has expired" },
        { status: 400 },
      );
    }

    if (
      inviteRecord.maxUses &&
      inviteRecord.currentUses >= inviteRecord.maxUses
    ) {
      return NextResponse.json(
        { error: "Invite code usage limit reached" },
        { status: 400 },
      );
    }

    await db
      .update(inviteCode)
      .set({
        currentUses: inviteRecord.currentUses + 1,
        updatedAt: new Date(),
      })
      .where(eq(inviteCode.id, inviteRecord.id));

    if (
      inviteRecord.maxUses &&
      inviteRecord.currentUses + 1 >= inviteRecord.maxUses
    ) {
      await db
        .update(inviteCode)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(inviteCode.id, inviteRecord.id));
    }

    await db
      .update(user)
      .set({
        emailVerified: true,
        inviteCodeId: inviteRecord.id,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error consuming invite:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
