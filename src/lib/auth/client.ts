import { createAuthClient } from "better-auth/react";
import {
  inferAdditionalFields,
  usernameClient,
} from "better-auth/client/plugins";

import type { auth } from "@/lib/auth/auth";

export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000",

  plugins: [
    usernameClient(),
    inferAdditionalFields<typeof auth>(),
  ],
});