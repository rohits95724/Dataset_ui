"use client";
import React, { createContext, useContext, useState, useMemo, ReactNode, useCallback, useEffect } from "react";
import { generateColumnMetadata, ColumnMeta } from "@/utils/filterGenerator";

// Define a type alias to replace explicit 'any' types for spreadsheet rows
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SpreadsheetRow = Record<string, any>;

export interface FilterState {
  globalSearch: string;
  columnFilters: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}

interface DatasetContextProps {
  SpreadsheetRow?: never; // placeholder to prevent unused type warning if not exported directly
  originalData: SpreadsheetRow[];
  data: SpreadsheetRow[];
  columns: ColumnMeta[];
  fileName: string | null;
  fileSize: string | null;
  isLoading: boolean;
  uploadProgress: number;
  isFilterPanelOpen: boolean;
  filters: FilterState;

  setUploadedData: (data: SpreadsheetRow[], fileName: string, fileSize: string) => void;
  setGlobalSearch: (search: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setColumnFilter: (columnKey: string, filterValue: any) => void;
  resetFilters: () => void;
  toggleFilterPanel: () => void;
  setFilterPanelOpen: (isOpen: boolean) => void;
  setUploadProgress: (progress: number) => void;
  setIsLoading: (loading: boolean) => void;
  loadSeedData: () => void;
}

const DatasetContext = createContext<DatasetContextProps | undefined>(undefined);

// Helper to generate seed patient data
// Helper to generate seed doctor data
function generateSeedDoctors(): SpreadsheetRow[] {
  const firstNamesMale = ["Arjun", "Aditya", "Rahul", "Amit", "Rajesh", "Sanjay", "Vijay", "Anil", "Vikram", "Sunil", "Ravi", "Sandeep", "Karan", "Abhishek", "Rohan", "Deepak", "Vivek", "Manish", "Prakash", "Suresh", "Vikrant", "Devendra"];
  const firstNamesFemale = ["Ananya", "Priyanka", "Sunita", "Deepika", "Kiran", "Shalini", "Pooja", "Meera", "Neha", "Divya", "Aishwarya", "Anjali", "Ritu", "Sneha", "Kriti", "Aditi", "Preeti", "Tanvi", "Radhika", "Swati", "Shruti", "Kavita"];
  const lastNames = ["Sharma", "Verma", "Gupta", "Singh", "Patel", "Reddy", "Nair", "Joshi", "Iyer", "Choudhury", "Kumar", "Rao", "Deshmukh", "Banerjee", "Sen", "Mehta", "Bhat", "Prasad", "Mishra", "Pandey", "Saxena", "Gill"];
  const specialties = ["Cardiology", "Neurology", "Pediatrics", "Orthopedics", "General Medicine", "Dermatology", "Oncology", "Gynaecology", "Ophthalmology"];
  const systemsOfMedicine = ["Modern Medicine (Allopathy)", "Ayurveda", "Homeopathy", "Unani", "Siddha"];
  const degreesMap: Record<string, string[]> = {
    "Modern Medicine (Allopathy)": ["MBBS", "MBBS, MD", "MBBS, MS", "DNB", "MBBS, MD, DM"],
    "Ayurveda": ["BAMS", "BAMS, MS (Ayu)"],
    "Homeopathy": ["BHMS", "BHMS, MD (Hom)"],
    "Unani": ["BUMS"],
    "Siddha": ["BSMS"]
  };
  const districts = ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Alwar", "Sikar", "Bhilwara", "Sri Ganganagar"];
  const statesMap: Record<string, string> = {
    "Jaipur": "Rajasthan",
    "Jodhpur": "Rajasthan",
    "Udaipur": "Rajasthan",
    "Kota": "Rajasthan",
    "Bikaner": "Rajasthan",
    "Ajmer": "Rajasthan",
    "Alwar": "Rajasthan",
    "Sikar": "Rajasthan",
    "Bhilwara": "Rajasthan",
    "Sri Ganganagar": "Rajasthan"
  };
  const councilsMap: Record<string, string> = {
    "Rajasthan": "Rajasthan Medical Council",
    "Delhi": "Delhi Medical Council",
    "Gujarat": "Gujarat Medical Council"
  };
  const languagesList = ["English", "Hindi", "Rajasthani", "Gujarati", "Punjabi"];
  const facilityOwnerships = ["Private", "Government", "ESI", "Trust", "Corporate"];
  const facilityTypes = ["PHC (Primary Health Centre)", "CHC (Community Health Centre)", "District Hospital", "Sub Divisional Hospital", "Medical College Hospital", "Private Clinic", "Corporate Hospital"];
  const hospitalsMap: Record<string, string[]> = {
    "Private": ["Bhandari Hospital", "Apex Hospital", "Jeevan Rekha Hospital", "Fortis Escorts Jaipur"],
    "Government": ["SMS Hospital Jaipur", "MDM Hospital Jodhpur", "PBM Hospital Bikaner", "MBS Hospital Kota"],
    "ESI": ["ESI Hospital Jaipur", "ESI Dispensary Jodhpur"],
    "Trust": ["Santokba Durlabhji Memorial Hospital", "Bhagwan Mahaveer Cancer Hospital"],
    "Corporate": ["EHCC Hospital", "Manipal Hospital Jaipur", "Narayana Multispeciality"]
  };
  const collegesList = [
    "SMS Medical College, Jaipur",
    "Sardar Patel Medical College, Bikaner",
    "RNT Medical College, Udaipur",
    "Dr. S.N. Medical College, Jodhpur",
    "Jawaharlal Nehru Medical College, Ajmer",
    "Government Medical College, Kota",
    "RUHS College of Medical Sciences, Jaipur",
    "Harvard Medical School, USA",
    "Oxford Medical School, UK",
    "Beijing Medical University, China",
    "Volgograd State Medical University, Russia"
  ];

  const seed = [];
  // Generate exactly 20,299 records as per the Rajasthan Registry Database Strategy
  for (let i = 1; i <= 20299; i++) {
    const isMale = Math.random() > 0.5;
    const gender = isMale ? "Male" : "Female";
    const fn = isMale 
      ? firstNamesMale[Math.floor(Math.random() * firstNamesMale.length)]
      : firstNamesFemale[Math.floor(Math.random() * firstNamesFemale.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const doctorName = `Dr. ${fn} ${ln}`;

    const specialty = specialties[Math.floor(Math.random() * specialties.length)];
    const system = systemsOfMedicine[Math.floor(Math.random() * systemsOfMedicine.length)];
    const degrees = degreesMap[system] || ["MBBS"];
    const degree = degrees[Math.floor(Math.random() * degrees.length)];

    const experience = Math.floor(Math.random() * 32) + 1; // 1 to 32 yrs
    const district = districts[Math.floor(Math.random() * districts.length)];
    
    // 95% Rajasthan, 5% other states for filtering realism
    const state = Math.random() > 0.05 ? "Rajasthan" : (Math.random() > 0.5 ? "Delhi" : "Gujarat");
    const council = councilsMap[state] || "Medical Council of India";
    
    // Languages: select 1 to 3 random languages
    const numLangs = Math.floor(Math.random() * 3) + 1;
    const selectedLangs = [];
    const tempLangs = [...languagesList];
    for (let l = 0; l < numLangs; l++) {
      const idx = Math.floor(Math.random() * tempLangs.length);
      selectedLangs.push(tempLangs.splice(idx, 1)[0]);
    }
    const piLanguage = selectedLangs.join(", ");

    const ownership = facilityOwnerships[Math.floor(Math.random() * facilityOwnerships.length)];
    const hosps = hospitalsMap[ownership] || ["General Clinic"];
    const hospitalName = hosps[Math.floor(Math.random() * hosps.length)];
    const facilityType = facilityTypes[Math.floor(Math.random() * facilityTypes.length)];

    const regYear = 2026 - experience - Math.floor(Math.random() * 3);
    const regNum = `REG-${regYear}-${String(10000 + i).slice(1)}`;

    const regStatus = Math.random() > 0.15 ? "Verified" : (Math.random() > 0.5 ? "Pending" : "Unverified");
    const status = Math.random() > 0.1 ? "Active" : "Inactive";
    const verificationStatus = Math.random() > 0.2 ? "Verified" : (Math.random() > 0.5 ? "Pending" : "Unverified");

    const phone = `+91 ${90000 + Math.floor(Math.random() * 9999)} ${10000 + Math.floor(Math.random() * 89999)}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}@${hospitalName.toLowerCase().replace(/\s+/g, "")}.org`;

    // derived doctor type
    const doctorType = (ownership === "Government" || ownership === "ESI") ? "Government Doctor" : "Private Doctor";
    const governmentEmployee = doctorType === "Government Doctor";

    // verification statuses
    const isRegistrationVerified = regStatus === "Verified";
    const isPhoneVerified = Math.random() > 0.15;
    const isEmailVerified = Math.random() > 0.2;
    const isQualificationsVerified = regStatus === "Verified";
    const isWorkVerified = Math.random() > 0.1;

    // GPS coordinate generation within Rajasthan bounding box
    // Lat: 23.3 to 30.2, Long: 69.3 to 78.2
    const lat = 23.3 + Math.random() * (30.2 - 23.3);
    const lng = 69.3 + Math.random() * (78.2 - 69.3);

    // College selection & foreign educated check
    const college = collegesList[Math.floor(Math.random() * collegesList.length)];
    const isForeignEducated = college.includes("USA") || college.includes("UK") || college.includes("China") || college.includes("Russia");

    seed.push({
      "id": `DOC-${String(i).padStart(5, "0")}`,
      "doctorName": doctorName,
      "gender": gender,
      "hprSpecialitys": specialty,
      "systemOfMedicine": system,
      "doctorMedicalQualifications___courseId_name": degree,
      "workExperienceInYear": experience,
      "hprWorkDetails___districtName": district,
      "currentCity": district,
      "hprWorkDetails___stateName": state,
      "stateMedicalCouncil": council,
      "piLanguage": piLanguage,
      "hprWorkDetails___facilityOwnership": ownership,
      "hospitalName": hospitalName,
      "registrationNumber": regNum,
      "registrationYear": regYear,
      "registrationStatus": regStatus,
      "status": status,
      "phoneNumber": phone,
      "email": email,
      "doctorType": doctorType,
      "isRegistrationVerified": isRegistrationVerified,
      "isPhoneVerified": isPhoneVerified,
      "isEmailVerified": isEmailVerified,
      "isQualificationsVerified": isQualificationsVerified,
      "isWorkVerified": isWorkVerified,
      
      // New requested database columns
      "doctors_work.facilityLat": lat,
      "doctors_work.facilityLong": lng,
      "doctors_main.stateName": state,
      "doctors_work.verificationStatus": verificationStatus,
      "doctors_main.governmentEmployee": governmentEmployee,
      "doctors_work.facilityType": facilityType,
      "doctors_work.facilityOwnership": ownership,
      "doctors_qualifications.collegeId.name": college,
      "isForeignEducated": isForeignEducated
    });
  }
  return seed;
}

function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

const runFiltering = (
  originalData: SpreadsheetRow[],
  filters: FilterState,
  columns: ColumnMeta[]
): SpreadsheetRow[] => {
  let filtered = [...originalData];
  const { globalSearch, columnFilters } = filters;

  // 1. Apply Global Search
  if (globalSearch.trim() !== "") {
    const searchLower = globalSearch.toLowerCase().trim();
    filtered = filtered.filter((row) => {
      return Object.values(row).some((val) =>
        String(val).toLowerCase().includes(searchLower)
      );
    });
  }

  // 2. Apply Custom Filters
  // GPS Proximity Filter
  const gps = columnFilters["gpsProximity"];
  if (gps && gps.lat !== null && gps.lng !== null && gps.radius !== "" && gps.radius !== undefined) {
    const radiusNum = Number(gps.radius);
    if (radiusNum > 0) {
      filtered = filtered.filter((row) => {
        const flat = Number(row["doctors_work.facilityLat"]);
        const flng = Number(row["doctors_work.facilityLong"]);
        if (isNaN(flat) || isNaN(flng)) return false;
        const dist = getHaversineDistance(gps.lat, gps.lng, flat, flng);
        return dist <= radiusNum;
      });
    }
  }

  // State Filter
  const states = columnFilters["doctors_main.stateName"];
  if (Array.isArray(states) && states.length > 0) {
    filtered = filtered.filter((row) => {
      const rowVal = String(row["doctors_main.stateName"] || "").trim().toLowerCase();
      return states.some(f => String(f).trim().toLowerCase() === rowVal);
    });
  }

  // Workplace Verification Status
  const verStatuses = columnFilters["doctors_work.verificationStatus"];
  if (Array.isArray(verStatuses) && verStatuses.length > 0) {
    filtered = filtered.filter((row) => {
      const rowVal = String(row["doctors_work.verificationStatus"] || "").trim().toLowerCase();
      return verStatuses.some(f => String(f).trim().toLowerCase() === rowVal);
    });
  }

  // Government Employee Filter
  const govEmp = columnFilters["doctors_main.governmentEmployee"];
  if (govEmp === "yes") {
    filtered = filtered.filter((row) => row["doctors_main.governmentEmployee"] === true);
  } else if (govEmp === "no") {
    filtered = filtered.filter((row) => row["doctors_main.governmentEmployee"] === false);
  }

  // Facility Type
  const facTypes = columnFilters["doctors_work.facilityType"];
  if (Array.isArray(facTypes) && facTypes.length > 0) {
    filtered = filtered.filter((row) => {
      const rowVal = String(row["doctors_work.facilityType"] || "").trim().toLowerCase();
      return facTypes.some(f => String(f).trim().toLowerCase() === rowVal);
    });
  }

  // Facility Ownership
  const facOwnerships = columnFilters["doctors_work.facilityOwnership"];
  if (Array.isArray(facOwnerships) && facOwnerships.length > 0) {
    filtered = filtered.filter((row) => {
      const rowVal = String(row["doctors_work.facilityOwnership"] || row["hprWorkDetails___facilityOwnership"] || "").trim().toLowerCase();
      return facOwnerships.some(f => String(f).trim().toLowerCase() === rowVal);
    });
  }

  // Medical College / Alma Mater
  const colleges = columnFilters["doctors_qualifications.collegeId.name"];
  if (Array.isArray(colleges) && colleges.length > 0) {
    filtered = filtered.filter((row) => {
      const rowVal = String(row["doctors_qualifications.collegeId.name"] || "").trim().toLowerCase();
      return colleges.some(f => String(f).trim().toLowerCase() === rowVal);
    });
  }

  // Foreign Educated Filter
  const foreign = columnFilters["isForeignEducated"];
  if (foreign === "yes") {
    filtered = filtered.filter((row) => row["isForeignEducated"] === true);
  } else if (foreign === "no") {
    filtered = filtered.filter((row) => row["isForeignEducated"] === false);
  }

  // 3. Apply Standard Column Filters (skipping custom ones)
  columns.forEach((col) => {
    if ([
      "doctors_main.stateName",
      "doctors_work.verificationStatus",
      "doctors_main.governmentEmployee",
      "doctors_work.facilityType",
      "doctors_work.facilityOwnership",
      "doctors_qualifications.collegeId.name",
      "isForeignEducated",
      "doctors_work.facilityLat",
      "doctors_work.facilityLong",
      "hprWorkDetails___facilityOwnership"
    ].includes(col.name)) {
      return;
    }

    const activeFilter = columnFilters[col.name];
    if (activeFilter === undefined || activeFilter === null) return;

    if (col.type === "category") {
      if (Array.isArray(activeFilter) && activeFilter.length > 0) {
        filtered = filtered.filter((row) => {
          const rowVal = String(row[col.name] || "").trim();
          if (rowVal.includes(",")) {
            const rowVals = rowVal.split(",").map(s => s.trim().toLowerCase());
            return activeFilter.some(filterVal => rowVals.includes(String(filterVal).trim().toLowerCase()));
          }
          return activeFilter.some(filterVal => String(filterVal).trim().toLowerCase() === rowVal.toLowerCase());
        });
      }
    } else if (col.type === "number") {
      const { min, max } = activeFilter;
      filtered = filtered.filter((row) => {
        const rowVal = Number(row[col.name]);
        if (isNaN(rowVal)) return true;
        if (min !== "" && min !== undefined && rowVal < min) return false;
        if (max !== "" && max !== undefined && rowVal > max) return false;
        return true;
      });
    } else if (col.type === "date") {
      const { start, end } = activeFilter;
      filtered = filtered.filter((row) => {
        const dateStr = String(row[col.name] || "").trim();
        if (!dateStr) return true;
        const time = Date.parse(dateStr);
        if (isNaN(time)) return true;

        if (start) {
          const startTime = Date.parse(start);
          if (!isNaN(startTime) && time < startTime) return false;
        }
        if (end) {
          const endTime = Date.parse(end);
          if (!isNaN(endTime) && time > endTime) return false;
        }
        return true;
      });
    } else if (col.type === "text") {
      if (typeof activeFilter === "string" && activeFilter.trim() !== "") {
        const textSearch = activeFilter.toLowerCase().trim();
        filtered = filtered.filter((row) => {
          const rowVal = String(row[col.name] || "").toLowerCase();
          return rowVal.includes(textSearch);
        });
      }
    }
  });

  return filtered;
};

export const DatasetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [originalData, setOriginalData] = useState<SpreadsheetRow[]>([]);
  const [columns, setColumns] = useState<ColumnMeta[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isFilterPanelOpen, setFilterPanelOpen] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    globalSearch: "",
    columnFilters: {},
  });

  // Calculate filtered data reactively without triggering cascading state renders
  const data = useMemo(() => {
    return runFiltering(originalData, filters, columns);
  }, [originalData, filters, columns]);

  const setUploadedData = useCallback((newData: SpreadsheetRow[], name: string, size: string) => {
    const cols = generateColumnMetadata(newData);
    
    // Initialize filters structure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const initialColumnFilters: { [key: string]: any } = {};
    cols.forEach((col) => {
      if (col.type === "category") {
        initialColumnFilters[col.name] = [];
      } else if (col.type === "number") {
        initialColumnFilters[col.name] = { min: "", max: "" };
      } else if (col.type === "date") {
        initialColumnFilters[col.name] = { start: "", end: "" };
      } else {
        initialColumnFilters[col.name] = "";
      }
    });

    // Custom Filters Initializations
    initialColumnFilters["gpsProximity"] = { lat: null, lng: null, radius: "" };
    initialColumnFilters["doctors_main.stateName"] = [];
    initialColumnFilters["doctors_work.verificationStatus"] = [];
    initialColumnFilters["doctors_main.governmentEmployee"] = "all";
    initialColumnFilters["doctors_work.facilityType"] = [];
    initialColumnFilters["doctors_work.facilityOwnership"] = [];
    initialColumnFilters["doctors_qualifications.collegeId.name"] = [];
    initialColumnFilters["isForeignEducated"] = "all";

    setOriginalData(newData);
    setColumns(cols);
    setFileName(name);
    setFileSize(size);
    setFilters({
      globalSearch: "",
      columnFilters: initialColumnFilters,
    });
    setIsLoading(false);
    setUploadProgress(100);
  }, []);

  const setGlobalSearch = useCallback((search: string) => {
    setFilters((prev) => ({
      ...prev,
      globalSearch: search,
    }));
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setColumnFilter = useCallback((columnKey: string, filterValue: any) => {
    setFilters((prev) => ({
      ...prev,
      columnFilters: {
        ...prev.columnFilters,
        [columnKey]: filterValue,
      },
    }));
  }, []);

  const resetFilters = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resetColFilters: { [key: string]: any } = {};
    columns.forEach((col) => {
      if (col.type === "category") {
        resetColFilters[col.name] = [];
      } else if (col.type === "number") {
        resetColFilters[col.name] = { min: "", max: "" };
      } else if (col.type === "date") {
        resetColFilters[col.name] = { start: "", end: "" };
      } else {
        resetColFilters[col.name] = "";
      }
    });

    // Reset Custom Filters
    resetColFilters["gpsProximity"] = { lat: null, lng: null, radius: "" };
    resetColFilters["doctors_main.stateName"] = [];
    resetColFilters["doctors_work.verificationStatus"] = [];
    resetColFilters["doctors_main.governmentEmployee"] = "all";
    resetColFilters["doctors_work.facilityType"] = [];
    resetColFilters["doctors_work.facilityOwnership"] = [];
    resetColFilters["doctors_qualifications.collegeId.name"] = [];
    resetColFilters["isForeignEducated"] = "all";

    setFilters({
      globalSearch: "",
      columnFilters: resetColFilters,
    });
  }, [columns]);

  const toggleFilterPanel = useCallback(() => {
    setFilterPanelOpen((prev) => !prev);
  }, []);

  const loadSeedData = useCallback(() => {
    const mockData = generateSeedDoctors();
    setUploadedData(mockData, "doctors_registry_records.xlsx", "124.2 KB");
  }, [setUploadedData]);

  useEffect(() => {
    loadSeedData();
  }, [loadSeedData]);

  return (
    <DatasetContext.Provider
      value={{
        originalData,
        data,
        columns,
        fileName,
        fileSize,
        isLoading,
        uploadProgress,
        isFilterPanelOpen,
        filters,
        setUploadedData,
        setGlobalSearch,
        setColumnFilter,
        resetFilters,
        toggleFilterPanel,
        setFilterPanelOpen,
        setUploadProgress,
        setIsLoading,
        loadSeedData,
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
};

export const useDataset = () => {
  const context = useContext(DatasetContext);
  if (!context) {
    throw new Error("useDataset must be used within a DatasetProvider");
  }
  return context;
};
