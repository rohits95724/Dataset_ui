"use client";
import dynamic from "next/dynamic";

const MapScreen = dynamic(() => import("./MapScreen"), {
  ssr: false,
});

export default function MapScreenHOC() {
  return <MapScreen />;
}
