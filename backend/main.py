from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from services.gemini_service import generate_market_report, generate_infographic_data
from services.city_comparision import compare_cities, get_available_cities
from services.mongo import mongo_service
from services.email_service import email_service
import json
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MonthRequest(BaseModel):
    month: str
    year: str

class EmailRequest(BaseModel):
    month: str
    year: str
    to_emails: List[str]
    subject: str = None
    template: str = "pastel"  # "pastel" or "blue"

class CityComparisonRequest(BaseModel):
    month: str
    year: str
    cities: List[str]  # 2-3 cities from Greater Vancouver

class CityComparisonEmailRequest(BaseModel):
    month: str
    year: str
    cities: List[str]
    to_emails: List[str]
    subject: str = None

class CityComparisonFacebookRequest(BaseModel):
    month: str
    year: str
    cities: List[str]
    caption: str = None

@app.post("/analyze")
async def analyze_report(request: MonthRequest):
    try:
        month = request.month
        year = request.year
        print(f"Processing month: {month} {year}")
        
        # Check if report already exists in database
        existing_report = mongo_service.get_report(month, year)
        if existing_report:
            print(f"✅ Report for {month} {year} already exists in database")
            return existing_report.get("data", existing_report)
        
        print(f"Report not found in database, generating new report...")

        
        url = f"https://members.gvrealtors.ca/news/GVR-Stats-Package-{month}-{year}.pdf"
        print(f"Downloading from: {url}")
        
        output = generate_market_report(url, month, year)
        print(f"Got output, length: {len(output)}")
        
        if not output or not output.strip():
            raise HTTPException(status_code=500, detail="generate_market_report returned empty response")
        
        print("Parsing JSON...")
        data = json.loads(output)
        print("JSON parsed successfully")
        
        # Save to MongoDB
        mongo_id = mongo_service.save_report(month, year, data)
        if mongo_id:
            data["mongo_id"] = mongo_id
        
        return data
    except HTTPException:
        raise
    except json.JSONDecodeError as e:
        print(f"JSON Error: {e}")
        raise HTTPException(status_code=500, detail=f"Invalid JSON from API: {str(e)}")
    except Exception as e:
        print(f"Exception: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.get("/")
def root():
    return {"message": "Market Report API Running", "mongodb": mongo_service.connected}

@app.get("/reports")
def get_all_reports(year: str = None):
    """Get all saved market reports from MongoDB (optionally filtered by year)"""
    reports = mongo_service.get_all_reports(year)
    return {"count": len(reports), "reports": reports}

@app.get("/reports/{month}")
def get_report(month: str, year: str = None):
    """Get specific month's market report from MongoDB (optionally filtered by year)"""
    report = mongo_service.get_report(month, year)
    if not report:
        year_msg = f" {year}" if year else ""
        raise HTTPException(status_code=404, detail=f"Report for {month}{year_msg} not found")
    return report

@app.delete("/reports/{month}")
def delete_report(month: str, year: str = 2025):
    """Delete specific month's market report from MongoDB"""
    success = mongo_service.delete_report(month, year)
    if not success:
        raise HTTPException(status_code=404, detail=f"Report for {month} not found")
    return {"message": f"Report for {month} deleted successfully"}

@app.post("/infographic")
async def generate_infographic(request: MonthRequest):
    """Generate only visual infographic data for market report"""
    try:
        month = request.month
        year = request.year
        print(f"Generating infographic for: {month} {year}")
        
        # Check if report with infographic already exists
        existing_report = mongo_service.get_report(month, year)
        if existing_report and existing_report.get("data", {}).get("visual_infographic_data"):
            print(f"✅ Infographic for {month} {year} already exists")
            return {
                "message": "Infographic already exists",
                "visual_infographic_data": existing_report["data"]["visual_infographic_data"]
            }
        
        print(f"Generating new infographic data...")
        
        # Download PDF
        url = f"https://members.gvrealtors.ca/news/GVR-Stats-Package-{month}-{year}.pdf"
        print(f"Downloading from: {url}")
        
        # Generate only infographic data
        infographic_json = generate_infographic_data(url, month, year)
        infographic_data = json.loads(infographic_json)
        
        print("Infographic data generated successfully")
        
        # Update existing report or create new one with only infographic data
        if existing_report:
            # Update existing report with infographic data
            existing_report["data"]["visual_infographic_data"] = infographic_data
            mongo_service.save_report(month, year, existing_report["data"])
            print("Updated existing report with infographic data")
        else:
            # Create minimal report with only infographic data
            minimal_report = {
                "month": month,
                "year": year,
                "visual_infographic_data": infographic_data
            }
            mongo_service.save_report(month, year, minimal_report)
            print("Created new report with infographic data")
        
        return {
            "message": "Infographic generated successfully",
            "visual_infographic_data": infographic_data
        }
        
    except HTTPException:
        raise
    except json.JSONDecodeError as e:
        print(f"JSON Error: {e}")
        raise HTTPException(status_code=500, detail=f"Invalid JSON from API: {str(e)}")
    except Exception as e:
        print(f"Exception: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.post("/send-email")
async def send_infographic_email(request: EmailRequest):
    """Send infographic as HTML email"""
    try:
        month = request.month
        year = request.year
        to_emails = request.to_emails
        
        # Get report from database
        existing_report = mongo_service.get_report(month, year)
        if not existing_report or not existing_report.get("data", {}).get("visual_infographic_data"):
            raise HTTPException(status_code=404, detail="Infographic not found. Please generate it first.")
        
        visual_data = existing_report["data"]["visual_infographic_data"]
        
        # Generate HTML email content based on selected template
        if request.template == "blue":
            html_content = email_service.generate_blue_template_html(visual_data, month, year)
        else:
            html_content = email_service.generate_infographic_html(visual_data, month, year)
        
        # Send email
        subject = request.subject or f"{month} {year} - Real Estate Market Update"
        email_service.send_email(to_emails, subject, html_content, request.template)
        
        return {
            "message": "Email sent successfully",
            "recipients": to_emails
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

@app.get("/cities")
async def get_cities():
    """Get list of available cities in Greater Vancouver"""
    return {
        "cities": get_available_cities(),
        "count": len(get_available_cities())
    }

@app.post("/compare-cities")
async def compare_cities_endpoint(request: CityComparisonRequest):
    """Compare real estate data across 2-3 cities in Greater Vancouver"""
    try:
        month = request.month
        year = request.year
        cities = request.cities
        
        print(f"Processing city comparison: {month} {year}")
        print(f"Cities: {cities}")
        
        # Validate input
        if not cities or len(cities) < 2 or len(cities) > 3:
            raise HTTPException(
                status_code=400, 
                detail="Please provide 2-3 cities for comparison"
            )
        
        # Generate comparison
        comparison_data = compare_cities(month, year, cities)
        
        print(f"✅ Comparison completed successfully")
        
        return comparison_data
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        print(f"Exception: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.post("/email-city-comparison")
async def email_city_comparison(request: CityComparisonEmailRequest):
    """Generate and email city comparison report"""
    try:
        month = request.month
        year = request.year
        cities = request.cities
        to_emails = request.to_emails
        
        print(f"Generating city comparison email for {month} {year}")
        print(f"Cities: {cities}")
        print(f"Recipients: {to_emails}")
        
        # Validate input
        if not cities or len(cities) < 2 or len(cities) > 3:
            raise HTTPException(
                status_code=400,
                detail="Please provide 2-3 cities for comparison"
            )
        
        if not to_emails or len(to_emails) == 0:
            raise HTTPException(status_code=400, detail="Please provide at least one recipient email")
        
        # Check if comparison already exists in database
        city_names = sorted(cities)
        existing_comparisons = mongo_service.get_city_comparison(month=month, year=year)
        
        comparison_data = None
        for comp in existing_comparisons:
            comp_cities = sorted([c.get("name") for c in comp.get("cities", [])])
            if comp_cities == city_names:
                print(f"✅ Found existing comparison in database")
                comparison_data = comp
                break
        
        # If not found, generate new comparison
        if not comparison_data:
            print(f"⚠️  Comparison not found in database, generating new one...")
            comparison_data = compare_cities(month, year, cities)
        
        # Generate HTML email
        html_content = email_service.generate_city_comparison_html(comparison_data)
        
        # Generate subject if not provided
        city_names = ", ".join(cities)
        subject = request.subject or f"Greater Vancouver City Comparison: {city_names} - {month} {year}"
        
        # Send email
        success = email_service.send_email(to_emails, subject, html_content)
        
        if success:
            return {
                "success": True,
                "message": f"City comparison email sent to {len(to_emails)} recipient(s)",
                "recipients": to_emails,
                "cities": cities,
                "month": month,
                "year": year
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to send email")
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        print(f"Exception: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error sending city comparison email: {str(e)}")

@app.post("/city-comparison-image")
async def generate_city_comparison_image(request: CityComparisonRequest):
    """Generate city comparison as image for social media posting"""
    try:
        month = request.month
        year = request.year
        cities = request.cities
        
        print(f"Generating city comparison image for {month} {year}")
        print(f"Cities: {cities}")
        
        # Validate input
        if not cities or len(cities) < 2 or len(cities) > 3:
            raise HTTPException(
                status_code=400,
                detail="Please provide 2-3 cities for comparison"
            )
        
        # Check if comparison already exists in database
        city_names = sorted(cities)
        existing_comparisons = mongo_service.get_city_comparison(month=month, year=year)
        
        comparison_data = None
        for comp in existing_comparisons:
            comp_cities = sorted([c.get("name") for c in comp.get("cities", [])])
            if comp_cities == city_names:
                print(f"✅ Found existing comparison in database")
                comparison_data = comp
                break
        
        # If not found, generate new comparison
        if not comparison_data:
            print(f"⚠️  Comparison not found in database, generating new one...")
            comparison_data = compare_cities(month, year, cities)
        
        # Generate HTML
        html_content = email_service.generate_city_comparison_html(comparison_data)
        
        # Convert to image and upload to temporary storage
        try:
            from services.html_to_image import html_to_image_sync
            import base64
            import requests
            from io import BytesIO
            
            print("Converting HTML to image...")
            image_bytes = html_to_image_sync(html_content, width=900)
            print(f"Image generated: {len(image_bytes)} bytes")
            
            # Upload to imgbb or similar service for a public URL
            # For now, return base64 - but Facebook might need a public URL
            image_base64 = base64.b64encode(image_bytes).decode('utf-8')
            
            # Try to upload to imgbb for a public URL (optional, needs API key)
            imgbb_key = os.getenv("IMGBB_API_KEY", "")
            image_url = None
            
            if imgbb_key:
                try:
                    print("Uploading to imgbb...")
                    upload_response = requests.post(
                        "https://api.imgbb.com/1/upload",
                        data={
                            "key": imgbb_key,
                            "image": image_base64
                        }
                    )
                    if upload_response.ok:
                        image_url = upload_response.json()["data"]["url"]
                        print(f"Image uploaded: {image_url}")
                except Exception as upload_err:
                    print(f"Failed to upload to imgbb: {upload_err}")
            
            return {
                "success": True,
                "image_base64": f"data:image/png;base64,{image_base64}",
                "image_url": image_url,
                "month": month,
                "year": year,
                "cities": cities
            }
        except ImportError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Image conversion library not installed: {str(e)}. Run: pip install imgkit"
            )
        except Exception as e:
            print(f"Error in image generation: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate image: {str(e)}"
            )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        print(f"Exception: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating city comparison image: {str(e)}")