"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { getWorkflowsByCampaign } from "@/lib/workflowStorage";
import type { Workflow } from "@/types/workflow";
import WorkflowTable from "./components/WorkflowTable";
import styles from "./Workflow.module.css";

export default function WorkflowList() {
  const { id } = useParams<{ id: string }>();

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Draft filter inputs (what the admin is typing/selecting right now)
  const [searchText, setSearchText] = useState("");
  const [academicYear, setAcademicYear] = useState("");

  // Applied filters (only updated when "Go" is clicked)
  const [appliedSearchText, setAppliedSearchText] = useState("");
  const [appliedAcademicYear, setAppliedAcademicYear] = useState("");

  useEffect(() => {
    setWorkflows(getWorkflowsByCampaign(id));
    setLoaded(true);
  }, [id]);

  const academicYearOptions = useMemo(
    () => Array.from(new Set(workflows.map((w) => w.academicYear))).filter(Boolean),
    [workflows]
  );

  const filteredWorkflows = useMemo(() => {
    const term = appliedSearchText.trim().toLowerCase();
    return workflows.filter((w) => {
      const matchesTerm =
        !term ||
        w.name.toLowerCase().includes(term) ||
        w.code.toLowerCase().includes(term) ||
        w.description.toLowerCase().includes(term);
      const matchesYear =
        !appliedAcademicYear || w.academicYear === appliedAcademicYear;
      return matchesTerm && matchesYear;
    });
  }, [workflows, appliedSearchText, appliedAcademicYear]);

  const handleGo = () => {
    setAppliedSearchText(searchText);
    setAppliedAcademicYear(academicYear);
  };

  const handleClear = () => {
    setSearchText("");
    setAcademicYear("");
    setAppliedSearchText("");
    setAppliedAcademicYear("");
  };

  return (
    <main className="page">
      <section className="application-container">
        <div className={styles.breadcrumbBar}>
          <span className={styles.breadcrumbTitle}>Work Flow List</span>
          <nav className={styles.breadcrumbNav}>
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/">Admission</Link>
            <span>/</span>
            <Link href="/">Campaign</Link>
            <span>/</span>
            <span className={styles.breadcrumbCurrent}>Work Flow List</span>
          </nav>
        </div>

        <div className={styles.card}>
          <div className={styles.filterRow}>
            <span className={styles.filterLabel}>Search For</span>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Name, code or description"
            />
          </div>

          <div className={styles.filterRow}>
            <label className={styles.filterLabel} htmlFor="academicYearFilter">
              Academic Year
            </label>
            <select
              id="academicYearFilter"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
            >
              <option value="">All Years</option>
              {academicYearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.headingRow}>
            <h2 className={styles.listTitle}>Work Flow List</h2>

            <div className={styles.headingActions}>
              <div className={styles.searchButtons}>
                <button
                  type="button"
                  className={styles.clearButton}
                  onClick={handleClear}
                >
                  Clear Search
                </button>
                <button type="button" className={styles.goButton} onClick={handleGo}>
                  Go
                </button>
              </div>

              {loaded && workflows.length === 0 && (
                <Link
                  href={`/campaign/${id}/workflow/add`}
                  className={styles.addWorkflowButton}
                >
                  Add Work Flow
                </Link>
              )}
            </div>
          </div>

          {loaded && (
            <WorkflowTable campaignId={id} workflows={filteredWorkflows} />
          )}
        </div>
      </section>
    </main>
  );
}
