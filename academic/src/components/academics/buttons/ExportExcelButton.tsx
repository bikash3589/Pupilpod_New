"use client";

import Button from "@/components/ui/Button";

interface ExportExcelButtonProps<T extends object> {
  rows: T[];
  columns: { key: keyof T; header: string }[];
  filename: string;
  label?: string;
  disabled?: boolean;
}

function toCsvValue(value: unknown) {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export default function ExportExcelButton<T extends object>({
  rows,
  columns,
  filename,
  label = "Export",
  disabled,
}: ExportExcelButtonProps<T>) {
  function handleExport() {
    const header = columns.map((c) => toCsvValue(c.header)).join(",");
    const lines = rows.map((row) => columns.map((c) => toCsvValue(row[c.key])).join(","));
    const csv = [header, ...lines].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleExport} disabled={disabled}>
      {label}
    </Button>
  );
}
