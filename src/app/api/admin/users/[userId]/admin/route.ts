import { NextRequest, NextResponse } from "next/server";
import { db } from "~/lib/db";
import { user } from "~/lib/db/schema";
import { auth } from "~/lib/auth";
import { requireAdmin } from "~/lib/admin";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requireAdmin(session.user.id);

    const { isAdmin } = await req.json();
    const { userId } = params;

    if (session.user.id === userId) {
      return NextResponse.json(
        { error: "Cannot modify your own admin status" },
        { status: 400 },
      );
    }

    await db.update(user).set({ isAdmin }).where(eq(user.id, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Admin access required") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
