"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "./toast-context";
import { authService } from "@/services/auth/authService";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  createdAt?: string;
}

interface AuthContextProps {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  // Handle NextAuth Session Synchronization
  useEffect(() => {
    if (status === "loading") {
      setIsLoading(true);
      return;
    }

    if (status === "authenticated" && session) {
      const nextAuthUser: User = {
        id: `google-${session.user?.email?.split("@")[0] || "user"}`,
        name: session.user?.name || "Google User",
        email: session.user?.email || "",
        role: "Administrator",
        avatarUrl: session.user?.image || `https://api.dicebear.com/7.x/initials/svg?seed=${session.user?.email}`,
        createdAt: new Date().toISOString(),
      };
      setUser(nextAuthUser);
      setAccessToken(session.id_token || null);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setAccessToken(null);
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, [session, status]);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      await authService.signInWithGoogle();
      return true;
    } catch (error) {
      console.error("Google login failed", error);
      addToast("Google sign-in failed", "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Clear legacy storage tokens if any
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("mockUser");
      
      await authService.signOut();
    } catch (error) {
      console.error("Logout request error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated,
        isLoading,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
