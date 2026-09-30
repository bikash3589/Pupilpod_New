"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import type { RegisteredUserListRow } from "@/types/registeredUser";
import styles from "./RegisteredUserTable.module.css";

type RegisteredUserTableProps = {
  rows: RegisteredUserListRow[];
  query: string;
  onQueryChange: (value: string) => void;
  selectedIds: Set<string>;
  onToggleSelected: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
};

type SortColumn = "name" | "email" | "mobile" | "status" | "createdAt";

function cellValue(row: RegisteredUserListRow, column: SortColumn): string {
  return column === "createdAt" ? row.createdAt : row[column];
}

export default function RegisteredUserTable({
  rows,
  query,
  onQueryChange,
  selectedIds,
  onToggleSelected,
  onToggleAll,
}: RegisteredUserTableProps) {
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sorted = useMemo(() => {
    if (!sortColumn) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const cmp = cellValue(a, sortColumn).localeCompare(cellValue(b, sortColumn));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [rows, sortColumn, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / entriesPerPage));
  const currentPage = Math.min(page, totalPages);
  const paginated = sorted.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const toggleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDir("asc");
    }
  };

  const allOnPageSelected =
    paginated.length > 0 && paginated.every((r) => selectedIds.has(r.id));

  const rangeLabel =
    sorted.length === 0
      ? "Showing 0 to 0 of 0 entries"
      : `Showing ${(currentPage - 1) * entriesPerPage + 1} to ${Math.min(
          currentPage * entriesPerPage,
          sorted.length
        )} of ${sorted.length} entries`;

  const InfoRow = () => (
    <div className={styles.infoRow}>
      <span>{rangeLabel}</span>
      <div className={styles.infoRowRight}>
        <div className={styles.pageButtons}>
          <button disabled={currentPage === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span className={styles.pageNumber}>{currentPage}</span>
          <button disabled={currentPage === totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
        <label>
          Search:{" "}
          <input
            type="text"
            value={query}
            onChange={(e) => {
              onQueryChange(e.target.value);
              setPage(1);
            }}
          />
        </label>
      </div>
    </div>
  );

  return (
    <div className={styles.tableWrap}>
      <div className={styles.entriesRow}>
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

      <InfoRow />

      <table className={styles.table}>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={allOnPageSelected}
                onChange={() => onToggleAll(paginated.map((r) => r.id))}
              />
            </th>
            <th>SI No</th>
            <th onClick={() => toggleSort("name")}>
              Name <ArrowUpDown size={12} />
            </th>
            <th onClick={() => toggleSort("email")}>
              Email <ArrowUpDown size={12} />
            </th>
            <th onClick={() => toggleSort("mobile")}>
              Mobile <ArrowUpDown size={12} />
            </th>
            <th onClick={() => toggleSort("status")}>
              Status <ArrowUpDown size={12} />
            </th>
            <th onClick={() => toggleSort("createdAt")}>
              Registration Date <ArrowUpDown size={12} />
            </th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td colSpan={7} className={styles.emptyRow}>
                No data available in table
              </td>
            </tr>
          ) : (
            paginated.map((row, index) => (
              <tr key={row.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(row.id)}
                    onChange={() => onToggleSelected(row.id)}
                  />
                </td>
                <td>{(currentPage - 1) * entriesPerPage + index + 1}</td>
                <td>{row.name}</td>
                <td>{row.email}</td>
                <td>{row.mobile}</td>
                <td className={row.status === "Applied" ? styles.statusApplied : styles.statusNotApplied}>
                  {row.status}
                </td>
                <td>{new Date(row.createdAt).toLocaleDateString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <InfoRow />
    </div>
  );
}
