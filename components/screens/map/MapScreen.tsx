"use client";
import React, { useMemo, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useDataset } from "@/context/dataset-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Doctor } from "@/types/doctor";

const MapView = dynamic(() => import("./components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[580px] rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950/20">
      <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-2" />
      <p className="text-xs font-semibold text-zinc-550 dark:text-zinc-450 animate-pulse">
        Initializing interactive map viewport...
      </p>
    </div>
  ),
});

export default function MapScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    originalData,
    data,
    filters,
    setFilterPanelOpen,
  } = useDataset();

  // Auth Guard redirect
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Check if any filters are active (same logic as Dashboard)
  const isFilterActive = useMemo(() => {
    if (filters.globalSearch && filters.globalSearch.trim() !== "") {
      return true;
    }

    const colFilters = filters.columnFilters || {};
    for (const key of Object.keys(colFilters)) {
      const val = colFilters[key];
      if (key === "gpsProximity") {
        if (val && (val.lat !== null || val.lng !== null || (val.radius && val.radius !== ""))) {
          return true;
        }
      } else if (key === "doctors_main.governmentEmployee" || key === "isForeignEducated") {
        if (val && val !== "all") {
          return true;
        }
      } else if (Array.isArray(val)) {
        if (val.length > 0) {
          return true;
        }
      } else if (val && typeof val === "object") {
        if (
          (val.min !== undefined && val.min !== "") ||
          (val.max !== undefined && val.max !== "") ||
          (val.start !== undefined && val.start !== "") ||
          (val.end !== undefined && val.end !== "")
        ) {
          return true;
        }
      } else if (typeof val === "string" && val.trim() !== "") {
        return true;
      }
    }
    return false;
  }, [filters]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-zinc-50/20 dark:bg-zinc-950/10">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="h-8.5 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Button>
      </div>

      {isFilterActive && originalData.length > 0 ? (
        /* Map View is active and ready */
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  Practitioner Geospatial Map
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-2xs">
                  {data.length} Matching Records
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Visualizing doctor workplace coordinates. Adjust filters in the sidebar to dynamically refresh markers.
              </p>
            </div>
          </div>

          <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-xs rounded-xl overflow-hidden p-3.5 flex flex-col">
            <MapView doctors={data as Doctor[]} />
          </Card>
        </div>
      ) : (
        /* Guard / Warning View when filters are not selected */
        <div className="flex flex-col items-center justify-center p-12 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900/40 text-center min-h-[450px] animate-in fade-in duration-300 max-w-2xl mx-auto mt-8">
          <div className="p-4 bg-amber-50 rounded-full text-amber-600 mb-4">
            <AlertTriangle className="w-12 h-12" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Active Filter Required</h3>
          <p className="text-xs text-muted-foreground max-w-md mt-2 leading-relaxed">
            To view the doctor registry on the map, you must first apply at least one filter (e.g. search keyword, specialty, location, or facility type) using the left sidebar panel. This keeps the map viewport focused and performant.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterPanelOpen(true)}
              className="text-xs font-semibold cursor-pointer h-9 px-4 border-zinc-200 dark:border-zinc-800"
            >
              Open Filters Sidebar
            </Button>
            <Button
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer h-9 px-4"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
