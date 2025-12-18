"use client";

import { useState, useEffect } from "react";

interface AutopostButtonProps {
  post: string;
  reportMonth: string;
  userEmail?: string;
}

export default function AutopostButton({ post, reportMonth, userEmail }: AutopostButtonProps) {
  const [posting, setPosting] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; postUrl?: string } | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(false);

  // Check connection status when email changes
  async function checkConnection() {
    if (!userEmail) {
      setIsConnected(false);
      return;
    }

    setCheckingConnection(true);
    try {
      const response = await fetch("/api/autopost/user/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsConnected(!!data.accessToken);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      setIsConnected(false);
    } finally {
      setCheckingConnection(false);
    }
  }

  // Check connection on mount and when email changes
  useEffect(() => {
    checkConnection();
  }, [userEmail]);

  async function handleAutopost() {
    if (!userEmail) {
      alert("Please set your email in settings to use autopost");
      return;
    }

    setPosting(true);
    setResult(null);

    try {
      // For demo, using a placeholder image. In production, generate image from report data
      const imageUrl = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200";

      const response = await fetch("/api/autopost/social/publish-facebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          caption: post,
          userEmail,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({ 
          success: true, 
          message: "Posted to Facebook successfully!",
          postUrl: data.postUrl 
        });
      } else {
        setResult({ success: false, message: data.error || "Failed to post" });
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || "Network error" });
    } finally {
      setPosting(false);
    }
  }

  function handleConnect() {
    if (!userEmail) {
      alert("Please set your email first");
      return;
    }

    const appId = process.env.NEXT_PUBLIC_META_APP_ID;
    const redirectUri = encodeURIComponent(process.env.NEXT_PUBLIC_META_REDIRECT_URI || "");
    const scope = "pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish";

    // Store current URL to return after OAuth
    const returnUrl = window.location.pathname;
    const stateData = JSON.stringify({ email: userEmail, returnUrl });
    const encodedState = encodeURIComponent(stateData);

    const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&state=${encodedState}&response_type=code`;

    window.location.href = authUrl;
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={handleAutopost}
          disabled={posting}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-semibold text-sm flex items-center justify-center gap-2"
        >
          {posting ? (
            <>
              <span className="animate-spin">⏳</span>
              Posting...
            </>
          ) : (
            <>
              <span>📤</span>
              Auto-Post to Facebook
            </>
          )}
        </button>

        <button
          onClick={handleConnect}
          disabled={isConnected || checkingConnection}
          className={`px-4 py-2 rounded-lg transition font-semibold text-sm ${
            isConnected
              ? "bg-green-600 text-white cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
          title={isConnected ? "Meta Account Connected" : "Connect Meta Account"}
        >
          {checkingConnection ? (
            <>⏳ Checking...</>
          ) : isConnected ? (
            <>✅ Connected</>
          ) : (
            <>🔗 Connect</>
          )}
        </button>
      </div>

      {result && (
        <div
          className={`p-3 rounded-lg text-sm ${
            result.success
              ? "bg-green-50 border border-green-500 text-green-800"
              : "bg-red-50 border border-red-500 text-red-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <span>
              {result.success ? "✅" : "❌"} {result.message}
            </span>
            {result.postUrl && (
              <a
                href={result.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition font-semibold text-xs"
              >
                🔗 View Post
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
