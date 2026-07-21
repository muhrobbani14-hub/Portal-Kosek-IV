import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins";

import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,

    // Pengguna baru dapat membuat akun melalui halaman registrasi.
    // Field isActive tetap tidak dapat dikirim dari client.
    disableSignUp: false,

    minPasswordLength: 12,
    maxPasswordLength: 128,

    // Setelah registrasi, pengguna diarahkan ke halaman login.
    autoSignIn: false,
  },

  user: {
    additionalFields: {
      isActive: {
        type: "boolean",
        required: false,
        defaultValue: true,

        // User tidak boleh mengaktifkan akunnya sendiri.
        input: false,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "VIEWER",

        // Role hanya diatur dari database/admin, bukan dari registrasi user.
        input: false,
      },
    },
  },

  session: {
    // Delapan jam.
    expiresIn: 60 * 60 * 8,

    // Perbarui masa berlaku maksimal satu kali per jam.
    updateAge: 60 * 60,
  },

  rateLimit: {
    enabled: true,
    window: 60,
    max: 20,
  },

  trustedOrigins: Array.from(
    new Set(
      [
        process.env.BETTER_AUTH_URL,
        process.env.NEXT_PUBLIC_APP_URL,
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
        "http://localhost:3000",
      ].filter((origin): origin is string => Boolean(origin)),
    ),
  ),

  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 30,
    }),
  ],
});
