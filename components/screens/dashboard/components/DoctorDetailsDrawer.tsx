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
  GraduationCap,
  Globe2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
              {details.profile_pic_url && (
                <AvatarImage src={details.profile_pic_url} alt={details.doctorName} className="object-cover" />
              )}
              <AvatarFallback className="bg-emerald-600 text-white font-extrabold text-3xl">
                {getInitials(details.doctorName || "User")}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left space-y-2.5 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h2 className="text-3xl font-extrabold tracking-tight text-zinc-50">
                  {details.doctorName}
                </h2>
                {details.hprId && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 uppercase tracking-wide">
                    HPR ID: {details.hprId}
                  </span>
                )}
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
                {details.hprSpecialitys || "General Practitioner"} • {details.systemOfMedicine}
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

          {/* Section 2: Split Personal & Detailed Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Personal & Contact Card */}
            <div className="p-5 rounded-xl border border-zinc-200 bg-white space-y-4 shadow-2xs">
              <h4 className="font-bold text-sm border-b border-zinc-100 pb-2 flex items-center gap-2 text-emerald-600">
                <User className="w-4 h-4" />
                Personal & Contact Details
              </h4>
              <div className="space-y-4">
                {details.emailOfficial && (
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-zinc-50 text-muted-foreground mt-0.5">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Official Email</p>
                      <p className="text-xs font-bold truncate max-w-[280px] mt-0.5 text-zinc-900">
                        {details.emailOfficial}
                      </p>
                    </div>
                  </div>
                )}
                {details.emailPublic && (
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-zinc-50 text-muted-foreground mt-0.5">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Public Email</p>
                      <p className="text-xs font-bold truncate max-w-[280px] mt-0.5 text-zinc-900">
                        {details.emailPublic}
                      </p>
                    </div>
                  </div>
                )}
                {(!details.emailOfficial && !details.emailPublic) && (
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
                )}
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-zinc-50 text-muted-foreground mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Contact Number</p>
                    <p className="text-xs font-bold mt-0.5 text-zinc-900">
                      {details.publicMobileNumber || details.phoneNumber || "N/A"}
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

            {/* Quick Status Check Card */}
            <div className="p-5 rounded-xl border border-zinc-200 bg-white space-y-4 shadow-2xs">
              <h4 className="font-bold text-sm border-b border-zinc-100 pb-2 flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                Registry & Status Info
              </h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-zinc-50 text-muted-foreground mt-0.5">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Employment Status</p>
                    <p className="text-xs font-bold mt-0.5 text-zinc-900">
                      {details.areYouCurrentlyWorking !== undefined
                        ? (details.areYouCurrentlyWorking ? "Currently Working" : "Not Working")
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-zinc-50 text-muted-foreground mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Profile Completeness</p>
                    <p className="text-xs font-bold mt-0.5 text-zinc-900">
                      {details.profileCompleted !== undefined
                        ? (details.profileCompleted ? "Completed" : "Incomplete")
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-zinc-50 text-muted-foreground mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Application Status</p>
                    <p className="text-xs font-bold mt-0.5 text-zinc-900 capitalize">
                      {details.applicationStatus || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Section 3: Council Registrations List */}
          {details.registrations && details.registrations.length > 0 ? (
            <div className="p-5 rounded-xl border border-zinc-200 bg-white space-y-4 shadow-2xs">
              <h4 className="font-bold text-sm border-b border-zinc-100 pb-2 flex items-center gap-2 text-emerald-600">
                <FileText className="w-4 h-4" />
                Medical Council Registrations ({details.registrations.length})
              </h4>
              <div className="space-y-4 divide-y divide-zinc-150">
                {details.registrations.map((reg, idx) => (
                  <div key={reg.id || idx} className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs ${idx > 0 ? "pt-4" : ""}`}>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Council Name</p>
                      <p className="font-bold text-zinc-950 mt-0.5">{reg.council_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Registration Number</p>
                      <p className="font-bold text-zinc-950 mt-0.5">{reg.registration_no || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Status / Renewable</p>
                      <p className="font-semibold text-zinc-700 mt-0.5">{reg.status || "Active"} ({reg.is_renewable || "Renewable"})</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Registration Date</p>
                      <p className="font-semibold text-zinc-700 mt-0.5">{reg.registration_date || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Renewal Due Date</p>
                      <p className="font-semibold text-zinc-700 mt-0.5">{reg.due_date || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">NUID Status</p>
                      <p className="font-semibold text-zinc-700 mt-0.5">{reg.is_nuid ? "Yes" : "No"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-xl border border-zinc-200 bg-white space-y-4 shadow-2xs">
              <h4 className="font-bold text-sm border-b border-zinc-100 pb-2 flex items-center gap-2 text-emerald-600">
                <FileText className="w-4 h-4" />
                Medical Council Registrations
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">License ID</p>
                  <p className="font-bold mt-0.5 text-zinc-900">{details.registrationNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Council Name</p>
                  <p className="font-bold mt-0.5 text-zinc-900">{details.stateMedicalCouncil || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Registration Year</p>
                  <p className="font-bold mt-0.5 text-zinc-900">{details.registrationYear || "N/A"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Academic Qualifications List */}
          {((details.qualificationsDomestic && details.qualificationsDomestic.length > 0) ||
            (details.qualificationsInternational && details.qualificationsInternational.length > 0)) ? (
            <div className="p-5 rounded-xl border border-zinc-200 bg-white space-y-4 shadow-2xs">
              <h4 className="font-bold text-sm border-b border-zinc-100 pb-2 flex items-center gap-2 text-emerald-600">
                <GraduationCap className="w-4 h-4" />
                Academic Qualifications
              </h4>
              <div className="space-y-4 divide-y divide-zinc-150">
                {details.qualificationsDomestic?.map((qual, idx) => (
                  <div key={qual.id || idx} className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs ${idx > 0 ? "pt-4" : ""}`}>
                    <div className="col-span-1 sm:col-span-2 md:col-span-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
                        Domestic Qualification
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Degree Course</p>
                      <p className="font-bold text-zinc-950 mt-0.5">{qual.course_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">College / Institution</p>
                      <p className="font-semibold text-zinc-700 mt-0.5">{qual.college_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">University</p>
                      <p className="font-semibold text-zinc-700 mt-0.5">{qual.university_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Graduation Date</p>
                      <p className="font-semibold text-zinc-700 mt-0.5">{qual.qualification_month || ""} {qual.qualification_year || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Status</p>
                      <p className="font-semibold text-zinc-700 mt-0.5">{qual.active ? "Active" : "Inactive"}</p>
                    </div>
                  </div>
                ))}

                {details.qualificationsInternational?.map((qual, idx) => {
                  const isOffset = (details.qualificationsDomestic?.length || 0) > 0 || idx > 0;
                  return (
                    <div key={qual.id || idx} className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs ${isOffset ? "pt-4" : ""}`}>
                      <div className="col-span-1 sm:col-span-2 md:col-span-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wide">
                          <Globe2 className="w-3 h-3" />
                          International Qualification
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Degree Course</p>
                        <p className="font-bold text-zinc-950 mt-0.5">{qual.course_name || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">College / Institution</p>
                        <p className="font-semibold text-zinc-700 mt-0.5">{qual.college_name || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">University</p>
                        <p className="font-semibold text-zinc-700 mt-0.5">{qual.university_name || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Country of Study</p>
                        <p className="font-bold text-emerald-700 mt-0.5">{qual.country_name || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Graduation Date</p>
                        <p className="font-semibold text-zinc-700 mt-0.5">{qual.qualification_month || ""} {qual.qualification_year || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Status</p>
                        <p className="font-semibold text-zinc-700 mt-0.5">{qual.active ? "Active" : "Inactive"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-xl border border-zinc-200 bg-white space-y-4 shadow-2xs">
              <h4 className="font-bold text-sm border-b border-zinc-100 pb-2 flex items-center gap-2 text-emerald-600">
                <GraduationCap className="w-4 h-4" />
                Academic Qualifications
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Degree Course</p>
                  <p className="font-bold mt-0.5 text-zinc-900">{details.doctorMedicalQualifications___courseId_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">College / Institution</p>
                  <p className="font-semibold mt-0.5 text-zinc-700">{details["doctors_qualifications.collegeId.name"] || "N/A"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Workplaces Details List */}
          {details.workplaces && details.workplaces.length > 0 ? (
            <div className="p-5 rounded-xl border border-zinc-200 bg-white space-y-4 shadow-2xs">
              <h4 className="font-bold text-sm border-b border-zinc-100 pb-2 flex items-center gap-2 text-emerald-600">
                <Building2 className="w-4 h-4" />
                Practice Facilities & Workplaces ({details.workplaces.length})
              </h4>
              <div className="space-y-4 divide-y divide-zinc-150">
                {details.workplaces.map((work, idx) => (
                  <div key={work.id || idx} className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs ${idx > 0 ? "pt-4" : ""}`}>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Facility Name</p>
                      <p className="font-bold text-zinc-955 mt-0.5">{work.facility_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Facility Type</p>
                      <p className="font-semibold text-zinc-700 mt-0.5">{work.facility_type || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Facility Ownership</p>
                      <p className="font-semibold text-zinc-700 mt-0.5">{work.facility_ownership || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Location / Area</p>
                      <p className="font-semibold text-zinc-700 mt-0.5">{work.district_name || "N/A"}, {work.state_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">GPS Coordinates</p>
                      <p className="font-semibold text-zinc-700 mt-0.5">
                        {work.facility_lat && work.facility_long ? `${work.facility_lat}, ${work.facility_long}` : "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
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
                    <p className="text-xs font-bold text-zinc-900 mt-0.5">{details.hprWorkDetails___facilityOwnership || details["doctors_work.facilityOwnership"] || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-zinc-50 text-muted-foreground mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Location / Area</p>
                    <p className="text-xs font-bold text-zinc-900 mt-0.5">
                      {details.hprWorkDetails___districtName || "N/A"}, {details.hprWorkDetails___stateName || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

