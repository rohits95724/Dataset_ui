"use client";
import React, { createContext, useContext, useState, useMemo, ReactNode, useCallback, useEffect } from "react";
import { generateColumnMetadata, ColumnMeta } from "@/utils/filterGenerator";
import { useAuth } from "./auth-context";
import { useToast } from "./toast-context";
import { doctorService } from "@/services/doctor-services/doctorService";
import { FilterOptionsResponse } from "@/types/doctor";

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
  SpreadsheetRow?: never;
  originalData: SpreadsheetRow[];
  data: SpreadsheetRow[];
  columns: ColumnMeta[];
  fileName: string | null;
  fileSize: string | null;
  isLoading: boolean;
  uploadProgress: number;
  isFilterPanelOpen: boolean;
  filters: FilterState;

  // Pagination parameters
  isApiMode: boolean;
  cursor: number;
  limit: number;
  nextCursor: number | null;
  prevCursors: number[];
  filterVocabulary: FilterOptionsResponse | null;

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

  setLimit: (limit: number) => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  updateDoctor: (updatedDoctor: SpreadsheetRow) => void;
}

const DatasetContext = createContext<DatasetContextProps | undefined>(undefined);

// Dummy seed doctor data generator has been completely removed to prioritize live API data.

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

// normalizeDoctor is called internally by doctorService.getDoctors()


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

  // Pagination & API Mode States
  const [cursor, setCursor] = useState<number>(0);
  const [limit, setLimit] = useState<number>(20);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [prevCursors, setPrevCursors] = useState<number[]>([]);
  const [filterVocabulary, setFilterVocabulary] = useState<FilterOptionsResponse | null>(null);

  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const isApiMode = fileName === "Live API Registry";

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
    setCursor(0);
    setPrevCursors([]);
    setIsLoading(false);
    setUploadProgress(100);
  }, []);

  const fetchDoctorsFromApi = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      const { globalSearch, columnFilters } = filters;

      if (globalSearch && globalSearch.trim() !== "") {
        params.append("q", globalSearch.trim());
      }

      const gov = columnFilters["doctors_main.governmentEmployee"];
      if (gov && gov !== "all") {
        params.append("government_employee", gov);
      }

      const foreign = columnFilters["isForeignEducated"];
      if (foreign && foreign !== "all") {
        params.append("is_foreign_educated", foreign);
      }

      const exp = columnFilters["workExperienceInYear"];
      if (exp) {
        if (exp.min !== undefined && exp.min !== "") {
          params.append("experience_min", String(exp.min));
        }
        if (exp.max !== undefined && exp.max !== "") {
          params.append("experience_max", String(exp.max));
        }
      }

      const appendArrayParam = (paramName: string, filterKey: string) => {
        const filterVals = columnFilters[filterKey];
        if (Array.isArray(filterVals) && filterVals.length > 0) {
          filterVals.forEach((val) => {
            params.append(paramName, String(val));
          });
        }
      };

      appendArrayParam("specialty", "hprSpecialitys");
      appendArrayParam("system_of_medicine", "systemOfMedicine");
      appendArrayParam("state_source", "doctors_main.stateName");
      appendArrayParam("verification_status", "doctors_work.verificationStatus");
      appendArrayParam("facility_type", "doctors_work.facilityType");
      appendArrayParam("facility_ownership", "doctors_work.facilityOwnership");
      appendArrayParam("college_name", "doctors_qualifications.collegeId.name");
      appendArrayParam("doctor_type", "doctorType");
      appendArrayParam("gender", "gender");
      appendArrayParam("pi_language", "piLanguage");
      appendArrayParam("course_name", "doctorMedicalQualifications___courseId_name");

      // Apply page limits and pagination cursors
      params.append("limit", String(limit));
      if (cursor > 0) {
        params.append("cursor", String(cursor));
      }

      const resData = await doctorService.getDoctors(params);
      const normalized = Array.isArray(resData?.items) ? resData.items : (Array.isArray(resData) ? resData : []);

      setOriginalData(normalized);
      setNextCursor(resData?.next_cursor ?? null);

      if (normalized.length > 0) {
        const cols = generateColumnMetadata(normalized as unknown as Record<string, unknown>[]);
        setColumns(cols);
      }
      setFileName("Live API Registry");
      setFileSize("Active connection");
    } catch (error) {
      console.error("Failed to fetch doctors from backend API:", error);
      addToast("Failed to connect to FastAPI.", "error");
      setOriginalData([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, filters, cursor, limit, addToast]);

  const loadSeedData = useCallback(() => {
    fetchDoctorsFromApi();
  }, [fetchDoctorsFromApi]);

  // Load the API-sourced filters vocabulary when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      doctorService.getFilterOptions()
        .then((vocab) => {
          setFilterVocabulary(vocab);
        })
        .catch((err) => {
          console.error("Failed to load backend filter options vocabulary", err);
        });
    } else {
      setFilterVocabulary(null);
    }
  }, [isAuthenticated]);

  // Reset pagination cursor when filters or limit change
  useEffect(() => {
    setCursor(0);
    setPrevCursors([]);
  }, [filters.columnFilters, filters.globalSearch, limit]);

  // Calculate filtered data reactively (only in client/mock mode, API mode just returns active page)
  const data = useMemo(() => {
    if (isApiMode) {
      return originalData;
    }
    return runFiltering(originalData, filters, columns);
  }, [originalData, filters, columns, isApiMode]);

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
    setCursor(0);
    setPrevCursors([]);
  }, [columns]);

  const toggleFilterPanel = useCallback(() => {
    setFilterPanelOpen((prev) => !prev);
  }, []);

  const goToNextPage = useCallback(() => {
    if (nextCursor !== null) {
      setPrevCursors((prev) => [...prev, cursor]);
      setCursor(nextCursor);
    }
  }, [nextCursor, cursor]);

  const goToPrevPage = useCallback(() => {
    if (prevCursors.length > 0) {
      const prev = [...prevCursors];
      const prevCursor = prev.pop()!;
      setPrevCursors(prev);
      setCursor(prevCursor);
    }
  }, [prevCursors]);

  const updateDoctor = useCallback((updatedDoctor: SpreadsheetRow) => {
    setOriginalData((prev) =>
      prev.map((doc) => (doc.id === updatedDoctor.id ? updatedDoctor : doc))
    );
  }, []);

  useEffect(() => {
    if (isAuthenticated && originalData.length === 0) {
      loadSeedData();
    }
  }, [isAuthenticated, originalData.length, loadSeedData]);

  useEffect(() => {
    if (!isAuthenticated) {
      setOriginalData([]);
      return;
    }

    const handler = setTimeout(() => {
      fetchDoctorsFromApi();
    }, 400);

    return () => clearTimeout(handler);
  }, [filters, cursor, limit, isAuthenticated, fetchDoctorsFromApi]);

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
        isApiMode,
        cursor,
        limit,
        nextCursor,
        prevCursors,
        filterVocabulary,
        setUploadedData,
        setGlobalSearch,
        setColumnFilter,
        resetFilters,
        toggleFilterPanel,
        setFilterPanelOpen,
        setUploadProgress,
        setIsLoading,
        loadSeedData,
        setLimit,
        goToNextPage,
        goToPrevPage,
        updateDoctor,
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
