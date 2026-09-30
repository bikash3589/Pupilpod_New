"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, ClipboardList, Eye } from "lucide-react";
import { isUppercaseDisplayField, isUrlValue } from "@/lib/applicationListStorage";
import type { ApplicationRow } from "@/types/applicationList";
import styles from "./ApplicationsTable.module.css";

type ApplicationsTableProps = {
  rows: ApplicationRow[];
  columns: string[];
  fieldLabels: Record<string, string>;
  selectedIds: Set<string>;
  onToggleSelected: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
  onView: (row: ApplicationRow) => void;
  onHistory: (row: ApplicationRow) => void;
};

function renderCell(fieldName: string, value: string) {
  if (isUrlValue(value)) {
    return (
      <a href={value} target="_blank" rel="noreferrer">
        Download
      </a>
    );
  }
  return isUppercaseDisplayField(fieldName) ? value.toUpperCase() : value || "—";
}

function cellValue(row: ApplicationRow, column: string): string {
  if (column === "applicationId") return row.applicationId;
  if (column === "wfStatus") return row.wfStatus;
  if (column === "sequenceNo") return String(row.sequenceNo);
  if (column === "program") return row.program ?? "";
  if (column === "yearGroup") return row.yearGroup ?? "";
  return row.fields[column] ?? "";
}

export default function ApplicationsTable({
  rows,
  columns,
  fieldLabels,
  selectedIds,
  onToggleSelected,
  onToggleAll,
  onView,
  onHistory,
}: ApplicationsTableProps) {
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [quickSearch, setQuickSearch] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const searched = useMemo(() => {
    const term = quickSearch.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) =>
      [row.applicationId, row.wfStatus, row.program ?? "", row.yearGroup ?? "", ...Object.values(row.fields)]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [rows, quickSearch]);

  const sorted = useMemo(() => {
    if (!sortColumn) return searched;
    const copy = [...searched];
    copy.sort((a, b) => {
      const av = cellValue(a, sortColumn);
      const bv = cellValue(b, sortColumn);
      const cmp = av.localeCompare(bv, undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [searched, sortColumn, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / entriesPerPage));
  const currentPage = Math.min(page, totalPages);
  const paginated = sorted.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  const toggleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDir("asc");
    }
  };

  const SortableHeader = ({ column, label }: { column: string; label: string }) => (
    <th onClick={() => toggleSort(column)} className={styles.sortableHeader}>
      {label} <ArrowUpDown size={12} />
    </th>
  );

  const allOnPageSelected =
    paginated.length > 0 && paginated.every((r) => selectedIds.has(r.submissionId));

  return (
    <div className={styles.tableWrap}>
      <div className={styles.dataTableControls}>
        <div className={styles.entriesControl}>
          Show{" "}
          <select
            value={entriesPerPage}
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>{" "}
          entries
        </div>

        <div className={styles.searchControl}>
          Search:{" "}
          <input
            type="text"
            value={quickSearch}
            onChange={(e) => {
              setQuickSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <p className={styles.empty}>No applications found.</p>
      ) : (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={() => onToggleAll(paginated.map((r) => r.submissionId))}
                  />
                </th>
                <th>Action</th>
                <SortableHeader column="applicationId" label="Application ID" />
                <SortableHeader column="wfStatus" label="WF Status" />
                <SortableHeader column="sequenceNo" label="SubmissionId" />
                {columns.map((col) => (
                  <SortableHeader key={col} column={col} label={fieldLabels[col] ?? col} />
                ))}
                <SortableHeader column="program" label="Program" />
                <SortableHeader column="yearGroup" label="Class" />
              </tr>
            </thead>
            <tbody>
              {paginated.map((row) => (
                <tr key={row.submissionId}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(row.submissionId)}
                      onChange={() => onToggleSelected(row.submissionId)}
                    />
                  </td>
                  <td>
                    <div className={styles.actionIcons}>
                      <button type="button" onClick={() => onView(row)} title="View Form">
                        <Eye size={16} />
                      </button>
                      <button type="button" onClick={() => onHistory(row)} title="Show History">
                        <ClipboardList size={16} />
                      </button>
                    </div>
                  </td>
                  <td>{row.applicationId}</td>
                  <td>
                    <span className={styles.statusBadge}>{row.wfStatus}</span>
                  </td>
                  <td>{row.sequenceNo}</td>
                  {columns.map((col) => (
                    <td key={col}>{renderCell(col, row.fields[col] ?? "")}</td>
                  ))}
                  <td>{row.program ?? "—"}</td>
                  <td>{row.yearGroup ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.pagination}>
            <span>
              Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
              {Math.min(currentPage * entriesPerPage, sorted.length)} of {sorted.length} entries
            </span>
            <div className={styles.pageButtons}>
              <button disabled={currentPage === 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </button>
              <span className={styles.pageNumber}>{currentPage}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
