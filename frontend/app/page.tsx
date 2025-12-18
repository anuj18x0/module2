"use client";

import { useState } from "react";
import Link from "next/link";
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
  Legend,
} from "recharts";

export default function HomePage() {
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [infographicLoading, setInfographicLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [infographicResult, setInfographicResult] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [infographicError, setInfographicError] = useState<string>("");

  const months = [
    "November",
    "October",
    "September",
    "August",
    "July",
    "June",
    "May",
    "April",
    "March",
    "February",
    "January",
  ];

  const years = [
    "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015"
  ]

  async function handleProceed() {
    if ((!selectedMonth) || (!selectedYear)) return;

    setLoading(true);
    setError("");

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: selectedMonth, year: selectedYear }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleInfographic() {
    if ((!selectedMonth) || (!selectedYear)) return;

    setInfographicLoading(true);
    setInfographicError("");

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/infographic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: selectedMonth, year: selectedYear }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      setInfographicResult(data);
    } catch (err) {
      setInfographicError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setInfographicLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-8 rounded-lg shadow-lg mb-8">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                🏠 Greater Vancouver Market Report
              </h1>
              <p className="text-indigo-100 text-lg">
                Real estate insights powered by AI analysis
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/cities-comparison"
                className="px-4 py-2 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition shadow-sm"
              >
                🏙️ Compare Cities
              </Link>
              <Link
                href="/blog"
                className="px-4 py-2 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition shadow-sm"
              >
                📰 View Blog
              </Link>
            </div>
          </div>
        </div>

        {/* Month Selector */}
        <div className="flex gap-4 items-center mb-8 bg-white p-4 rounded-lg shadow-md border-l-4 border-indigo-600">
          <select
            className="border-2 border-indigo-300 p-3 rounded-lg focus:outline-none focus:border-indigo-600 bg-white text-black font-medium"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="">Select Month</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            className="border-2 border-indigo-300 p-3 rounded-lg focus:outline-none focus:border-indigo-600 bg-white text-black font-medium"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">Select Year</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button
            onClick={handleProceed}
            disabled={!selectedMonth || !selectedYear || loading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-md"
          >
            {loading ? "⏳ Processing..." : "📊 Analyze Report"}
          </button>

          <button
            onClick={handleInfographic}
            disabled={!selectedMonth || !selectedYear || infographicLoading}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-md"
          >
            {infographicLoading ? "⏳ Creating..." : "🎨 Create Infographic"}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-400 text-red-800 p-4 rounded-lg mb-8 font-semibold">
            ❌ Error: {error}
          </div>
        )}

        {infographicError && (
          <div className="bg-red-50 border-2 border-red-400 text-red-800 p-4 rounded-lg mb-8 font-semibold">
            ❌ Infographic Error: {infographicError}
          </div>
        )}

        {/* Loading Screen - Analysis */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-24 h-24 border-8 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <h3 className="mt-8 text-2xl font-bold text-gray-800">Analyzing Market Data...</h3>
            <p className="mt-2 text-gray-600">Processing {selectedMonth} {selectedYear} report</p>
            <div className="mt-6 flex flex-col gap-2 text-sm text-gray-500">
              <p>✓ Downloading PDF report</p>
              <p>✓ Extracting market data</p>
              <p>✓ Analyzing with AI</p>
              <p className="animate-pulse">⏳ Generating insights...</p>
            </div>
          </div>
        )}

        {/* Loading Screen - Infographic */}
        {infographicLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-24 h-24 border-8 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
            <h3 className="mt-8 text-2xl font-bold text-gray-800">Creating Visual Infographic...</h3>
            <p className="mt-2 text-gray-600">Generating {selectedMonth} {selectedYear} visuals</p>
            <div className="mt-6 flex flex-col gap-2 text-sm text-gray-500">
              <p>✓ Downloading PDF report</p>
              <p>✓ Extracting visual data</p>
              <p className="animate-pulse">⏳ Creating infographic template...</p>
            </div>
          </div>
        )}

        {/* Success - View Analysis Button */}
        {!loading && result && (
          <div className="bg-white rounded-2xl shadow-xl p-10 text-center border-l-4 border-green-600">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Analysis Complete!</h2>
              <p className="text-gray-600 text-lg">
                {selectedMonth} {selectedYear} Market Report is ready
              </p>
            </div>
            <a
              href={`/blog/${selectedMonth.toLowerCase()}-${selectedYear}`}
              className="inline-block px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-lg font-semibold rounded-lg hover:from-indigo-700 hover:to-blue-700 transition shadow-lg hover:shadow-xl"
            >
              📊 View Full Analysis
            </a>
          </div>
        )}

        {/* Success - Infographic Created */}
        {!infographicLoading && infographicResult && (
          <div className="bg-white rounded-2xl shadow-xl p-10 text-center border-l-4 border-purple-600">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-4">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Infographic Created!</h2>
              <p className="text-gray-600 text-lg">
                {selectedMonth} {selectedYear} Visual templates are ready
              </p>
            </div>
            <a
              href={`/blog/${selectedMonth.toLowerCase()}-${selectedYear}/market-update`}
              className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition shadow-lg hover:shadow-xl"
            >
              🎨 View Infographic
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function Markdown({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="text-black [&_*]:text-black [&_h1]:text-black [&_h2]:text-black [&_h3]:text-black [&_h4]:text-black [&_h5]:text-black [&_h6]:text-black [&_p]:text-black [&_li]:text-black [&_td]:text-black [&_th]:text-black [&_strong]:text-black [&_em]:text-black [&_a]:text-indigo-600 [&_table]:border-collapse [&_table]:w-full [&_thead]:bg-indigo-600 [&_thead]:text-white [&_tbody_tr:nth-child(odd)]:bg-white [&_tbody_tr:nth-child(even)]:bg-gray-50 [&_td]:border [&_td]:border-gray-300 [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-gray-300 [&_th]:px-3 [&_th]:py-2">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {text}
      </ReactMarkdown>
    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <div className="p-6 rounded-lg border-l-4 border-indigo-600 shadow-md bg-white hover:shadow-lg transition">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
        {title}
      </h2>
      {children}
    </div>
  );
}

function MicroMarketGrid({ cities }: any) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(cities).map(([city, content]: any) => (
        <div key={city} className="p-4 bg-white rounded-lg border-l-4 border-purple-500 shadow-md">
          <h3 className="font-bold text-purple-700 mb-3 text-lg">
            {city.replace(/_/g, " ")}
          </h3>
          <div className="text-gray-800">
            <Markdown text={content} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Charts({ chartData }: any) {
  if (!chartData) return null;

  // Benchmark prices data
  const benchmarkData = [
    { type: "Detached", price: chartData.property_types?.benchmark_prices?.detached },
    { type: "Townhouse", price: chartData.property_types?.benchmark_prices?.townhouse },
    { type: "Apartment", price: chartData.property_types?.benchmark_prices?.apartment },
  ].filter(d => d.price);

  // City benchmarks data
  const cityBenchmarkData = Object.entries(chartData.city_benchmarks || {}).map(
    ([city, price]: any) => ({
      city: city.replace(/_/g, " "),
      price,
    })
  );

  // Percentage changes
  const percentChangeData = [
    { period: "1M", change: chartData.percentage_changes?.moM },
    { period: "3M", change: chartData.percentage_changes?.qoQ },
    { period: "6M", change: chartData.percentage_changes?.six_month },
    { period: "1Y", change: chartData.percentage_changes?.one_year },
  ].filter(d => d.change !== undefined);

  // Sales data
  const salesData = [
    { type: "Detached", sales: chartData.property_types?.sales?.detached },
    { type: "Attached", sales: chartData.property_types?.sales?.attached },
    { type: "Apartment", sales: chartData.property_types?.sales?.apartment },
  ].filter(d => d.sales);

  // Listings data
  const listingsData = [
    { type: "Detached", listings: chartData.property_types?.listings?.detached },
    { type: "Attached", listings: chartData.property_types?.listings?.attached },
    { type: "Apartment", listings: chartData.property_types?.listings?.apartment },
  ].filter(d => d.listings);

  return (
    <div className="space-y-6">
      <Section title="📊 Market Analytics">
        <div className="text-sm text-gray-600 mb-6 p-4 bg-gray-50 rounded border border-gray-200">
          Complete visualization of all market metrics with detailed charts and comparisons.
        </div>
      </Section>

      {benchmarkData.length > 0 && (
        <Section title="🏠 Benchmark Prices by Property Type">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={benchmarkData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip
                formatter={(value) => `$${(value as number).toLocaleString()}`}
              />
              <Bar dataKey="price" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </Section>
      )}

      {cityBenchmarkData.length > 0 && (
        <Section title="🏙️ City Benchmark Prices">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={cityBenchmarkData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="city" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip
                formatter={(value) => `$${(value as number).toLocaleString()}`}
              />
              <Bar dataKey="price" fill="#7c3aed" />
            </BarChart>
          </ResponsiveContainer>
        </Section>
      )}

      {percentChangeData.length > 0 && (
        <Section title="📈 Price Changes Over Time">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={percentChangeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="change" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </Section>
      )}

      {salesData.length > 0 && listingsData.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <Section title="🔢 Sales by Property Type">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </Section>

          <Section title="📋 Active Listings by Property Type">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={listingsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="listings" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </Section>
        </div>
      )}

      {chartData.property_types?.sales && chartData.property_types?.listings && (
        <Section title="⚖️ Sales vs Listings Comparison">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                {
                  type: "Detached",
                  sales: chartData.property_types.sales.detached,
                  listings: chartData.property_types.listings.detached,
                },
                {
                  type: "Attached",
                  sales: chartData.property_types.sales.attached,
                  listings: chartData.property_types.listings.attached,
                },
                {
                  type: "Apartment",
                  sales: chartData.property_types.sales.apartment,
                  listings: chartData.property_types.listings.apartment,
                },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#3b82f6" name="Sales" />
              <Bar dataKey="listings" fill="#f59e0b" name="Listings" />
            </BarChart>
          </ResponsiveContainer>
        </Section>
      )}

      {chartData.absorption_rate && (
        <Section title="📊 Market Absorption Ratios">
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(chartData.absorption_rate).map(([key, value]: any) => (
              <div key={key} className="p-4 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg shadow-md">
                <h3 className="font-semibold text-white capitalize">
                  {key.replace(/_/g, " ")}
                </h3>
                <p className="text-3xl font-bold text-white mt-2">{value}</p>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}