"use client";

import { useEffect, useState } from "react";

import campaignFieldStyles from "@/components/CampaignField.module.css";
import {
  deleteImageFieldCoordinates,
  getImageFieldCoordinates,
  saveImageFieldCoordinates,
} from "@/lib/campaignTemplateStorage";
import type { PhotoFieldName, TemplateType } from "@/types/uploadTemplate";
import styles from "./ImageFieldConfigModal.module.css";

type CoordField = "x" | "y" | "pageNo" | "width" | "height";

type CoordFormState = Record<CoordField, string>;

const emptyCoords: CoordFormState = {
  x: "",
  y: "",
  pageNo: "",
  width: "",
  height: "",
};

const COORD_LABELS: Record<CoordField, string> = {
  x: "X",
  y: "Y",
  pageNo: "Page No",
  width: "Width",
  height: "Height",
};

type ImageFieldConfigModalProps = {
  campaignId: string;
  fieldName: PhotoFieldName;
  initialTemplateType: TemplateType | "";
  onClose: () => void;
  onSaved: () => void;
};

export default function ImageFieldConfigModal({
  campaignId,
  fieldName,
  initialTemplateType,
  onClose,
  onSaved,
}: ImageFieldConfigModalProps) {
  const [templateType, setTemplateType] = useState<TemplateType | "">(
    initialTemplateType
  );
  const [coords, setCoords] = useState<CoordFormState>(emptyCoords);
  const [errors, setErrors] = useState<Partial<Record<CoordField, string>>>({});
  const [hasExisting, setHasExisting] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (!templateType) {
      setCoords(emptyCoords);
      setHasExisting(false);
      return;
    }
    const existing = getImageFieldCoordinates(campaignId, fieldName, templateType);
    if (existing) {
      setCoords({
        x: existing.x?.toString() ?? "",
        y: existing.y?.toString() ?? "",
        pageNo: existing.pageNo?.toString() ?? "",
        width: existing.width?.toString() ?? "",
        height: existing.height?.toString() ?? "",
      });
      setHasExisting(true);
    } else {
      setCoords(emptyCoords);
      setHasExisting(false);
    }
  }, [templateType, campaignId, fieldName]);

  const parseIntOrNull = (value: string): number | null | typeof NaN => {
    if (!value.trim()) return null;
    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : NaN;
  };

  const validate = (): boolean => {
    const nextErrors: Partial<Record<CoordField, string>> = {};
    (Object.keys(coords) as CoordField[]).forEach((field) => {
      if (Number.isNaN(parseIntOrNull(coords[field]))) {
        nextErrors[field] = "Must be a whole number";
      }
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = () => {
    if (!templateType || !validate()) return;

    saveImageFieldCoordinates({
      campaignId,
      fieldName,
      templateType,
      x: parseIntOrNull(coords.x) as number | null,
      y: parseIntOrNull(coords.y) as number | null,
      pageNo: parseIntOrNull(coords.pageNo) as number | null,
      width: parseIntOrNull(coords.width) as number | null,
      height: parseIntOrNull(coords.height) as number | null,
    });
    onSaved();
    setJustSaved(true);
    window.setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleDelete = () => {
    if (!templateType) return;
    deleteImageFieldCoordinates(campaignId, fieldName, templateType);
    onSaved();
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Set Parameter — {fieldName}</h2>

        <div className={campaignFieldStyles.field}>
          <label htmlFor="imageFieldTemplateType">
            Template Type <span className={campaignFieldStyles.required}>*</span>
          </label>
          <select
            id="imageFieldTemplateType"
            value={templateType}
            disabled={justSaved}
            onChange={(e) => setTemplateType(e.target.value as TemplateType)}
          >
            <option value="">Please Select Template Type</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
          </select>
        </div>

        <div className={styles.coordGrid}>
          {(Object.keys(COORD_LABELS) as CoordField[]).map((field) => (
            <div className={campaignFieldStyles.field} key={field}>
              <label htmlFor={`coord-${field}`}>{COORD_LABELS[field]}</label>
              <input
                id={`coord-${field}`}
                type="number"
                value={coords[field]}
                disabled={!templateType || justSaved}
                onChange={(e) =>
                  setCoords((prev) => ({ ...prev, [field]: e.target.value }))
                }
              />
              {errors[field] && (
                <p className={campaignFieldStyles.error}>{errors[field]}</p>
              )}
            </div>
          ))}
        </div>

        {justSaved && (
          <p className={styles.savedMessage}>Saved successfully.</p>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            onClick={handleSave}
            disabled={!templateType || justSaved}
            className={styles.saveButton}
          >
            Save
          </button>
          {hasExisting && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={justSaved}
              className={styles.deleteButton}
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            disabled={justSaved}
            className={styles.closeButton}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
