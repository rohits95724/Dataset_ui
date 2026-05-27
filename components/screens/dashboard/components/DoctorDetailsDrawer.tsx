"use client";
import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Award,
  FileText,
  Building2,
  MapPin,
  Calendar,
  Briefcase,
  Languages,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useModal } from "@/context/modal-context";
import { useAuth } from "@/context/auth-context";
import { doctorService } from "@/services/doctor-services/doctorService";
import { Doctor } from "@/types/doctor";

export interface DoctorDetailsProps {
  doctor: Doctor;
}

/**
 * Extracts the integer portion of a string/numeric ID.
 * Supports both DOC-00001 format and raw numbers.
 */
export function extractDoctorId(id: string | number): number {
  if (typeof id === "number") return id;
  const matches = String(id).match(/\d+/);
  return matches ? parseInt(matches[0], 10) : 0;
}

export const DoctorDetailsDrawer: React.FC<DoctorDetailsProps> = ({ doctor }) => {
  const { closeDrawer } = useModal();
  const { isAuthenticated } = useAuth();
  const [details, setDetails] = useState<Doctor>(doctor);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadLiveDetails() {
      if (!isAuthenticated || !doctor.id) return;
      setLoading(true);
      try {
        const idNum = extractDoctorId(doctor.id);
        const data = await doctorService.getDoctorById(idNum);
        if (data) {
          setDetails(data);
        }
      } catch (err) {
        console.error("Failed to load doctor dossier details from live API", err);
      } finally {
        setLoading(false);
      }
    }
    loadLiveDetails();
  }, [doctor.id, isAuthenticated]);

  const getInitials = (name: string) => {
    return name
      .replace("Dr. ", "")
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Helper for rendering verification badges
  const renderVerificationPill = (isVerified: boolean, label: string) => {
    return isVerified ? (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-2xs">
        <CheckCircle2 className="w-3.5 h-3.5" />
        {label} Verified
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-2xs">
        <AlertTriangle className="w-3.5 h-3.5" />
        {label} Pending
      </span>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-zinc-50 text-zinc-900 overflow-hidden relative">
      {/* Dynamic Overlay Loading Spinner */}
      {loading && (
        <div className="absolute inset-0 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
            <p className="text-xs font-bold text-zinc-650 dark:text-zinc-350 animate-pulse">
              Retrieving live credentials dossier...
            </p>
          </div>
        </div>
      )}

      {/* Sticky Header Top Bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-white/95 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-4.5 h-4.5 text-emerald-600" />
          <span className="font-extrabold text-xs uppercase tracking-wider text-zinc-500">
            Practitioner Registration Dossier
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={closeDrawer}
          className="h-8 w-8 hover:bg-zinc-100 rounded-full cursor-pointer text-muted-foreground hover:text-zinc-950 transition-colors"
          aria-label="Close details"
        >
          <X className="w-4.5 h-4.5" />
        </Button>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Large Profile Card Header */}
        <div className="relative bg-gradient-to-r from-emerald-800 via-emerald-900 to-teal-950 p-8 border-b border-zinc-200 text-white shadow-xs">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-24 w-24 ring-4 ring-emerald-500/20 bg-emerald-500/10 shadow-lg shrink-0">
              <AvatarFallback className="bg-emerald-600 text-white font-extrabold text-3xl">
                {getInitials(details.doctorName || "User")}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left space-y-2.5 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h2 className="text-3xl font-extrabold tracking-tight text-zinc-55">
                  {details.doctorName}
                </h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                  {details.gender}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${details.status === "Active"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                  }`}>
                  {details.status}
                </span>
              </div>
              <p className="text-zinc-300 font-semibold text-sm flex items-center justify-center sm:justify-start gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                {details.hprSpecialitys} • {details.systemOfMedicine}
              </p>
              <p className="text-zinc-400 text-xs font-semibold">
                {details.doctorType} • {details.workExperienceInYear} Years Professional Experience
              </p>
            </div>
          </div>
        </div>

        {/* Sections Container */}
        <div className="p-6 space-y-6">

          {/* Section 1: Credentials Verification Grid */}
          <div className="p-5 rounded-xl border border-zinc-200 bg-white space-y-3.5 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Registry Verification Status
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {renderVerificationPill(!!details.isRegistrationVerified, "Registration")}
              {renderVerificationPill(!!details.isQualificationsVerified, "Degree")}
              {renderVerificationPill(!!details.isWorkVerified, "Practice Info")}
              {renderVerificationPill(!!details.isPhoneVerified, "Mobile No")}
              {renderVerificationPill(!!details.isEmailVerified, "Email Address")}
            </div>
          </div>

          {/* Section 2: Split Personal & Registration Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Personal & Contact Card */}
            <div className="p-5 rounded-xl border border-zinc-200 bg-white space-y-4 shadow-2xs">
              <h4 className="font-bold text-sm border-b border-zinc-100 pb-2 flex items-center gap-2 text-emerald-600">
                <User className="w-4 h-4" />
                Personal & Contact Details
              </h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-zinc-50 text-muted-foreground mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Email Address</p>
                    <p className="text-xs font-bold truncate max-w-[280px] mt-0.5 text-zinc-900">
                      {details.email || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-zinc-50 text-muted-foreground mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Contact Number</p>
                    <p className="text-xs font-bold mt-0.5 text-zinc-900">
                      {details.phoneNumber || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-zinc-50 text-muted-foreground mt-0.5">
                    <Languages className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Languages Spoken</p>
                    <p className="text-xs font-bold mt-0.5 text-zinc-900">
                      {details.piLanguage || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic & Registration Card */}
            <div className="p-5 rounded-xl border border-zinc-200 bg-white space-y-4 shadow-2xs">
              <h4 className="font-bold text-sm border-b border-zinc-100 pb-2 flex items-center gap-2 text-emerald-600">
                <FileText className="w-4 h-4" />
                Council Registrations
              </h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-zinc-50 text-muted-foreground mt-0.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Medical License ID</p>
                    <p className="text-xs font-bold mt-0.5 text-zinc-900">
                      {details.registrationNumber || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-zinc-50 text-muted-foreground mt-0.5">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">State Medical Council</p>
                    <p className="text-xs font-bold mt-0.5 text-zinc-900">
                      {details.stateMedicalCouncil || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-zinc-50 text-muted-foreground mt-0.5">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Registration Year</p>
                    <p className="text-xs font-bold mt-0.5 text-zinc-900">
                      {details.registrationYear || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Section 3: Professional Practice & Facility details */}
          <div className="p-5 rounded-xl border border-zinc-200 bg-white space-y-4 shadow-2xs">
            <h4 className="font-bold text-sm border-b border-zinc-100 pb-2 flex items-center gap-2 text-emerald-600">
              <Building2 className="w-4 h-4" />
              Practice & Facility details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-zinc-50 text-muted-foreground mt-0.5">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Hospital/Clinic Name</p>
                  <p className="text-xs font-bold text-zinc-900 mt-0.5">{details.hospitalName || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-zinc-50 text-muted-foreground mt-0.5">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Facility Ownership</p>
                  <p className="text-xs font-bold text-zinc-900 mt-0.5">{details.hprWorkDetails___facilityOwnership || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-zinc-50 text-muted-foreground mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Location / Area</p>
                  <p className="text-xs font-bold text-zinc-900 mt-0.5">
                    {details.hprWorkDetails___districtName}, {details.hprWorkDetails___stateName}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-zinc-50 text-muted-foreground mt-0.5">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Qualifications & Degree</p>
                  <p className="text-xs font-bold text-zinc-900 mt-0.5">{details.doctorMedicalQualifications___courseId_name || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-zinc-50 text-muted-foreground mt-0.5">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Work Experience</p>
                  <p className="text-xs font-bold text-zinc-900 mt-0.5">{details.workExperienceInYear} Years</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-zinc-50 text-muted-foreground mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Verification status</p>
                  <p className="text-xs font-bold text-zinc-900 mt-0.5">{details.registrationStatus}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
