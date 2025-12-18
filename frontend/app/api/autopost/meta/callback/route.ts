import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForToken,
  getUserInfo,
  getUserPages,
  storeUserToken,
} from "@/lib/autopost-token-manager";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const stateParam = searchParams.get("state");

    // Parse state to get email and returnUrl
    let email: string;
    let returnUrl = "/";
    
    try {
      const stateData = JSON.parse(decodeURIComponent(stateParam || ""));
      email = stateData.email;
      returnUrl = stateData.returnUrl || "/";
    } catch (e) {
      // Fallback: treat state as just email (backward compatibility)
      email = stateParam || "";
    }

    if (error) {
      return NextResponse.redirect(
        `${req.nextUrl.origin}${returnUrl}?error=${encodeURIComponent(error)}`
      );
    }

    if (!code) {
      return NextResponse.json({ error: "No authorization code received" }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: "No email provided" }, { status: 400 });
    }

    // Exchange code for long-lived token
    const { accessToken } = await exchangeCodeForToken(code);

    // Get user info
    const userInfo = await getUserInfo(accessToken);

    // Get user's Facebook pages
    const pages = await getUserPages(accessToken);

    if (pages.length === 0) {
      return NextResponse.redirect(
        `${req.nextUrl.origin}/?error=no_pages_found`
      );
    }

    // Use first page by default
    const firstPage = pages[0];
    const igAccount = firstPage.instagram_business_account;

    // Store user token in database
    await storeUserToken(email, {
      accessToken,
      pageId: firstPage.id,
      pageName: firstPage.name,
      igBusinessId: igAccount?.id,
      igUsername: igAccount?.username,
      userName: userInfo.name,
      metaUserId: userInfo.id,
      permissions: userInfo.permissions?.data?.map((p: any) => p.permission) || [],
    });

    // Redirect back to the original page with success
    return NextResponse.redirect(
      `${req.nextUrl.origin}${returnUrl}?meta_connected=true&page=${encodeURIComponent(firstPage.name)}`
    );
  } catch (error: any) {
    console.error("Meta OAuth callback error:", error);
    // Try to get returnUrl from state if available
    const stateParam = new URL(req.url).searchParams.get("state");
    let returnUrl = "/";
    try {
      const stateData = JSON.parse(decodeURIComponent(stateParam || ""));
      returnUrl = stateData.returnUrl || "/";
    } catch (e) {
      // Ignore parse error
    }
    return NextResponse.redirect(
      `${req.nextUrl.origin}${returnUrl}?error=${encodeURIComponent(error.message || "auth_failed")}`
    );
  }
}
