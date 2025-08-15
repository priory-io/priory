import { NextRequest, NextResponse } from "next/server";
import { db } from "~/lib/db";
import { inviteCode } from "~/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { config } from "~/lib/config";

export async function POST(req: NextRequest) {
  try {
    const { inviteCode: code } = await req.json();

    if (config.features.bypassInvitesInDev) {
      return NextResponse.json({
        valid: true,
        inviteId: "dev-bypass",
        description: "Development mode - invite validation bypassed",
      });
    }

    if (!code) {
      return NextResponse.json(
        { error: "Invite code is required" },
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

    return NextResponse.json({
      valid: true,
      inviteId: inviteData.id,
      description: inviteData.description,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
