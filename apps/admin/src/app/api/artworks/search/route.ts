import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:3001";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || "";
  const artist = searchParams.get("artist") || "";
  const availability = searchParams.get("availability") || "";
  const technique = searchParams.get("technique") || "";
  const page = searchParams.get("page") || "1";
  const hitsPerPage = searchParams.get("hitsPerPage") || "20";

  const params = new URLSearchParams({
    page,
    hitsPerPage,
  });
  if (query) params.append("q", query);
  if (artist) params.append("artist", artist);
  if (availability) params.append("availability", availability);
  if (technique) params.append("technique", technique);

  try {
    const response = await fetch(`${API_URL}/api/artworks/search?${params}`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to search artworks" }, { status: 500 });
  }
}

