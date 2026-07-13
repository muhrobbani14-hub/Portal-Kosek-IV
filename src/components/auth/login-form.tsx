"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth/client";

export function LoginForm() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
        setErrorMessage(
          "Username atau password tidak sesuai.",
        );
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

        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          disabled={isLoading}
          required
          minLength={12}
          className="w-full rounded-lg border border-white/20 bg-white/90 px-4 py-3 text-slate-950 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="Masukkan password"
        />
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
