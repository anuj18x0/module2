from vertexai import init
from vertexai.generative_models import GenerativeModel, Part
from dotenv import load_dotenv
from services.download_monthly_report import get_monthly_report
import os
import json
import re

load_dotenv()

init(
    project=os.getenv("PROJECT_ID"),
    location=os.getenv("LOCATION")
)

model = GenerativeModel("gemini-2.5-flash")

def generate_market_report(url, month, year):
  """
  Generate market report from PDF
  Args:
    month: Month name
    year: Year
    pdf_path: Optional local PDF path. If not provided, will try to download from URL
  """
  print(f"Starting report generation for {month} {year}")
  
  pdf_path = get_monthly_report(url)

  try:
    if pdf_path:
      # Use local PDF file
      print(f"Using local PDF: {pdf_path}")
      data_path = pdf_path
    else:
      # Download from URL (legacy behavior)
      url = f"https://members.gvrealtors.ca/news/GVR-Stats-Package-{month}-{year}.pdf"
      print(f"Downloading from {url}")
      data_path = get_monthly_report(url=url)
      print(f"PDF downloaded to: {data_path}")
    
    data = open(data_path, "rb").read()
    print(f"PDF size: {len(data)} bytes")
  except Exception as e:
    print(f"Error loading PDF: {e}")
    raise
  
  pdf = Part.from_data(
      data=data,
      mime_type="application/pdf"
  )

  prompt = """
You are a senior real estate economist and market analyst. Analyze the attached GVREALTORS monthly market report PDF and return ONLY a JSON object (no other text) with the schema below. Use ONLY actual data from the PDF.

JSON Schema:

{
  "executive_summary": "500 word executive summary structured with: (1) Opening paragraph with market overview, (2) Bullet points (5-7 key metrics: benchmark price changes, market trends, absorption rates, sales/listings data), (3) 2-3 embedded Markdown tables: Area benchmarks with price changes, Property type comparison, Absorption rates by segment. Use markdown formatting: start bullets with '- ' or '* '. Include actual numbers from PDF in both bullets and tables.",
  "benchmark_table": "Markdown table with key areas. Columns: Area | Benchmark Price | Price Index | 1M % | 3M % | 6M % | 1Y % | Sales | Listings | Absorption %. Include: Greater Vancouver (all types), Vancouver East, Vancouver West, Burnaby, Richmond, Coquitlam, North Vancouver, West Vancouver. Keep concise with 8-10 rows.",
  "city_benchmarks": {
    "Burnaby": number,
    "Coquitlam": number,
    "Richmond": number,
    "Vancouver_East": number,
    "Vancouver_West": number,
    "North_Vancouver": number,
    "West_Vancouver": number,
    "Maple_Ridge": number,
    "Port_Coquitlam": number,
    "Port_Moody": number,
    "Squamish": number,
    "Sunshine_Coast": number,
    "Whistler": number
  },
  "city_detail_table": "Markdown table with ALL 13 cities: City | Benchmark Price | Price Index | Sales | Listings | Absorption % | YoY Change %",
  "property_types": {
    "benchmark_prices": {
      "detached": number,
      "townhouse": number,
      "apartment": number
    },
    "sales": {
      "detached": number,
      "attached": number,
      "apartment": number
    },
    "listings": {
      "detached": number,
      "attached": number,
      "apartment": number
    }
  },
  "property_type_detail_table": "Markdown table: Property Type | Benchmark Price | Price Index | Sales | Listings | Absorption % | 1M % | 3M % | 6M % | 1Y %",
  "percentage_changes": {
    "moM": number,
    "qoQ": number,
    "six_month": number,
    "one_year": number
  },
  "absorption_rate": {
    "overall_ratio": "string (e.g., '12.6%')",
    "detached_ratio": "string",
    "attached_ratio": "string",
    "apartment_ratio": "string"
  },
  "buyer_insights": "100-150 word section for home buyers with: Current market conditions, buyer advantages, negotiation tips, best areas for buyers. Include 1 embedded Markdown table: Buyer Opportunity by Area (Area | Days on Market | Price Trend | Opportunity).",
  "seller_insights": "100-150 word section for home sellers with: Market conditions for sellers, pricing strategies, best practices, high-demand areas. Include 1 embedded Markdown table: Seller Market Strength (Area | Sales Volume | Price vs List | Market Strength).",
  "investment_analysis": "100-150 word section for investors with: Market outlook, best opportunities, ROI potential, risk assessment. Include 1 embedded Markdown table: Investment Opportunities (Area/Type | Price | 1Y Change | Investment Score).",
  "realtor_talking_points": [
    "10 specific, data-backed bullet points that realtors can use with clients. Each point should cite actual numbers from the PDF."
  ],
  "newsletter_article": "500-550 word polished newsletter article. Structure: (1) Headline and opening, (2) Market overview with statistics, (3) Buyer insights, (4) Seller insights, (5) Expert outlook, (6) Call-to-action. Include 1-2 embedded Markdown tables, use headers (##), bold text, and bullets for readability. Must use REAL numbers from the PDF.",
  "market_predictions": "200-250 word section with: Short-term outlook (3 months), medium-term outlook (6-12 months), key factors to watch, potential scenarios.",
  "facebook_posts": [
    "Facebook post 1 (190-250 chars) - Start with an attention-grabbing emoji + hook question or bold statement. Include 1 KEY statistic from the report (e.g., 'Metro Vancouver home sales dropped x%'). Use 2-3 relevant emojis. End with hashtags: #VancouverRealEstate #HousingMarket #RealtyGenie. MUST be engaging and scroll-stopping!",
    "Facebook post 2 (220-260 chars) - Tell a mini-story: for example 'Here's what's happening in Metro Vancouver...' Share the MOST surprising or important trend with specific numbers. Use emojis for visual appeal (📊📈📉🏠). Include a relatable insight for buyers OR sellers. Add hashtags: #RealEstate #MarketUpdate #VancouverHomes",
    "Facebook post 3 (200-240 chars) - Strong call-to-action with urgency. Start with 'Don't miss out!' or 'Act now!' Include what buyers/sellers should do RIGHT NOW based on current market. Use compelling emoji (🚨⚡💡🔥). Cite 1 specific data point. End with: 'DM us for expert guidance! #RealEstateAdvice #VancouverMarket'"
  ],
  "visual_infographic_data": {
    "location_title": "string (e.g., 'GREATER VANCOUVER', 'FRASER VALLEY')",
    "main_statistics": [
      {
        "label": "NEW LISTINGS",
        "current": "string",
        "pct_change": number,
        "prev_month": "string",
        "prev_year": "string"
      },
      {
        "label": "ACTIVE LISTINGS",
        "current": "string",
        "pct_change": number,
        "prev_month": "string",
        "prev_year": "string with percentage"
      },
      {
        "label": "TOTAL SALES",
        "current": "string",
        "pct_change": number,
        "prev_month": "string",
        "prev_year": "string with percentage"
      },
      {
        "label": "AVERAGE PRICE",
        "current": "string (e.g., '$1,003,693')",
        "pct_change": number,
        "prev_month": "string",
        "prev_year": "string with percentage"
      }
    ],
    "benchmark_price_narratives": [
      {
        "type": "Single Family Detached",
        "price": "string (e.g., '$1,405,500')",
        "description": "string (e.g., 'Benchmark price decreased 0.6% compared to previous month and decreased 5.4% compared to previous year.')"
      },
      {
        "type": "Townhomes",
        "price": "string",
        "description": "string"
      },
      {
        "type": "Apartments",
        "price": "string",
        "description": "string"
      }
    ],
    "poster_metrics": [
      {
        "label": "string (e.g., 'NEW LISTINGS')",
        "value": "string (e.g., '2,210')",
        "change": "string (e.g., '-25.5%')",
        "positive": boolean
      }
    ]
  }
}

CRITICAL RULES:
- Return ONLY valid JSON, no markdown fences, no explanation text before/after.
- All numeric values must be numbers (no quotes except absorption_rate strings and visual_infographic_data strings).
- ALL data must be REAL from the PDF - do not fabricate numbers. Extract exact statistics.
- visual_infographic_data is MANDATORY with complete main_statistics (4 items: new listings, active listings, total sales, average price) and benchmark_price_narratives (3 items: detached, townhomes, apartments) DONT NULL ANY VALUE.
- For visual_infographic_data.main_statistics, calculate pct_change using: ((current - prev_month) / prev_month) * 100
- Keep all content CONCISE to avoid token limit truncation.
- All Markdown tables must be complete with proper syntax using pipes (|) and dashes (-).
- Ensure every table row is COMPLETE with all columns filled.
- Within JSON strings, ALL special characters MUST be properly escaped:
  * Use \\n for newlines (NOT actual line breaks)
  * Use \\\\ for backslashes
  * City names with slashes (e.g., "Maple Ridge/Pitt Meadows") are fine
  * Ensure proper quote escaping within strings
- newsletter_article is MANDATORY (500-600 words with REAL data).
- Output must be valid, parsable JSON that passes JSON.parse() without errors.
- Test your JSON mentally before outputting - ensure all brackets, braces, and quotes are balanced.
"""

  response = model.generate_content(
      contents=[pdf, prompt],
  )

  output_text = response.text
  
  if not output_text or not output_text.strip():
      raise ValueError("Gemini API returned empty response")
  
  # Strip markdown code fence if present
  original_text = output_text
  if output_text.startswith("```"):
      # Find the closing ```
      parts = output_text.split("```")
      if len(parts) >= 2:
          output_text = parts[1].strip()
          if output_text.startswith("json"):
              output_text = output_text[4:].strip()
  
  # Find the first { and last } to extract JSON
  start_idx = output_text.find('{')
  end_idx = output_text.rfind('}')
  if start_idx != -1 and end_idx != -1:
      output_text = output_text[start_idx:end_idx+1]
  
  # Fix common JSON escaping issues from LLM output
  # The problem: Gemini outputs text with actual newlines, backslashes, and special chars in JSON strings
  # which breaks JSON parsing. We need to properly escape them.
  import re
  
  def escape_json_string_content(json_str):
      """
      Properly escape special characters within JSON string values.
      This walks through the JSON and escapes content within quoted strings.
      """
      result = []
      in_string = False
      i = 0
      
      while i < len(json_str):
          char = json_str[i]
          
          # Check if we're entering/exiting a string (unescaped quote)
          if char == '"':
              # Count preceding backslashes to see if quote is escaped
              num_backslashes = 0
              j = i - 1
              while j >= 0 and json_str[j] == '\\':
                  num_backslashes += 1
                  j -= 1
              
              # If even number of backslashes (including 0), the quote is not escaped
              if num_backslashes % 2 == 0:
                  in_string = not in_string
              result.append(char)
          
          # If inside a string, escape special characters
          elif in_string:
              if char == '\n':
                  result.append('\\n')
              elif char == '\r':
                  result.append('\\r')
              elif char == '\t':
                  result.append('\\t')
              elif char == '\\' and i + 1 < len(json_str) and json_str[i + 1] not in ['n', 'r', 't', '"', '\\', '/', 'b', 'f', 'u']:
                  # Escape backslashes that aren't already part of escape sequences
                  result.append('\\\\')
              else:
                  result.append(char)
          else:
              result.append(char)
          
          i += 1
      
      return ''.join(result)
  
  output_text = escape_json_string_content(output_text)
  
  # Validate it's valid JSON
  try:
      parsed = json.loads(output_text)
  except json.JSONDecodeError as e:
      print(f"JSON Parse Error: {e}")
      print(f"Error at line {e.lineno}, column {e.colno}")
      
      # Try additional fixes for common issues
      print("Attempting to fix common JSON issues...")
      
      # Fix 1: Remove any trailing commas before ] or }
      output_text = re.sub(r',(\s*[\]}])', r'\1', output_text)
      
      # Fix 2: Ensure all markdown table pipes are properly escaped in strings
      # This is tricky - we need to be in a string context
      
      # Try parsing again
      try:
          parsed = json.loads(output_text)
          print("✅ JSON fixed and parsed successfully after cleanup!")
      except json.JSONDecodeError as e2:
          # Still failed, show detailed error
          print(f"Still failing after fixes: {e2}")
          print(f"Error at line {e2.lineno}, column {e2.colno}")
          
          # Show context around the error
          lines = output_text.split('\n')
          start_line = max(0, e2.lineno - 3)
          end_line = min(len(lines), e2.lineno + 3)
          print("Context around error:")
          for i in range(start_line, end_line):
              if i < len(lines):
                  prefix = ">>> " if i == e2.lineno - 1 else "    "
                  line_content = lines[i][:150]  # Show more context
                  print(f"{prefix}{i+1}: {line_content}")
          
          print(f"\nOriginal output (first 800 chars): {original_text[:800]}")
          print(f"\nCleaned output (first 800 chars): {output_text[:800]}")
          raise
  
  output_path = f"output/monthly_market_report_{month}.json"
  with open(output_path, "w", encoding="utf-8") as f:
      f.write(output_text)

  print(f"Saved as {output_path}!")
  return output_text


def generate_infographic_data(url, month, year):
  """Generate ONLY visual infographic data from PDF (focused prompt for infographics)"""
  print(f"Starting infographic generation for {month} {year} from {url}")
  try:
    data_path = get_monthly_report(url=url)
    print(f"PDF downloaded to: {data_path}")
    data = open(data_path, "rb").read()
    print(f"PDF size: {len(data)} bytes")
  except Exception as e:
    print(f"Error downloading PDF: {e}")
    raise
  
  pdf = Part.from_data(
      data=data,
      mime_type="application/pdf"
  )

  infographic_prompt = """
You are creating visual infographic data for real estate market reports. Analyze the attached GVREALTORS monthly market report PDF and return ONLY a JSON object for the visual_infographic_data field.

JSON Schema:

{
  "location_title": "string (e.g., 'GREATER VANCOUVER')",
  "main_statistics": [
    {
      "label": "NEW LISTINGS",
      "current": "string (e.g., '2,210')",
      "pct_change": number (e.g., -25.5 for 25.5% decrease, 15.2 for 15.2% increase),
      "prev_month": "string (e.g., '2,967')",
      "prev_year": "string with % (e.g., '2,367 (-6.6%)')"
    },
    {
      "label": "ACTIVE LISTINGS",
      "current": "string",
      "pct_change": number,
      "prev_month": "string",
      "prev_year": "string with %"
    },
    {
      "label": "TOTAL SALES",
      "current": "string",
      "pct_change": number,
      "prev_month": "string",
      "prev_year": "string with %"
    },
    {
      "label": "AVERAGE PRICE",
      "current": "string (e.g., '$1,245,600')",
      "pct_change": number,
      "prev_month": "string",
      "prev_year": "string with %"
    }
  ],
  "benchmark_price_narratives": [
    {
      "type": "Single Family Detached",
      "price": "string (e.g., '$1,405,500')",
      "description": "string (e.g., 'The benchmark price for a detached home in Greater Vancouver decreased 0.6% in the past month to $1,405,500, down 6.8% from November 2023.')"
    },
    {
      "type": "Townhomes",
      "price": "string",
      "description": "string (similar format)"
    },
    {
      "type": "Apartments",
      "price": "string",
      "description": "string (similar format)"
    }
  ],
  "poster_metrics": [
    {
      "label": "string (e.g., 'Active Listings')",
      "value": "string (e.g., '13,245')",
      "change": "string (e.g., '+5.2%')",
      "trend": "string ('up' or 'down')"
    }
  ]
}

CRITICAL FORMATTING RULES:
1. Return ONLY valid JSON - no markdown, no backticks, no explanations
2. All strings must properly escape special characters: \\n for newlines, \\" for quotes, \\\\ for backslashes
3. Ensure all commas are correct - no trailing commas before ] or }
4. Numbers like pct_change should be actual numbers (e.g., -25.5), not strings
5. Use actual data from the PDF - no placeholders
6. Format prices with commas and $ sign: "$1,405,500"
7. For pct_change: negative numbers for decreases (e.g., -6.8), positive for increases (e.g., 5.2)
8. Descriptions should be 1-2 sentences with specific numbers from PDF

Extract the most visually impactful statistics for infographic display.
"""

  response = model.generate_content([infographic_prompt, pdf])
  output_text = response.text
  original_text = output_text
  
  print(f"Raw infographic response received, length: {len(output_text)}")
  
  # Clean markdown code blocks if present
  if "```json" in output_text:
      output_text = output_text.split("```json")[1]
      if "```" in output_text:
          output_text = output_text.split("```")[0]
  elif "```" in output_text:
      parts = output_text.split("```")
      if len(parts) >= 2:
          output_text = parts[1]
  
  output_text = output_text.strip()
  
  # Apply JSON string escaping
  def escape_json_string_content(json_str):
      result = []
      in_string = False
      i = 0
      while i < len(json_str):
          char = json_str[i]
          if char == '"' and (i == 0 or json_str[i-1] != '\\'):
              in_string = not in_string
              result.append(char)
          elif in_string:
              if char == '\n':
                  result.append('\\n')
              elif char == '\r':
                  result.append('\\r')
              elif char == '\t':
                  result.append('\\t')
              elif char == '\\' and i + 1 < len(json_str) and json_str[i + 1] not in ['n', 'r', 't', '\\', '"']:
                  result.append('\\\\')
              else:
                  result.append(char)
          else:
              result.append(char)
          i += 1
      return ''.join(result)
  
  output_text = escape_json_string_content(output_text)
  
  # Remove trailing commas
  import re
  output_text = re.sub(r',(\s*[\]}])', r'\1', output_text)
  
  # Validate JSON
  try:
      parsed = json.loads(output_text)
      print("✅ Infographic JSON parsed successfully!")
  except json.JSONDecodeError as e:
      print(f"JSON Parse Error: {e}")
      print(f"Error at line {e.lineno}, column {e.colno}")
      
      # Show context
      lines = output_text.split('\n')
      start_line = max(0, e.lineno - 3)
      end_line = min(len(lines), e.lineno + 3)
      print("Context around error:")
      for i in range(start_line, end_line):
          if i < len(lines):
              prefix = ">>> " if i == e.lineno - 1 else "    "
              print(f"{prefix}{i+1}: {lines[i][:150]}")
      raise
  
  print(f"Infographic data generated successfully!")
  return output_text