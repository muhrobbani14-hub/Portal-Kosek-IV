import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";

export const getCurrentSession = cache(async () => {
  return auth.api.getSession({
    headers: await headers(),
  });
});

export const requireUser = cache(async () => {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/");
  }

  if (session.user.isActive === false) {
    redirect("/");
  }

  return session;
});
