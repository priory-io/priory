import { lt, and, eq } from "drizzle-orm";
import { db } from "~/lib/db";
import { qrUploadSession } from "~/lib/db/schema";

/**
 * Cleans up expired QR upload sessions from the database
 * Deletes all sessions where expiresAt is in the past
 */
export async function cleanupExpiredQRSessions(): Promise<number> {
  try {
    const now = new Date();

    const result = await db
      .delete(qrUploadSession)
      .where(lt(qrUploadSession.expiresAt, now))
      .returning();

    console.log(`Cleaned up ${result.length} expired QR sessions`);
    return result.length;
  } catch (error) {
    console.error("Failed to cleanup expired QR sessions:", error);
    throw error;
  }
}

/**
 * Deactivates all expired sessions without deleting them (for audit trail)
 */
export async function deactivateExpiredQRSessions(): Promise<number> {
  try {
    const now = new Date();

    const result = await db
      .update(qrUploadSession)
      .set({ isActive: false })
      .where(
        and(
          lt(qrUploadSession.expiresAt, now),
          eq(qrUploadSession.isActive, true),
        ),
      )
      .returning();

    console.log(`Deactivated ${result.length} expired QR sessions`);
    return result.length;
  } catch (error) {
    console.error("Failed to deactivate expired QR sessions:", error);
    throw error;
  }
}
