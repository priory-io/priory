import { NextRequest, NextResponse } from "next/server";
import { db } from "~/lib/db";
import { inviteCode, user } from "~/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { config } from "~/lib/config";
import {
  withRateLimit,
  getClientIp,
  defaultRateLimitConfigs,
} from "~/lib/rate-limit";
import { checkRequestSize } from "~/lib/request-size-limit";
import { inviteConsumeSchema } from "~/lib/input-validation";

export async function POST(req: NextRequest) {
  try {
    const rateLimitCheck = await withRateLimit(
      req,
      defaultRateLimitConfigs.inviteValidation,
      getClientIp(req),
    );
    if (rateLimitCheck) return rateLimitCheck;

    const sizeCheck = checkRequestSize(req, { maxJsonSize: 5 * 1024 });
    if (!sizeCheck.allowed) {
      return NextResponse.json({ error: sizeCheck.error }, { status: 413 });
    }

    const body = await req.json();
    const validatedData = inviteConsumeSchema.parse(body);
    const { inviteCode: code, userId } = validatedData;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    if (config.features.bypassInvitesInDev) {
      await db
        .update(user)
        .set({
          emailVerified: true,
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId));

      return NextResponse.json({ success: true });
    }

    if (!code) {
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
    if (
      error instanceof Error &&
      error.message.startsWith("Validation error:")
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error consuming invite:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
