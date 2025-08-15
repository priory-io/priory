import { NextRequest, NextResponse } from "next/server";
import { db } from "~/lib/db";
import { user } from "~/lib/db/schema";
import { auth } from "~/lib/auth";
import { eq } from "drizzle-orm";

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.delete(user).where(eq(user.id, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
