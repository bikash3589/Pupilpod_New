"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { getCampaignById } from "@/lib/campaignStorage";
import {
  deleteInvoices,
  getInvoicesByCampaign,
  updateInvoicesStatus,
} from "@/lib/invoiceStorage";
import type { Campaign } from "@/types/campaign";
import type { Invoice, InvoiceStatus } from "@/types/invoice";
import styles from "./ApplicationInvoice.module.css";

const STATUS_OPTIONS: InvoiceStatus[] = [
  "Not Paid",
  "Paid",
  "Partial Paid",
  "Cancelled",
];

type Filters = {
  academicYear: string;
  program: string;
  className: string;
  studentName: string;
  invoiceTitle: string;
  invoiceNumber: string;
  dueDate: string;
  status: string;
};

const emptyFilters: Filters = {
  academicYear: "",
  program: "",
  className: "",
  studentName: "",
  invoiceTitle: "",
  invoiceNumber: "",
  dueDate: "",
  status: "",
};

function escapeCsvValue(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function toCsv(rows: Invoice[]): string {
  const headers = [
    "Invoice Series Number",
    "Invoice Title",
    "Name",
    "Program",
    "Class",
    "Academic Year",
    "Fee Item",
    "Ac Head",
    "Due Date",
    "Status",
    "Invoice Fee Amount",
    "Paid",
    "Pending",
  ];
  const lines = rows.map((invoice) =>
    [
      invoice.invoiceNumber,
      invoice.invoiceTitle,
      invoice.studentName,
      invoice.program,
      invoice.class,
      invoice.academicYear,
      invoice.feeItem ?? "",
      invoice.accountHead ?? "",
      invoice.dueDate,
      invoice.status,
      invoice.amount.toString(),
      invoice.paidAmount.toString(),
      (invoice.amount - invoice.paidAmount).toString(),
    ]
      .map(escapeCsvValue)
      .join(",")
  );
  return [headers.map(escapeCsvValue).join(","), ...lines].join("\n");
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function statusClassName(status: InvoiceStatus, styles: Record<string, string>) {
  switch (status) {
    case "Paid":
      return styles.statusPaid;
    case "Partial Paid":
      return styles.statusPartial;
    case "Cancelled":
      return styles.statusCancelled;
    default:
      return styles.statusNotPaid;
  }
}

function SortCaret() {
  return <span className={styles.sortCaret}>⇅</span>;
}

export default function ApplicationInvoice() {
  const { id } = useParams<{ id: string }>();

  const [campaign, setCampaign] = useState<Campaign | null | undefined>(
    undefined
  );
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [draftFilters, setDraftFilters] = useState<Filters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(emptyFilters);
  const [hasSearched, setHasSearched] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [quickSearch, setQuickSearch] = useState("");

  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<InvoiceStatus | "">("");

  useEffect(() => {
    const found = getCampaignById(id) ?? null;
    setCampaign(found);
    setInvoices(getInvoicesByCampaign(id));
    setDraftFilters((prev) => ({
      ...prev,
      academicYear: found?.academicYear ?? "",
    }));
    setAppliedFilters((prev) => ({
      ...prev,
      academicYear: found?.academicYear ?? "",
    }));
  }, [id]);

  const refreshInvoices = () => setInvoices(getInvoicesByCampaign(id));

  const academicYearOptions = useMemo(
    () =>
      Array.from(
        new Set(
          [campaign?.academicYear, ...invoices.map((i) => i.academicYear)].filter(
            Boolean
          )
        )
      ) as string[],
    [campaign, invoices]
  );

  const programOptions = useMemo(
    () =>
      Array.from(
        new Set(
          [...(campaign?.programs ?? []), ...invoices.map((i) => i.program)].filter(
            Boolean
          )
        )
      ) as string[],
    [campaign, invoices]
  );

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesYear =
        !appliedFilters.academicYear ||
        invoice.academicYear === appliedFilters.academicYear;
      const matchesProgram =
        !appliedFilters.program || invoice.program === appliedFilters.program;
      const matchesClass =
        !appliedFilters.className ||
        invoice.class.toLowerCase().includes(appliedFilters.className.toLowerCase());
      const matchesStudent =
        !appliedFilters.studentName ||
        invoice.studentName
          .toLowerCase()
          .includes(appliedFilters.studentName.toLowerCase());
      const matchesTitle =
        !appliedFilters.invoiceTitle ||
        invoice.invoiceTitle
          .toLowerCase()
          .includes(appliedFilters.invoiceTitle.toLowerCase());
      const matchesNumber =
        !appliedFilters.invoiceNumber ||
        invoice.invoiceNumber
          .toLowerCase()
          .includes(appliedFilters.invoiceNumber.toLowerCase());
      const matchesDueDate =
        !appliedFilters.dueDate || invoice.dueDate === appliedFilters.dueDate;
      const matchesStatus =
        !appliedFilters.status || invoice.status === appliedFilters.status;

      return (
        matchesYear &&
        matchesProgram &&
        matchesClass &&
        matchesStudent &&
        matchesTitle &&
        matchesNumber &&
        matchesDueDate &&
        matchesStatus
      );
    });
  }, [invoices, appliedFilters]);

  const totalAmount = useMemo(
    () => filteredInvoices.reduce((sum, invoice) => sum + invoice.amount, 0),
    [filteredInvoices]
  );

  const visibleInvoices = useMemo(() => {
    const term = quickSearch.trim().toLowerCase();
    if (!term) return filteredInvoices;
    return filteredInvoices.filter(
      (invoice) =>
        invoice.studentName.toLowerCase().includes(term) ||
        invoice.invoiceTitle.toLowerCase().includes(term) ||
        invoice.invoiceNumber.toLowerCase().includes(term) ||
        (invoice.feeItem ?? "").toLowerCase().includes(term) ||
        (invoice.accountHead ?? "").toLowerCase().includes(term) ||
        invoice.status.toLowerCase().includes(term)
    );
  }, [filteredInvoices, quickSearch]);

  const totalPages = Math.max(1, Math.ceil(visibleInvoices.length / entriesPerPage));
  const paginatedInvoices = visibleInvoices.slice(
    (page - 1) * entriesPerPage,
    page * entriesPerPage
  );

  const handleSearch = () => {
    setAppliedFilters(draftFilters);
    setQuickSearch("");
    setPage(1);
    setHasSearched(true);
  };

  const handleClearSearch = () => {
    const cleared: Filters = {
      ...emptyFilters,
      academicYear: campaign?.academicYear ?? "",
    };
    setDraftFilters(cleared);
    setAppliedFilters(cleared);
    setQuickSearch("");
    setPage(1);
    setHasSearched(true);
  };

  const toggleSelect = (invoiceId: string) => {
    setSelectedIds((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((v) => v !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const visibleIds = paginatedInvoices.map((invoice) => invoice.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((v) => selectedIds.includes(v));

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((v) => !visibleIds.includes(v)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleDeleteOne = (invoiceId: string) => {
    if (!confirm("Delete this invoice?")) return;
    deleteInvoices([invoiceId]);
    refreshInvoices();
    setSelectedIds((prev) => prev.filter((v) => v !== invoiceId));
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      alert("Select at least one invoice first.");
      return;
    }
    if (!confirm(`Delete ${selectedIds.length} selected invoice(s)?`)) return;
    deleteInvoices(selectedIds);
    refreshInvoices();
    setSelectedIds([]);
  };

  const handleBulkUpdateApply = () => {
    if (!bulkStatus) return;
    updateInvoicesStatus(selectedIds, bulkStatus);
    refreshInvoices();
    setSelectedIds([]);
    setShowBulkUpdate(false);
    setBulkStatus("");
  };

  const handleBulkDownload = () => {
    if (selectedIds.length === 0) {
      alert("Select at least one invoice first.");
      return;
    }
    const selectedInvoices = filteredInvoices.filter((invoice) =>
      selectedIds.includes(invoice.id)
    );
    downloadCsv("invoices-selected.csv", toCsv(selectedInvoices));
  };

  const handleExportExcel = () => {
    if (filteredInvoices.length === 0) {
      alert("No invoices to export.");
      return;
    }
    downloadCsv("invoices-export.csv", toCsv(filteredInvoices));
  };

  const tableInfoText = `Showing ${
    visibleInvoices.length === 0 ? 0 : (page - 1) * entriesPerPage + 1
  } to ${Math.min(page * entriesPerPage, visibleInvoices.length)} of ${
    visibleInvoices.length
  } entries`;

  return (
    <main className="page">
      <div className={styles.pageHeader}>
        <h1 className="page-title">
          Manage Applicant Invoice for {campaign?.name ?? ""}
        </h1>
        <nav className={styles.breadcrumbNav}>
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/">Admission</Link>
          <span>/</span>
          <Link href="/">Campaign</Link>
          <span>/</span>
          <span className={styles.breadcrumbCurrent}>
            Manage Applicant Invoice for {campaign?.name ?? ""}
          </span>
        </nav>
      </div>

      {campaign === undefined && (
        <section className="application-container">
          <div className={styles.card}>
            <p>Loading campaign...</p>
          </div>
        </section>
      )}

      {campaign === null && (
        <section className="application-container">
          <div className={styles.card}>
            <p>No campaign found for this id.</p>
          </div>
        </section>
      )}

      {campaign && (
        <section className="application-container">
          <div className={styles.card}>
            <div className={styles.filterGrid}>
              <div className={styles.filterField}>
                <label>
                  Academic Year <span className={styles.required}>*</span>
                </label>
                <select
                  value={draftFilters.academicYear}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      academicYear: e.target.value,
                    }))
                  }
                >
                  {academicYearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterField}>
                <label>Program</label>
                <select
                  value={draftFilters.program}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({ ...prev, program: e.target.value }))
                  }
                >
                  <option value="">Select Program</option>
                  {programOptions.map((program) => (
                    <option key={program} value={program}>
                      {program}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterField}>
                <label>Class</label>
                <input
                  type="text"
                  value={draftFilters.className}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({ ...prev, className: e.target.value }))
                  }
                />
              </div>

              <div className={styles.filterField}>
                <label>Student Name</label>
                <input
                  type="text"
                  value={draftFilters.studentName}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      studentName: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className={styles.filterGridSecondary}>
              <div className={styles.filterField}>
                <label>Invoice Title</label>
                <input
                  type="text"
                  value={draftFilters.invoiceTitle}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      invoiceTitle: e.target.value,
                    }))
                  }
                />
              </div>

              <div className={styles.filterField}>
                <label>Invoice Number</label>
                <input
                  type="text"
                  value={draftFilters.invoiceNumber}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      invoiceNumber: e.target.value,
                    }))
                  }
                />
              </div>

              <div className={styles.filterField}>
                <label>Due Date</label>
                <input
                  type="date"
                  value={draftFilters.dueDate}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({ ...prev, dueDate: e.target.value }))
                  }
                />
              </div>

              <div className={styles.filterField}>
                <label>Invoice Status</label>
                <select
                  value={draftFilters.status}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({ ...prev, status: e.target.value }))
                  }
                >
                  <option value="">Select Status</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterActions}>
                <button
                  type="button"
                  className={styles.clearButton}
                  onClick={handleClearSearch}
                >
                  Clear Search
                </button>
                <button
                  type="button"
                  className={styles.searchButton}
                  onClick={handleSearch}
                >
                  Search
                </button>
              </div>
            </div>

            <div className={styles.summaryBar}>
              <span>No of invoice : {filteredInvoices.length}</span>
              <span>Total Amount:{totalAmount}</span>
            </div>

            <div className={styles.bulkRow}>
              <div className={styles.bulkButtons}>
                <button type="button" onClick={handleBulkDelete}>
                  Bulk Delete
                </button>
                <button type="button" onClick={() => setShowBulkUpdate((v) => !v)}>
                  Bulk Update
                </button>
                <button type="button" onClick={handleBulkDownload}>
                  Bulk Download
                </button>
                <button
                  type="button"
                  className={styles.exportButton}
                  onClick={handleExportExcel}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                    <path d="M14 2v6h6" />
                  </svg>
                  Export Excel
                </button>
              </div>
            </div>

            {selectedIds.length > 0 && (
              <p className={styles.selectionNote}>
                {selectedIds.length} invoice(s) selected
              </p>
            )}

            {showBulkUpdate && (
              <div className={styles.bulkUpdatePanel}>
                <label>Set status to</label>
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value as InvoiceStatus)}
                >
                  <option value="">Select Status</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={!bulkStatus || selectedIds.length === 0}
                  onClick={handleBulkUpdateApply}
                >
                  Apply
                </button>
                <button type="button" onClick={() => setShowBulkUpdate(false)}>
                  Cancel
                </button>
              </div>
            )}

            {hasSearched && (
              <>
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
                </div>

                <div className={styles.tableInfoRow}>
                  <span className={styles.tableInfoText}>{tableInfoText}</span>
                  <div className={styles.pageButtons}>
                    <button
                      type="button"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                  <div className={styles.quickSearchControl}>
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

                <div className={styles.tableScroll}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            checked={allVisibleSelected}
                            onChange={toggleSelectAllVisible}
                          />
                          <SortCaret />
                        </th>
                        <th>
                          Sl.No <SortCaret />
                        </th>
                        <th>
                          Invoice Title <SortCaret />
                        </th>
                        <th>
                          Name <SortCaret />
                        </th>
                        <th>
                          Invoice Series Number <SortCaret />
                        </th>
                        <th>
                          Invoice Fee Amount <SortCaret />
                        </th>
                        <th>
                          Paid <SortCaret />
                        </th>
                        <th>
                          Pending <SortCaret />
                        </th>
                        <th>
                          Fee Item <SortCaret />
                        </th>
                        <th>
                          Ac Head <SortCaret />
                        </th>
                        <th>
                          Due Date <SortCaret />
                        </th>
                        <th>
                          Status <SortCaret />
                        </th>
                        <th>
                          Actions <SortCaret />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedInvoices.length === 0 ? (
                        <tr>
                          <td colSpan={12} className={styles.emptyCell}>
                            No data available in table
                          </td>
                        </tr>
                      ) : (
                        paginatedInvoices.map((invoice, index) => (
                          <tr key={invoice.id}>
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(invoice.id)}
                                onChange={() => toggleSelect(invoice.id)}
                              />
                            </td>
                            <td>{(page - 1) * entriesPerPage + index + 1}</td>
                            <td>{invoice.invoiceTitle}</td>
                            <td>{invoice.studentName}</td>
                            <td>{invoice.invoiceNumber}</td>
                            <td>{invoice.amount}</td>
                            <td>{invoice.paidAmount}</td>
                            <td>{invoice.amount - invoice.paidAmount}</td>
                            <td>{invoice.feeItem}</td>
                            <td>{invoice.accountHead}</td>
                            <td>{invoice.dueDate}</td>
                            <td>
                              <span className={statusClassName(invoice.status, styles)}>
                                {invoice.status}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className={styles.deleteRowButton}
                                onClick={() => handleDeleteOne(invoice.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className={styles.tableInfoRow}>
                  <span className={styles.tableInfoText}>{tableInfoText}</span>
                  <div className={styles.pageButtons}>
                    <button
                      type="button"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
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
        </section>
      )}
    </main>
  );
}
