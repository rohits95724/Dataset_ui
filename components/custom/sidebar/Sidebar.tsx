"use client";
import React, { useMemo, useState } from "react";
import {
  Filter,
  RotateCcw,
  Search,
  ChevronDown,
  ChevronUp,
  Briefcase,
  User as UserIcon,
  Languages,
  MapPin,
  Award,
  Building,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Globe,
} from "lucide-react";
import { useDataset } from "@/context/dataset-context";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

export const Sidebar: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { originalData, filters, setColumnFilter, resetFilters } = useDataset();

  // Search filter query states for dropdowns
  const [specialtySearch, setSpecialtySearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [stateSearch, setStateSearch] = useState("");
  const [verificationSearch, setVerificationSearch] = useState("");
  const [facilityTypeSearch, setFacilityTypeSearch] = useState("");
  const [facilityOwnershipSearch, setFacilityOwnershipSearch] = useState("");
  const [collegeSearch, setCollegeSearch] = useState("");
  const [degreeSearch, setDegreeSearch] = useState("");

  // Section toggle states for cleaner visual hierarchy
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    gps: true,
    specialty: true,
    medicine: false,
    location: true,
    state: false,
    verification: false,
    govEmployee: false,
    facilityType: false,
    facilityOwnership: false,
    college: false,
    foreign: false,
    experience: true,
    gender: false,
    language: false,
    degree: false,
    doctorType: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Compute unique filter options dynamically from active dataset
  const filterOptions = useMemo(() => {
    const getUniqueVals = (field: string, isCommaSeparated = false) => {
      const set = new Set<string>();
      originalData.forEach((row) => {
        const val = row[field];
        if (val !== undefined && val !== null && val !== "") {
          if (isCommaSeparated && String(val).includes(",")) {
            String(val)
              .split(",")
              .forEach((s) => set.add(s.trim()));
          } else {
            set.add(String(val).trim());
          }
        }
      });
      return Array.from(set).sort();
    };

    return {
      specialties: getUniqueVals("hprSpecialitys"),
      systems: getUniqueVals("systemOfMedicine"),
      locations: getUniqueVals("hprWorkDetails___districtName"),
      genders: getUniqueVals("gender"),
      languages: getUniqueVals("piLanguage", true),
      facilityOwnerships: getUniqueVals("doctors_work.facilityOwnership").length > 0 
        ? getUniqueVals("doctors_work.facilityOwnership") 
        : getUniqueVals("hprWorkDetails___facilityOwnership"),
      facilityTypes: getUniqueVals("doctors_work.facilityType"),
      degrees: getUniqueVals("doctorMedicalQualifications___courseId_name"),
      doctorTypes: getUniqueVals("doctorType"),
      states: getUniqueVals("doctors_main.stateName"),
      verificationStatuses: getUniqueVals("doctors_work.verificationStatus"),
      colleges: getUniqueVals("doctors_qualifications.collegeId.name"),
    };
  }, [originalData]);

  if (!isAuthenticated) return null;

  const handleCategoryCheckboxChange = (columnName: string, optionValue: string, checked: boolean) => {
    const currentFilter: string[] = filters.columnFilters[columnName] || [];
    let updated: string[];
    if (checked) {
      updated = [...currentFilter, optionValue];
    } else {
      updated = currentFilter.filter((val) => val !== optionValue);
    }
    setColumnFilter(columnName, updated);
  };

  const handleRangeInputChange = (boundary: "min" | "max", value: string) => {
    const current = filters.columnFilters["workExperienceInYear"] || { min: "", max: "" };
    const numVal = value === "" ? "" : Number(value);
    setColumnFilter("workExperienceInYear", {
      ...current,
      [boundary]: numVal,
    });
  };

  const activeExp = filters.columnFilters["workExperienceInYear"] || { min: "", max: "" };
  const activeGps = filters.columnFilters["gpsProximity"] || { lat: null, lng: null, radius: "" };

  return (
    <aside className="w-80 flex flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 h-full shrink-0 select-none">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950">
        <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white text-sm">
          <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Filter Doctors
        </div>
        {originalData.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-xs text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 h-7 px-2 cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>
        )}
      </div>

      {/* Filters Form Container */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {originalData.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Sparkles className="w-6 h-6 text-zinc-300 dark:text-zinc-700 mx-auto animate-pulse" />
            <p className="text-xs text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
              No registry dataset loaded. Upload or seed a dataset to view dynamic search filters.
            </p>
          </div>
        ) : (
          <>
            {/* 1. GPS Proximity Search ("Doctors Near Me") */}
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 space-y-2">
              <button
                onClick={() => toggleSection("gps")}
                className="w-full flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white cursor-pointer py-1"
              >
                <span className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  GPS Proximity Search
                </span>
                {openSections.gps ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openSections.gps && (
                <div className="space-y-3 pt-1 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="gps-enable" className="text-xs text-zinc-600 dark:text-zinc-300 cursor-pointer font-medium">
                      Doctors Near Me
                    </Label>
                    <Checkbox
                      id="gps-enable"
                      checked={activeGps.lat !== null}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setColumnFilter("gpsProximity", { lat: 26.9124, lng: 75.7873, radius: 25 });
                        } else {
                          setColumnFilter("gpsProximity", { lat: null, lng: null, radius: "" });
                        }
                      }}
                      className="h-3.5 w-3.5 border-zinc-300 dark:border-zinc-700 text-emerald-600 rounded animate-in zoom-in-50"
                    />
                  </div>
                  {activeGps.lat !== null && (
                    <div className="space-y-2.5 bg-zinc-50 dark:bg-zinc-900/30 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-900/50 animate-in slide-in-from-top-1 duration-200">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground uppercase font-bold">Latitude</Label>
                          <Input
                            type="number"
                            step="any"
                            value={activeGps.lat ?? ""}
                            onChange={(e) => setColumnFilter("gpsProximity", { ...activeGps, lat: e.target.value === "" ? null : Number(e.target.value) })}
                            className="text-xs h-7 px-1.5"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground uppercase font-bold">Longitude</Label>
                          <Input
                            type="number"
                            step="any"
                            value={activeGps.lng ?? ""}
                            onChange={(e) => setColumnFilter("gpsProximity", { ...activeGps, lng: e.target.value === "" ? null : Number(e.target.value) })}
                            className="text-xs h-7 px-1.5"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground font-bold">
                          <span>RADIUS</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{activeGps.radius} km</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="150"
                          value={activeGps.radius || 25}
                          onChange={(e) => setColumnFilter("gpsProximity", { ...activeGps, radius: Number(e.target.value) })}
                          className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. Specialty Section */}
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 space-y-2">
              <button
                onClick={() => toggleSection("specialty")}
                className="w-full flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white cursor-pointer py-1"
              >
                <span className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-emerald-500" />
                  Specialty
                </span>
                {openSections.specialty ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openSections.specialty && (
                <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                  <div className="relative">
                    <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-zinc-400" />
                    <Input
                      placeholder="Search specialties..."
                      value={specialtySearch}
                      onChange={(e) => setSpecialtySearch(e.target.value)}
                      className="pl-7 text-xs h-8"
                    />
                  </div>
                  <div className="max-h-36 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
                    {filterOptions.specialties
                      .filter((s) => s.toLowerCase().includes(specialtySearch.toLowerCase()))
                      .map((opt) => {
                        const isChecked = (filters.columnFilters["hprSpecialitys"] || []).includes(opt);
                        return (
                          <div key={opt} className="flex items-center gap-2.5 px-1 py-0.5">
                            <Checkbox
                              id={`filter-spec-${opt}`}
                              checked={isChecked}
                              onCheckedChange={(checked) =>
                                handleCategoryCheckboxChange("hprSpecialitys", opt, !!checked)
                              }
                              className="h-3.5 w-3.5 border-zinc-300 dark:border-zinc-700 text-emerald-600 rounded"
                            />
                            <Label
                              htmlFor={`filter-spec-${opt}`}
                              className="text-xs text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white cursor-pointer truncate"
                            >
                              {opt}
                            </Label>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* 3. System of Medicine Section */}
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 space-y-2">
              <button
                onClick={() => toggleSection("medicine")}
                className="w-full flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white cursor-pointer py-1"
              >
                <span className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                  System of Medicine
                </span>
                {openSections.medicine ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openSections.medicine && (
                <div className="space-y-1.5 pt-1 max-h-32 overflow-y-auto animate-in fade-in duration-200">
                  {filterOptions.systems.map((opt) => {
                    const isChecked = (filters.columnFilters["systemOfMedicine"] || []).includes(opt);
                    return (
                      <div key={opt} className="flex items-center gap-2.5 px-1 py-0.5">
                        <Checkbox
                          id={`filter-sys-${opt}`}
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            handleCategoryCheckboxChange("systemOfMedicine", opt, !!checked)
                          }
                          className="h-3.5 w-3.5 border-zinc-300 dark:border-zinc-700 text-emerald-600 rounded"
                        />
                        <Label
                          htmlFor={`filter-sys-${opt}`}
                          className="text-xs text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white cursor-pointer truncate"
                        >
                          {opt}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 4. Location (District) Section */}
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 space-y-2">
              <button
                onClick={() => toggleSection("location")}
                className="w-full flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white cursor-pointer py-1"
              >
                <span className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  Location (Work District)
                </span>
                {openSections.location ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openSections.location && (
                <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                  <div className="relative">
                    <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-zinc-400" />
                    <Input
                      placeholder="Search locations..."
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      className="pl-7 text-xs h-8"
                    />
                  </div>
                  <div className="max-h-36 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
                    {filterOptions.locations
                      .filter((l) => l.toLowerCase().includes(locationSearch.toLowerCase()))
                      .map((opt) => {
                        const isChecked = (filters.columnFilters["hprWorkDetails___districtName"] || []).includes(opt);
                        return (
                          <div key={opt} className="flex items-center gap-2.5 px-1 py-0.5">
                            <Checkbox
                              id={`filter-loc-${opt}`}
                              checked={isChecked}
                              onCheckedChange={(checked) =>
                                handleCategoryCheckboxChange("hprWorkDetails___districtName", opt, !!checked)
                              }
                              className="h-3.5 w-3.5 border-zinc-300 dark:border-zinc-700 text-emerald-600 rounded"
                            />
                            <Label
                              htmlFor={`filter-loc-${opt}`}
                              className="text-xs text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white cursor-pointer truncate"
                            >
                              {opt}
                            </Label>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* 5. State Filter Section */}
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 space-y-2">
              <button
                onClick={() => toggleSection("state")}
                className="w-full flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white cursor-pointer py-1"
              >
                <span className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  State Source
                </span>
                {openSections.state ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openSections.state && (
                <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                  <div className="relative">
                    <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-zinc-400" />
                    <Input
                      placeholder="Search states..."
                      value={stateSearch}
                      onChange={(e) => setStateSearch(e.target.value)}
                      className="pl-7 text-xs h-8"
                    />
                  </div>
                  <div className="max-h-32 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
                    {filterOptions.states
                      .filter((s) => s.toLowerCase().includes(stateSearch.toLowerCase()))
                      .map((opt) => {
                        const isChecked = (filters.columnFilters["doctors_main.stateName"] || []).includes(opt);
                        return (
                          <div key={opt} className="flex items-center gap-2.5 px-1 py-0.5">
                            <Checkbox
                              id={`filter-state-${opt}`}
                              checked={isChecked}
                              onCheckedChange={(checked) =>
                                handleCategoryCheckboxChange("doctors_main.stateName", opt, !!checked)
                              }
                              className="h-3.5 w-3.5 border-zinc-300 dark:border-zinc-700 text-emerald-600 rounded"
                            />
                            <Label
                              htmlFor={`filter-state-${opt}`}
                              className="text-xs text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white cursor-pointer truncate"
                            >
                              {opt}
                            </Label>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* 6. Workplace Verification Status Section */}
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 space-y-2">
              <button
                onClick={() => toggleSection("verification")}
                className="w-full flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white cursor-pointer py-1"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Workplace Verification
                </span>
                {openSections.verification ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openSections.verification && (
                <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                  <div className="relative">
                    <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-zinc-400" />
                    <Input
                      placeholder="Search status..."
                      value={verificationSearch}
                      onChange={(e) => setVerificationSearch(e.target.value)}
                      className="pl-7 text-xs h-8"
                    />
                  </div>
                  <div className="max-h-32 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
                    {filterOptions.verificationStatuses
                      .filter((v) => v.toLowerCase().includes(verificationSearch.toLowerCase()))
                      .map((opt) => {
                        const isChecked = (filters.columnFilters["doctors_work.verificationStatus"] || []).includes(opt);
                        return (
                          <div key={opt} className="flex items-center gap-2.5 px-1 py-0.5">
                            <Checkbox
                              id={`filter-verification-${opt}`}
                              checked={isChecked}
                              onCheckedChange={(checked) =>
                                handleCategoryCheckboxChange("doctors_work.verificationStatus", opt, !!checked)
                              }
                              className="h-3.5 w-3.5 border-zinc-300 dark:border-zinc-700 text-emerald-600 rounded"
                            />
                            <Label
                              htmlFor={`filter-verification-${opt}`}
                              className="text-xs text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white cursor-pointer truncate"
                            >
                              {opt}
                            </Label>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* 7. Government Employee Filter Section */}
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 space-y-2">
              <button
                onClick={() => toggleSection("govEmployee")}
                className="w-full flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white cursor-pointer py-1"
              >
                <span className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                  Government Employee
                </span>
                {openSections.govEmployee ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openSections.govEmployee && (
                <div className="flex flex-col gap-1.5 pt-1 animate-in fade-in duration-200">
                  {["all", "yes", "no"].map((opt) => {
                    const activeVal = filters.columnFilters["doctors_main.governmentEmployee"] || "all";
                    return (
                      <div key={opt} className="flex items-center gap-2.5 px-1 py-0.5">
                        <input
                          type="radio"
                          id={`gov-emp-${opt}`}
                          name="govEmployeeRadio"
                          checked={activeVal === opt}
                          onChange={() => setColumnFilter("doctors_main.governmentEmployee", opt)}
                          className="h-3.5 w-3.5 border-zinc-300 dark:border-zinc-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <Label
                          htmlFor={`gov-emp-${opt}`}
                          className="text-xs text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white cursor-pointer"
                        >
                          {opt === "all" ? "Show All" : opt === "yes" ? "Government Employees Only" : "Private Sector Only"}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 8. Facility Type Section */}
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 space-y-2">
              <button
                onClick={() => toggleSection("facilityType")}
                className="w-full flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white cursor-pointer py-1"
              >
                <span className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-emerald-500" />
                  Facility Type
                </span>
                {openSections.facilityType ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openSections.facilityType && (
                <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                  <div className="relative">
                    <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-zinc-400" />
                    <Input
                      placeholder="Search facility types..."
                      value={facilityTypeSearch}
                      onChange={(e) => setFacilityTypeSearch(e.target.value)}
                      className="pl-7 text-xs h-8"
                    />
                  </div>
                  <div className="max-h-32 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
                    {filterOptions.facilityTypes
                      .filter((f) => f.toLowerCase().includes(facilityTypeSearch.toLowerCase()))
                      .map((opt) => {
                        const isChecked = (filters.columnFilters["doctors_work.facilityType"] || []).includes(opt);
                        return (
                          <div key={opt} className="flex items-center gap-2.5 px-1 py-0.5">
                            <Checkbox
                              id={`filter-factype-${opt}`}
                              checked={isChecked}
                              onCheckedChange={(checked) =>
                                handleCategoryCheckboxChange("doctors_work.facilityType", opt, !!checked)
                              }
                              className="h-3.5 w-3.5 border-zinc-300 dark:border-zinc-700 text-emerald-600 rounded"
                            />
                            <Label
                              htmlFor={`filter-factype-${opt}`}
                              className="text-xs text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white cursor-pointer truncate"
                            >
                              {opt}
                            </Label>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* 9. Facility Ownership Section */}
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 space-y-2">
              <button
                onClick={() => toggleSection("facilityOwnership")}
                className="w-full flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white cursor-pointer py-1"
              >
                <span className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-emerald-500" />
                  Facility Ownership
                </span>
                {openSections.facilityOwnership ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openSections.facilityOwnership && (
                <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                  <div className="relative">
                    <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-zinc-400" />
                    <Input
                      placeholder="Search ownership..."
                      value={facilityOwnershipSearch}
                      onChange={(e) => setFacilityOwnershipSearch(e.target.value)}
                      className="pl-7 text-xs h-8"
                    />
                  </div>
                  <div className="max-h-32 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
                    {filterOptions.facilityOwnerships
                      .filter((f) => f.toLowerCase().includes(facilityOwnershipSearch.toLowerCase()))
                      .map((opt) => {
                        const isChecked = (filters.columnFilters["doctors_work.facilityOwnership"] || []).includes(opt);
                        return (
                          <div key={opt} className="flex items-center gap-2.5 px-1 py-0.5">
                            <Checkbox
                              id={`filter-facown-${opt}`}
                              checked={isChecked}
                              onCheckedChange={(checked) =>
                                handleCategoryCheckboxChange("doctors_work.facilityOwnership", opt, !!checked)
                              }
                              className="h-3.5 w-3.5 border-zinc-300 dark:border-zinc-700 text-emerald-600 rounded"
                            />
                            <Label
                              htmlFor={`filter-facown-${opt}`}
                              className="text-xs text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white cursor-pointer truncate"
                            >
                              {opt}
                            </Label>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* 10. Medical College / Alma Mater Section */}
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 space-y-2">
              <button
                onClick={() => toggleSection("college")}
                className="w-full flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white cursor-pointer py-1"
              >
                <span className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                  Medical College / Alma Mater
                </span>
                {openSections.college ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openSections.college && (
                <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                  <div className="relative">
                    <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-zinc-400" />
                    <Input
                      placeholder="Search colleges..."
                      value={collegeSearch}
                      onChange={(e) => setCollegeSearch(e.target.value)}
                      className="pl-7 text-xs h-8"
                    />
                  </div>
                  <div className="max-h-36 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
                    {filterOptions.colleges
                      .filter((c) => c.toLowerCase().includes(collegeSearch.toLowerCase()))
                      .map((opt) => {
                        const isChecked = (filters.columnFilters["doctors_qualifications.collegeId.name"] || []).includes(opt);
                        return (
                          <div key={opt} className="flex items-center gap-2.5 px-1 py-0.5">
                            <Checkbox
                              id={`filter-college-${opt}`}
                              checked={isChecked}
                              onCheckedChange={(checked) =>
                                handleCategoryCheckboxChange("doctors_qualifications.collegeId.name", opt, !!checked)
                              }
                              className="h-3.5 w-3.5 border-zinc-300 dark:border-zinc-700 text-emerald-600 rounded"
                            />
                            <Label
                              htmlFor={`filter-college-${opt}`}
                              className="text-xs text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white cursor-pointer truncate"
                            >
                              {opt}
                            </Label>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* 11. Foreign-Educated Doctors Section */}
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 space-y-2">
              <button
                onClick={() => toggleSection("foreign")}
                className="w-full flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white cursor-pointer py-1"
              >
                <span className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-emerald-500" />
                  Foreign-Educated
                </span>
                {openSections.foreign ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openSections.foreign && (
                <div className="flex flex-col gap-1.5 pt-1 animate-in fade-in duration-200">
                  {["all", "yes", "no"].map((opt) => {
                    const activeVal = filters.columnFilters["isForeignEducated"] || "all";
                    return (
                      <div key={opt} className="flex items-center gap-2.5 px-1 py-0.5">
                        <input
                          type="radio"
                          id={`foreign-ed-${opt}`}
                          name="foreignRadio"
                          checked={activeVal === opt}
                          onChange={() => setColumnFilter("isForeignEducated", opt)}
                          className="h-3.5 w-3.5 border-zinc-300 dark:border-zinc-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <Label
                          htmlFor={`foreign-ed-${opt}`}
                          className="text-xs text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white cursor-pointer"
                        >
                          {opt === "all" ? "Show All" : opt === "yes" ? "Foreign-Educated Only" : "Domestic-Educated Only"}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 12. Experience Range Section */}
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 space-y-2">
              <button
                onClick={() => toggleSection("experience")}
                className="w-full flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white cursor-pointer py-1"
              >
                <span className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                  Experience (Years)
                </span>
                {openSections.experience ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openSections.experience && (
                <div className="grid grid-cols-2 gap-2 pt-1 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground uppercase font-bold">Min Yrs</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={activeExp.min ?? ""}
                      onChange={(e) => handleRangeInputChange("min", e.target.value)}
                      className="text-xs h-8"
                      min={0}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground uppercase font-bold">Max Yrs</Label>
                    <Input
                      type="number"
                      placeholder="40"
                      value={activeExp.max ?? ""}
                      onChange={(e) => handleRangeInputChange("max", e.target.value)}
                      className="text-xs h-8"
                      min={0}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 13. Doctor Type Section */}
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 space-y-2">
              <button
                onClick={() => toggleSection("doctorType")}
                className="w-full flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white cursor-pointer py-1"
              >
                <span className="flex items-center gap-2">
                  <UserIcon className="w-3.5 h-3.5 text-emerald-500" />
                  Doctor Type
                </span>
                {openSections.doctorType ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openSections.doctorType && (
                <div className="space-y-1.5 pt-1 animate-in fade-in duration-200">
                  {filterOptions.doctorTypes.map((opt) => {
                    const isChecked = (filters.columnFilters["doctorType"] || []).includes(opt);
                    return (
                      <div key={opt} className="flex items-center gap-2.5 px-1 py-0.5">
                        <Checkbox
                          id={`filter-dtype-${opt}`}
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            handleCategoryCheckboxChange("doctorType", opt, !!checked)
                          }
                          className="h-3.5 w-3.5 border-zinc-300 dark:border-zinc-700 text-emerald-600 rounded"
                        />
                        <Label
                          htmlFor={`filter-dtype-${opt}`}
                          className="text-xs text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white cursor-pointer truncate"
                        >
                          {opt}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 14. Gender Section */}
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 space-y-2">
              <button
                onClick={() => toggleSection("gender")}
                className="w-full flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white cursor-pointer py-1"
              >
                <span className="flex items-center gap-2">
                  <UserIcon className="w-3.5 h-3.5 text-emerald-500" />
                  Gender
                </span>
                {openSections.gender ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openSections.gender && (
                <div className="space-y-1.5 pt-1 animate-in fade-in duration-200">
                  {filterOptions.genders.map((opt) => {
                    const isChecked = (filters.columnFilters["gender"] || []).includes(opt);
                    return (
                      <div key={opt} className="flex items-center gap-2.5 px-1 py-0.5">
                        <Checkbox
                          id={`filter-gen-${opt}`}
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            handleCategoryCheckboxChange("gender", opt, !!checked)
                          }
                          className="h-3.5 w-3.5 border-zinc-300 dark:border-zinc-700 text-emerald-600 rounded"
                        />
                        <Label
                          htmlFor={`filter-gen-${opt}`}
                          className="text-xs text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white cursor-pointer truncate"
                        >
                          {opt}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 15. Language Section */}
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 space-y-2">
              <button
                onClick={() => toggleSection("language")}
                className="w-full flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white cursor-pointer py-1"
              >
                <span className="flex items-center gap-2">
                  <Languages className="w-3.5 h-3.5 text-emerald-500" />
                  Language Spoken
                </span>
                {openSections.language ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openSections.language && (
                <div className="space-y-1.5 pt-1 max-h-36 overflow-y-auto animate-in fade-in duration-200">
                  {filterOptions.languages.map((opt) => {
                    const isChecked = (filters.columnFilters["piLanguage"] || []).includes(opt);
                    return (
                      <div key={opt} className="flex items-center gap-2.5 px-1 py-0.5">
                        <Checkbox
                          id={`filter-lang-${opt}`}
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            handleCategoryCheckboxChange("piLanguage", opt, !!checked)
                          }
                          className="h-3.5 w-3.5 border-zinc-300 dark:border-zinc-700 text-emerald-600 rounded"
                        />
                        <Label
                          htmlFor={`filter-lang-${opt}`}
                          className="text-xs text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white cursor-pointer truncate"
                        >
                          {opt}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 16. Degree Qualifications Section */}
            <div className="pb-3 space-y-2">
              <button
                onClick={() => toggleSection("degree")}
                className="w-full flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white cursor-pointer py-1"
              >
                <span className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                  Medical Degree
                </span>
                {openSections.degree ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openSections.degree && (
                <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                  <div className="relative">
                    <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-zinc-400" />
                    <Input
                      placeholder="Search degrees..."
                      value={degreeSearch}
                      onChange={(e) => setDegreeSearch(e.target.value)}
                      className="pl-7 text-xs h-8"
                    />
                  </div>
                  <div className="max-h-36 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
                    {filterOptions.degrees
                      .filter((d) => d.toLowerCase().includes(degreeSearch.toLowerCase()))
                      .map((opt) => {
                        const isChecked = (filters.columnFilters["doctorMedicalQualifications___courseId_name"] || []).includes(opt);
                        return (
                          <div key={opt} className="flex items-center gap-2.5 px-1 py-0.5">
                            <Checkbox
                              id={`filter-deg-${opt}`}
                              checked={isChecked}
                              onCheckedChange={(checked) =>
                                handleCategoryCheckboxChange("doctorMedicalQualifications___courseId_name", opt, !!checked)
                              }
                              className="h-3.5 w-3.5 border-zinc-300 dark:border-zinc-700 text-emerald-600 rounded"
                            />
                            <Label
                              htmlFor={`filter-deg-${opt}`}
                              className="text-xs text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white cursor-pointer truncate"
                            >
                              {opt}
                            </Label>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  );
};
