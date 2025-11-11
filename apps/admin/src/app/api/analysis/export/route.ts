import { NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:3001";

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/api/analysis/export`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to export analyses" }, { status: 500 });
  }
}

