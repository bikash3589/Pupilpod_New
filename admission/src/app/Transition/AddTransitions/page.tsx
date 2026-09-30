"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getCampaigns } from "@/lib/campaignStorage";
import { getFluentFormFields } from "@/lib/transitionFormFields";
import { getColumnsForTable, getTableNames } from "@/lib/transitionTables";
import {
  createFieldMappings,
  getFieldMappingById,
  updateFieldMapping,
} from "@/lib/transitionFieldMapStorage";
import type { Campaign } from "@/types/campaign";
import styles from "./AddTransitions.module.css";

interface MappingRow {
  campaignId: string;
  tableName: string;
  columnName: string;
  fluentFormColumnName: string;
}

type RowErrors = Partial<Record<keyof MappingRow, string>>;

const emptyRow = (): MappingRow => ({
  campaignId: "",
  tableName: "",
  columnName: "",
  fluentFormColumnName: "",
});

export default function AddTransitions() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [rows, setRows] = useState<MappingRow[]>([emptyRow()]);
  const [rowErrors, setRowErrors] = useState<Record<number, RowErrors>>({});

  useEffect(() => {
    setCampaigns(getCampaigns());
  }, []);

  useEffect(() => {
    if (!editId) return;
    const existing = getFieldMappingById(editId);
    if (!existing) return;
    setRows([
      {
        campaignId: existing.campaignId,
        tableName: existing.tableName,
        columnName: existing.columnName,
        fluentFormColumnName: existing.fluentFormColumnName,
      },
    ]);
  }, [editId]);

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const removeRow = (index: number) =>
    setRows((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

  const updateRow = <K extends keyof MappingRow>(
    index: number,
    field: K,
    value: MappingRow[K]
  ) => {
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        const next = { ...row, [field]: value };
        // Switching table/campaign invalidates the dependent select's choice.
        if (field === "tableName") next.columnName = "";
        if (field === "campaignId") next.fluentFormColumnName = "";
        return next;
      })
    );
  };

  const validate = (): boolean => {
    const nextErrors: Record<number, RowErrors> = {};

    rows.forEach((row, index) => {
      const errors: RowErrors = {};
      if (!row.campaignId) errors.campaignId = "Application is required";
      if (!row.tableName) errors.tableName = "Table is required";
      if (!row.columnName) errors.columnName = "Column is required";
      if (!row.fluentFormColumnName)
        errors.fluentFormColumnName = "Form field is required";
      if (Object.keys(errors).length) nextErrors[index] = errors;
    });

    setRowErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    if (editId) {
      updateFieldMapping(editId, rows[0]);
    } else {
      createFieldMappings(rows);
    }

    router.push("/Transition");
  };

  const campaignOptions = campaigns.map((c) => ({ value: c.id, label: c.name }));
  const tableOptions = getTableNames();

  return (
    <main className="page">
      <div className={styles.pageHeader}>
        <h1 className="page-title">
          {editId ? "Edit Transition" : "Add Transitions"}
        </h1>
        <nav className={styles.breadcrumbNav}>
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/">Admission</Link>
          <span>/</span>
          <Link href="/Transition">Transition</Link>
          <span>/</span>
          <span className={styles.breadcrumbCurrent}>
            {editId ? "Edit Transition" : "Add Transitions"}
          </span>
        </nav>
      </div>

      <div className={styles.formContainer}>
        <div className={styles.formHeader}>
          <h2 className={styles.formHeaderTitle}>
            {editId ? "Edit Field Mapping" : "Add Field Mapping"}
          </h2>
        </div>

        {!editId && (
          <button type="button" className={styles.addRowButton} onClick={addRow}>
            Add More Transition
          </button>
        )}

        <div className={styles.tableWrapper}>
          <div className={styles.mappingTable}>
            <div className={styles.mappingHeaderRow}>
              <span>Application *</span>
              <span>Table Name *</span>
              <span>Column *</span>
              <span>Fluent Form Field *</span>
              <span />
            </div>

            {rows.map((row, index) => {
              const columnOptions = getColumnsForTable(row.tableName);
              const formFieldOptions = getFluentFormFields(row.campaignId);
              const errors = rowErrors[index] ?? {};

              return (
                <div className={styles.mappingRow} key={index}>
                  <div className={styles.mappingCell}>
                    <select
                      value={row.campaignId}
                      onChange={(e) =>
                        updateRow(index, "campaignId", e.target.value)
                      }
                    >
                      <option value="">Select Application</option>
                      {campaignOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.campaignId && (
                      <p className={styles.fieldError}>{errors.campaignId}</p>
                    )}
                  </div>

                  <div className={styles.mappingCell}>
                    <select
                      value={row.tableName}
                      onChange={(e) =>
                        updateRow(index, "tableName", e.target.value)
                      }
                    >
                      <option value="">Select Table</option>
                      {tableOptions.map((table) => (
                        <option key={table} value={table}>
                          {table}
                        </option>
                      ))}
                    </select>
                    {errors.tableName && (
                      <p className={styles.fieldError}>{errors.tableName}</p>
                    )}
                  </div>

                  <div className={styles.mappingCell}>
                    <select
                      value={row.columnName}
                      onChange={(e) =>
                        updateRow(index, "columnName", e.target.value)
                      }
                      disabled={!row.tableName}
                    >
                      <option value="">Select Column</option>
                      {columnOptions.map((col) => (
                        <option key={col.column} value={col.column}>
                          {col.column}
                          {col.required ? " *" : ""}
                        </option>
                      ))}
                    </select>
                    {errors.columnName && (
                      <p className={styles.fieldError}>{errors.columnName}</p>
                    )}
                  </div>

                  <div className={styles.mappingCell}>
                    <select
                      value={row.fluentFormColumnName}
                      onChange={(e) =>
                        updateRow(index, "fluentFormColumnName", e.target.value)
                      }
                      disabled={!row.campaignId}
                    >
                      <option value="">Select Form Field</option>
                      {formFieldOptions.map((field) => (
                        <option key={field.name} value={field.name}>
                          {field.label}
                        </option>
                      ))}
                    </select>
                    {errors.fluentFormColumnName && (
                      <p className={styles.fieldError}>
                        {errors.fluentFormColumnName}
                      </p>
                    )}
                  </div>

                  <div className={styles.removeRowCell}>
                    {!editId && (
                      <button
                        type="button"
                        className={styles.removeRowButton}
                        onClick={() => removeRow(index)}
                        disabled={rows.length === 1}
                        title="Remove row"
                        aria-label="Remove row"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.formFooter}>
          <span>* denotes a required field</span>
          <button type="button" onClick={handleSubmit}>
            {editId ? "Save Changes" : "Submit"}
          </button>
        </div>
      </div>
    </main>
  );
}
