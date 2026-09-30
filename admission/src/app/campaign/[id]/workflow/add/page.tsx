"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import WorkflowForm, {
  type WorkflowFormValues,
} from "../components/WorkflowForm";
import { saveWorkflow } from "@/lib/workflowStorage";
import type { Workflow } from "@/types/workflow";

export default function AddWorkflow() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const handleSubmit = (values: WorkflowFormValues) => {
    const workflow: Workflow = {
      id: crypto.randomUUID(),
      campaignId: id,
      createdAt: new Date().toISOString(),
      ...values,
    };

    saveWorkflow(workflow);
    router.push(`/campaign/${id}/workflow`);
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
          <Link href={`/campaign/${id}/workflow`} className="navigationButton">
            Work Flow List
          </Link>
        </nav>
      </header>

      <h1 className="page-title">Add Work Flow</h1>

      <WorkflowForm
        campaignId={id}
        onSubmit={handleSubmit}
        submitLabel="Save Work Flow"
      />
    </main>
  );
}
