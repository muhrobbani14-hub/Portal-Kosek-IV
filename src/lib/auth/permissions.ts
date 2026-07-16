import "server-only";

import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth/auth";

type SessionLike = {
  user?: {
    isActive?: boolean | null;
    role?: string | null;
  } | null;
} | null;

export function canEditPortal(session: SessionLike) {
  return (
    Boolean(session) &&
    session?.user?.isActive !== false &&
    session?.user?.role === "ADMIN"
  );
}

export async function requireAdminRequest(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  return canEditPortal(session) ? session : null;
}
