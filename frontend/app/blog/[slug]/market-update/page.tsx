"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import MarketUpdate from "@/components/MarketUpdate";

export default function MarketUpdatePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailTemplate, setEmailTemplate] = useState("pastel");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState("");

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
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading infographic...</p>
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
            className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            ← Back to Report
          </button>
        </div>
      </div>
    );
  }

  const visualData = report.data.visual_infographic_data;
  
  // Transform data for MarketUpdate component
  const mainStats = visualData.main_statistics?.map((stat: any) => ({
    icon: null, // Icons are handled by the component
    label: stat.label,
    current: stat.current,
    pctChange: stat.pct_change,
    prevMonth: stat.prev_month,
    prevYear: stat.prev_year
  })) || [];

  const benchmarkStats = visualData.benchmark_price_narratives?.map((item: any) => ({
    type: item.type,
    price: item.price,
    desc: item.description
  })) || [];

  async function handleSendEmail() {
    if (!emailRecipients.trim()) return;
    
    try {
      setSendingEmail(true);
      setEmailSuccess(false);
      setEmailError("");
      
      const parts = slug.split("-");
      const month = parts[0];
      const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
      
      // Parse email addresses
      const emails = emailRecipients.split(",").map(e => e.trim()).filter(e => e);
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: capitalizedMonth,
          year: report.data?.year || report.year,
          to_emails: emails,
          subject: emailSubject || undefined,
          template: emailTemplate
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to send email");
      }
      
      setEmailSuccess(true);
      setTimeout(() => {
        setShowEmailForm(false);
        setEmailRecipients("");
        setEmailSubject("");
        setEmailSuccess(false);
      }, 3000);
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Market Update Infographic</h1>
            <p className="text-gray-600 mt-1">{report.month} {report.data?.year || report.year}</p>
          </div>
          <button
            onClick={() => router.push(`/blog/${slug}`)}
            className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg shadow-md hover:shadow-lg transition border border-indigo-200"
          >
            ← Back to Report
          </button>
        </div>

        {/* Infographic */}
        <div className="bg-white shadow-2xl" style={{ width: '1080px', margin: '0 auto' }}>
          <MarketUpdate
            locationTitle={visualData.location_title || "GREATER VANCOUVER"}
            reportDate={`${report.month.toUpperCase()} ${report.data?.year || report.year}`}
            mainStats={mainStats}
            benchmarkStats={benchmarkStats}
            agentGroup="Realty Genie"
            agentWebsite="www.realtygenie.co"
          />
        </div>

        {/* Export Options */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Send Infographic</h3>
          <button 
            onClick={() => setShowEmailForm(!showEmailForm)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
          >
            📧 Send via Email
          </button>

          {/* Email Form */}
          {showEmailForm && (
            <div className="border-t pt-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Send Infographic via Email</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="pastel"
                        checked={emailTemplate === "pastel"}
                        onChange={(e) => setEmailTemplate(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">🎨 Pastel (Coral/Pink)</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="blue"
                        checked={emailTemplate === "blue"}
                        onChange={(e) => setEmailTemplate(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">🔷 Modern Blue</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Emails (comma separated)
                  </label>
                  <input
                    type="text"
                    value={emailRecipients}
                    onChange={(e) => setEmailRecipients(e.target.value)}
                    placeholder="email1@example.com, email2@example.com"
                    className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject (optional)
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder={`${report.month} ${report.data?.year || report.year} - Real Estate Market Update`}
                    className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleSendEmail}
                  disabled={sendingEmail || !emailRecipients}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {sendingEmail ? "📤 Sending..." : "✉️ Send Email"}
                </button>
                {emailSuccess && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                    ✅ Email sent successfully!
                  </div>
                )}
                {emailError && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    ❌ {emailError}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
