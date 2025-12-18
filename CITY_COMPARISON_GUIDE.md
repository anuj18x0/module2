# City Comparison Feature - Testing Guide

## Overview
This feature allows comparing real estate market data across 2-3 cities in Greater Vancouver using data from gvrealtors.ca monthly reports.

## Architecture

### Backend (FastAPI - Python)
- **Service**: `backend/services/city_comparision.py`
- **Endpoints**: Added in `backend/main.py`
  - `GET /cities` - Returns list of available Greater Vancouver cities
  - `POST /compare-cities` - Generates comparison report

### Frontend (Next.js)
- **API Route**: `frontend/app/api/compare-cities/route.ts`
- **Page**: `frontend/app/cities-comparison/page.tsx`
- **Component**: `frontend/components/CityComparisonInfographic.tsx`

## How to Test

### 1. Start Backend
```bash
cd backend
.\venv\Scripts\activate  # Windows
uvicorn main:app --reload --port 8000
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Access the Feature
Navigate to: `http://localhost:3000/cities-comparison`

### 4. Test Steps
1. Select a month (e.g., November)
2. Select a year (e.g., 2025)
3. Select 2-3 cities from the available list:
   - Vancouver East
   - Vancouver West
   - Burnaby East
   - Richmond
   - Surrey
   - etc.
4. Click "Compare Cities"

## Features

### Data Displayed
For each city and property type (Overall, Detached, Townhouse, Condo):
- Active Listings
- Total Sales
- Benchmark Price
- Month-over-Month Change (%)
- Year-over-Year Change (%)

### Visualizations
1. **Summary Cards** - Quick overview of each city
2. **Sales Comparison Chart** - Bar chart showing sales by property type
3. **Price Comparison Chart** - Horizontal bar chart of benchmark prices
4. **Active Listings Chart** - Bar chart of current inventory
5. **YoY Changes Chart** - Line chart showing year-over-year trends
6. **Market Health Radar** - Spider chart comparing overall market metrics
7. **Data Tables** - Detailed numeric tables for each property type

## API Request Format

```json
POST /api/compare-cities
{
  "month": "November",
  "year": "2025",
  "cities": ["Vancouver East", "Burnaby North", "Richmond"]
}
```

## API Response Format

```json
{
  "month": "November",
  "year": "2025",
  "summary": "Brief market summary...",
  "cities": [
    {
      "name": "Vancouver East",
      "overall": {
        "activeListings": 1234,
        "totalSales": 567,
        "benchmarkPrice": 1234567,
        "momChange": 2.5,
        "yoyChange": -5.3
      },
      "detached": { /* ... */ },
      "townhouse": { /* ... */ },
      "condo": { /* ... */ }
    }
  ]
}
```

## Error Handling

All null values are properly handled in the frontend:
- Null numbers display as "N/A"
- Charts use 0 as fallback for null values
- Percentage changes handle null gracefully

## Available Cities

- Vancouver East
- Vancouver West
- Burnaby East
- Burnaby North
- Burnaby South
- Coquitlam
- New Westminster
- North Vancouver
- Port Coquitlam
- Port Moody
- Richmond
- Surrey
- Pitt Meadows
- Maple Ridge
- Langley
- Delta
- White Rock
- West Vancouver

## Troubleshooting

### PDF Download Issues
- Ensure the PDF exists on gvrealtors.ca for the selected month/year
- Check backend logs for download errors

### Gemini API Issues
- Verify GOOGLE_APPLICATION_CREDENTIALS is set
- Check PROJECT_ID and LOCATION in .env file
- Ensure Vertex AI API is enabled

### Frontend Issues
- Install dependencies: `npm install lucide-react recharts`
- Clear browser cache if seeing stale data
- Check browser console for errors

## Next Steps

1. Add caching for frequently requested comparisons
2. Export to PDF functionality
3. Email report capability
4. Historical comparison over multiple months
5. Custom city selection persistence
