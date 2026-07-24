import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth/auth";

const protectedPaths = [
  "/dashboard",
  "/kosek-iv",
  "/organization",
  "/members",
  "/satrad",
  "/units",
];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isProtectedPath = protectedPaths.some(
    (path) =>
      pathname === path ||
      pathname.startsWith(`${path}/`),
  );

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session || session.user.isActive === false) {
    return NextResponse.redirect(
      new URL("/", request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/kosek-iv/:path*",
    "/organization/:path*",
    "/members/:path*",
    "/satrad/:path*",
    "/units/:path*",
  ],
};
