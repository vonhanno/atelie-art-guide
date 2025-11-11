import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:3001";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ artworkId: string }> }
) {
  try {
    if (!API_URL || API_URL === "http://localhost:3001") {
      return NextResponse.json({ error: "API server not configured" }, { status: 503 });
    }
    
    const { artworkId } = await params;
    const response = await fetch(`${API_URL}/api/analysis/artwork/${artworkId}`, {
      next: { revalidate: 10 },
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: "Analysis not found" }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching analysis:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch analysis" },
      { status: 500 }
    );
  }
}

