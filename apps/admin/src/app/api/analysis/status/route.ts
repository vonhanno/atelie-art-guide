import { NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:3001";

export async function GET() {
  try {
    if (!API_URL || API_URL === "http://localhost:3001") {
      // Return default/empty stats if API is not configured
      return NextResponse.json({
        total: 0,
        pending: 0,
        processing: 0,
        done: 0,
        failed: 0,
        successRate: 0,
      });
    }
    
    const response = await fetch(`${API_URL}/api/analysis/status`, {
      next: { revalidate: 5 }, // Cache for 5 seconds
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching analysis status:", error);
    // Return empty stats instead of error to prevent client crash
    return NextResponse.json({
      total: 0,
      pending: 0,
      processing: 0,
      done: 0,
      failed: 0,
      successRate: 0,
    });
  }
}

