"use client";

import { ReactNode, useMemo, useState } from "react";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  /** Custom cell render. Falls back to String(accessor(row) ?? row[key]). */
  render?: (row: T) => ReactNode;
  /** Value used for sorting/search when it isn't a plain property read off `key`. */
  accessor?: (row: T) => string | number | null | undefined;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  /** Rendered as a right-aligned strip at the top of the card (Add button, etc.) */
  headerActions?: ReactNode;
  /** Extra column appended after the data columns, e.g. Edit/Delete icon buttons. */
  renderActions?: (row: T) => ReactNode;
  /** Leading column before the data columns, e.g. row checkboxes. */
  renderLeading?: (row: T) => ReactNode;
  leadingHeader?: ReactNode;
  /** Adds a page-relative serial-number column right after the leading column. */
  showSerial?: boolean;
  /** Header text for the serial column — legacy screens spell this differently ("SI No" vs "Sl No"). */
  serialHeader?: string;
  searchable?: boolean;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  emptyMessage?: string;
  /** Skip the outer `.card` wrapper so the caller can nest this inside its own card (e.g. below a filter section). */
  bare?: boolean;
  /** Purely cosmetic sort-arrow glyph next to the "Actions" header — no sorting behavior attached. */
  actionsSortDecoration?: boolean;
  /** Duplicate info/pagination/search bar both above and below table (DataTables legacy style) */
  duplicateControls?: boolean;
}

function readValue<T>(row: T, col: DataTableColumn<T>): string | number | null | undefined {
  if (col.accessor) return col.accessor(row);
  const value = (row as Record<string, unknown>)[col.key];
  if (value === null || value === undefined) return value as null | undefined;
  if (typeof value === "string" || typeof value === "number") return value;
  return String(value);
}

export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  headerActions,
  renderActions,
  renderLeading,
  leadingHeader,
  showSerial = false,
  serialHeader = "SI NO",
  searchable = true,
  pageSizeOptions = [10, 25, 50, 100],
  defaultPageSize = 25,
  emptyMessage = "No matching records found.",
  bare = false,
  actionsSortDecoration = true,
  duplicateControls = true,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>({ key: "__serial__", dir: "asc" });

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter((row) => columns.some((col) => String(readValue(row, col) ?? "").toLowerCase().includes(q)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, search]);

  const sorted = useMemo(() => {
    if (!sort || sort.key === "__serial__") return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = readValue(a, col);
      const bv = readValue(b, col);
      if (av == null && bv == null) return 0;
      if (av == null) return -1;
      if (bv == null) return 1;
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return copy;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, sort]);

  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(total, currentPage * pageSize);
  const pageRows = sorted.slice(start - 1, end);

  function toggleSort(key: string) {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  }

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handlePageSize(value: number) {
    setPageSize(value);
    setPage(1);
  }

  const renderControlBar = (isTop: boolean) => (
    <div className="dt-controls-row">
      <div className="dt-info">
        {total === 0 ? "Showing 0 to 0 of 0 entries" : `Showing ${start} to ${end} of ${total} entries`}
      </div>
      <div className="dt-controls-right">
        <div className="dt-pagination">
          <button className="dt-page-btn" disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </button>
          <span className="dt-page-current">{currentPage}</span>
          <button className="dt-page-btn" disabled={currentPage >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}>
            Next
          </button>
        </div>
        {searchable && (
          <div className="dt-search">
            Search:
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="dt-search-input"
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={bare ? undefined : "card"}>
      {headerActions && <div className="dt-header">{headerActions}</div>}

      <div className="dt-top-controls">
        <div className="dt-show">
          Show
          <select value={pageSize} onChange={(e) => handlePageSize(Number(e.target.value))}>
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          entries
        </div>

        {duplicateControls && renderControlBar(true)}
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {renderLeading && <th>{leadingHeader}</th>}
              {showSerial && (
                <th
                  className="sortable"
                  onClick={() => toggleSort("__serial__")}
                >
                  {serialHeader}
                  <span className="dt-sort-arrows">
                    <span className={sort?.key === "__serial__" && sort.dir === "asc" ? "active" : ""}>▲</span>
                    <span className={sort?.key === "__serial__" && sort.dir === "desc" ? "active" : ""}>▼</span>
                  </span>
                </th>
              )}
              {columns.map((col) => {
                const isSorted = sort?.key === col.key;
                return (
                  <th
                    key={col.key}
                    className={col.sortable ? "sortable" : undefined}
                    style={{ textAlign: col.align }}
                    onClick={() => col.sortable && toggleSort(col.key)}
                  >
                    {col.header}
                    {(col.sortable ?? true) && (
                      <span className="dt-sort-arrows">
                        <span className={isSorted && sort?.dir === "asc" ? "active" : "inactive"}>▲</span>
                        <span className={isSorted && sort?.dir === "desc" ? "active" : "inactive"}>▼</span>
                      </span>
                    )}
                  </th>
                );
              })}
              {renderActions && (
                <th>
                  ACTIONS
                  {actionsSortDecoration && (
                    <span className="dt-sort-arrows" aria-hidden>
                      <span className="inactive">▲</span>
                      <span className="inactive">▼</span>
                    </span>
                  )}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <tr key={rowKey(row)}>
                {renderLeading && <td>{renderLeading(row)}</td>}
                {showSerial && <td>{start + i}</td>}
                {columns.map((col) => (
                  <td key={col.key} style={{ textAlign: col.align }}>
                    {col.render ? col.render(row) : String(readValue(row, col) ?? "")}
                  </td>
                ))}
                {renderActions && (
                  <td>
                    <div className="row-actions">{renderActions(row)}</div>
                  </td>
                )}
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={columns.length + (renderActions ? 1 : 0) + (renderLeading ? 1 : 0) + (showSerial ? 1 : 0)}>
                  <div className="empty-state">{emptyMessage}</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="dt-footer">
        {renderControlBar(false)}
      </div>
    </div>
  );
}
