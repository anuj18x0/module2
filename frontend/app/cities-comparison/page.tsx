"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp, ArrowDown, Minus, TrendingUp, TrendingDown } from "lucide-react";
import CityComparisonInfographic from "@/components/CityComparisonInfographic";

interface CityData {
  name: string;
  overall?: PropertyData;
  detached?: PropertyData;
  townhouse?: PropertyData;
  apartment?: PropertyData;
}

interface PropertyData {
  newListings?: number;
  activeListings?: number;
  totalSales?: number;
  benchmarkPrice?: number;
  momChange?: number;
  yoyChange?: number;
}

interface ComparisonResult {
  month: string;
  year: string;
  cities: CityData[];
  summary: string;
}

export default function CityComparison() {
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("2025");
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string>("");
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState<string>("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState<string>("");
  const [postingToFacebook, setPostingToFacebook] = useState(false);
  const [facebookSuccess, setFacebookSuccess] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [fbModalOpen, setFbModalOpen] = useState(false);
  const [fbCaption, setFbCaption] = useState<string>("");

  const months = [
    "November", "October", "September", "August", "July", "June",
    "May", "April", "March", "February", "January"
  ];

  const years = ["2025", "2024", "2023", "2022"];

  // Fetch available cities on component mount
  useEffect(() => {
    fetchCities();
  }, []);

  async function fetchCities() {
    try {
      const response = await fetch("/api/compare-cities");
      const data = await response.json();
      setAvailableCities(data.cities || []);
    } catch (err) {
      console.error("Error fetching cities:", err);
    }
  }

  function handleCityToggle(city: string) {
    if (selectedCities.includes(city)) {
      setSelectedCities(selectedCities.filter(c => c !== city));
    } else if (selectedCities.length < 3) {
      setSelectedCities([...selectedCities, city]);
    }
  }

  async function handleCompare() {
    if (!selectedMonth || !selectedYear || selectedCities.length < 2) {
      setError("Please select month, year, and at least 2 cities");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/compare-cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear,
          cities: selectedCities,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to compare cities");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function formatPrice(price: number | null): string {
    if (price === null) return "N/A";
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  function formatNumber(num: number | null): string {
    if (num === null) return "N/A";
    return num.toLocaleString();
  }

  function formatChange(change: number | null): JSX.Element {
    if (change === null) return <span className="text-gray-400">N/A</span>;
    
    const isPositive = change > 0;
    const isNeutral = change === 0;
    
    return (
      <div className={`flex items-center gap-1 ${
        isPositive ? "text-green-600" : isNeutral ? "text-gray-500" : "text-red-600"
      }`}>
        {isPositive ? <ArrowUp size={16} /> : isNeutral ? <Minus size={16} /> : <ArrowDown size={16} />}
        <span className="font-semibold">{Math.abs(change).toFixed(1)}%</span>
      </div>
    );
  }

  async function handleSendEmail() {
    if (!emailRecipients.trim()) {
      setError("Please enter at least one email address");
      return;
    }

    // Parse email addresses (comma or space separated)
    const emails = emailRecipients
      .split(/[,\s]+/)
      .map(e => e.trim())
      .filter(e => e);

    if (emails.length === 0) {
      setError("Please enter valid email addresses");
      return;
    }

    setSendingEmail(true);
    setError("");
    setEmailSuccess("");

    try {
      const response = await fetch("http://localhost:8000/email-city-comparison", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear,
          cities: selectedCities,
          to_emails: emails,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to send email");
      }

      const data = await response.json();
      setEmailSuccess(`Email sent successfully to ${emails.length} recipient(s)!`);
      setTimeout(() => {
        setEmailModalOpen(false);
        setEmailRecipients("");
        setEmailSuccess("");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  }

  async function handlePostToFacebook() {
    if (!userEmail.trim()) {
      setError("Please enter your email address");
      return;
    }

    setPostingToFacebook(true);
    setError("");
    setFacebookSuccess("");

    try {
      // Step 1: Generate image from city comparison
      const imageResponse = await fetch("http://localhost:8000/city-comparison-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear,
          cities: selectedCities,
        }),
      });

      if (!imageResponse.ok) {
        const errorData = await imageResponse.json();
        throw new Error(errorData.detail || "Failed to generate image");
      }

      const imageData = await imageResponse.json();
      
      // Use public URL if available, otherwise use base64
      const imageToPost = imageData.image_url || imageData.image_base64;

      const cityNames = selectedCities.join(", ");
      const defaultCaption = fbCaption || `Greater Vancouver Market Comparison: ${cityNames} - ${selectedMonth} ${selectedYear}\n\n${result?.summary || ""}`;

      // Step 3: Post to Facebook via AutoPost API
      const fbResponse = await fetch("/api/autopost/social/publish-facebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: imageToPost,
          caption: defaultCaption,
          userEmail: userEmail,
        }),
      });

      if (!fbResponse.ok) {
        const errorData = await fbResponse.json();
        throw new Error(errorData.error || "Failed to post to Facebook");
      }

      const fbData = await fbResponse.json();
      setFacebookSuccess("Posted to Facebook successfully!");
      setTimeout(() => {
        setFbModalOpen(false);
        setUserEmail("");
        setFbCaption("");
        setFacebookSuccess("");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to post to Facebook");
    } finally {
      setPostingToFacebook(false);
    }
  }

  function getPropertyTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      overall: "🏘️",
      detached: "🏠",
      townhouse: "🏘️",
      apartment: "🏢",
    };
    return icons[type] || "📊";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Greater Vancouver City Comparison
          </h1>
          <p className="text-gray-600 text-lg">
            Compare real estate market data across multiple cities
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Month Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full text-black  px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              >
                <option value="">Choose month...</option>
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full text-black px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* City Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Cities (2-3 cities)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableCities.map((city) => (
                <button
                  key={city}
                  onClick={() => handleCityToggle(city)}
                  disabled={!selectedCities.includes(city) && selectedCities.length >= 3}
                  className={`px-4 text-black py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    selectedCities.includes(city)
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                      : "bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:bg-blue-50"
                  } ${
                    !selectedCities.includes(city) && selectedCities.length >= 3
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Selected: {selectedCities.length} / 3
            </p>
          </div>

          {/* Compare Button */}
          <button
            onClick={handleCompare}
            disabled={loading || !selectedMonth || !selectedYear || selectedCities.length < 2}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Comparing..." : "Compare Cities"}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-8">
            {/* Summary */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-6 md:p-8 text-white">
              <h2 className="text-2xl font-bold mb-3">
                {result.month} {result.year} Market Summary
              </h2>
              <p className="text-lg leading-relaxed">{result.summary}</p>
            </div>

            {/* Infographic Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Visual Market Comparison</h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => setEmailModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors shadow-md flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email Report
                  </button>
                  <button
                    onClick={() => setFbModalOpen(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors shadow-md flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Post to Facebook
                  </button>
                </div>
              </div>
              <CityComparisonInfographic data={result} />
            </div>

            {/* Property Type Tabs */}
            {["overall", "detached", "townhouse", "apartment"].map((propertyType) => (
              <div key={propertyType} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span>{getPropertyTypeIcon(propertyType)}</span>
                    <span className="capitalize">{propertyType} Properties</span>
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">City</th>
                        <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Active Listings</th>
                        <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Total Sales</th>
                        <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Benchmark Price</th>
                        <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">MoM Change</th>
                        <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">YoY Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.cities.map((city, idx) => {
                        const data = city[propertyType as keyof CityData] as PropertyData;
                        return (
                          <tr
                            key={city.name}
                            className={`${
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            } hover:bg-blue-50 transition-colors`}
                          >
                            <td className="px-6 py-4 font-semibold text-gray-900">{city.name}</td>
                            <td className="px-6 py-4 text-right text-gray-700">
                              {formatNumber(data.activeListings)}
                            </td>
                            <td className="px-6 py-4 text-right text-gray-700">
                              {formatNumber(data.totalSales)}
                            </td>
                            <td className="px-6 py-4 text-right font-semibold text-gray-900">
                              {formatPrice(data.benchmarkPrice)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {formatChange(data.momChange)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {formatChange(data.yoyChange)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {/* Key Insights Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {result.cities.map((city) => (
                <div key={city.name} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <h4 className="text-xl font-bold text-gray-900 mb-4">{city.name}</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Sales</span>
                      <span className="font-bold text-lg">{formatNumber(city.overall.totalSales)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Active Listings</span>
                      <span className="font-bold text-lg">{formatNumber(city.overall.activeListings)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">YoY Change</span>
                      {formatChange(city.overall.yoyChange)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email Modal */}
        {emailModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Email Report</h3>
                <button
                  onClick={() => {
                    setEmailModalOpen(false);
                    setEmailRecipients("");
                    setError("");
                    setEmailSuccess("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-gray-600 mb-4">
                Send this city comparison report to email recipients
              </p>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Addresses (comma or space separated)
                </label>
                <textarea
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                  placeholder="example1@email.com, example2@email.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-black"
                  rows={3}
                />
              </div>

              {emailSuccess && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-green-700 font-medium text-sm">{emailSuccess}</p>
                </div>
              )}

              <button
                onClick={handleSendEmail}
                disabled={sendingEmail}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingEmail ? "Sending..." : "Send Email"}
              </button>
            </div>
          </div>
        )}

        {/* Facebook Modal */}
        {fbModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Post to Facebook</h3>
                <button
                  onClick={() => {
                    setFbModalOpen(false);
                    setUserEmail("");
                    setFbCaption("");
                    setError("");
                    setFacebookSuccess("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-gray-600 mb-4">
                Post this city comparison report to your Facebook page
              </p>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Email (connected to Meta)
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-black"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Caption (optional)
                </label>
                <textarea
                  value={fbCaption}
                  onChange={(e) => setFbCaption(e.target.value)}
                  placeholder="Add a custom caption for your post..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-black"
                  rows={3}
                />
              </div>

              {facebookSuccess && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-green-700 font-medium text-sm">{facebookSuccess}</p>
                </div>
              )}

              <button
                onClick={handlePostToFacebook}
                disabled={postingToFacebook}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {postingToFacebook ? "Posting..." : "Post to Facebook"}
              </button>

              <p className="text-xs text-gray-500 mt-3 text-center">
                Note: You need to have your Meta account connected first
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
