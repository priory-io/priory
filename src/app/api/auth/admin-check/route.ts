import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { isUserAdmin } from "~/lib/admin";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await isUserAdmin(session.user.id);

    return NextResponse.json({ isAdmin: admin });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
