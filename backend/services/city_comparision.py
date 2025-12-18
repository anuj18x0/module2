import requests
from vertexai.generative_models import GenerativeModel, Part
from services.download_monthly_report import get_monthly_report
import json
import os
from typing import List, Dict

model = GenerativeModel("gemini-2.5-pro")

GREATER_VANCOUVER_CITIES = [
    "Vancouver East", "Vancouver West", "Burnaby East", "Burnaby North", "Burnaby South", "Coquitlam", "New Westminster", "North Vancouver", 
    "Port Coquitlam", "Port Moody", "Richmond", "Surrey", "Pitt Meadows",
    "Maple Ridge", "Langley", "Delta", "White Rock", "West Vancouver"
]

def download_city_pdfs(month: str, year: str, cities: List[str]) -> Dict[str, str]:
    """
    Download PDFs for the specified month/year for city-specific data.
    Returns a dict mapping city names to their PDF paths.
    """
    base_url = f"https://members.gvrealtors.ca/news/GVR-Stats-Package-{month}-{year}.pdf"
    
    print(f"Downloading PDF for {month} {year}")
    try:
        pdf_path = get_monthly_report(base_url)
        # For now, we use the same PDF for all cities since GVR provides regional data
        print(f"PDF downloaded successfully: {pdf_path}")
    except Exception as e:
        print(f"Error downloading PDF: {e}")
        raise Exception(f"Failed to download PDF for {month} {year}")
    
    return pdf_path

def generate_city_comparison_prompt(cities: List[str], month: str, year: str) -> str:
    """
    Generate the prompt for Gemini to extract city comparison data.
    """
    cities_list = ", ".join(cities)
    
    prompt = f"""You are a real estate data analyst. Analyze the attached Greater Vancouver Real Estate Board monthly report PDF for {month} {year}.

Extract and compare the following data for these cities/regions: {cities_list}

For EACH city, extract the following metrics for ALL property types (Overall, Detached, Townhouse, Apartment/Condo):

1. **New Listings** (new listings added this month)
2. **Active Listings** (current month)
3. **Total Sales** (current month)
4. **Benchmark Price** (current month)
5. **Month-over-Month Change** (MoM % change compared to previous month)
6. **Year-over-Year Change** (YoY % change compared to same month last year)

Return ONLY a valid JSON object with this EXACT structure:

{{
  "month": "{month}",
  "year": "{year}",
  "cities": [
    {{
      "name": "City Name",
      "overall": {{
        "newListings": 1234,
        "activeListings": 1234,
        "totalSales": 567,
        "benchmarkPrice": 1234567,
        "momChange": 2.5,
        "yoyChange": -5.3
      }},
      "detached": {{
        "newListings": 456,
        "activeListings": 456,
        "totalSales": 123,
        "benchmarkPrice": 2345678,
        "momChange": 1.8,
        "yoyChange": -6.2
      }},
      "townhouse": {{
        "newListings": 234,
        "activeListings": 234,
        "totalSales": 89,
        "benchmarkPrice": 1234567,
        "momChange": number,
        "yoyChange": number
      }},
      "apartment": {{
        "newListings": number,
        "activeListings": number,
        "totalSales": number,
        "benchmarkPrice": number,
        "momChange": number,
        "yoyChange": number
      }}
    }}
  ],
  "summary": "Brief 2-3 sentence summary of key trends across these cities"
}}

IMPORTANT:
- Use EXACT numeric values from the PDF (no approximations)
- Each and Every data is present in the pdf so dont return N/A
- MoM and YoY changes should be in percentage (positive for increase, negative for decrease)
- Return ONLY the JSON object, no additional text or markdown formatting
- Ensure all numbers are actual numbers, not strings
- here new listings is reffered as the new listings made in the current month - last month
"""
    
    return prompt

def compare_cities(month: str, year: str, cities: List[str]) -> Dict:
    """
    Main function to compare multiple cities.
    
    Args:
        month: Month name (e.g., "November")
        year: Year (e.g., "2025")
        cities: List of 2-3 city names from Greater Vancouver
    
    Returns:
        Dict containing comparison data in JSON format
    """
    print(f"\n{'='*60}")
    print(f"Starting city comparison for {month} {year}")
    print(f"Cities: {', '.join(cities)}")
    print(f"{'='*60}\n")
    
    # Validate inputs
    if not cities or len(cities) < 2 or len(cities) > 3:
        raise ValueError("Please provide 2-3 cities for comparison")
    
    # Validate cities are from Greater Vancouver
    for city in cities:
        if city not in GREATER_VANCOUVER_CITIES:
            raise ValueError(f"Invalid city: {city}. Must be from Greater Vancouver area.")
    
    # Check if comparison already exists in database
    print("Step 0: Checking database for existing comparison...")
    try:
        from services.mongo import mongo_service
        city_names = sorted(cities)
        existing_comparisons = mongo_service.get_city_comparison(month=month, year=year)
        
        for comparison in existing_comparisons:
            if sorted(comparison.get("city_names", [])) == city_names:
                print(f"✅ Found existing comparison in database!")
                print(f"{'='*60}\n")
                # Return existing data in the expected format
                return {
                    "month": comparison.get("month"),
                    "year": comparison.get("year"),
                    "cities": comparison.get("cities"),
                    "summary": comparison.get("summary")
                }
    except Exception as db_error:
        print(f"⚠️  Database check failed: {db_error}")
        print("Proceeding with new comparison generation...")
    
    # Download PDFs
    print("Step 1: Downloading PDFs...")
    pdf_path = f"GVR-Stats-Package-{month}-{year}.pdf"
    if not os.path.exists(f"GVR-Stats-Package-{month}-{year}.pdf"):
        pdf_path = download_city_pdfs(month, year, cities)
    
    try:
        with open(pdf_path, "rb") as f:
            pdf_data = f.read()
        print(f"PDF loaded: {len(pdf_data)} bytes")
    except Exception as e:
        print(f"Error reading PDF: {e}")
        raise Exception(f"Failed to read PDF file: {pdf_path}")
    
    # Create Gemini Part
    pdf_part = Part.from_data(
        data=pdf_data,
        mime_type="application/pdf"
    )
    
    # Generate prompt
    print("Step 3: Generating comparison prompt...")
    prompt = generate_city_comparison_prompt(cities, month, year)
    
    # Call Gemini
    print("Step 4: Calling Gemini API...")
    try:
        response = model.generate_content([prompt, pdf_part])
        result_text = response.text
        print(f"Gemini response received: {len(result_text)} characters")
        
        # Clean the response (remove markdown code blocks if present)
        result_text = result_text.strip()
        if result_text.startswith("```json"):
            result_text = result_text[7:]
        if result_text.startswith("```"):
            result_text = result_text[3:]
        if result_text.endswith("```"):
            result_text = result_text[:-3]
        result_text = result_text.strip()
        
        # Parse JSON
        print("Step 5: Parsing JSON response...")
        comparison_data = json.loads(result_text)
        
        print(f"\n{'='*60}")
        print(f"✅ City comparison completed successfully!")
        print(f"{'='*60}\n")

        print(comparison_data)
        
        # Save to MongoDB
        try:
            from services.mongo import mongo_service
            mongo_service.save_city_comparison(
                month=comparison_data.get("month"),
                year=comparison_data.get("year"),
                cities=comparison_data.get("cities"),
                summary=comparison_data.get("summary")
            )
        except Exception as db_error:
            print(f"⚠️  Failed to save to database: {db_error}")
            # Continue even if DB save fails
        
        return comparison_data
        
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {e}")
        print(f"Raw response: {result_text[:500]}...")
        raise Exception(f"Failed to parse Gemini response as JSON: {e}")
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        raise Exception(f"Failed to generate city comparison: {e}")

def get_available_cities() -> List[str]:
    """
    Returns the list of available cities in Greater Vancouver.
    """
    return GREATER_VANCOUVER_CITIES
