"use client";
import React from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { Doctor } from "@/types/doctor";

const LazyMapView = dynamic(
  () => import("./MapView").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[580px] rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950/20">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-2" />
        <p className="text-xs font-semibold text-zinc-550 dark:text-zinc-450 animate-pulse">
          Initializing interactive map viewport...
        </p>
      </div>
    ),
  }
);

interface MapViewHOCProps {
  doctors: Doctor[];
}

export const MapViewHOC: React.FC<MapViewHOCProps> = ({ doctors }) => {
  return <LazyMapView doctors={doctors} />;
};
