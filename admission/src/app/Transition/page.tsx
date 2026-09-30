"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getCampaigns } from "@/lib/campaignStorage";
import {
  deleteFieldMapping,
  getFieldMappings,
} from "@/lib/transitionFieldMapStorage";
import type { Campaign } from "@/types/campaign";
import type { FieldMappingRow } from "@/types/transitionFieldMap";
import styles from "./Transistion.module.css";

export default function Transition() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [mappings, setMappings] = useState<FieldMappingRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [campaignFilter, setCampaignFilter] = useState("");
  const [quickSearch, setQuickSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setCampaigns(getCampaigns());
    setMappings(getFieldMappings());
    setLoaded(true);
  }, []);

  const campaignNameById = useMemo(() => {
    const map = new Map<string, string>();
    campaigns.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [campaigns]);

  const filtered = useMemo(() => {
    const term = quickSearch.trim().toLowerCase();
    return mappings.filter((row) => {
      if (campaignFilter && row.campaignId !== campaignFilter) return false;
      if (!term) return true;
      const campaignName = campaignNameById.get(row.campaignId) ?? "";
      return (
        row.tableName.toLowerCase().includes(term) ||
        row.columnName.toLowerCase().includes(term) ||
        row.fluentFormColumnName.toLowerCase().includes(term) ||
        campaignName.toLowerCase().includes(term)
      );
    });
  }, [mappings, campaignFilter, quickSearch, campaignNameById]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / entriesPerPage));
  const paginated = filtered.slice(
    (page - 1) * entriesPerPage,
    page * entriesPerPage
  );

  const handleDelete = (id: string) => {
    if (!window.confirm("Delete this transition field mapping?")) return;
    deleteFieldMapping(id);
    setMappings(getFieldMappings());
  };

  const clearFilters = () => {
    setCampaignFilter("");
    setQuickSearch("");
    setPage(1);
  };

  return (
    <main className="page">
      <header>
        <nav className="navigation">
          <Link href="/" className="navigationButton">
            Home
          </Link>
          <Link href="/" className="navigationButton">
            Admission
          </Link>
          <Link href="/" className="navigationButton">
            Campaign
          </Link>
        </nav>
      </header>

      <h1 className="page-title">Transition List</h1>

      <section className="application-container">
        <div className={styles.toolbar}>
          <div className={styles.filterRow}>
            <span className={styles.filterLabel}>Filter by Application</span>
            <select
              value={campaignFilter}
              onChange={(e) => {
                setCampaignFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Applications</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={styles.clearButton}
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>

          <Link href="/Transition/AddTransitions" className="navigationButton">
            Add Transitions
          </Link>
        </div>

        <div className={styles.tableSection}>
          <div className={styles.tableToolbar}>
            <div>
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

            <div>
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
                <th>Application</th>
                <th>Table Name</th>
                <th>Column</th>
                <th>Fluent Form Field</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loaded ? (
                <tr>
                  <td colSpan={5} className={styles.emptyCell}>
                    Loading...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.emptyCell}>
                    No data available in table
                  </td>
                </tr>
              ) : (
                paginated.map((row) => (
                  <tr key={row.id}>
                    <td>
                      {campaignNameById.get(row.campaignId) ??
                        "(deleted campaign)"}
                    </td>
                    <td>{row.tableName}</td>
                    <td>{row.columnName}</td>
                    <td>{row.fluentFormColumnName}</td>
                    <td>
                      <div className={styles.actionLinks}>
                        <Link href={`/Transition/AddTransitions?edit=${row.id}`}>
                          Edit
                        </Link>
                        <button
                          type="button"
                          className={styles.deleteAction}
                          onClick={() => handleDelete(row.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className={styles.pagination}>
            <span>
              Showing{" "}
              {filtered.length === 0 ? 0 : (page - 1) * entriesPerPage + 1} to{" "}
              {Math.min(page * entriesPerPage, filtered.length)} of{" "}
              {filtered.length} entries
            </span>
            <div className={styles.pageButtons}>
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span>{page}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
