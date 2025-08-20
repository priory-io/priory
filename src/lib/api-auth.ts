import { NextRequest } from "next/server";
import { db } from "~/lib/db";
import { apiKey, user } from "~/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createHash } from "crypto";

export interface ApiKeyAuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  permissions?: string[];
  error?: string;
}

export async function authenticateApiKey(
  request: NextRequest,
  requiredPermission?: string,
): Promise<ApiKeyAuthResult> {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { success: false, error: "No API key provided" };
  }

  const apiKeyValue = authHeader.substring(7);

  if (!apiKeyValue.startsWith("pk_")) {
    return { success: false, error: "Invalid API key format" };
  }

  try {
    const hashedKey = createHash("sha256").update(apiKeyValue).digest("hex");

    const result = await db
      .select({
        apiKey: {
          id: apiKey.id,
          userId: apiKey.userId,
          permissions: apiKey.permissions,
          isActive: apiKey.isActive,
          expiresAt: apiKey.expiresAt,
        },
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      })
      .from(apiKey)
      .innerJoin(user, eq(apiKey.userId, user.id))
      .where(and(eq(apiKey.hashedKey, hashedKey), eq(apiKey.isActive, true)))
      .limit(1);

    if (result.length === 0) {
      return { success: false, error: "Invalid API key" };
    }

    const { apiKey: keyData, user: userData } = result[0]!;

    if (keyData.expiresAt && new Date() > keyData.expiresAt) {
      return { success: false, error: "API key has expired" };
    }

    if (
      requiredPermission &&
      !keyData.permissions.includes(requiredPermission)
    ) {
      return { success: false, error: "Insufficient permissions" };
    }

    await db
      .update(apiKey)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKey.id, keyData.id));

    return {
      success: true,
      user: userData,
      permissions: keyData.permissions,
    };
  } catch (error) {
    console.error("API key authentication error:", error);
    return { success: false, error: "Authentication failed" };
  }
}
