import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:3001";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status") || "";
  const limit = searchParams.get("limit") || "50";
  const offset = searchParams.get("offset") || "0";

  const params = new URLSearchParams({ limit, offset });
  if (status) params.append("status", status);

  try {
    if (!API_URL || API_URL === "http://localhost:3001") {
      // Return empty results if API is not configured
      return NextResponse.json({
        results: [],
        total: 0,
        limit: Number(limit),
        offset: Number(offset),
      });
    }
    
    const response = await fetch(`${API_URL}/api/analysis?${params}`, {
      next: { revalidate: 5 },
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching analyses:", error);
    // Return empty results instead of error
    return NextResponse.json({
      results: [],
      total: 0,
      limit: Number(limit),
      offset: Number(offset),
    });
  }
}

