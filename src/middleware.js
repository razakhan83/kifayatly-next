import { NextResponse } from "next/server";

export function middleware(req) {
    // Middleware redirects have been removed to prevent loops.
    // The /admin route now handles unauthorized access directly via its own UI.
    return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
