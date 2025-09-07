import { NextRequest, NextResponse } from "next/server";
import { db } from "~/lib/db";
import { user } from "~/lib/db/schema";
import { auth } from "~/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        emailVerified: user.emailVerified,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!userData.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(userData[0]);
  } catch (error) {
    console.error(error);
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
    const { name, email } = body;

    if (!name && !email) {
      return NextResponse.json(
        { error: "At least one field (name or email) is required" },
        { status: 400 },
      );
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) {
      updateData.email = email;
      updateData.emailVerified = false;
    }

    await db.update(user).set(updateData).where(eq(user.id, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("duplicate key")) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
