import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
import os
from typing import List

class EmailService:
    def __init__(self):
        # SMTP Configuration - Update these with your credentials
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("FROM_EMAIL", self.smtp_username)
        self.from_name = os.getenv("FROM_NAME", "Realty Genie")
        
    def generate_infographic_html(self, visual_data: dict, month: str, year: str) -> str:
        """Generate email-compatible HTML from infographic data with inline CSS"""
        
        location_title = visual_data.get("location_title", "GREATER VANCOUVER")
        report_date = f"{month.upper()} {year}"
        main_stats = visual_data.get("main_statistics", [])
        benchmark_stats = visual_data.get("benchmark_price_narratives", [])
        
        # Build table rows for statistics
        stats_rows = ""
        for stat in main_stats:
            pct_change = stat.get("pct_change", 0)
            badge_color = "#10b981" if pct_change >= 0 else "#ff6b6b"
            badge_bg = "rgba(16, 185, 129, 0.15)" if pct_change >= 0 else "rgba(255, 107, 107, 0.15)"
            
            stats_rows += f"""
            <tr style="border-bottom: 1px solid rgba(0,0,0,0.08);">
                <td style="padding: 10px 6px; font-weight: 700; color: #1f1f1f; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">
                    {stat.get('label', '')}
                </td>
                <td style="padding: 10px 6px; font-weight: 800; font-size: 13.6px; color: #1f1f1f;">
                    {stat.get('current', '')}
                </td>
                <td style="padding: 10px 6px; text-align: center;">
                    <span style="font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 10px; display: inline-block; color: {badge_color}; background: {badge_bg};">
                        {'+' if pct_change > 0 else ''}{pct_change}%
                    </span>
                </td>
                <td style="padding: 10px 6px; font-size: 10.88px; color: #6b7280; font-weight: 600;">
                    {stat.get('prev_month', '')}
                </td>
                <td style="padding: 10px 6px; font-size: 10.88px; color: #6b7280; font-weight: 600;">
                    {stat.get('prev_year', '')}
                </td>
            </tr>
            """
        
        # Build benchmark sections
        benchmark_sections = ""
        for item in benchmark_stats:
            benchmark_sections += f"""
            <p style="margin: 0 0 12px 0; font-size: 12px; line-height: 1.6; color: rgba(255,255,255,0.95);">
                <strong>{item.get('type', '')}:</strong> At <span style="color: #FFD700; font-weight: 700;">{item.get('price', '')}</span>, the {item.get('description', '')}
            </p>
            """
        
        # Complete HTML email template with inline CSS
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Market Update - {month} {year}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f9fafb;">
            <div style="max-width: 1080px; margin: 0 auto; background: linear-gradient(to bottom, #ffffff 0%, #f9fafb 100%);">
                
                <!-- HEADER -->
                <div style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); color: white; text-align: center; padding: 20px 30px; position: relative;">
                    <h1 style="font-size: 32px; font-weight: 800; margin: 0; letter-spacing: 2px; text-transform: uppercase; text-shadow: 0 2px 10px rgba(0,0,0,0.2);">
                        {location_title}
                    </h1>
                    <div style="height: 3px; width: 70px; background: #FFD700; margin: 6px auto; border-radius: 10px; box-shadow: 0 2px 15px rgba(255, 215, 0, 0.5);"></div>
                    <h2 style="font-size: 16px; font-weight: 500; margin: 0; letter-spacing: 2.5px; text-transform: uppercase; opacity: 0.95;">
                        REAL ESTATE MARKET UPDATE
                    </h2>
                </div>
                
                <!-- HERO IMAGE -->
                <div style="position: relative; width: 100%; height: 280px; overflow: hidden;">
                    <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80" 
                         alt="Interior" 
                         style="width: 100%; height: 100%; object-fit: cover; display: block;">
                </div>
                
                <!-- STATS CARD -->
                <div style="background: rgba(255, 255, 255, 0.98); margin: -200px 40px 0 40px; position: relative; border-radius: 15px; padding: 20px; box-shadow: 0 15px 40px rgba(0,0,0,0.15); backdrop-filter: blur(10px);">
                    
                    <!-- BRANDING -->
                    <div style="text-align: center; margin-bottom: 15px;">
                        <div style="font-size: 11.2px; color: #6b7280; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">
                            AI-Powered Market Intelligence
                        </div>
                    </div>
                    
                    <!-- REPORT TITLE -->
                    <div style="text-align: center; margin-bottom: 12px;">
                        <div style="font-size: 11.2px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                            {report_date}
                        </div>
                        <div style="font-size: 17.6px; font-weight: 700; color: #1f1f1f; margin-top: 2px;">
                            Market Report
                        </div>
                    </div>
                    
                    <!-- STATS TABLE -->
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 11.2px;">
                        <thead>
                            <tr style="background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%); color: white;">
                                <th style="padding: 8px 6px; text-align: left; font-weight: 700; font-size: 10.4px; text-transform: uppercase; letter-spacing: 0.5px; border-right: 1px solid rgba(255,255,255,0.2);">Metric</th>
                                <th style="padding: 8px 6px; text-align: left; font-weight: 700; font-size: 10.4px; text-transform: uppercase; letter-spacing: 0.5px; border-right: 1px solid rgba(255,255,255,0.2);">Current</th>
                                <th style="padding: 8px 6px; text-align: center; font-weight: 700; font-size: 10.4px; text-transform: uppercase; letter-spacing: 0.5px; border-right: 1px solid rgba(255,255,255,0.2);">Change</th>
                                <th style="padding: 8px 6px; text-align: left; font-weight: 700; font-size: 10.4px; text-transform: uppercase; letter-spacing: 0.5px; border-right: 1px solid rgba(255,255,255,0.2);">Prev Month</th>
                                <th style="padding: 8px 6px; text-align: left; font-weight: 700; font-size: 10.4px; text-transform: uppercase; letter-spacing: 0.5px;">Prev Year</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats_rows}
                        </tbody>
                    </table>
                    
                    <!-- FOOTER TEXT -->
                    <div style="text-align: center; font-size: 9.6px; color: #6b7280; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; padding: 10px 0; border-top: 1px solid rgba(215, 25, 32, 0.1);">
                        ALL AREAS & PROPERTIES COMBINED
                    </div>
                    <div style="text-align: center; font-size: 8px; color: #9ca3af; margin-top: 4px;">
                        SOURCE: MLS® HOME PRICE INDEX MONTHLY STATISTICS PACKAGE
                    </div>
                </div>
                
                <!-- BENCHMARK SECTION -->
                <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: white; padding: 20px 40px; margin-top: 20px;">
                    <h4 style="font-size: 16px; font-weight: 700; margin: 0 0 15px 0; text-align: center; text-transform: uppercase; letter-spacing: 1px; color: #FFD700;">
                        MLS® HPI Benchmark Price Activity
                    </h4>
                    <div>
                        {benchmark_sections}
                    </div>
                </div>
                
                <!-- FOOTER -->
                <div style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); color: white; padding: 15px 30px; text-align: center;">
                    <h2 style="font-size: 19.2px; font-weight: 800; margin: 0 0 6px 0; letter-spacing: 2px; text-transform: uppercase;">
                        REALTY GENIE
                    </h2>
                    <p style="font-size: 12px; margin: 0 0 10px 0; opacity: 0.9;">
                        Empowering Real Estate Professionals with AI-Driven Insights
                    </p>
                    <div style="font-size: 11.2px; margin-bottom: 10px;">
                        <span>📧 <a href="mailto:info@realtygenie.co" style="color: white; font-weight: 700; text-decoration: none;">info@realtygenie.co</a></span>
                        <span style="margin: 0 8px;">•</span>
                        <span>🌐 <a href="https://www.realtygenie.co" style="color: white; font-weight: 700; text-decoration: none;">www.realtygenie.co</a></span>
                    </div>
                    <div style="font-size: 9.6px; opacity: 0.8; font-style: italic;">
                        This report is auto-generated using AI analysis of official MLS® data. For realtor use only.
                    </div>
                </div>
                
            </div>
        </body>
        </html>
        """
        
        return html
    
    def generate_blue_template_html(self, visual_data: dict, month: str, year: str) -> str:
        """Generate email-compatible HTML from infographic data - Modern Blue Template (exact test.html replica)"""
        
        location_title = visual_data.get("location_title", "GREATER VANCOUVER")
        report_date = f"{month.upper()} {year}"
        main_stats = visual_data.get("main_statistics", [])
        benchmark_stats = visual_data.get("benchmark_price_narratives", [])
        
        # Build main stats HTML with icons using table for 2x2 grid (email-safe)
        stats_html = ""
        icons = [
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>',
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>',
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>'
        ]
        
        stats_cells = ""
        for idx, stat in enumerate(main_stats):
            pct_change = stat.get("pct_change", 0)
            trend_bg = "#ecfdf5" if pct_change >= 0 else "#fef2f2"
            trend_color = "#10b981" if pct_change >= 0 else "#ef4444"
            arrow = "▲" if pct_change >= 0 else "▼"
            icon = icons[idx] if idx < len(icons) else icons[0]
            
            # Start new row after every 2 cells
            if idx % 2 == 0 and idx > 0:
                stats_cells += "</tr><tr>"
            
            stats_cells += f"""
            <td style="background: white; border-radius: 12px; padding: 25px; width: 48%; vertical-align: top; border: 1px solid #f1f5f9;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                        <td>
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td style="color: #06b6d4; opacity: 0.8; vertical-align: middle; width: 30px;">{icon}</td>
                                    <td style="font-size: 14px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.5px; vertical-align: middle;">{stat.get('label', '')}</td>
                                    <td style="text-align: right; vertical-align: middle;">
                                        <span style="font-size: 16px; font-weight: 700; padding: 4px 8px; border-radius: 8px; background: {trend_bg}; color: {trend_color}; white-space: nowrap;">{arrow} {abs(pct_change)}%</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding-top: 15px; font-size: 42px; font-weight: 800; color: #0f172a; line-height: 1; letter-spacing: -1px; font-family: 'Montserrat', sans-serif;">{stat.get('current', '')}</td>
                    </tr>
                    <tr>
                        <td style="padding-top: 20px; border-top: 1px solid #f1f5f9;">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td style="font-size: 14px; color: #64748b; width: 50%;">
                                        <strong style="color: #334155; display: block; margin-bottom: 4px;">Prev Month:</strong> {stat.get('prev_month', '')}
                                    </td>
                                    <td style="font-size: 14px; color: #64748b; text-align: right; width: 50%;">
                                        <strong style="color: #334155; display: block; margin-bottom: 4px;">Prev Year:</strong> {stat.get('prev_year', '')}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>"""
        
        stats_html = f"""<table cellpadding="0" cellspacing="15" border="0" width="100%"><tr>{stats_cells}</tr></table>"""
        
        # Build benchmark narratives HTML using table for 3-column layout (email-safe)
        narratives_html = ""
        narrative_cells = ""
        for item in benchmark_stats:
            narrative_cells += f"""
            <td style="background: white; border-radius: 12px; padding: 25px; border-top: 5px solid #06b6d4; border-bottom: 1px solid #f1f5f9; border-left: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; width: 33.33%; vertical-align: top;">
                <div style="font-size: 14px; font-weight: 800; color: #06b6d4; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">{item.get('type', '')}</div>
                <div style="font-family: 'Montserrat', sans-serif; font-size: 29px; font-weight: 800; color: #0f172a; margin-bottom: 15px; line-height: 1;">{item.get('price', '')}</div>
                <div style="font-size: 14px; line-height: 1.6; color: #64748b; font-weight: 500;">{item.get('description', '')}</div>
            </td>"""
        
        narratives_html = f"""<table cellpadding="0" cellspacing="15" border="0" width="100%"><tr>{narrative_cells}</tr></table>"""
        
        # Complete HTML matching test.html structure exactly
        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Real Estate Market Update</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@600;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: #f0f2f5; background-image: radial-gradient(#334155 0.5px, transparent 0.5px); background-size: 20px 20px; padding: 40px; color: #0f172a;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 1000px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden;">
        <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 35px 45px; border-top: 4px solid #06b6d4;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                        <td style="vertical-align: middle;">
                            <div style="font-size: 14px; opacity: 0.9; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; color: #06b6d4;">Market Report</div>
                            <h1 style="font-family: 'Montserrat', sans-serif; font-size: 45px; font-weight: 800; letter-spacing: -1px; text-transform: uppercase; line-height: 1.1; margin: 5px 0 0 0;">{location_title}</h1>
                        </td>
                        <td style="text-align: right; vertical-align: middle;">
                            <div style="font-size: 14px; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 1px;">{report_date}</div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td style="padding: 45px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                    <td>
                        <div style="font-family: 'Montserrat', sans-serif; font-size: 22px; font-weight: 800; margin-bottom: 25px; color: #0f172a; text-transform: uppercase;">
                            <span style="display: inline-block; width: 8px; height: 24px; background: #06b6d4; margin-right: 15px; border-radius: 4px; vertical-align: middle;"></span><span style="vertical-align: middle;">Market Activity</span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>
                        {stats_html}
                    </td>
                </tr>
            </table>
        </div>

        <div style="padding: 0 45px 45px 45px; background: linear-gradient(to bottom, white, #f8fafc);">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                    <td>
                        <div style="font-family: 'Montserrat', sans-serif; font-size: 22px; font-weight: 800; margin-bottom: 25px; color: #0f172a; text-transform: uppercase;">
                            <span style="display: inline-block; width: 8px; height: 24px; background: #06b6d4; margin-right: 15px; border-radius: 4px; vertical-align: middle;"></span><span style="vertical-align: middle;">Benchmark Price Analysis</span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>
                        {narratives_html}
                    </td>
                </tr>
            </table>
        </div>

        <tr>
            <td style="background: #0f172a; color: #ffffff; padding: 30px 45px; border-top: 3px solid rgba(6, 182, 212, 0.5);">
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                        <td style="font-weight: 600; font-size: 15px; width: 50%;">
                            <a href="mailto:info@realtygenie.co" style="color: #ffffff; text-decoration: none; opacity: 0.8;">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 10px;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                <span style="vertical-align: middle;">info@realtygenie.co</span>
                            </a>
                        </td>
                        <td style="text-align: right; font-weight: 600; font-size: 15px; width: 50%;">
                            <a href="https://www.realtygenie.co" target="_blank" style="color: #ffffff; text-decoration: none; opacity: 0.8;">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 10px;"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path></svg>
                                <span style="vertical-align: middle;">www.realtygenie.co</span>
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>"""
        
        return html
    
    def generate_city_comparison_html(self, comparison_data: dict) -> str:
        """Generate email-compatible HTML for city comparison report"""
        
        month = comparison_data.get("month", "")
        year = comparison_data.get("year", "")
        cities = comparison_data.get("cities", [])
        summary = comparison_data.get("summary", "")
        
        # Generate table rows for each city and property type
        table_rows = ""
        colors = ["#3B82F6", "#8B5CF6", "#EC4899"]
        
        for city_idx, city in enumerate(cities):
            city_name = city.get("name", "")
            color = colors[city_idx % len(colors)]
            
            # Get property data
            overall = city.get("overall", {})
            detached = city.get("detached", {})
            townhouse = city.get("townhouse", {})
            apartment = city.get("apartment", {}) or city.get("appartment", {})
            
            property_types = [
                {"label": "Overall", "data": overall, "is_main": True},
                {"label": "Detached", "data": detached, "is_main": False},
                {"label": "Townhouse", "data": townhouse, "is_main": False},
                {"label": "Apartment", "data": apartment, "is_main": False}
            ]
            
            for prop in property_types:
                data = prop["data"]
                is_main = prop["is_main"]
                bg_color = "#ffffff" if city_idx % 2 == 0 else "#f9fafb"
                border_top = "border-top: 2px solid #9ca3af;" if is_main else ""
                
                # Format values
                active_listings = data.get("activeListings", "N/A")
                if active_listings != "N/A":
                    active_listings = f"{active_listings:,}"
                
                total_sales = data.get("totalSales", "N/A")
                if total_sales != "N/A":
                    total_sales = f"{total_sales:,}"
                
                benchmark_price = data.get("benchmarkPrice", "N/A")
                if benchmark_price != "N/A":
                    benchmark_price = f"${benchmark_price/1000000:.1f}M"
                
                mom_change = data.get("momChange")
                mom_text = "N/A"
                mom_color = "#6b7280"
                if mom_change is not None:
                    mom_text = f"{'+' if mom_change >= 0 else ''}{mom_change:.1f}%"
                    mom_color = "#16a34a" if mom_change >= 0 else "#dc2626"
                
                yoy_change = data.get("yoyChange")
                yoy_text = "N/A"
                yoy_color = "#6b7280"
                if yoy_change is not None:
                    yoy_text = f"{'+' if yoy_change >= 0 else ''}{yoy_change:.1f}%"
                    yoy_color = "#16a34a" if yoy_change >= 0 else "#dc2626"
                
                # Cell name formatting
                if is_main:
                    cell_name = f"""
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 12px; height: 12px; border-radius: 50%; background-color: {color};"></div>
                        <div>
                            <div style="font-weight: 700; font-size: 14px; color: #111827;">{city_name}</div>
                            <div style="font-size: 11px; color: #6b7280; text-transform: uppercase;">{prop['label']}</div>
                        </div>
                    </div>
                    """
                else:
                    cell_name = f'<div style="padding-left: 24px; font-size: 12px; color: #374151;">{prop["label"]}</div>'
                
                font_weight = "700" if is_main else "600"
                font_size = "14px" if is_main else "13px"
                
                table_rows += f"""
                <tr style="background-color: {bg_color}; {border_top} border-bottom: 1px solid #e5e7eb; transition: background-color 0.2s;">
                    <td style="padding: 12px 16px; border-right: 1px solid #e5e7eb;">
                        {cell_name}
                    </td>
                    <td style="padding: 12px 16px; text-align: center; border-right: 1px solid #e5e7eb;">
                        <span style="font-weight: {font_weight}; font-size: {font_size}; color: #111827;">{active_listings}</span>
                    </td>
                    <td style="padding: 12px 16px; text-align: center; border-right: 1px solid #e5e7eb;">
                        <span style="font-weight: {font_weight}; font-size: {font_size}; color: #111827;">{total_sales}</span>
                    </td>
                    <td style="padding: 12px 16px; text-align: center; border-right: 1px solid #e5e7eb;">
                        <span style="font-weight: {font_weight}; font-size: {font_size}; color: #111827;">{benchmark_price}</span>
                    </td>
                    <td style="padding: 12px 16px; text-align: center; border-right: 1px solid #e5e7eb;">
                        <span style="font-weight: 700; font-size: 12px; color: {mom_color};">{mom_text}</span>
                    </td>
                    <td style="padding: 12px 16px; text-align: center;">
                        <span style="font-weight: 700; font-size: 12px; color: {yoy_color};">{yoy_text}</span>
                    </td>
                </tr>
                """
        
        # Complete HTML email template
        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>City Comparison Report</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6; padding: 40px 20px;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 900px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
        <!-- Header -->
        <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: white; padding: 24px 32px;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                        <td style="vertical-align: middle;">
                            <h1 style="font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">Greater Vancouver Market Comparison</h1>
                            <p style="font-size: 14px; margin: 6px 0 0 0; opacity: 0.9;">{month} {year}</p>
                        </td>
                        <td style="text-align: right; vertical-align: middle;">
                            <div style="font-size: 13px; font-weight: 600; opacity: 0.9;">Official Report</div>
                            <div style="font-size: 12px; opacity: 0.8; margin-top: 2px;">Real Estate Board</div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        
        <!-- Main Table -->
        <tr>
            <td style="padding: 0;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                    <!-- Table Header -->
                    <tr style="background-color: #f9fafb; border-bottom: 2px solid #9ca3af;">
                        <th style="padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; border-right: 1px solid #e5e7eb;">City / Type</th>
                        <th style="padding: 12px 16px; text-align: center; font-size: 11px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; border-right: 1px solid #e5e7eb;">Active Listings</th>
                        <th style="padding: 12px 16px; text-align: center; font-size: 11px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; border-right: 1px solid #e5e7eb;">Total Sales</th>
                        <th style="padding: 12px 16px; text-align: center; font-size: 11px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; border-right: 1px solid #e5e7eb;">Benchmark Price</th>
                        <th style="padding: 12px 16px; text-align: center; font-size: 11px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; border-right: 1px solid #e5e7eb;">MoM Change (%)</th>
                        <th style="padding: 12px 16px; text-align: center; font-size: 11px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">YoY Change (%)</th>
                    </tr>
                    
                    <!-- Table Body -->
                    {table_rows}
                </table>
            </td>
        </tr>
        
        <!-- Footer -->
        <tr>
            <td style="background-color: #f9fafb; padding: 24px 32px; border-top: 2px solid #e5e7eb;">
                <div style="margin-bottom: 12px;">
                    <p style="font-size: 11px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 6px 0;">Market Summary</p>
                    <p style="font-size: 14px; color: #374151; line-height: 1.6; margin: 0;">{summary}</p>
                </div>
                <div style="padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280;">
                    <p style="margin: 0;">Source: Greater Vancouver Real Estate Board • Generated: {month} {year}</p>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>"""
        
        return html
    
    def send_email(self, to_emails: List[str], subject: str, html_content: str, template: str = "pastel") -> bool:
        """Send HTML email via SMTP"""
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = ', '.join(to_emails)
            
            # Attach HTML content
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            return True
        except Exception as e:
            print(f"Error sending email: {str(e)}")
            raise e

email_service = EmailService()
