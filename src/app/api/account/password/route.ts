import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/lib/auth";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long" },
        { status: 400 },
      );
    }

    try {
      await auth.api.changePassword({
        body: {
          currentPassword,
          newPassword,
        },
        headers: req.headers,
      });

      return NextResponse.json({ success: true });
    } catch (authError) {
      if (authError instanceof Error) {
        if (authError.message.includes("Invalid password")) {
          return NextResponse.json(
            { error: "Current password is incorrect" },
            { status: 400 },
          );
        }
        if (
          authError.message.includes("Password authentication not available")
        ) {
          return NextResponse.json(
            { error: "Password authentication not available for this account" },
            { status: 400 },
          );
        }
      }
      throw authError;
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
