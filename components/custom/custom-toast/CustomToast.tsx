"use client";
import React from "react";
import { useToast } from "@/context/toast-context";
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const CustomToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => {
        let Icon = Info;
        let colorClass =
          "bg-blue-50 border-blue-200 text-blue-800 dark:bg-zinc-900 dark:border-blue-900/50 dark:text-blue-200";
        if (toast.type === "success") {
          Icon = CheckCircle;
          colorClass =
            "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-zinc-900 dark:border-emerald-950 dark:text-emerald-400";
        } else if (toast.type === "error") {
          Icon = AlertCircle;
          colorClass =
            "bg-rose-50 border-rose-200 text-rose-800 dark:bg-zinc-900 dark:border-rose-950 dark:text-rose-400";
        } else if (toast.type === "warning") {
          Icon = AlertTriangle;
          colorClass =
            "bg-amber-50 border-amber-200 text-amber-800 dark:bg-zinc-900 dark:border-amber-950 dark:text-amber-400";
        }

        return (
          <div
            key={toast.id}
            className={cn(
              "flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all transform duration-300 ease-out",
              colorClass
            )}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm font-medium leading-5">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0 cursor-pointer"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
