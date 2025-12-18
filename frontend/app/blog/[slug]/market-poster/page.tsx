"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import MarketPoster from "@/components/MarketPoster";

export default function MarketPosterPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReport();
  }, [slug]);

  async function fetchReport() {
    try {
      setLoading(true);
      const parts = slug.split("-");
      const month = parts[0];
      const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/reports/${capitalizedMonth}`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch report: ${res.status}`);
      }
      
      const data = await res.json();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load report");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading poster...</p>
        </div>
      </div>
    );
  }

  if (error || !report?.data?.visual_infographic_data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-10 rounded-2xl shadow-xl max-w-md">
          <span className="text-6xl">❌</span>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Data Not Available</h2>
          <p className="text-gray-600 mt-2">{error || "Visual infographic data not found"}</p>
          <button
            onClick={() => router.push(`/blog/${slug}`)}
            className="mt-6 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
          >
            ← Back to Report
          </button>
        </div>
      </div>
    );
  }

  const visualData = report.data.visual_infographic_data;
  
  // Transform data for MarketPoster component
  const metrics = visualData.poster_metrics || visualData.main_statistics?.map((stat: any) => ({
    label: stat.label,
    value: stat.current,
    change: `${stat.pct_change > 0 ? '+' : ''}${stat.pct_change}%`,
    positive: stat.pct_change >= 0
  })) || [];

  const benchmarkText = visualData.benchmark_price_narratives?.map((item: any) => 
    `${item.type}: At ${item.price}, the ${item.description}`
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Social Media Poster</h1>
            <p className="text-gray-300 mt-1">{report.month} {report.data?.year || report.year}</p>
          </div>
          <button
            onClick={() => router.push(`/blog/${slug}`)}
            className="px-6 py-3 bg-white text-pink-600 font-semibold rounded-lg shadow-md hover:shadow-lg transition"
          >
            ← Back to Report
          </button>
        </div>

        {/* Poster */}
        <div className="flex justify-center">
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
            <MarketPoster
              region={visualData.location_title || "GREATER VANCOUVER"}
              month={`${report.month.toUpperCase()} ${report.data?.year || report.year}`}
              metrics={metrics.slice(0, 4)} // Take first 4 metrics
              benchmarkText={benchmarkText}
            />
          </div>
        </div>

        {/* Download Options */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Export Options</h3>
          <p className="text-gray-600 mb-4">Perfect for Instagram posts, Facebook stories, and LinkedIn updates</p>
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition font-semibold">
              📸 Download for Instagram (1080x1350)
            </button>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
              📘 Download for Facebook (1200x1500)
            </button>
            <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold">
              💼 Download for LinkedIn (1200x1500)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
