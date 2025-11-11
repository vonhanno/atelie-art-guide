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
    const response = await fetch(`${API_URL}/api/analysis?${params}`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch analyses" }, { status: 500 });
  }
}

