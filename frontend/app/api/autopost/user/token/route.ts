import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/autopost-token-manager";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Get user and decrypted token by email
    const result = await getUserByEmail(email);

    if (!result) {
      return NextResponse.json(
        {
          error: "User not found or token expired",
          hasValidToken: false,
        },
        { status: 404 }
      );
    }

    const { user, accessToken, activePage } = result;

    return NextResponse.json({
      success: true,
      hasValidToken: true,
      accessToken: accessToken,
      user: {
        email: user.email,
        userName: user.userName,
        pageId: user.pageId,
        pageName: user.pageName,
        igBusinessId: user.igBusinessId,
        igUsername: user.igUsername,
        permissions: user.permissions,
        lastActivity: user.lastActivity,
      },
      activePage: activePage || null,
    });
  } catch (error: any) {
    console.error("Token retrieval error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve token", hasValidToken: false },
      { status: 500 }
    );
  }
}
