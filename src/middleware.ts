import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routeAccessMap } from "./lib/settings";
import { verifySession } from "./lib/auth";

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Public routes and static assets
  const isStaticAsset = path.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|json)$/) || path.startsWith("/_next") || path.startsWith("/img") || path.startsWith("/public");

  if (path === "/sign-in" || path === "/api/auth/login" || path === "/api/auth/logout" || isStaticAsset) {
    return NextResponse.next();
  }

  // Verify session
  const session = await verifySession();
  const role = session?.role as string | undefined;

  // If not logged in and trying to access protected route (anything not public)
  if (!role) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // Redirect "/" to role-based dashboard
  if (path === "/") {
    return NextResponse.redirect(new URL(`/${role}`, req.url));
  }

  // Role-based access control
  for (const [routePattern, allowedRoles] of Object.entries(routeAccessMap)) {
    // Convert route pattern to simple regex (assuming simple patterns like /admin(.*))
    // The previous code used createRouteMatcher from Clerk which handles complex patterns.
    // Our settings.ts has patterns like "/admin(.*)".
    // We need to convert this to a regex that matches start of string.

    // Pattern: /admin(.*) -> ^/admin.*$
    const regexPattern = `^${routePattern.replace("(.*)", ".*")}$`;
    const matcher = new RegExp(regexPattern);

    if (matcher.test(path)) {
      if (!allowedRoles.includes(role)) {
        // Authorized role check
        return NextResponse.redirect(new URL(`/${role}`, req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Verify we are matching everything except static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
