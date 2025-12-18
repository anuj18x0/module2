import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, caption, userEmail } = await req.json();

    if (!imageUrl || !caption || !userEmail) {
      return NextResponse.json(
        { error: "Missing required fields: imageUrl, caption, userEmail" },
        { status: 400 }
      );
    }

    // Get user's access token by email
    const tokenResponse = await fetch(`${req.nextUrl.origin}/api/autopost/user/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail }),
    });

    if (!tokenResponse.ok) {
      return NextResponse.json(
        { error: "No valid Meta token found. Please connect your Meta account first." },
        { status: 401 }
      );
    }

    const { accessToken, user, activePage } = await tokenResponse.json();

    // Use active page if available, otherwise fall back to user fields
    const pageId = activePage?.pageId || user.pageId;
    const pageToken = activePage?.pageToken || accessToken;

    if (!pageToken || !pageId) {
      return NextResponse.json(
        { error: "Invalid token or no Facebook page connected" },
        { status: 401 }
      );
    }

    // Get Page Access Token
    const pageTokenRes = await axios.get(
      `https://graph.facebook.com/v21.0/${pageId}?fields=access_token&access_token=${pageToken}`
    );

    const pageAccessToken = pageTokenRes.data.access_token;

    // Upload photo to Facebook
    let uploadRes;
    
    // Check if imageUrl is base64 or a URL
    if (imageUrl.startsWith('data:image')) {
      // Handle base64 image
      const base64Data = imageUrl.split(',')[1];
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      // Create form data for binary upload
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('source', imageBuffer, {
        filename: 'image.png',
        contentType: 'image/png',
      });
      formData.append('message', caption);
      formData.append('published', 'true');
      
      uploadRes = await axios.post(
        `https://graph.facebook.com/v21.0/${pageId}/photos`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${pageAccessToken}`,
          },
        }
      );
    } else {
      // Handle URL
      uploadRes = await axios.post(
        `https://graph.facebook.com/v21.0/${pageId}/photos`,
        {
          url: imageUrl,
          message: caption,
          published: true,
        },
        {
          headers: {
            Authorization: `Bearer ${pageAccessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Construct the post URL
    const postUrl = `https://www.facebook.com/${uploadRes.data.post_id}`;

    return NextResponse.json({
      success: true,
      postId: uploadRes.data.id,
      postUrl: postUrl,
      message: "Posted to Facebook successfully!",
    });
  } catch (error: any) {
    console.error("Facebook posting error:", error.response?.data || error);
    return NextResponse.json(
      {
        error: error.response?.data?.error?.message || "Failed to post to Facebook",
        details: error.response?.data,
      },
      { status: 500 }
    );
  }
}
