"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth/client";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    if (isLoading) return;

    setIsLoading(true);

    try {
      await authClient.signOut();

      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      aria-label={isLoading ? "Sedang keluar" : "Keluar dari portal"}
      className={[
        "group relative inline-flex h-10 items-center justify-center gap-2 overflow-hidden",
        "rounded-xl border border-red-400/20 bg-red-500/[0.06] px-3",
        "text-xs font-bold text-red-300 shadow-[0_8px_24px_rgba(0,0,0,0.2)]",
        "transition duration-300",
        "hover:-translate-y-0.5 hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-200",
        "hover:shadow-[0_12px_30px_rgba(0,0,0,0.3),0_0_18px_rgba(248,113,113,0.08)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70",
        "disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50",
        "sm:px-4 sm:text-sm",
      ].join(" ")}
    >
      {/* Highlight tipis bagian atas */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-300/50 to-transparent" />

      {/* Ikon logout */}
      <span className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-red-400/20 bg-red-500/10 transition duration-300 group-hover:border-red-400/40 group-hover:bg-red-500/15">
        {isLoading ? (
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-3.5 w-3.5 animate-spin fill-none stroke-current"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              className="opacity-25"
            />

            <path
              d="M21 12a9 9 0 0 0-9-9"
              className="opacity-90"
            />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-3.5 w-3.5 fill-none stroke-current"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 17l5-5-5-5" />
            <path d="M15 12H3" />
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          </svg>
        )}
      </span>

      <span className="relative hidden sm:inline">
        {isLoading ? "Keluar..." : "Logout"}
      </span>
    </button>
  );
}