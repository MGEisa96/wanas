import { NextResponse } from "next/server";

/** Placeholder library for dashboard image picker. */
export async function GET() {
  return NextResponse.json({
    images: [{ src: "/assets/logo.jpeg", name: "ونس" }],
  });
}
