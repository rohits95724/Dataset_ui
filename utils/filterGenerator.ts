export interface ColumnMeta {
  name: string;
  type: "number" | "date" | "category" | "text";
  uniqueValues?: string[]; // for category dropdowns
  min?: number; // for numeric ranges
  max?: number;
  minDate?: string; // for date ranges
  maxDate?: string;
}

export function generateColumnMetadata(data: Record<string, unknown>[]): ColumnMeta[] {
  if (!data || data.length === 0) return [];

  // Extract all unique keys across all rows to support sparse tables
  const allKeys = Array.from(
    new Set(data.flatMap((row) => Object.keys(row || {})))
  );

  return allKeys.map((key) => {
    // Collect all non-null, non-undefined, non-empty string values for this column
    const values = data
      .map((row) => row[key])
      .filter((v) => v !== null && v !== undefined && v !== "");

    if (values.length === 0) {
      return { name: key, type: "text" };
    }

    // Heuristics for type inference
    let numericCount = 0;
    let dateCount = 0;
    const uniqueVals = new Set<string>();

    values.forEach((v) => {
      const strVal = String(v).trim();
      uniqueVals.add(strVal);

      // Check number (exclude empty spaces, check if isNaN)
      if (strVal !== "" && !isNaN(Number(strVal))) {
        numericCount++;
      }

      // Check date
      // Match typical date formats: YYYY-MM-DD, MM/DD/YYYY, DD-MM-YYYY, or ISO strings
      const isDateString =
        /^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/.test(strVal) || // YYYY-MM-DD
        /^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}/.test(strVal) || // MM/DD/YYYY or DD-MM-YYYY
        (strVal.length > 10 && !isNaN(Date.parse(strVal)) && isNaN(Number(strVal))); // Timestamp / ISO but not a pure number
      
      if (isDateString && !isNaN(Date.parse(strVal))) {
        dateCount++;
      }
    });

    const totalValid = values.length;
    const isNumeric = numericCount / totalValid > 0.7;
    const isDate = dateCount / totalValid > 0.7;
    const uniqueCount = uniqueVals.size;

    // A column is a category if it has low cardinality (e.g. <= 15 unique values or <= 20% of total rows)
    const isCategory = uniqueCount <= 15 || (uniqueCount <= 30 && uniqueCount / data.length < 0.2);

    if (isNumeric) {
      const numbers = values.map((v) => Number(v)).filter((n) => !isNaN(n));
      const min = Math.min(...numbers);
      const max = Math.max(...numbers);
      return {
        name: key,
        type: "number",
        min: isFinite(min) ? min : 0,
        max: isFinite(max) ? max : 100,
      };
    }

    if (isDate) {
      const dates = values
        .map((v) => Date.parse(String(v)))
        .filter((d) => !isNaN(d));
      const minDate = new Date(Math.min(...dates)).toISOString().split("T")[0];
      const maxDate = new Date(Math.max(...dates)).toISOString().split("T")[0];
      return {
        name: key,
        type: "date",
        minDate,
        maxDate,
      };
    }

    if (isCategory) {
      // Sort categories and clean empty ones
      const sortedCategories = Array.from(uniqueVals)
        .filter((v) => v.length > 0)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

      return {
        name: key,
        type: "category",
        uniqueValues: sortedCategories,
      };
    }

    return {
      name: key,
      type: "text",
    };
  });
}
