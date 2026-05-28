"use client";
import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";
import { Doctor, MapDoctor } from "@/types/doctor";
import { useModal } from "@/context/modal-context";
import { DoctorDetailsDrawer } from "../../dashboard/components/DoctorDetailsDrawer";
import { Button } from "@/components/ui/button";

// Fix default leaflet icons
const getInitials = (name: string) => {
  return (name || "DR")
    .replace("Dr. ", "")
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const createCustomMarker = (doctor: Doctor | MapDoctor) => {
  const initials = getInitials(doctor.doctorName);
  return L.divIcon({
    html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs border-2 border-white shadow-lg transition-all duration-200 transform hover:scale-110 active:scale-95 cursor-pointer">${initials}</div>`,
    className: "custom-leaflet-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const getCoords = (doc: Doctor | MapDoctor) => {
  const docRecord = doc as unknown as Record<string, unknown>;
  const lat = Number(doc["doctors_work.facilityLat"] ?? docRecord.facility_lat ?? docRecord.facilityLat);
  const lng = Number(doc["doctors_work.facilityLong"] ?? docRecord.facility_long ?? docRecord.facilityLong);
  return { lat, lng };
};

interface MapViewProps {
  doctors: (Doctor | MapDoctor)[];
}

// Sub-component to fit map bounds to active markers
const MapBoundsAdjuster: React.FC<{ doctorsWithCoords: (Doctor | MapDoctor)[] }> = ({ doctorsWithCoords }) => {
  const map = useMap();

  useEffect(() => {
    if (doctorsWithCoords.length === 0) return;

    const bounds = L.latLngBounds(
      doctorsWithCoords.map((doc) => {
        const { lat, lng } = getCoords(doc);
        return [lat, lng];
      })
    );

    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
  }, [doctorsWithCoords, map]);

  return null;
};

export default function MapView({ doctors }: MapViewProps) {
  const { openDrawer } = useModal();

  // Filter doctors with valid lat/long
  const doctorsWithCoords = doctors.filter((doc) => {
    const { lat, lng } = getCoords(doc);
    return lat && lng && !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
  });

  if (doctorsWithCoords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900/40 text-center min-h-[400px]">
        <div className="p-4 bg-amber-50 rounded-full text-amber-600 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No Geo-located Doctors Found</h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          None of the doctors in the filtered dataset have valid facility latitude and longitude coordinates. Please refine your filter selection or add coordinate data.
        </p>
      </div>
    );
  }

  // Center of India as initial fallback
  const centerLat = 22.5937;
  const centerLng = 78.9629;

  return (
    <div className="w-full h-[580px] rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 relative shadow-sm bg-zinc-100 z-0">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={5}
        className="w-full h-full"
        style={{ zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MarkerClusterGroup>
          {doctorsWithCoords.map((doc) => {
            const { lat, lng } = getCoords(doc);
            const subTitle = [doc.doctorType, doc.gender].filter(Boolean).join(" • ");
            const hasDetailsCard = !!(doc.hospitalName || doc.hprWorkDetails___districtName || doc.hprSpecialitys);

            return (
              <Marker
                key={doc.id}
                position={[lat, lng]}
                icon={createCustomMarker(doc)}
              >
                <Popup className="custom-popup">
                  <div className="p-1 space-y-2 text-zinc-900 min-w-[200px]">
                    <div>
                      <h4 className="font-bold text-sm text-zinc-950 leading-tight">
                        {doc.doctorName}
                      </h4>
                      {subTitle && (
                        <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">
                          {subTitle}
                        </p>
                      )}
                    </div>

                    {hasDetailsCard && (
                      <div className="text-xs space-y-1 bg-zinc-50 p-2 rounded border border-zinc-100 font-medium">
                        {doc.hospitalName && (
                          <p className="truncate text-zinc-700">
                            <span className="font-bold text-zinc-800 text-[10px] uppercase block tracking-wider">Hospital</span>
                            {doc.hospitalName}
                          </p>
                        )}
                        {doc.hprWorkDetails___districtName && (
                          <p className="truncate text-zinc-700 mt-1">
                            <span className="font-bold text-zinc-800 text-[10px] uppercase block tracking-wider">Location</span>
                            {doc.hprWorkDetails___districtName}, {doc.hprWorkDetails___stateName || ""}
                          </p>
                        )}
                        {doc.hprSpecialitys && (
                          <p className="truncate text-zinc-700 mt-1">
                            <span className="font-bold text-zinc-800 text-[10px] uppercase block tracking-wider">Specialty</span>
                            {doc.hprSpecialitys}
                          </p>
                        )}
                      </div>
                    )}

                    <Button
                      size="sm"
                      onClick={() => openDrawer(<DoctorDetailsDrawer doctor={doc as Doctor} />)}
                      className="w-full h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition-all"
                    >
                      View Full Profile
                    </Button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>

        <MapBoundsAdjuster doctorsWithCoords={doctorsWithCoords} />
      </MapContainer>
    </div>
  );
}
