import { auth } from "@/auth";

/**
 * Get the current session on the server side
 * Use this in Server Components, Server Actions, and API routes
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

