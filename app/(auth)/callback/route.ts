import { NextResponse } from "next/server";

/**
 * Auth callback kept for future cloud sync.
 * Local mode redirects to dashboard.
 */
export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/dashboard`);
}
