"use client";

import { useRef, useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

interface ImportExportButtonsProps {
  templateColumns: string[];
  templateFilename: string;
  onImport: (rows: Record<string, string>[]) => void;
  entityLabel: string;
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (cells[i] ?? "").trim();
    });
    return row;
  });
}

export default function ImportExportButtons({
  templateColumns,
  templateFilename,
  onImport,
  entityLabel,
}: ImportExportButtonsProps) {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  function downloadTemplate() {
    const csv = templateColumns.join(",") + "\r\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = templateFilename.endsWith(".csv") ? templateFilename : `${templateFilename}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    file.text().then((text) => setRows(parseCsv(text)));
  }

  function handleSubmit() {
    if (rows.length === 0) {
      toast("Choose a CSV file with at least one data row.", "error");
      return;
    }
    onImport(rows);
    toast(`${rows.length} ${entityLabel}(s) imported.`, "success");
    setOpen(false);
    setRows([]);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={downloadTemplate}>
        Default Template
      </Button>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Import
      </Button>
      <Modal open={open} title={`Import ${entityLabel}`} onClose={() => setOpen(false)}>
        <p className="text-sm text-muted">
          Upload a CSV matching the default template columns: {templateColumns.join(", ")}
        </p>
        <div className="field mt-12">
          <label>CSV file</label>
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFile} />
        </div>
        {fileName && (
          <p className="text-sm">
            {fileName} — {rows.length} row(s) parsed.
          </p>
        )}
        <div className="form-actions">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Import
          </Button>
        </div>
      </Modal>
    </>
  );
}
