"use client";
import React from "react";
import NextTopLoader from "nextjs-toploader";
import { ModalProvider } from "@/context/modal-context";
import { ToastProvider } from "@/context/toast-context";
import { AuthProvider } from "@/context/auth-context";
import { DatasetProvider } from "@/context/dataset-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 0,
        refetchOnReconnect: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <DatasetProvider>
            <ModalProvider>
              <NextTopLoader showSpinner={false} color="#0CAF60" />
              {children}
            </ModalProvider>
          </DatasetProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
};