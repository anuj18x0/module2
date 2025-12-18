"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function BlogIndexPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      setLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/reports`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch reports: ${res.status}`);
      }
      
      const data = await res.json();
      // Sort by created_at descending (newest first)
      const sortedReports = data.reports.sort((a: any, b: any) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setReports(sortedReports);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white p-10 rounded-2xl shadow-2xl mb-12">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-5xl font-bold mb-3">📰 Market Reports</h1>
              <p className="text-blue-100 text-xl">
                Metro Vancouver Real Estate Insights & Analysis
              </p>
            </div>
            <Link
              href="/"
              className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition shadow-lg"
            >
              ← Dashboard
            </Link>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-8">
            <h3 className="text-red-800 font-bold text-lg mb-2">Error Loading Reports</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Reports Grid */}
        {reports.length === 0 && !error && (
          <div className="text-center bg-white p-16 rounded-2xl shadow-xl">
            <span className="text-6xl mb-4 block">📭</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No Reports Yet</h2>
            <p className="text-gray-600 mb-6">Generate your first market report from the dashboard!</p>
            <Link
              href="/"
              className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
            >
              Go to Dashboard
            </Link>
          </div>
        )}

        {reports.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => {
              const slug = `${report.month.toLowerCase()}-${report.year || report.data?.year || 2025}`;
              const date = new Date(report.created_at);
              
              return (
                <Link
                  key={report._id}
                  href={`/blog/${slug}`}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-indigo-400"
                >
                  {/* Card Header with Gradient */}
                  <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-5xl">📊</span>
                      <span className="bg-white text-indigo-600 px-3 py-1 rounded-full text-xs font-bold">
                        2025
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-blue-100 transition">
                      {report.month}
                    </h3>
                    <p className="text-indigo-200 text-sm mt-2">
                      Metro Vancouver Market Report
                    </p>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="text-lg">📅</span>
                        <span className="text-sm">
                          Published: {date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="text-lg">✅</span>
                        <span className="text-sm">
                          Status: {report.json_valid ? "Verified" : "Processing"}
                        </span>
                      </div>

                      {/* Quick Stats */}
                      {report.data?.property_types?.benchmark_prices && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-xs text-gray-500 mb-2">Benchmark Prices</p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="bg-blue-50 p-2 rounded text-center">
                              <p className="text-blue-900 font-bold">
                                ${(report.data.property_types.benchmark_prices.detached / 1000000).toFixed(2)}M
                              </p>
                              <p className="text-gray-600">Detached</p>
                            </div>
                            <div className="bg-purple-50 p-2 rounded text-center">
                              <p className="text-purple-900 font-bold">
                                ${(report.data.property_types.benchmark_prices.townhouse / 1000000).toFixed(2)}M
                              </p>
                              <p className="text-gray-600">Townhouse</p>
                            </div>
                            <div className="bg-green-50 p-2 rounded text-center">
                              <p className="text-green-900 font-bold">
                                ${(report.data.property_types.benchmark_prices.apartment / 1000).toFixed(0)}K
                              </p>
                              <p className="text-gray-600">Apartment</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Read More Button */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-indigo-600 font-semibold group-hover:text-indigo-700">
                        <span>Read Full Report</span>
                        <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
