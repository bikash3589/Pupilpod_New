"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { deleteCampaign } from "@/lib/campaignStorage";
import { searchCampaigns } from "@/lib/campaignSearch";
import { defaultCampaignSearchCriteria } from "@/types/campaignSearch";
import styles from "./CampaignTable.module.css";

interface CampaignTableProps {
  searchText?: string;
}

export default function CampaignTable({ searchText = "" }: CampaignTableProps) {
  const [loaded, setLoaded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoaded(true);
  }, []);

  // The top search box's term drives the query; reset back to page 1 whenever
  // it changes so a new search doesn't land on a now out-of-range page.
  useEffect(() => {
    setPage(1);
  }, [searchText]);

  const result = useMemo(() => {
    if (!loaded) return null;
    return searchCampaigns(defaultCampaignSearchCriteria(searchText));
    // refreshKey forces a recompute after a delete mutates storage.
  }, [loaded, searchText, refreshKey]);

  const filtered = result?.data ?? [];
  const totalPages = Math.max(1, Math.ceil(filtered.length / entriesPerPage));
  const paginated = filtered.slice(
    (page - 1) * entriesPerPage,
    page * entriesPerPage
  );

  const handleDelete = (id: string) => {
    if (!confirm("Delete this campaign?")) return;
    deleteCampaign(id);
    setRefreshKey((k) => k + 1);
  };

  if (!loaded) {
    return <p>Loading campaigns...</p>;
  }

  return (
    <div className={styles.wrapper}>
      {/* ============ Toolbar: entries + search ============ */}
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

        {searchText && (
          <div className={styles.resultSummary}>
            {result?.foundRows ?? 0} of {result?.totalRows ?? 0} campaigns match &quot;{searchText}&quot;
          </div>
        )}
      </div>

      {result?.totalRows === 0 ? (
        <p>No campaigns yet. Click "Add Campaign" to create one.</p>
      ) : filtered.length === 0 ? (
        <p>No campaigns match your search.</p>
      ) : (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>SI No</th>
                <th>Name</th>
                <th>Academic Year</th>
                <th>Seat</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Actions</th>
                <th>Workflow Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((c, index) => (
                <tr key={c.id}>
                  <td>{(page - 1) * entriesPerPage + index + 1}</td>
                  <td>
                    {/* <Link href={`/AddCampaign?id=${c.id}`} className={styles.nameLink}>
                      {c.name}
                    </Link> */}
                    {c.name}
                  </td>
                  <td>{c.academicYear}</td>
                  {/* <td>{c.seatMatrix.campaignSeat ?? 0}</td> */}
                  <td>{c.seatMatrix.reduce((sum, s) => sum + (s.campaignSeat ?? 0), 0)}</td>
                  <td>{c.startDate}</td>
                  <td>{c.endDate}</td>
                  <td>
                    <span
                      className={
                        c.status === "Published"
                          ? styles.statusPublished
                          : c.status === "Stopped"
                          ? styles.statusStopped
                          : styles.statusDraft
                      }
                    >
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionIcons}>
                      {/* <button title="View">Eye👁</button> */}
                      <Link href={`/campaign/${c.id}/submitted-form`} >Submitted Form</Link>
                      <Link href={`/campaign/${c.id}/view`} title="View">View Application Form</Link>
                      <Link href={`/campaign/${c.id}/registered-users`} title="View">Registered user</Link>
                      <Link href={`/campaign/${c.id}/edit`} title="View">Edit</Link>
                      {/* <Link href={`/campaign/${c.id}`} title="View">Delete</Link> */}
                      <span><button title="Delete" onClick={() => handleDelete(c.id)}>
                        Delete
                      </button>
                      </span>
                      <Link href={`/campaign/${c.id}/upload-template`} title="View">Upload Tempalate</Link>
                      <Link href={`/campaign/${c.id}/application-invoice`} title="View">Application Invoice</Link>
                    </div>
                  </td>
                  <td>
                    <Link href={`/campaign/${c.id}/workflow`} title="">Work Flow</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ============ Pagination ============ */}
          <div className={styles.pagination}>
            <span>
              Showing {(page - 1) * entriesPerPage + 1} to{" "}
              {Math.min(page * entriesPerPage, filtered.length)} of{" "}
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
        </>
      )}
    </div>
  );
}