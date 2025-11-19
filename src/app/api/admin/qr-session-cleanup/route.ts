import { NextResponse } from "next/server";
import { cleanupExpiredQRSessions } from "~/lib/qr-session-cleanup";

/**
 * Cleanup endpoint for expired QR sessions
 * Can be called periodically by a cron job or external service
 *
 * To secure this endpoint, you can:
 * 1. Add a secret token in environment variables
 * 2. Check the authorization header in the request
 * 3. Use a service that verifies the source IP
 */
export async function POST() {
  try {
    const cleanedCount = await cleanupExpiredQRSessions();

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${cleanedCount} expired QR sessions`,
      cleanedCount,
    });
  } catch (error) {
    console.error("QR session cleanup error:", error);
    return NextResponse.json(
      { error: "Failed to cleanup QR sessions" },
      { status: 500 },
    );
  }
}
