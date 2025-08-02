import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const pendingInviteCode = req.cookies.get("pendingInviteCode")?.value;

    if (pendingInviteCode) {
      const response = NextResponse.json({ inviteCode: pendingInviteCode });
      response.cookies.delete("pendingInviteCode");
      return response;
    }

    return NextResponse.json({ inviteCode: null });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
