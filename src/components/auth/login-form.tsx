"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth/client";

export function LoginForm() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErrorMessage("");
    setIsLoading(true);

    try {
      const result = await authClient.signIn.username({
        username: username.trim(),
        password,
      });

      if (result.error) {
        if (result.error.status === 401) {
          setErrorMessage("Username atau password tidak sesuai.");
        } else {
          console.error("Login API error:", {
            code: result.error.code,
            status: result.error.status,
          });
          setErrorMessage(
            "Login gagal diproses karena gangguan layanan. Silakan coba kembali.",
          );
        }

        return;
      }

      const sessionResult = await authClient.getSession();

      if (
        sessionResult.data?.user.isActive === false
      ) {
        await authClient.signOut();

        setErrorMessage(
          "Akun ini sedang dinonaktifkan. Hubungi administrator.",
        );

        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);

      setErrorMessage(
        "Terjadi gangguan saat login. Silakan coba kembali.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div>
        <label
          htmlFor="username"
          className="mb-2 block text-left text-sm font-medium text-white"
        >
          Username
        </label>

        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(event) =>
            setUsername(event.target.value)
          }
          disabled={isLoading}
          required
          minLength={3}
          className="w-full rounded-lg border border-white/20 bg-white/90 px-4 py-3 text-slate-950 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="Masukkan username"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-left text-sm font-medium text-white"
        >
          Password
        </label>

        <div className="relative">
          <input
            id="password"
            name="password"
            type={isPasswordVisible ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            disabled={isLoading}
            required
            minLength={12}
            className="w-full rounded-lg border border-white/20 bg-white/90 px-4 py-3 pr-12 text-slate-950 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="Masukkan password"
          />
          <button
            type="button"
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            aria-label={
              isPasswordVisible ? "Sembunyikan password" : "Tampilkan password"
            }
            aria-pressed={isPasswordVisible}
            className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-600 transition hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
          >
            {isPasswordVisible ? (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.9 5.2A10.7 10.7 0 0112 5c5.2 0 8.5 4.7 9.5 6.4a1.2 1.2 0 010 1.2 15 15 0 01-3 3.5M6.2 6.2A15.4 15.4 0 002.5 11.4a1.2 1.2 0 000 1.2C3.5 14.3 6.8 19 12 19c.9 0 1.8-.2 2.6-.4"
                />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.5 12s3.3-7 9.5-7 9.5 7 9.5 7-3.3 7-9.5 7-9.5-7-9.5-7z"
                />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {errorMessage ? (
        <div
          role="alert"
          className="rounded-lg border border-red-400/30 bg-red-950/60 px-4 py-3 text-sm text-red-100"
        >
          {errorMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={
          isLoading ||
          username.trim().length < 3 ||
          password.length < 12
        }
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Memproses..." : "LOGIN"}
      </button>

      <p className="text-center text-sm text-white/80">
        Belum memiliki akun?{" "}
        <Link
          href="/register"
          className="font-semibold text-blue-300 hover:text-blue-200"
        >
          Daftar sekarang
        </Link>
      </p>
    </form>
  );
}
