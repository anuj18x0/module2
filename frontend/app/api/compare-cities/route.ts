import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { month, year, cities } = body;

    // Validate input
    if (!month || !year || !cities || !Array.isArray(cities)) {
      return NextResponse.json(
        { error: "Missing required fields: month, year, and cities" },
        { status: 400 }
      );
    }

    if (cities.length < 2 || cities.length > 3) {
      return NextResponse.json(
        { error: "Please provide 2-3 cities for comparison" },
        { status: 400 }
      );
    }

    console.log(`Comparing cities: ${cities.join(", ")} for ${month} ${year}`);

    // Call backend API
    const response = await fetch(`${BACKEND_URL}/compare-cities`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        month,
        year,
        cities,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.detail || "Failed to compare cities" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in compare-cities API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get list of available cities
    const response = await fetch(`${BACKEND_URL}/cities`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch cities");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching cities:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
