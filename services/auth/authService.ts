import { signIn, signOut } from "next-auth/react";

export const authService = {
  /**
   * Triggers the NextAuth Google OAuth redirection flow.
   */
  async signInWithGoogle(): Promise<void> {
    await signIn("google");
  },

  /**
   * Triggers the NextAuth session termination and redirects to the login screen.
   */
  async signOut(): Promise<void> {
    await signOut({ callbackUrl: "/auth/login" });
  },
};
