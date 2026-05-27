"use client";
import React from "react";
import { Navbar } from "@/components/custom/navbar/Navbar";
import { Sidebar } from "@/components/custom/sidebar/Sidebar";
import { CustomToastContainer } from "@/components/custom/custom-toast/CustomToast";
import { useAuth } from "@/context/auth-context";

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex h-screen flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {isAuthenticated && <Sidebar />}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {children}
        </div>
      </div>
      <CustomToastContainer />
    </div>
  );
};
