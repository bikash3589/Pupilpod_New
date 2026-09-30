"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import WorkflowForm, {
  type WorkflowFormValues,
} from "../../components/WorkflowForm";
import { getWorkflowById, updateWorkflow } from "@/lib/workflowStorage";
import type { Workflow } from "@/types/workflow";
import styles from "./WorkflowEdit.module.css";

export default function EditWorkflow() {
  const { id, workflowId } = useParams<{ id: string; workflowId: string }>();

  // undefined = still loading, null = no matching workflow for this campaign
  const [workflow, setWorkflow] = useState<Workflow | null | undefined>(
    undefined
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const found = getWorkflowById(workflowId);
    setWorkflow(found && found.campaignId === id ? found : null);
  }, [id, workflowId]);

  const handleSubmit = (values: WorkflowFormValues) => {
    const updated = updateWorkflow(workflowId, values);
    if (updated) {
      setWorkflow(updated);
      setSaved(true);
    }
  };

  return (
    <main className="page">
      <div className={styles.pageHeader}>
        <h1 className="page-title">Edit Work Flow</h1>
        <nav className={styles.breadcrumbNav}>
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/">Admission</Link>
          <span>/</span>
          <Link href={`/campaign/${id}`}>Campaign</Link>
          <span>/</span>
          <Link href={`/campaign/${id}/workflow`}>Manage Work Flow</Link>
          <span>/</span>
          <span className={styles.breadcrumbCurrent}>Edit Work Flow</span>
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
        <>
          {saved && (
            <p>
              Changes saved.{" "}
              <Link href={`/campaign/${id}/workflow`}>Back to Work Flow List</Link>
            </p>
          )}

          <WorkflowForm
            campaignId={id}
            initialValues={workflow}
            submitLabel="Save Changes"
            onSubmit={handleSubmit}
            headerTitle="Edit WorkFlow"
            headerAction={
              <Link
                href={`/campaign/${id}/workflow/${workflowId}/transition`}
                className={styles.transitionButton}
              >
                Edit Work Flow Transition
              </Link>
            }
          />
        </>
      )}
    </main>
  );
}
