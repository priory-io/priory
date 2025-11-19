import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { qrUploadSession } from "~/lib/db/schema";
import {
  withRateLimit,
  getClientIp,
  defaultRateLimitConfigs,
} from "~/lib/rate-limit";

export async function POST(request: NextRequest) {
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

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingSession = await db.query.qrUploadSession.findFirst({
      where: (sessions, { eq, and, gt }) =>
        and(
          eq(sessions.userId, session.user.id),
          eq(sessions.isActive, true),
          gt(sessions.expiresAt, new Date()),
        ),
      orderBy: (sessions, { desc }) => [desc(sessions.createdAt)],
    });

    if (existingSession) {
      return NextResponse.json({
        id: existingSession.id,
        sessionToken: existingSession.sessionToken,
        expiresAt: existingSession.expiresAt,
      });
    }

    const sessionToken = nanoid(32);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const newSession = await db
      .insert(qrUploadSession)
      .values({
        id: nanoid(8),
        userId: session.user.id,
        sessionToken,
        expiresAt,
      })
      .returning();

    const qrSession = newSession[0];

    if (!qrSession) {
      return NextResponse.json(
        { error: "Failed to create QR session" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      id: qrSession.id,
      sessionToken: qrSession.sessionToken,
      expiresAt: qrSession.expiresAt,
    });
  } catch (error) {
    console.error("QR session creation error:", error);
    return NextResponse.json(
      { error: "Failed to create QR session" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
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

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activeSessions = await db.query.qrUploadSession.findMany({
      where: (sessions, { eq, and, gt }) =>
        and(
          eq(sessions.userId, session.user.id),
          eq(sessions.isActive, true),
          gt(sessions.expiresAt, new Date()),
        ),
      orderBy: (sessions, { desc }) => [desc(sessions.createdAt)],
    });

    return NextResponse.json({
      sessions: activeSessions,
    });
  } catch (error) {
    console.error("QR session fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch QR sessions" },
      { status: 500 },
    );
  }
}
