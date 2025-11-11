import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:3001";

export async function POST(request: NextRequest) {
  try {
    if (!API_URL || API_URL === "http://localhost:3001") {
      return NextResponse.json(
        { error: "API server not configured. Please set API_URL environment variable." },
        { status: 503 }
      );
    }
    
    const body = await request.json();
    const response = await fetch(`${API_URL}/api/analysis/enqueue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error enqueueing analysis:", error);
    return NextResponse.json(
      { error: error.message || "Failed to enqueue analysis" },
      { status: 500 }
    );
  }
}

