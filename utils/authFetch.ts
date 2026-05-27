import { getSession } from "next-auth/react";

/**
 * Robust fetch utility wrapper that dynamically injects the Google OAuth Bearer token
 * from the active NextAuth session into headers.
 * 
 * @param url The target API URL
 * @param options Traditional fetch configuration options
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const session = await getSession();
  const idToken = session?.id_token;

  const headers = new Headers(options.headers);
  if (idToken) {
    headers.set("Authorization", `Bearer ${idToken}`);
  }
  
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
