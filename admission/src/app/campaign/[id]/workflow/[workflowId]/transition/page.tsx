"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import MultiSelectTags from "@/components/MultiSelectTags";
import { getWorkflowById, updateWorkflow } from "@/lib/workflowStorage";
import type { Workflow, WorkflowTransition } from "@/types/workflow";
import styles from "./Transition.module.css";

const STAFF_OPTIONS = [
  "Anand Pupilpod",
  "Admin Staff",
  "Front Office",
  "Accounts Team",
  "Registrar",
];

const TRANSITION_ACTION_OPTIONS = [
  "Approve",
  "Reject",
  "Forward",
  "Return",
  "Submit",
];

const SCREEN_TAB_OPTIONS = [
  "Application Form",
  "Document Verification",
  "Payment",
  "Interview",
  "Offer Letter",
];

const FEE_ADMISSION_SETTING_OPTIONS = [
  "Nursery Admission Fee",
  "Primary Admission Fee",
  "Secondary Admission Fee",
];

const emptyTransition = (): WorkflowTransition => ({
  fromState: "",
  toState: "",
  displayName: "",
  enableRemark: false,
  transitionAction: "",
  screenOrTab: "",
  userPermissions: [],
  autoGenerateInvoice: "No",
  redirectState: "",
  feeAdmissionSettings: [],
});

// Backfills defaults for transitions saved before redirectState/feeAdmissionSettings existed.
const normalizeTransition = (transition: WorkflowTransition): WorkflowTransition => ({
  ...emptyTransition(),
  ...transition,
});

export default function EditWorkflowTransition() {
  const { id, workflowId } = useParams<{ id: string; workflowId: string }>();

  // undefined = still loading, null = no matching workflow for this campaign
  const [workflow, setWorkflow] = useState<Workflow | null | undefined>(
    undefined
  );
  const [transitions, setTransitions] = useState<WorkflowTransition[]>([]);
  const [saved, setSaved] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  useEffect(() => {
    const found = getWorkflowById(workflowId);
    const matched = found && found.campaignId === id ? found : null;
    setWorkflow(matched);
    setTransitions(
      matched?.transitions?.length
        ? matched.transitions.map(normalizeTransition)
        : [emptyTransition()]
    );
  }, [id, workflowId]);

  const stateOptions = (workflow?.states ?? [])
    .map((state) => state.stateName)
    .filter(Boolean);

  const addTransition = () => {
    setTransitions((prev) => [...prev, emptyTransition()]);
  };

  const removeTransition = (index: number) => {
    setTransitions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTransition = <K extends keyof WorkflowTransition>(
    index: number,
    field: K,
    value: WorkflowTransition[K]
  ) => {
    setTransitions((prev) =>
      prev.map((transition, i) =>
        i === index ? { ...transition, [field]: value } : transition
      )
    );
  };

  const handleSubmit = () => {
    if (!workflow) return;

    const cleanedTransitions = transitions.filter(
      (transition) =>
        transition.fromState.trim() ||
        transition.toState.trim() ||
        transition.displayName?.trim()
    );

    // Replicates add_wf_transitionProcess.php: a (from,to) pair that already
    // exists in either direction is blocked, but surfaced via a warning
    // instead of silently dropped like the legacy app does.
    const accepted: WorkflowTransition[] = [];
    let skippedCount = 0;

    for (const transition of cleanedTransitions) {
      const isDuplicate = accepted.some(
        (existing) =>
          (existing.fromState === transition.fromState &&
            existing.toState === transition.toState) ||
          (existing.fromState === transition.toState &&
            existing.toState === transition.fromState)
      );

      if (isDuplicate && transition.fromState && transition.toState) {
        skippedCount += 1;
      } else {
        accepted.push(transition);
      }
    }

    const updated = updateWorkflow(workflowId, {
      name: workflow.name,
      code: workflow.code,
      description: workflow.description,
      academicYear: workflow.academicYear,
      states: workflow.states,
      transitions: accepted,
    });

    if (updated) {
      setWorkflow(updated);
      setTransitions(
        updated.transitions.length ? updated.transitions : [emptyTransition()]
      );
      setSaved(true);
      setDuplicateWarning(
        skippedCount > 0
          ? `${skippedCount} transition${skippedCount > 1 ? "s were" : " was"} skipped — a transition already exists for that From State / To State pair (in either direction).`
          : null
      );
    }
  };

  return (
    <main className="page">
      <div className={styles.pageHeader}>
        <h1 className="page-title">Edit Work Flow Transition</h1>
        <nav className={styles.breadcrumbNav}>
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href={`/campaign/${id}/workflow`}>Manage Work Flow</Link>
          <span>/</span>
          <span className={styles.breadcrumbCurrent}>
            Edit Work Flow Transition
          </span>
        </nav>
      </div>

      {workflow === undefined && (
        <section className="application-container">
          <p>Loading work flow...</p>
        </section>
      )}

      {workflow === null && (
        <section className="application-container">
          <p>No work flow found for this id.</p>
          <Link href={`/campaign/${id}/workflow`}>Back to Work Flow List</Link>
        </section>
      )}

      {workflow && (
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2 className={styles.formHeaderTitle}>Edit WorkFlow Transitions</h2>
          </div>

          {saved && <p className={styles.savedMessage}>Changes saved.</p>}
          {duplicateWarning && (
            <p className={styles.duplicateWarning}>{duplicateWarning}</p>
          )}

          <button
            type="button"
            className={styles.addTransitionButton}
            onClick={addTransition}
          >
            Add More Transition
          </button>

          <div className={styles.tableWrapper}>
            <div className={styles.transitionsTable}>
              <div className={styles.transitionsHeaderRow}>
                <span>From State</span>
                <span>To State</span>
                <span>Display Name</span>
                <span>Enable Remark</span>
                <span>Transition Action</span>
                <span>Screen Or Tab</span>
                <span>User Permission</span>
                <span>Auto Generate Invoice</span>
                <span>Redirect State</span>
                <span>Fee Admission Setting(s)</span>
                <span />
              </div>

              {transitions.map((transition, index) => (
                <div className={styles.transitionsRow} key={index}>
                  <div className={styles.transitionsCell}>
                    <select
                      value={transition.fromState}
                      onChange={(e) =>
                        updateTransition(index, "fromState", e.target.value)
                      }
                    >
                      <option value="">Select State</option>
                      {stateOptions.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.transitionsCell}>
                    <select
                      value={transition.toState}
                      onChange={(e) =>
                        updateTransition(index, "toState", e.target.value)
                      }
                    >
                      <option value="">Select State</option>
                      {stateOptions.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.transitionsCell}>
                    <input
                      type="text"
                      placeholder="Display Name"
                      value={transition.displayName}
                      onChange={(e) =>
                        updateTransition(index, "displayName", e.target.value)
                      }
                    />
                  </div>

                  <div className={styles.transitionsCheckboxCell}>
                    <input
                      type="checkbox"
                      checked={transition.enableRemark}
                      onChange={(e) =>
                        updateTransition(
                          index,
                          "enableRemark",
                          e.target.checked
                        )
                      }
                    />
                  </div>

                  <div className={styles.transitionsCell}>
                    <select
                      value={transition.transitionAction}
                      onChange={(e) =>
                        updateTransition(
                          index,
                          "transitionAction",
                          e.target.value
                        )
                      }
                    >
                      <option value="">Select Transition</option>
                      {TRANSITION_ACTION_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.transitionsCell}>
                    <select
                      value={transition.screenOrTab}
                      onChange={(e) =>
                        updateTransition(index, "screenOrTab", e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      {SCREEN_TAB_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.transitionsCell}>
                    <MultiSelectTags
                      options={STAFF_OPTIONS}
                      selected={transition.userPermissions}
                      onChange={(next) =>
                        updateTransition(index, "userPermissions", next)
                      }
                      placeholder="Select Permission"
                    />
                  </div>

                  <div className={styles.transitionsCell}>
                    <select
                      value={transition.autoGenerateInvoice}
                      onChange={(e) =>
                        updateTransition(
                          index,
                          "autoGenerateInvoice",
                          e.target.value as "Yes" | "No"
                        )
                      }
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>

                  <div className={styles.transitionsCell}>
                    <select
                      value={transition.redirectState}
                      onChange={(e) =>
                        updateTransition(index, "redirectState", e.target.value)
                      }
                    >
                      <option value="">None</option>
                      {stateOptions.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.transitionsCell}>
                    <MultiSelectTags
                      options={FEE_ADMISSION_SETTING_OPTIONS}
                      selected={transition.feeAdmissionSettings}
                      onChange={(next) =>
                        updateTransition(index, "feeAdmissionSettings", next)
                      }
                      placeholder="Select Setting"
                    />
                  </div>

                  <div className={styles.transitionsRemoveCell}>
                    <button
                      type="button"
                      className={styles.removeTransitionButton}
                      onClick={() => removeTransition(index)}
                      title="Remove transition"
                      aria-label="Remove transition"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.formFooter}>
            <span>* denotes a required field</span>
            <button type="button" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
