import { NextRequest, NextResponse } from "next/server";
import { db } from "~/lib/db";
import { userPreferences } from "~/lib/db/schema";
import { auth } from "~/lib/auth";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const preferences = await db
      .select({
        theme: userPreferences.theme,
        language: userPreferences.language,
        timezone: userPreferences.timezone,
        compactMode: userPreferences.compactMode,
        autoSave: userPreferences.autoSave,
        showAnalytics: userPreferences.showAnalytics,
      })
      .from(userPreferences)
      .where(eq(userPreferences.userId, session.user.id))
      .limit(1);

    if (!preferences.length) {
      const defaultPreferences = {
        theme: "system",
        language: "en",
        timezone: "UTC",
        compactMode: false,
        autoSave: true,
        showAnalytics: true,
      };

      await db.insert(userPreferences).values({
        id: nanoid(),
        userId: session.user.id,
        ...defaultPreferences,
      });

      return NextResponse.json(defaultPreferences);
    }

    return NextResponse.json(preferences[0]);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { theme, language, timezone, compactMode, autoSave, showAnalytics } =
      body;

    const updateData: any = { updatedAt: new Date() };
    if (theme !== undefined) updateData.theme = theme;
    if (language !== undefined) updateData.language = language;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (compactMode !== undefined) updateData.compactMode = compactMode;
    if (autoSave !== undefined) updateData.autoSave = autoSave;
    if (showAnalytics !== undefined) updateData.showAnalytics = showAnalytics;

    const existing = await db
      .select({ id: userPreferences.id })
      .from(userPreferences)
      .where(eq(userPreferences.userId, session.user.id))
      .limit(1);

    if (!existing.length) {
      await db.insert(userPreferences).values({
        id: nanoid(),
        userId: session.user.id,
        theme: theme || "system",
        language: language || "en",
        timezone: timezone || "UTC",
        compactMode: compactMode || false,
        autoSave: autoSave !== undefined ? autoSave : true,
        showAnalytics: showAnalytics !== undefined ? showAnalytics : true,
      });
    } else {
      await db
        .update(userPreferences)
        .set(updateData)
        .where(eq(userPreferences.userId, session.user.id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
