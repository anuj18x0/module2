"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import AutopostButton from "@/components/AutopostButton";

export default function BlogReportPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [year, setYear] = useState("2025");

  useEffect(() => {
    fetchReport();
  }, [slug]);

  async function fetchReport() {
    try {
      setLoading(true);
      // Convert slug like "november-2025" to "November" and extract year
      const parts = slug.split("-");
      const month = parts[0];
      const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
      const extractedYear = parts[1] || "2025";
      setYear(extractedYear);
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/reports/${capitalizedMonth}`);
      
      if (!res.ok) {
        if (res.status === 404) {
          setError(`Report not found for ${capitalizedMonth}`);
        } else {
          throw new Error(`Failed to fetch report: ${res.status}`);
        }
        return;
      }
      
      const data = await res.json();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load report");
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
          <p className="mt-4 text-gray-600 text-lg">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white p-10 rounded-2xl shadow-xl max-w-md">
          <span className="text-6xl">❌</span>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Report Not Found</h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <button
            onClick={() => router.push("/blog")}
            className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            ← Back to All Reports
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const reportData = report.data || {};
  const summary = reportData.executive_summary || "";
  const benchmarkTable = reportData.benchmark_table || "";
  const cityDetailTable = reportData.city_detail_table || "";
  const propertyTypeTable = reportData.property_type_detail_table || "";
  const facebookPosts = reportData.facebook_posts || [];
  const newsletterArticle = reportData.newsletter_article || "";
  const buyerInsights = reportData.buyer_insights || "";
  const sellerInsights = reportData.seller_insights || "";
  const investmentAnalysis = reportData.investment_analysis || "";
  const realtorTalkingPoints = reportData.realtor_talking_points || [];
  const marketPredictions = reportData.market_predictions || "";

  // Chart data
  const propertyTypes = reportData.property_types || {};
  const benchmarkPrices = propertyTypes.benchmark_prices || {};
  const cityBenchmarks = reportData.city_benchmarks || {};
  const percentageChanges = reportData.percentage_changes || {};

  const priceData = Object.keys(benchmarkPrices).length > 0 ? [
    { type: "Detached", price: benchmarkPrices.detached || 0 },
    { type: "Townhouse", price: benchmarkPrices.townhouse || 0 },
    { type: "Apartment", price: benchmarkPrices.apartment || 0 },
  ] : [];

  const cityData = Object.entries(cityBenchmarks).map(([city, price]: any) => ({
    city: city.replace(/_/g, " "),
    price,
  })).slice(0, 8);

  const changeData = Object.keys(percentageChanges).length > 0 ? [
    { period: "1 Month", change: percentageChanges.moM || 0 },
    { period: "3 Months", change: percentageChanges.qoQ || 0 },
    { period: "6 Months", change: percentageChanges.six_month || 0 },
    { period: "1 Year", change: percentageChanges.one_year || 0 },
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="p-8 max-w-6xl mx-auto">
        {/* Header with Navigation */}
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white p-10 rounded-2xl shadow-2xl mb-12">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-5xl font-bold mb-3">📰 {report.month} {report.data?.year || year} Market Report</h1>
              <p className="text-blue-100 text-xl">
                Metro Vancouver Real Estate Insights
              </p>
            </div>
            <button
              onClick={() => router.push("/blog")}
              className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition shadow-lg"
            >
              ← All Reports
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-12">
          {/* Executive Summary */}
          {summary && (
            <section className="bg-white rounded-2xl shadow-xl p-10 border-l-4 border-indigo-600">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-4xl">📋</span>
                Executive Summary
              </h2>
              <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed [&_*]:text-gray-800 [&_h1]:text-gray-900 [&_h2]:text-gray-900 [&_h3]:text-gray-800 [&_p]:text-gray-700 [&_p]:leading-relaxed [&_p]:mb-4 [&_li]:text-gray-700 [&_li]:mb-2 [&_ul]:space-y-2 [&_strong]:text-gray-900 [&_table]:border-collapse [&_table]:w-full [&_table]:my-6 [&_thead]:bg-indigo-600 [&_thead]:text-white [&_tbody_tr:nth-child(odd)]:bg-white [&_tbody_tr:nth-child(even)]:bg-gray-50 [&_td]:border [&_td]:border-gray-300 [&_td]:px-4 [&_td]:py-3 [&_td]:text-black [&_th]:border [&_th]:border-gray-300 [&_th]:px-4 [&_th]:py-3 [&_th]:font-semibold">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {summary}
                </ReactMarkdown>
              </div>
            </section>
          )}

          {/* Charts Section */}
          {(priceData.length > 0 || cityData.length > 0 || changeData.length > 0) && (
            <section className="bg-white rounded-2xl shadow-xl p-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <span className="text-4xl">📊</span>
                Market Analytics
              </h2>
              
              <div className="space-y-10">
                {/* Price Changes Chart */}
                {changeData.length > 0 && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">📈 Price Changes Over Time</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={changeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                        <XAxis dataKey="period" stroke="#4f46e5" style={{ fontSize: '14px', fontWeight: 500 }} />
                        <YAxis stroke="#4f46e5" style={{ fontSize: '14px' }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', border: '2px solid #4f46e5', borderRadius: '8px' }}
                          formatter={(value) => `${value}%`} 
                        />
                        <Line type="monotone" dataKey="change" stroke="#4f46e5" strokeWidth={3} dot={{ fill: '#4f46e5', r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Property Type Prices Chart */}
                {priceData.length > 0 && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-xl">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">🏠 Benchmark Prices by Property Type</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={priceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
                        <XAxis dataKey="type" stroke="#9333ea" style={{ fontSize: '14px', fontWeight: 500 }} />
                        <YAxis stroke="#9333ea" style={{ fontSize: '14px' }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', border: '2px solid #9333ea', borderRadius: '8px' }}
                          formatter={(value) => `$${(value as number).toLocaleString()}`} 
                        />
                        <Bar dataKey="price" fill="#9333ea" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* City Benchmarks Chart */}
                {cityData.length > 0 && (
                  <div className="bg-gradient-to-br from-green-50 to-teal-50 p-8 rounded-xl">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">🏙️ Top Cities by Benchmark Price</h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={cityData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                        <XAxis type="number" stroke="#059669" style={{ fontSize: '14px' }} />
                        <YAxis dataKey="city" type="category" width={120} stroke="#059669" style={{ fontSize: '13px', fontWeight: 500 }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', border: '2px solid #059669', borderRadius: '8px' }}
                          formatter={(value) => `$${(value as number).toLocaleString()}`} 
                        />
                        <Bar dataKey="price" fill="#059669" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Detailed Tables */}
          <div className="grid lg:grid-cols-1 gap-8">
            {benchmarkTable && (
              <section className="bg-white rounded-2xl shadow-xl p-10 border-l-4 border-blue-600">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="text-3xl">📊</span>
                  Comprehensive Benchmark Data
                </h2>
                <div className="overflow-x-auto [&_table]:w-full [&_table]:border-collapse [&_thead]:bg-blue-600 [&_thead]:text-white [&_tbody_tr:nth-child(odd)]:bg-white [&_tbody_tr:nth-child(even)]:bg-blue-50 [&_td]:border [&_td]:border-gray-300 [&_td]:px-4 [&_td]:py-3 [&_td]:text-black [&_th]:border [&_th]:border-gray-300 [&_th]:px-4 [&_th]:py-3 [&_th]:font-semibold [&_th]:text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {benchmarkTable}
                  </ReactMarkdown>
                </div>
              </section>
            )}

            {cityDetailTable && (
              <section className="bg-white rounded-2xl shadow-xl p-10 border-l-4 border-purple-600">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="text-3xl">🏙️</span>
                  City Performance Metrics
                </h2>
                <div className="overflow-x-auto [&_table]:w-full [&_table]:border-collapse [&_thead]:bg-purple-600 [&_thead]:text-white [&_tbody_tr:nth-child(odd)]:bg-white [&_tbody_tr:nth-child(even)]:bg-purple-50 [&_td]:border [&_td]:border-gray-300 [&_td]:px-4 [&_td]:py-3 [&_td]:text-black [&_th]:border [&_th]:border-gray-300 [&_th]:px-4 [&_th]:py-3 [&_th]:font-semibold [&_th]:text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {cityDetailTable}
                  </ReactMarkdown>
                </div>
              </section>
            )}

            {propertyTypeTable && (
              <section className="bg-white rounded-2xl shadow-xl p-10 border-l-4 border-green-600">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="text-3xl">🏘️</span>
                  Property Type Analysis
                </h2>
                <div className="overflow-x-auto [&_table]:w-full [&_table]:border-collapse [&_thead]:bg-green-600 [&_thead]:text-white [&_tbody_tr:nth-child(odd)]:bg-white [&_tbody_tr:nth-child(even)]:bg-green-50 [&_td]:border [&_td]:border-gray-300 [&_td]:px-4 [&_td]:py-3 [&_td]:text-black [&_th]:border [&_th]:border-gray-300 [&_th]:px-4 [&_th]:py-3 [&_th]:font-semibold [&_th]:text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {propertyTypeTable}
                  </ReactMarkdown>
                </div>
              </section>
            )}
          </div>

          {/* Newsletter Article - Featured */}
          {newsletterArticle && (
            <section className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-2xl p-12 border-4 border-indigo-300">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-5xl">📰</span>
                <h2 className="text-4xl font-bold text-white">Featured Newsletter</h2>
              </div>
              <div className="bg-white rounded-xl p-10 prose prose-lg max-w-none [&_*]:text-gray-800 [&_h1]:text-gray-900 [&_h2]:text-gray-900 [&_h2]:text-3xl [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-gray-800 [&_h3]:text-xl [&_p]:text-gray-700 [&_p]:leading-relaxed [&_p]:mb-6 [&_li]:text-gray-700 [&_li]:mb-2 [&_ul]:space-y-2 [&_strong]:text-gray-900 [&_strong]:font-bold [&_table]:border-collapse [&_table]:w-full [&_table]:my-8 [&_thead]:bg-indigo-600 [&_thead]:text-white [&_tbody_tr:nth-child(odd)]:bg-white [&_tbody_tr:nth-child(even)]:bg-indigo-50 [&_td]:border [&_td]:border-gray-300 [&_td]:px-4 [&_td]:py-3 [&_td]:text-black [&_th]:border [&_th]:border-gray-300 [&_th]:px-4 [&_th]:py-3 [&_th]:font-semibold">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {newsletterArticle}
                </ReactMarkdown>
              </div>
            </section>
          )}

          {/* Buyer & Seller Insights */}
          <div className="grid lg:grid-cols-2 gap-8">
            {buyerInsights && (
              <section className="bg-white rounded-2xl shadow-xl p-10 border-l-4 border-blue-600">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="text-3xl">🏠</span>
                  Buyer Insights
                </h2>
                <div className="prose prose-lg max-w-none [&_*]:text-gray-800 [&_h1]:text-gray-900 [&_h2]:text-gray-900 [&_h3]:text-gray-800 [&_p]:text-gray-700 [&_p]:leading-relaxed [&_p]:mb-4 [&_li]:text-gray-700 [&_li]:mb-2 [&_ul]:space-y-2 [&_strong]:text-gray-900 [&_table]:border-collapse [&_table]:w-full [&_table]:my-6 [&_thead]:bg-blue-600 [&_thead]:text-white [&_tbody_tr:nth-child(odd)]:bg-white [&_tbody_tr:nth-child(even)]:bg-blue-50 [&_td]:border [&_td]:border-gray-300 [&_td]:px-4 [&_td]:py-3 [&_td]:text-black [&_th]:border [&_th]:border-gray-300 [&_th]:px-4 [&_th]:py-3 [&_th]:font-semibold">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {buyerInsights}
                  </ReactMarkdown>
                </div>
              </section>
            )}

            {sellerInsights && (
              <section className="bg-white rounded-2xl shadow-xl p-10 border-l-4 border-orange-600">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="text-3xl">💼</span>
                  Seller Insights
                </h2>
                <div className="prose prose-lg max-w-none [&_*]:text-gray-800 [&_h1]:text-gray-900 [&_h2]:text-gray-900 [&_h3]:text-gray-800 [&_p]:text-gray-700 [&_p]:leading-relaxed [&_p]:mb-4 [&_li]:text-gray-700 [&_li]:mb-2 [&_ul]:space-y-2 [&_strong]:text-gray-900 [&_table]:border-collapse [&_table]:w-full [&_table]:my-6 [&_thead]:bg-orange-600 [&_thead]:text-white [&_tbody_tr:nth-child(odd)]:bg-white [&_tbody_tr:nth-child(even)]:bg-orange-50 [&_td]:border [&_td]:border-gray-300 [&_td]:px-4 [&_td]:py-3 [&_td]:text-black [&_th]:border [&_th]:border-gray-300 [&_th]:px-4 [&_th]:py-3 [&_th]:font-semibold">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {sellerInsights}
                  </ReactMarkdown>
                </div>
              </section>
            )}
          </div>

          {/* Investment Analysis */}
          {investmentAnalysis && (
            <section className="bg-white rounded-2xl shadow-xl p-10 border-l-4 border-emerald-600">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">💰</span>
                Investment Analysis
              </h2>
              <div className="prose prose-lg max-w-none [&_*]:text-gray-800 [&_h1]:text-gray-900 [&_h2]:text-gray-900 [&_h3]:text-gray-800 [&_p]:text-gray-700 [&_p]:leading-relaxed [&_p]:mb-4 [&_li]:text-gray-700 [&_li]:mb-2 [&_ul]:space-y-2 [&_strong]:text-gray-900 [&_table]:border-collapse [&_table]:w-full [&_table]:my-6 [&_thead]:bg-emerald-600 [&_thead]:text-white [&_tbody_tr:nth-child(odd)]:bg-white [&_tbody_tr:nth-child(even)]:bg-emerald-50 [&_td]:border [&_td]:border-gray-300 [&_td]:px-4 [&_td]:py-3 [&_td]:text-black [&_th]:border [&_th]:border-gray-300 [&_th]:px-4 [&_th]:py-3 [&_th]:font-semibold">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {investmentAnalysis}
                </ReactMarkdown>
              </div>
            </section>
          )}

          {/* Realtor Talking Points */}
          {realtorTalkingPoints.length > 0 && (
            <section className="bg-white rounded-2xl shadow-xl p-10 border-l-4 border-purple-600">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">🎯</span>
                Realtor Talking Points
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {realtorTalkingPoints.map((point: string, idx: number) => (
                  <div key={idx} className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-500 shadow-sm">
                    <div className="flex gap-3">
                      <span className="text-purple-600 font-bold text-lg flex-shrink-0">{idx + 1}.</span>
                      <p className="text-gray-800 leading-relaxed">{point}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Market Predictions */}
          {marketPredictions && (
            <section className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl shadow-xl p-10 border-l-4 border-amber-600">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">🔮</span>
                Market Predictions & Outlook
              </h2>
              <div className="prose prose-lg max-w-none [&_*]:text-gray-800 [&_h1]:text-gray-900 [&_h2]:text-gray-900 [&_h3]:text-gray-800 [&_p]:text-gray-700 [&_p]:leading-relaxed [&_p]:mb-4 [&_li]:text-gray-700 [&_li]:mb-2 [&_ul]:space-y-2 [&_strong]:text-gray-900">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {marketPredictions}
                </ReactMarkdown>
              </div>
            </section>
          )}

          {/* Facebook Posts */}
          {facebookPosts.length > 0 && (
            <section className="bg-white rounded-2xl shadow-xl p-10 border-l-4 border-blue-500">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">👥</span>
                Social Media Content
              </h2>
              <div className="space-y-4">
                {facebookPosts.map((post: string, idx: number) => (
                  <div key={idx} className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-500 shadow-sm">
                    <p className="text-gray-800 leading-relaxed">{post}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Auto-Post to Facebook */}
          {facebookPosts.length > 0 && (
            <section className="bg-white rounded-2xl shadow-xl p-10 border-l-4 border-blue-600">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">📤</span>
                Auto-Post to Facebook
              </h2>
              
              {/* Email Input */}
              <div className="mb-6 bg-blue-50 p-6 rounded-xl border border-blue-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Email (for Meta authentication)
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
                <p className="text-xs text-gray-600 mt-2">
                  💡 Enter your email to connect your Meta account and auto-post these messages
                </p>
              </div>

              {/* Social Media Posts with Autopost Buttons */}
              <div className="space-y-4">
                {facebookPosts.map((post: string, idx: number) => (
                  <div key={idx} className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-sm">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 font-semibold mb-2">Post {idx + 1}</p>
                        <p className="text-gray-800 leading-relaxed mb-4">{post}</p>
                      </div>
                    </div>
                    <AutopostButton
                      post={post}
                      reportMonth={report.month}
                      userEmail={userEmail}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Visual Infographics */}
          {reportData.visual_infographic_data && (
            <section className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl p-10">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-4xl">🎨</span>
                Visual Infographics
              </h2>
              <p className="text-purple-100 mb-8 text-lg">
                Export professional market infographics for social media, presentations, and marketing materials.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <button
                  onClick={() => router.push(`/blog/${slug}/market-update`)}
                  className="bg-white text-purple-700 px-8 py-6 rounded-xl font-bold text-lg hover:bg-purple-50 transition shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">📊</span>
                  <div className="text-left">
                    <div>Market Update Infographic</div>
                    <div className="text-sm font-normal text-purple-600">Full detailed report with stats</div>
                  </div>
                </button>
                <button
                  onClick={() => router.push(`/blog/${slug}/market-poster`)}
                  className="bg-white text-pink-700 px-8 py-6 rounded-xl font-bold text-lg hover:bg-pink-50 transition shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">🖼️</span>
                  <div className="text-left">
                    <div>Social Media Poster</div>
                    <div className="text-sm font-normal text-pink-600">Optimized for Instagram/Facebook</div>
                  </div>
                </button>
              </div>
            </section>
          )}

          {/* Report Metadata */}
          <section className="bg-gradient-to-r from-indigo-100 to-blue-100 rounded-2xl p-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-indigo-600">
                <h4 className="text-sm font-semibold text-indigo-900 mb-2">📅 Report Month</h4>
                <p className="text-2xl font-bold text-indigo-600">{report.month} {report.data?.year || year}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-600">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">📅 Published</h4>
                <p className="text-lg font-bold text-blue-600">
                  {new Date(report.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-600">
                <h4 className="text-sm font-semibold text-green-900 mb-2">✅ Data Status</h4>
                <p className="text-lg font-bold text-green-600">
                  {report.json_valid ? "Verified" : "Processing"}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
