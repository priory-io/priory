import { eq } from "drizzle-orm";
import { db } from "~/lib/db";
import { user } from "~/lib/db/schema";

export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const result = await db
      .select({ isAdmin: user.isAdmin })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    return result[0]?.isAdmin ?? false;
  } catch {
    return false;
  }
}

export async function requireAdmin(userId: string): Promise<void> {
  const admin = await isUserAdmin(userId);
  if (!admin) {
    throw new Error("Admin access required");
  }
}
