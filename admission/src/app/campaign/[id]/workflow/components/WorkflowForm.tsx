"use client";

import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";

import CampaignField, {
  type CampaignFieldHandle,
} from "@/components/CampaignField";
import campaignFieldStyles from "@/components/CampaignField.module.css";
import MultiSelectTags from "@/components/MultiSelectTags";
import { getCampaignById } from "@/lib/campaignStorage";
import type { Workflow, WorkflowState } from "@/types/workflow";
import styles from "./WorkflowForm.module.css";

export type WorkflowFormValues = Omit<Workflow, "id" | "createdAt" | "campaignId">;

type WorkflowFormProps = {
  campaignId?: string;
  initialValues?: Workflow;
  onSubmit: (values: WorkflowFormValues) => void;
  submitLabel?: string;
  headerTitle?: string;
  headerAction?: ReactNode;
};

const NOTIFICATION_OPTIONS = ["Email", "SMS", "Email & SMS"];

const TEMPLATE_OPTIONS = [
  "Application Received",
  "Interview Scheduled",
  "Offer Letter",
  "Admission Confirmed",
  "Application Rejected",
];

const emptyState = (): WorkflowState => ({
  orderNo: "",
  stateName: "",
  stateCode: "",
  displayName: "",
  notification: "",
  notificationTemplates: [],
});

// Backfills defaults for states saved before displayName/notificationTemplates existed.
const normalizeState = (state: WorkflowState): WorkflowState => ({
  ...emptyState(),
  ...state,
});

type FirstRowErrors = {
  orderNo?: string;
  stateName?: string;
  stateCode?: string;
};

export default function WorkflowForm({
  campaignId,
  initialValues,
  onSubmit,
  submitLabel = "Submit",
  headerTitle,
  headerAction,
}: WorkflowFormProps) {
  const nameRef = useRef<CampaignFieldHandle | null>(null);
  const codeRef = useRef<CampaignFieldHandle | null>(null);

  const [states, setStates] = useState<WorkflowState[]>(
    initialValues?.states?.length
      ? initialValues.states.map(normalizeState)
      : [emptyState()]
  );
  const [firstRowErrors, setFirstRowErrors] = useState<FirstRowErrors>({});
  const [campaignName, setCampaignName] = useState("");

  useEffect(() => {
    if (!campaignId) return;
    const campaign = getCampaignById(campaignId);
    setCampaignName(campaign?.name ?? "");
  }, [campaignId]);

  const addState = () => {
    setStates((prev) => [...prev, emptyState()]);
  };

  const removeState = (index: number) => {
    setStates((prev) => prev.filter((_, i) => i !== index));
  };

  const updateState = <K extends keyof WorkflowState>(
    index: number,
    field: K,
    value: WorkflowState[K]
  ) => {
    setStates((prev) =>
      prev.map((state, i) => (i === index ? { ...state, [field]: value } : state))
    );

    if (
      index === 0 &&
      (field === "orderNo" || field === "stateName" || field === "stateCode") &&
      typeof value === "string" &&
      value.trim()
    ) {
      setFirstRowErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateFirstRow = () => {
    const first = states[0];
    const errors: FirstRowErrors = {};
    if (!first.orderNo.trim()) errors.orderNo = "Can't be empty!";
    if (!first.stateName.trim()) errors.stateName = "Can't be empty!";
    if (!first.stateCode.trim()) errors.stateCode = "Can't be empty!";
    setFirstRowErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nameValid = nameRef.current?.validate() ?? true;
    const codeValid = codeRef.current?.validate() ?? true;
    const statesValid = validateFirstRow();
    if (!nameValid || !codeValid || !statesValid) return;

    const formData = new FormData(event.currentTarget);
    const getStr = (key: string) =>
      (formData.get(key)?.toString() ?? "").trim();

    const cleanedStates = states.filter(
      (state) => state.orderNo.trim() || state.stateName.trim() || state.stateCode.trim()
    );

    onSubmit({
      name: getStr("name"),
      code: getStr("code"),
      description: getStr("description"),
      academicYear: getStr("academicYear"),
      states: cleanedStates,
      transitions: initialValues?.transitions ?? [],
    });
  };

  const currentYear = new Date().getFullYear();
  const academicYears = Array.from(
    new Set([
      initialValues?.academicYear,
      `${currentYear}-${currentYear + 1}`,
      `${currentYear + 1}-${currentYear + 2}`,
    ])
  ).filter((year): year is string => Boolean(year));

  return (
    <form className={styles.formContainer} onSubmit={handleSubmit}>
      {(headerTitle || headerAction) && (
        <div className={styles.formHeader}>
          {headerTitle && (
            <h2 className={styles.formHeaderTitle}>{headerTitle}</h2>
          )}
          {headerAction}
        </div>
      )}

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <CampaignField
            label="Academic Year"
            name="academicYear"
            type="select"
            defaultValue={initialValues?.academicYear ?? academicYears[0]}
            options={academicYears.map((year) => ({
              value: year,
              label: year,
            }))}
          />
        </div>

        {campaignId && (
          <div className={styles.formGroup}>
            <div className={campaignFieldStyles.field}>
              <label>Campaign Name</label>
              <input type="text" value={campaignName} disabled readOnly />
            </div>
          </div>
        )}

        <div className={styles.formGroup}>
          <CampaignField
            ref={nameRef}
            label="Work Flow Name"
            name="name"
            required
            defaultValue={initialValues?.name}
            errorMessage="Can't be empty!"
          />
        </div>

        <div className={styles.formGroup}>
          <CampaignField
            ref={codeRef}
            label="Work Flow Code"
            name="code"
            required
            defaultValue={initialValues?.code}
            errorMessage="Can't be empty!"
          />
        </div>
      </div>

      <div className={styles.descriptionGroup}>
        <label>Description</label>
        <textarea name="description" defaultValue={initialValues?.description} />
      </div>

      <div className={styles.statesGroup}>
        <button
          type="button"
          className={styles.addStateButton}
          onClick={addState}
        >
          Add More State
        </button>

        <div className={styles.statesTable}>
          <div className={styles.statesHeaderRow}>
            <span>
              Order No <span className={styles.required}>*</span>
            </span>
            <span>
              State Name <span className={styles.required}>*</span>
            </span>
            <span>
              State Code <span className={styles.required}>*</span>
            </span>
            <span>Display Name</span>
            <span>Notification</span>
            <span>Notification Template(s)</span>
            <span />
          </div>

          {states.map((state, index) => (
            <div className={styles.statesRow} key={index}>
              <div className={styles.statesCell}>
                <input
                  type="text"
                  placeholder={index === 0 ? "" : "Order"}
                  value={state.orderNo}
                  onChange={(e) => updateState(index, "orderNo", e.target.value)}
                  onBlur={() => index === 0 && validateFirstRow()}
                />
                {index === 0 && firstRowErrors.orderNo && (
                  <p className={styles.fieldError}>{firstRowErrors.orderNo}</p>
                )}
              </div>

              <div className={styles.statesCell}>
                <input
                  type="text"
                  placeholder={index === 0 ? "" : "State Name"}
                  value={state.stateName}
                  onChange={(e) => updateState(index, "stateName", e.target.value)}
                  onBlur={() => index === 0 && validateFirstRow()}
                />
                {index === 0 && firstRowErrors.stateName && (
                  <p className={styles.fieldError}>{firstRowErrors.stateName}</p>
                )}
              </div>

              <div className={styles.statesCell}>
                <input
                  type="text"
                  placeholder={index === 0 ? "" : "Code"}
                  value={state.stateCode}
                  onChange={(e) => updateState(index, "stateCode", e.target.value)}
                  onBlur={() => index === 0 && validateFirstRow()}
                />
                {index === 0 && firstRowErrors.stateCode && (
                  <p className={styles.fieldError}>{firstRowErrors.stateCode}</p>
                )}
              </div>

              <div className={styles.statesCell}>
                <input
                  type="text"
                  placeholder="Display Name"
                  value={state.displayName}
                  onChange={(e) => updateState(index, "displayName", e.target.value)}
                />
              </div>

              <div className={styles.statesCell}>
                <select
                  value={state.notification}
                  onChange={(e) =>
                    updateState(index, "notification", e.target.value)
                  }
                >
                  <option value="">Select Notification</option>
                  {NOTIFICATION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.statesCell}>
                <MultiSelectTags
                  options={TEMPLATE_OPTIONS}
                  selected={state.notificationTemplates}
                  onChange={(next) =>
                    updateState(index, "notificationTemplates", next)
                  }
                  placeholder="Select Template"
                />
              </div>

              <div className={styles.statesRemoveCell}>
                {index > 0 && (
                  <button
                    type="button"
                    className={styles.removeStateButton}
                    onClick={() => removeState(index)}
                    title="Remove state"
                    aria-label="Remove state"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.formFooter}>
        <span>* denotes a required field</span>
        <button type="submit">{submitLabel}</button>
      </div>
    </form>
  );
}
