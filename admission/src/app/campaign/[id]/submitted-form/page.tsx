"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { getCampaignById } from "@/lib/campaignStorage";
import { getCampaignTemplates } from "@/lib/campaignTemplateStorage";
import { getFluentFormFields } from "@/lib/transitionFormFields";
import {
  applyTransition,
  evaluateFilterTree,
  getApplicationRows,
  getAvailableTransitions,
  resolveGridColumns,
  softDeleteSubmission,
} from "@/lib/applicationListStorage";
import type {
  ApplicationFilterTree,
  ApplicationRow,
  AvailableTransitionButton,
  GridType,
} from "@/types/applicationList";
import type { Campaign } from "@/types/campaign";

import ApplicationsTable from "./components/ApplicationsTable";
import AdvanceSearchPanel from "./components/AdvanceSearchPanel";
import UpdateProgramClassModal from "./components/UpdateProgramClassModal";
import TransitionRemarkModal from "./components/TransitionRemarkModal";
import RowDetailModal from "./components/RowDetailModal";
import MessageModal from "./components/MessageModal";
import styles from "./SubmittedForm.module.css";

const GRID_TABS: { value: GridType; label: string }[] = [
  { value: "quick", label: "Quick Data Grid" },
  { value: "requested", label: "Requested Grid" },
  { value: "full", label: "Full Data Grid" },
];

function downloadCsv(rows: ApplicationRow[], columns: string[], fieldLabels: Record<string, string>) {
  const header = ["Application ID", "Status", ...columns.map((c) => fieldLabels[c] ?? c), "Program", "Class"];
  const csvRows = rows.map((row) => [
    row.applicationId,
    row.wfStatus,
    ...columns.map((c) => row.fields[c] ?? ""),
    row.program ?? "",
    row.yearGroup ?? "",
  ]);

  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const csv = [header, ...csvRows]
    .map((line) => line.map((cell) => escape(String(cell))).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "applications.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function SubmittedFormList() {
  const { id } = useParams<{ id: string }>();

  const [campaign, setCampaign] = useState<Campaign | null | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);
  const [gridType, setGridType] = useState<GridType>("quick");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterTree, setFilterTree] = useState<ApplicationFilterTree | null>(null);
  const [showAdvanceSearch, setShowAdvanceSearch] = useState(false);
  const [updateProgramClassRow, setUpdateProgramClassRow] = useState<ApplicationRow | null>(null);
  const [detailModal, setDetailModal] = useState<{ row: ApplicationRow; tab: "details" | "history" } | null>(null);
  const [pendingTransition, setPendingTransition] = useState<AvailableTransitionButton | null>(null);
  const [messageModal, setMessageModal] = useState<"sms" | "email" | null>(null);

  useEffect(() => {
    setCampaign(getCampaignById(id) ?? null);
  }, [id]);

  const allFields = useMemo(
    () => (campaign ? getFluentFormFields(campaign.id).filter((f) => f.name !== "application_no") : []),
    [campaign, refreshKey]
  );
  const fieldLabels = useMemo(
    () => Object.fromEntries(allFields.map((f) => [f.name, f.label])),
    [allFields]
  );
  const columns = useMemo(
    () => resolveGridColumns(gridType, allFields),
    [gridType, allFields]
  );

  const rows = useMemo(
    () => (campaign ? getApplicationRows(campaign.id) : []),
    [campaign, refreshKey]
  );

  const allowedFields = useMemo(() => new Set(allFields.map((f) => f.name)), [allFields]);

  const visibleRows = useMemo(() => {
    if (!filterTree) return rows;
    return evaluateFilterTree(rows, filterTree, allowedFields);
  }, [rows, filterTree, allowedFields]);

  const availableTransitions = useMemo(
    () => (campaign && selectedIds.size > 0 ? getAvailableTransitions(campaign.id, [...selectedIds]) : []),
    [campaign, selectedIds, refreshKey]
  );

  const refresh = () => setRefreshKey((k) => k + 1);

  const toggleSelected = (submissionId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(submissionId)) next.delete(submissionId);
      else next.add(submissionId);
      return next;
    });
  };

  const toggleAll = (ids: string[]) => {
    setSelectedIds((prev) => {
      const allSelected = ids.length > 0 && ids.every((rowId) => prev.has(rowId));
      const next = new Set(prev);
      ids.forEach((rowId) => (allSelected ? next.delete(rowId) : next.add(rowId)));
      return next;
    });
  };

  const handleDelete = (row: ApplicationRow) => {
    if (!confirm(`Delete application ${row.applicationId}?`)) return;
    softDeleteSubmission(row.submissionId);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(row.submissionId);
      return next;
    });
    refresh();
  };

  const runTransition = (transition: AvailableTransitionButton, remark = "") => {
    if (!campaign) return;
    applyTransition(campaign.id, [...selectedIds], transition.transitionIndex, remark);
    setSelectedIds(new Set());
    setPendingTransition(null);
    refresh();
  };

  const handleTransitionClick = (transition: AvailableTransitionButton) => {
    if (transition.enableRemark) {
      setPendingTransition(transition);
    } else {
      runTransition(transition);
    }
  };

  const requireExactlyOne = (): ApplicationRow | null => {
    if (selectedIds.size !== 1) {
      alert("Please select exactly one application.");
      return null;
    }
    return visibleRows.find((r) => selectedIds.has(r.submissionId)) ?? null;
  };

  const handleDownloadPdf = async () => {
    if (!campaign || !requireExactlyOne()) return;
    const templates = await getCampaignTemplates(campaign.id);
    if (!templates.online.fileUrl) {
      alert("No application template has been uploaded for this campaign yet.");
      return;
    }
    window.open(templates.online.fileUrl, "_blank");
  };

  const handleSendMessage = (channel: "sms" | "email") => {
    if (selectedIds.size === 0) {
      alert("Select at least one application first.");
      return;
    }
    setMessageModal(channel);
  };

  if (campaign === undefined) {
    return (
      <main className="page">
        <p>Loading campaign...</p>
      </main>
    );
  }

  if (campaign === null) {
    return (
      <main className="page">
        <p>No campaign found for this id.</p>
        <Link href="/">Go to Home</Link>
      </main>
    );
  }

  return (
    <main className="page">
      <div className={styles.pageHeader}>
        <h1 className="page-title">Campaign</h1>
        <nav className={styles.breadcrumbNav}>
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/">Admission</Link>
          <span>/</span>
          <span className={styles.breadcrumbCurrent}>Campaign</span>
        </nav>
      </div>

      <section className="application-container">
        <div className={styles.tabBar}>
          {GRID_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={`${styles.tab} ${gridType === tab.value ? styles.tabActive : ""}`}
              onClick={() => setGridType(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <h2 className={styles.campaignName}>{campaign.name}</h2>

        <div className={styles.toolbar}>
          <Link
            href={`/campaign/${campaign.id}/submitted-form/apply`}
            className="navigationButton"
          >
            Apply
          </Link>
          <button type="button" className="navigationButton" onClick={handleDownloadPdf}>
            Download PDF
          </button>
          <button
            type="button"
            className="navigationButton"
            onClick={() => handleSendMessage("sms")}
          >
            Send SMS
          </button>
          <button
            type="button"
            className="navigationButton"
            onClick={() => handleSendMessage("email")}
          >
            Send Email
          </button>
          <button
            type="button"
            className="navigationButton"
            onClick={() => {
              const row = requireExactlyOne();
              if (row) setUpdateProgramClassRow(row);
            }}
          >
            Update Program &amp; Class
          </button>
          <button
            type="button"
            className="navigationButton"
            onClick={() => downloadCsv(visibleRows, columns, fieldLabels)}
          >
            Export Excel
          </button>

          <div className={styles.spacer} />

          <button
            type="button"
            className={`navigationButton ${styles.advanceSearchButton}`}
            onClick={() => setShowAdvanceSearch((v) => !v)}
          >
            🔍 Advance Search
          </button>
        </div>

        {availableTransitions.length > 0 && (
          <div className={styles.transitionBar}>
            <span>{selectedIds.size} selected —</span>
            {availableTransitions.map((transition) => (
              <button
                key={transition.transitionIndex}
                type="button"
                className={`navigationButton ${
                  transition.isAdmitAction ? styles.admitButton : styles.transitionButton
                }`}
                onClick={() => handleTransitionClick(transition)}
              >
                {transition.displayName}
              </button>
            ))}
          </div>
        )}

        {showAdvanceSearch && (
          <AdvanceSearchPanel
            fields={allFields}
            onSearch={setFilterTree}
            onClear={() => setFilterTree(null)}
          />
        )}

        <ApplicationsTable
          rows={visibleRows}
          columns={columns}
          fieldLabels={fieldLabels}
          selectedIds={selectedIds}
          onToggleSelected={toggleSelected}
          onToggleAll={toggleAll}
          onView={(row) => setDetailModal({ row, tab: "details" })}
          onHistory={(row) => setDetailModal({ row, tab: "history" })}
        />
      </section>

      {updateProgramClassRow && (
        <UpdateProgramClassModal
          campaign={campaign}
          row={updateProgramClassRow}
          onClose={() => setUpdateProgramClassRow(null)}
          onUpdated={refresh}
        />
      )}

      {pendingTransition && (
        <TransitionRemarkModal
          transition={pendingTransition}
          selectionCount={selectedIds.size}
          onClose={() => setPendingTransition(null)}
          onConfirm={(remark) => runTransition(pendingTransition, remark)}
        />
      )}

      {detailModal && (
        <RowDetailModal
          row={detailModal.row}
          initialTab={detailModal.tab}
          onClose={() => setDetailModal(null)}
          onDelete={handleDelete}
        />
      )}

      {messageModal && (
        <MessageModal
          channel={messageModal}
          submissionIds={[...selectedIds]}
          onClose={() => setMessageModal(null)}
          onSent={refresh}
        />
      )}
    </main>
  );
}
