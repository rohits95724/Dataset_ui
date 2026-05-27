"use client";
import React, { useState } from "react";
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
  Save,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useModal } from "@/context/modal-context";
import { useDataset } from "@/context/dataset-context";
import { useToast } from "@/context/toast-context";
import { Doctor } from "@/types/doctor";

export interface DoctorEditProps {
  doctor: Doctor;
}

export const DoctorEditDrawer: React.FC<DoctorEditProps> = ({ doctor }) => {
  const { closeDrawer } = useModal();
  const { updateDoctor } = useDataset();
  const { addToast } = useToast();

  const [formData, setFormData] = useState<Doctor>({ ...doctor });
  const [isSaving, setIsSaving] = useState(false);

  const getInitials = (name: string) => {
    return name
      .replace("Dr. ", "")
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (name: keyof Doctor) => {
    setFormData((prev) => ({
      ...prev,
      [name]: !prev[name] as unknown as boolean,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Clean up values
      const updated = {
        ...formData,
        workExperienceInYear: Number(formData.workExperienceInYear),
        registrationYear: Number(formData.registrationYear),
        // Sync derived/nested properties if applicable
        "doctors_main.stateName": formData.hprWorkDetails___stateName,
        "doctors_work.verificationStatus": formData.registrationStatus,
        "doctors_work.facilityOwnership": formData.hprWorkDetails___facilityOwnership,
      };

      updateDoctor(updated);
      addToast("Doctor details updated successfully!", "success");
      closeDrawer();
    } catch (err) {
      console.error("Failed to update doctor:", err);
      addToast("Failed to update details. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 overflow-hidden relative">
      {/* Sticky Header Top Bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
          <span className="font-extrabold text-xs uppercase tracking-wider text-zinc-500">
            Edit Practitioner Credentials
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={closeDrawer}
          className="h-8 w-8 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full cursor-pointer text-muted-foreground hover:text-zinc-950 dark:hover:text-white transition-colors"
          aria-label="Close edit panel"
        >
          <X className="w-4.5 h-4.5" />
        </Button>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
        {/* Large Profile Header */}
        <div className="relative bg-gradient-to-r from-emerald-800 via-emerald-900 to-teal-950 p-8 border-b border-zinc-200 dark:border-zinc-800 text-white shadow-xs shrink-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-20 w-20 ring-4 ring-emerald-500/20 bg-emerald-500/10 shadow-lg shrink-0">
              <AvatarFallback className="bg-emerald-600 text-white font-extrabold text-2xl">
                {getInitials(formData.doctorName || "User")}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left space-y-2 min-w-0 flex-1">
              <div className="space-y-1">
                <Label htmlFor="doctorName" className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
                  Practitioner Name
                </Label>
                <Input
                  id="doctorName"
                  name="doctorName"
                  value={formData.doctorName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Dr. Yogesh Bishnoi"
                  className="bg-white/10 border-white/20 text-white placeholder-white/40 focus:bg-white/15 h-9 text-sm max-w-md w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Sections */}
        <div className="p-6 space-y-6 flex-1">
          {/* Section 1: Split Personal & Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Card */}
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 space-y-4 shadow-2xs">
              <h4 className="font-bold text-sm border-b border-zinc-100 dark:border-zinc-800/80 pb-2 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <User className="w-4 h-4" />
                Personal Details
              </h4>
              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="gender" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Gender</Label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full text-xs h-9 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 px-3 outline-none cursor-pointer text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="piLanguage" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Languages Spoken</Label>
                  <div className="relative">
                    <Languages className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                    <Input
                      id="piLanguage"
                      name="piLanguage"
                      value={formData.piLanguage}
                      onChange={handleInputChange}
                      placeholder="e.g. English, Hindi"
                      className="pl-9 text-xs h-9"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Details Card */}
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 space-y-4 shadow-2xs">
              <h4 className="font-bold text-sm border-b border-zinc-100 dark:border-zinc-800/80 pb-2 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Phone className="w-4 h-4" />
                Contact Details
              </h4>
              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="doctor@hospital.org"
                      className="pl-9 text-xs h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phoneNumber" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      className="pl-9 text-xs h-9"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Clinical & Credentials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Professional credentials */}
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 space-y-4 shadow-2xs">
              <h4 className="font-bold text-sm border-b border-zinc-100 dark:border-zinc-800/80 pb-2 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Award className="w-4 h-4" />
                Medical Qualifications
              </h4>
              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="hprSpecialitys" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Specialty</Label>
                  <Input
                    id="hprSpecialitys"
                    name="hprSpecialitys"
                    value={formData.hprSpecialitys}
                    onChange={handleInputChange}
                    required
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="systemOfMedicine" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">System of Medicine</Label>
                  <Input
                    id="systemOfMedicine"
                    name="systemOfMedicine"
                    value={formData.systemOfMedicine}
                    onChange={handleInputChange}
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="doctorMedicalQualifications___courseId_name" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Medical Degree / Qualification</Label>
                  <Input
                    id="doctorMedicalQualifications___courseId_name"
                    name="doctorMedicalQualifications___courseId_name"
                    value={formData.doctorMedicalQualifications___courseId_name}
                    onChange={handleInputChange}
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="workExperienceInYear" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Work Experience (Years)</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                    <Input
                      id="workExperienceInYear"
                      name="workExperienceInYear"
                      type="number"
                      value={formData.workExperienceInYear}
                      onChange={handleInputChange}
                      className="pl-9 text-xs h-9"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Practice Details Card */}
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 space-y-4 shadow-2xs">
              <h4 className="font-bold text-sm border-b border-zinc-100 dark:border-zinc-800/80 pb-2 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Building2 className="w-4 h-4" />
                Practice & Facility Info
              </h4>
              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="hospitalName" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Hospital/Clinic Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                    <Input
                      id="hospitalName"
                      name="hospitalName"
                      value={formData.hospitalName}
                      onChange={handleInputChange}
                      className="pl-9 text-xs h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="hprWorkDetails___districtName" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">District Name</Label>
                    <Input
                      id="hprWorkDetails___districtName"
                      name="hprWorkDetails___districtName"
                      value={formData.hprWorkDetails___districtName}
                      onChange={handleInputChange}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="hprWorkDetails___stateName" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">State Name</Label>
                    <Input
                      id="hprWorkDetails___stateName"
                      name="hprWorkDetails___stateName"
                      value={formData.hprWorkDetails___stateName}
                      onChange={handleInputChange}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="hprWorkDetails___facilityOwnership" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Facility Ownership</Label>
                  <select
                    id="hprWorkDetails___facilityOwnership"
                    name="hprWorkDetails___facilityOwnership"
                    value={formData.hprWorkDetails___facilityOwnership}
                    onChange={handleInputChange}
                    className="w-full text-xs h-9 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 px-3 outline-none cursor-pointer text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="Private">Private</option>
                    <option value="Government">Government</option>
                    <option value="ESI">ESI</option>
                    <option value="Trust">Trust</option>
                    <option value="Corporate">Corporate</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="registrationNumber" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Registration Number</Label>
                    <Input
                      id="registrationNumber"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleInputChange}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="registrationYear" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Registration Year</Label>
                    <div className="relative">
                      <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                      <Input
                        id="registrationYear"
                        name="registrationYear"
                        type="number"
                        value={formData.registrationYear}
                        onChange={handleInputChange}
                        className="pl-9 text-xs h-9"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Status and Registry Verification Checklist */}
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 space-y-4 shadow-2xs">
            <h4 className="font-bold text-sm border-b border-zinc-100 dark:border-zinc-800/80 pb-2 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              Registry Verification Checklist
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Row Statuses */}
              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="registrationStatus" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Registration Status</Label>
                  <select
                    id="registrationStatus"
                    name="registrationStatus"
                    value={formData.registrationStatus}
                    onChange={handleInputChange}
                    className="w-full text-xs h-9 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 px-3 outline-none cursor-pointer text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="Verified">Verified</option>
                    <option value="Pending">Pending</option>
                    <option value="Unverified">Unverified</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="status" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Active Status</Label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full text-xs h-9 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 px-3 outline-none cursor-pointer text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Verification Checklist checkboxes */}
              <div className="space-y-3 pt-4.5">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="isRegistrationVerified"
                    checked={formData.isRegistrationVerified}
                    onChange={() => handleCheckboxChange("isRegistrationVerified")}
                    className="h-4 w-4 border-zinc-300 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <Label htmlFor="isRegistrationVerified" className="text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                    Registration Verified
                  </Label>
                </div>

                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="isQualificationsVerified"
                    checked={formData.isQualificationsVerified}
                    onChange={() => handleCheckboxChange("isQualificationsVerified")}
                    className="h-4 w-4 border-zinc-300 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <Label htmlFor="isQualificationsVerified" className="text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                    Qualifications & Degrees Verified
                  </Label>
                </div>

                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="isWorkVerified"
                    checked={formData.isWorkVerified}
                    onChange={() => handleCheckboxChange("isWorkVerified")}
                    className="h-4 w-4 border-zinc-300 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <Label htmlFor="isWorkVerified" className="text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                    Work Details & Placement Verified
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer actions panel */}
        <div className="sticky bottom-0 z-20 border-t border-zinc-200 dark:border-zinc-800 px-6 py-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md flex items-center justify-end gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={closeDrawer}
            disabled={isSaving}
            className="text-xs font-semibold cursor-pointer border-zinc-200 dark:border-zinc-850"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Credentials
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
