"use client";
import React from "react";
import { X, Search, Filter, Calendar, RefreshCw } from "lucide-react";
import { useDataset } from "@/context/dataset-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";


export const FilterPanel: React.FC = () => {
  const {
    columns,
    filters,
    isFilterPanelOpen,
    setFilterPanelOpen,
    setColumnFilter,
    resetFilters,
  } = useDataset();

  if (!isFilterPanelOpen) return null;

  const handleCategoryChange = (columnName: string, option: string, checked: boolean) => {
    const currentSelected: string[] = filters.columnFilters[columnName] || [];
    let updated: string[];
    if (checked) {
      updated = [...currentSelected, option];
    } else {
      updated = currentSelected.filter((v) => v !== option);
    }
    setColumnFilter(columnName, updated);
  };

  const handleNumericChange = (columnName: string, boundary: "min" | "max", val: string) => {
    const current = filters.columnFilters[columnName] || { min: "", max: "" };
    const numVal = val === "" ? "" : Number(val);
    const updated = {
      ...current,
      [boundary]: numVal,
    };
    setColumnFilter(columnName, updated);
  };

  const handleDateChange = (columnName: string, boundary: "start" | "end", val: string) => {
    const current = filters.columnFilters[columnName] || { start: "", end: "" };
    const updated = {
      ...current,
      [boundary]: val,
    };
    setColumnFilter(columnName, updated);
  };

  const handleTextChange = (columnName: string, val: string) => {
    setColumnFilter(columnName, val);
  };

  return (
    <div className="w-80 border-l border-zinc-200/80 bg-zinc-50/50 dark:border-zinc-800/80 dark:bg-zinc-950/20 h-full flex flex-col animate-in slide-in-from-right duration-250 z-20 shrink-0">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white text-sm">
          <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Refine Dataset
        </div>
        <button
          onClick={() => setFilterPanelOpen(false)}
          className="p-1 rounded-md text-muted-foreground hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-white cursor-pointer"
          aria-label="Close filters panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Widgets List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {columns.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            Upload a spreadsheet to configure filters.
          </p>
        ) : (
          columns.map((col) => {
            const filterVal = filters.columnFilters[col.name];

            return (
              <div key={col.name} className="space-y-2.5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate pr-2">
                    {col.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200/60 text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-400 font-semibold">
                    {col.type}
                  </span>
                </div>

                {/* Text Filter */}
                {col.type === "text" && (
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                    <Input
                      placeholder={`Search ${col.name.toLowerCase()}...`}
                      value={filterVal || ""}
                      onChange={(e) => handleTextChange(col.name, e.target.value)}
                      className="pl-8 text-xs h-8.5"
                    />
                  </div>
                )}

                {/* Category Filter */}
                {col.type === "category" && col.uniqueValues && (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 bg-white dark:bg-zinc-950/40">
                    {col.uniqueValues.map((opt) => {
                      const isChecked = Array.isArray(filterVal) && filterVal.includes(opt);
                      return (
                        <div key={opt} className="flex items-center gap-2 px-1 py-0.5">
                          <Checkbox
                            id={`filter-${col.name}-${opt}`}
                            checked={isChecked}
                            onCheckedChange={(checked) =>
                              handleCategoryChange(col.name, opt, !!checked)
                            }
                            className="h-3.5 w-3.5 text-emerald-600"
                          />
                          <Label
                            htmlFor={`filter-${col.name}-${opt}`}
                            className="text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer truncate"
                          >
                            {opt}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Numeric Range Filter */}
                {col.type === "number" && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Min</Label>
                      <Input
                        type="number"
                        placeholder={col.min !== undefined ? String(col.min) : "Min"}
                        value={filterVal?.min ?? ""}
                        onChange={(e) => handleNumericChange(col.name, "min", e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Max</Label>
                      <Input
                        type="number"
                        placeholder={col.max !== undefined ? String(col.max) : "Max"}
                        value={filterVal?.max ?? ""}
                        onChange={(e) => handleNumericChange(col.name, "max", e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>
                  </div>
                )}

                {/* Date Range Filter */}
                {col.type === "date" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <input
                        type="date"
                        value={filterVal?.start ?? ""}
                        onChange={(e) => handleDateChange(col.name, "start", e.target.value)}
                        className="w-full bg-transparent text-xs outline-none dark:text-white"
                        min={col.minDate}
                        max={col.maxDate}
                      />
                    </div>
                    <div className="flex items-center gap-1 bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <input
                        type="date"
                        value={filterVal?.end ?? ""}
                        onChange={(e) => handleDateChange(col.name, "end", e.target.value)}
                        className="w-full bg-transparent text-xs outline-none dark:text-white"
                        min={col.minDate}
                        max={col.maxDate}
                      />
                    </div>
                  </div>
                )}

                <Separator className="mt-4" />
              </div>
            );
          })
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={resetFilters}
          className="flex-1 text-xs"
          disabled={columns.length === 0}
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Reset All
        </Button>
        <Button
          size="sm"
          onClick={() => setFilterPanelOpen(false)}
          className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
};
