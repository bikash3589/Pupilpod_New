"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import type { Workflow } from "@/types/workflow";
import styles from "./WorkflowTable.module.css";

type WorkflowTableProps = {
  campaignId: string;
  workflows: Workflow[];
};

export default function WorkflowTable({
  campaignId,
  workflows,
}: WorkflowTableProps) {
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [quickSearch, setQuickSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const term = quickSearch.trim().toLowerCase();
    if (!term) return workflows;
    return workflows.filter(
      (w) =>
        w.name.toLowerCase().includes(term) ||
        w.code.toLowerCase().includes(term) ||
        w.description.toLowerCase().includes(term) ||
        w.academicYear.toLowerCase().includes(term)
    );
  }, [workflows, quickSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / entriesPerPage));
  const paginated = filtered.slice(
    (page - 1) * entriesPerPage,
    page * entriesPerPage
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.tableToolbar}>
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

      <table className={styles.table}>
        <thead>
          <tr>
            <th>WF Name</th>
            <th>WF Code</th>
            <th>Description</th>
            <th>Academic Year</th>
            <th>Work Flow State</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td colSpan={6} className={styles.emptyCell}>
                No data available in table
              </td>
            </tr>
          ) : (
            paginated.map((w) => (
              <tr key={w.id}>
                <td>{w.name}</td>
                <td>{w.code}</td>
                <td>{w.description}</td>
                <td>{w.academicYear}</td>
                <td>{w.states.map((s) => s.stateName).filter(Boolean).join(", ")}</td>
                <td>
                  <Link
                    href={`/campaign/${campaignId}/workflow/${w.id}/edit`}
                    className={styles.editIcon}
                    title="Edit Work Flow"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                    </svg>
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className={styles.pagination}>
        <span>
          Showing {filtered.length === 0 ? 0 : (page - 1) * entriesPerPage + 1}{" "}
          to {Math.min(page * entriesPerPage, filtered.length)} of{" "}
          {filtered.length} entries
        </span>
        <div className={styles.pageButtons}>
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span className={styles.pageNumber}>{page}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
