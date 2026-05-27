"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import {
  Search,
  EyeOff,
  ChevronDown,
  Trash2,
  Database,
  ArrowUpDown,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useDataset } from "@/context/dataset-context";
import { useToast } from "@/context/toast-context";
import { useModal } from "@/context/modal-context";
import { DoctorDetailsDrawer } from "./components/DoctorDetailsDrawer";
import { DoctorEditDrawer } from "./components/DoctorEditDrawer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    originalData,
    data,
    columns,
    fileName,
    filters,
    setGlobalSearch,
    resetFilters,
    loadSeedData,
    setUploadedData,
    isApiMode,
    cursor,
    limit,
    nextCursor,
    prevCursors,
    setLimit,
    goToNextPage,
    goToPrevPage,
  } = useDataset();
  const { addToast } = useToast();
  const { openDrawer } = useModal();

  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});

  // Auth Guard redirect
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const getInitials = (name: string) => {
    return name
      .replace("Dr. ", "")
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Construct table columns for TanStack Table
  const tableColumns = useMemo(() => {
    if (originalData.length === 0) return [];

    // Check if the current dataset is our Doctor schema by checking if `doctorName` is in keys
    const firstRowKeys = Object.keys(originalData[0] || {});
    const isDoctorSchema = firstRowKeys.includes("doctorName");

    if (!isDoctorSchema) {
      // Generic spreadsheet fallback columns
      return [
        {
          id: "select",
          header: ({ table }: any) => (
            <input
              type="checkbox"
              checked={table.getIsAllPageRowsSelected()}
              onChange={table.getToggleAllPageRowsSelectedHandler()}
              className="rounded border-zinc-300 dark:border-zinc-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
            />
          ),
          cell: ({ row }: any) => (
            <input
              type="checkbox"
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
              className="rounded border-zinc-300 dark:border-zinc-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
            />
          ),
          enableSorting: false,
        },
        ...columns.map((col) => ({
          accessorKey: col.name,
          header: ({ column }: any) => (
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="flex items-center gap-1.5 hover:text-zinc-950 dark:hover:text-white transition-colors font-bold text-xs"
            >
              {col.name}
              <ArrowUpDown className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
            </button>
          ),
          cell: (info: any) => String(info.getValue() ?? ""),
        })),
      ];
    }

    // Specific refactored Doctor registry columns
    return [
      {
        id: "select",
        header: ({ table }: any) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="rounded border-zinc-300 dark:border-zinc-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
          />
        ),
        cell: ({ row }: any) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="rounded border-zinc-300 dark:border-zinc-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "doctorName",
        header: ({ column }: any) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1.5 hover:text-zinc-950 dark:hover:text-white font-bold text-xs"
          >
            Doctor
            <ArrowUpDown className="w-3 h-3 text-zinc-400" />
          </button>
        ),
        cell: ({ row }: any) => {
          const name = row.original.doctorName;
          const gender = row.original.gender;
          const type = row.original.doctorType;
          return (
            <div className="flex items-center gap-3 py-1">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="bg-emerald-200 text-emerald-800 text-xs font-extrabold dark:bg-emerald-950/40 dark:text-emerald-300">
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-bold text-zinc-900 dark:text-white truncate text-xs">{name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{type} • {gender}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "hprSpecialitys",
        header: "Specialty",
        cell: ({ row }: any) => (
          <span className="font-semibold text-xs text-zinc-700 dark:text-zinc-300">
            {row.original.hprSpecialitys}
          </span>
        ),
      },
      {
        accessorKey: "doctorMedicalQualifications___courseId_name",
        header: "Qualification",
        cell: ({ row }: any) => (
          <span className="text-xs text-zinc-600 dark:text-zinc-400">
            {row.original.doctorMedicalQualifications___courseId_name}
          </span>
        ),
      },
      {
        accessorKey: "workExperienceInYear",
        header: ({ column }: any) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 hover:text-zinc-950 dark:hover:text-white font-bold text-xs"
          >
            Experience
            <ArrowUpDown className="w-3 h-3 text-zinc-400" />
          </button>
        ),
        cell: ({ row }: any) => (
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            {row.original.workExperienceInYear} yrs
          </span>
        ),
      },
      {
        accessorKey: "piLanguage",
        header: "Language",
        cell: ({ row }: any) => (
          <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate max-w-[120px] inline-block">
            {row.original.piLanguage}
          </span>
        ),
      },
      {
        accessorKey: "hospitalName",
        header: "Hospital",
        cell: ({ row }: any) => (
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            {row.original.hospitalName}
          </span>
        ),
      },
      {
        accessorKey: "hprWorkDetails___districtName",
        header: "Location",
        cell: ({ row }: any) => (
          <span className="text-xs text-zinc-600 dark:text-zinc-400">
            {row.original.hprWorkDetails___districtName}
          </span>
        ),
      },
      {
        accessorKey: "registrationStatus",
        header: "Registration",
        cell: ({ row }: any) => {
          const regStatus = row.original.registrationStatus;
          let badgeClass = "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-800";
          if (regStatus === "Verified") {
            badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40";
          } else if (regStatus === "Pending") {
            badgeClass = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40";
          } else if (regStatus === "Unverified") {
            badgeClass = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/40";
          }
          return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
              {regStatus}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }: any) => {
          const status = row.original.status;
          const badgeClass =
            status === "Active"
              ? "bg-emerald-50 text-emerald-800 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
              : "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-800";
          return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
              {status}
            </span>
          );
        },
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }: any) => (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openDrawer(<DoctorDetailsDrawer doctor={row.original} />)}
              className="h-7 text-xs font-semibold hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/20 border-zinc-200 dark:border-zinc-800 cursor-pointer"
            >
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openDrawer(<DoctorEditDrawer doctor={row.original} />)}
              className="h-7 text-xs font-semibold hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/20 border-zinc-200 dark:border-zinc-800 cursor-pointer"
            >
              Edit
            </Button>
          </div>
        ),
      },
    ];
  }, [originalData, columns, openDrawer]);

  // React Table initialization
  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      rowSelection,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: isApiMode,
  });



  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-zinc-50/20 dark:bg-zinc-950/10 overflow-hidden">
      {/* Scrollable container */}
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Header Panel */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Doctor Registry Board
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage medical practitioners, verify registrations, and filter specialties in real time.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadSeedData}
              className="border-zinc-200 hover:border-emerald-300 dark:border-zinc-800 dark:hover:border-emerald-950 hover:bg-emerald-50/10 self-start sm:self-auto cursor-pointer text-xs h-8.5"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Refresh Data
            </Button>
          </div>

          {/* Table Loading Skeleton / Active State */}
          {originalData.length === 0 ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div className="h-9 w-48 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded" />
                <div className="h-9 w-32 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded" />
              </div>
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900/40">
                <div className="h-10 bg-zinc-150 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 animate-pulse" />
                <div className="p-4 space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-4 items-center">
                      <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                      <div className="h-5 flex-1 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded" />
                      <div className="h-5 w-24 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded" />
                      <div className="h-5 w-16 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Active Doctor Visualizer Section */
            <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-xs rounded-xl overflow-hidden animate-fade-in flex flex-col">
              {/* Toolbar Area */}
              <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-zinc-950/20">
                {/* Search */}
                <div className="relative w-full md:max-w-xs shrink-0">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                  <Input
                    placeholder="Search doctor name, specialty..."
                    value={filters.globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    className="pl-8.5 h-8.5 text-xs"
                  />
                </div>

                {/* Toolbar buttons */}
                <div className="flex items-center gap-2">
                  {/* Dynamic Columns Visibility Selector */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8.5 text-xs font-semibold cursor-pointer border-zinc-200 dark:border-zinc-800">
                        <EyeOff className="w-3.5 h-3.5 mr-1.5" />
                        Columns
                        <ChevronDown className="w-3 h-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 max-h-60 overflow-y-auto">
                      <DropdownMenuLabel className="text-xs">Toggle Visibility</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {table.getAllLeafColumns().map((column) => {
                        if (column.id === "select" || column.id === "action") return null;
                        return (
                          <DropdownMenuCheckboxItem
                            key={column.id}
                            className="capitalize text-xs cursor-pointer"
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                          >
                            {column.id === "doctorName" ? "Doctor" : column.id}
                          </DropdownMenuCheckboxItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Reset Filters Quick Access */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="h-8.5 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 text-muted-foreground hover:text-zinc-900"
                  >
                    Reset Active Filters
                  </Button>
                </div>
              </div>

              {/* Scrollable Table viewport */}
              <div className="relative overflow-x-auto overflow-y-auto max-h-[580px] w-full min-h-[300px]">
                <table className="w-full text-left border-collapse">
                  {/* Sticky Header */}
                  <thead className="sticky top-0 z-10 bg-zinc-50 border-b border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="p-3.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-xs"
                            style={{ width: header.getSize() }}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>

                  {/* Table body */}
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900/10">
                    {table.getRowModel().rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={tableColumns.length}
                          className="p-16 text-center text-xs text-muted-foreground font-medium"
                        >
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <Database className="w-6 h-6 text-zinc-300 dark:text-zinc-700 animate-pulse" />
                            <p className="font-semibold text-zinc-850 dark:text-zinc-100 text-sm">
                              No practitioners found
                            </p>
                            <p className="max-w-xs leading-relaxed text-[11px]">
                              No clinician records match the current filter checks on the left. Reset filters or broaden your keyword search.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      table.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="p-3.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[220px]">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-950/20 text-[11px]">
                {/* Statistics counts */}
                {isApiMode ? (
                  <div className="text-muted-foreground font-medium">
                    Showing{" "}
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {data.length > 0 ? cursor + 1 : 0}
                    </span>{" "}
                    to{" "}
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {cursor + data.length}
                    </span>{" "}
                    practitioners
                  </div>
                ) : (
                  <div className="text-muted-foreground font-medium">
                    Showing{" "}
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {Math.min(
                        (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                        data.length
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {data.length}
                    </span>{" "}
                    practitioners
                  </div>
                )}

                {/* Page Navigation Actions */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-medium">Rows per page:</span>
                    <select
                      value={isApiMode ? limit : table.getState().pagination.pageSize}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (isApiMode) {
                          setLimit(val);
                        } else {
                          table.setPageSize(val);
                        }
                      }}
                      className="border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 px-2 py-1 font-semibold text-zinc-800 dark:text-zinc-200 outline-none text-[11px] cursor-pointer"
                    >
                      {[10, 20, 30, 40, 50].map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Prev/Next buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => isApiMode ? goToPrevPage() : table.previousPage()}
                      disabled={isApiMode ? prevCursors.length === 0 : !table.getCanPreviousPage()}
                      className="cursor-pointer h-7 w-7"
                    >
                      {"<"}
                    </Button>
                    <span className="text-muted-foreground font-semibold px-2">
                      Page{" "}
                      <span className="text-zinc-900 dark:text-white font-extrabold">
                        {isApiMode ? prevCursors.length + 1 : table.getState().pagination.pageIndex + 1}
                      </span>{" "}
                      {!isApiMode && `of ${table.getPageCount() || 1}`}
                    </span>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => isApiMode ? goToNextPage() : table.nextPage()}
                      disabled={isApiMode ? nextCursor === null : !table.getCanNextPage()}
                      className="cursor-pointer h-7 w-7"
                    >
                      {">"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
