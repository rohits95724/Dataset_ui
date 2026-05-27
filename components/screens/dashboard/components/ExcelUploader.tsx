"use client";
import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet } from "lucide-react";
import { useDataset, SpreadsheetRow } from "@/context/dataset-context";
import { useToast } from "@/context/toast-context";
import { cn } from "@/lib/utils";

export const ExcelUploader: React.FC = () => {
  const [isDragActive, setIsDragActive] = useState(false);
  const { setUploadedData, isLoading, uploadProgress, setIsLoading, setUploadProgress } =
    useDataset();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file) return;

    const isExcel =
      file.name.endsWith(".xlsx") ||
      file.name.endsWith(".xls") ||
      file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel";
    const isCsv =
      file.name.endsWith(".csv") ||
      file.type === "text/csv" ||
      file.type === "application/csv";

    if (!isExcel && !isCsv) {
      addToast(
        "Invalid file type. Please upload a valid Excel (.xlsx, .xls) or CSV file.",
        "error"
      );
      return;
    }

    setIsLoading(true);
    setUploadProgress(10);

    const reader = new FileReader();

    let progress = 10;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 10;
      if (progress >= 90) {
        clearInterval(interval);
      } else {
        setUploadProgress(progress);
      }
    }, 80);

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error("Could not parse file contents.");

        let parsedData: SpreadsheetRow[] = [];

        if (isExcel) {
          const workbook = XLSX.read(data, { type: "binary", cellDates: true });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          parsedData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        } else {
          const text = typeof data === "string" ? data : new TextDecoder().decode(data as ArrayBuffer);
          const workbook = XLSX.read(text, { type: "string" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          parsedData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        }

        if (parsedData.length === 0) {
          throw new Error("This spreadsheet has no rows or columns.");
        }

        clearInterval(interval);
        setUploadProgress(100);

        const sizeKB = (file.size / 1024).toFixed(1);
        const sizeStr =
          Number(sizeKB) > 1024
            ? `${(Number(sizeKB) / 1024).toFixed(1)} MB`
            : `${sizeKB} KB`;

        setTimeout(() => {
          setUploadedData(parsedData, file.name, sizeStr);
          addToast(
            `Imported ${parsedData.length} rows successfully from ${file.name}!`,
            "success"
          );
        }, 450);
      } catch (err: unknown) {
        clearInterval(interval);
        setIsLoading(false);
        setUploadProgress(0);
        const errMsg = err instanceof Error ? err.message : "Failed to read the spreadsheet.";
        addToast(errMsg, "error");
      }
    };

    reader.onerror = () => {
      clearInterval(interval);
      setIsLoading(false);
      setUploadProgress(0);
      addToast("File read operation failed.", "error");
    };

    if (isExcel) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={cn(
          "relative group border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[220px]",
          isDragActive
            ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
            : "border-zinc-300 hover:border-emerald-400 bg-zinc-50/50 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/60"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".xlsx,.xls,.csv"
          onChange={handleChange}
          disabled={isLoading}
        />

        {isLoading ? (
          <div className="w-full max-w-xs space-y-4 animate-in fade-in duration-300">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600">
              <Upload className="w-6 h-6 animate-bounce" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Parsing spreadsheet records...
              </p>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{uploadProgress}% Complete</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 transition-all duration-300">
            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 dark:bg-zinc-800 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform duration-300">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div>
              <p className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
                Drag and drop your spreadsheet here
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports Excel (.xlsx, .xls) and CSV files
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold shadow-xs group-hover:border-zinc-300 dark:group-hover:border-zinc-700 transition-colors">
              Browse Files
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
