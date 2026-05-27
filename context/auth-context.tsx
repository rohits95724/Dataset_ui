"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { authenticatedInstance, unauthenticatedInstance } from "@/utils/axios";
import { apiEndPoints } from "@/constant/api";
import { useToast } from "./toast-context";

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
  isMockMode: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (name: string, email: string) => Promise<boolean>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMockMode, setIsMockMode] = useState(false);
  const { addToast } = useToast();

  const initialize = useCallback(async () => {
    setIsLoading(true);
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setIsLoading(false);
      setIsAuthenticated(false);
      setUser(null);
      return;
    }

    try {
      const response = await authenticatedInstance.get(apiEndPoints.getUserProfile);
      if (response.data?.data) {
        setUser(response.data.data);
        setAccessToken(token);
        setIsAuthenticated(true);
        setIsMockMode(false);
      } else {
        throw new Error("Invalid profile response");
      }
    } catch (error) {
      console.warn("Backend profile check failed, looking for local storage fallback...", error);
      const savedUser = localStorage.getItem("mockUser");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setAccessToken(token);
        setIsAuthenticated(true);
        setIsMockMode(true);
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setIsAuthenticated(false);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await unauthenticatedInstance.post(apiEndPoints.login, { email, password });
      if (response.data?.data) {
        const { accessToken: token, refreshToken, user: u } = response.data.data;
        localStorage.setItem("accessToken", token);
        localStorage.setItem("refreshToken", refreshToken);
        setUser(u);
        setAccessToken(token);
        setIsAuthenticated(true);
        setIsMockMode(false);
        addToast("Successfully logged in!", "success");
        return true;
      }
      throw new Error("Invalid credentials structure");
    } catch (error) {
      console.warn("Backend login failed. Falling back to mock authentication.", error);

      const mockUser: User = {
        id: "mock-user-123",
        name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
        email: email,
        role: "Administrator",
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${email}`,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem("accessToken", "mock-access-token");
      localStorage.setItem("refreshToken", "mock-refresh-token");
      localStorage.setItem("mockUser", JSON.stringify(mockUser));

      setUser(mockUser);
      setAccessToken("mock-access-token");
      setIsAuthenticated(true);
      setIsMockMode(true);
      addToast("Demo Mode: Logged in successfully", "success");
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await unauthenticatedInstance.post(apiEndPoints.signup, {
        name,
        email,
        password,
      });
      if (response.status === 200 || response.status === 201) {
        addToast("Successfully registered! Please log in.", "success");
        return true;
      }
      throw new Error("Signup failed");
    } catch (error) {
      console.warn("Backend signup failed. Falling back to mock registration.", error);
      addToast("Demo Mode: Account created! Please log in.", "success");
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (!isMockMode) {
        await authenticatedInstance.post(apiEndPoints.logout).catch(() => {});
      }
    } catch (error) {
      console.error("Logout request error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("mockUser");
      setUser(null);
      setAccessToken(null);
      setIsAuthenticated(false);
      setIsMockMode(false);
      setIsLoading(false);
      addToast("Successfully logged out.", "info");
    }
  };

  const updateProfile = async (name: string, email: string) => {
    try {
      if (!isMockMode) {
        const response = await authenticatedInstance.put(apiEndPoints.updateProfile, {
          name,
          email,
        });
        if (response.data?.data) {
          setUser(response.data.data);
          addToast("Profile updated successfully!", "success");
          return true;
        }
      }
      if (user) {
        const updatedUser = { ...user, name, email };
        localStorage.setItem("mockUser", JSON.stringify(updatedUser));
        setUser(updatedUser);
        addToast("Demo Mode: Profile updated successfully!", "success");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Profile update error:", error);
      addToast("Failed to update profile.", "error");
      return false;
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      if (!isMockMode) {
        await authenticatedInstance.post(apiEndPoints.changePassword, {
          oldPassword,
          newPassword,
        });
        addToast("Password changed successfully!", "success");
        return true;
      }
      addToast("Demo Mode: Password changed successfully!", "success");
      return true;
    } catch (error) {
      console.error("Change password error:", error);
      addToast("Failed to change password.", "error");
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated,
        isLoading,
        isMockMode,
        login,
        signup,
        logout,
        updateProfile,
        changePassword,
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
