// One row per staff-entered or applicant-submitted application against a
// campaign's form-builder canvas — the local analog of
// wp_fluentform_submissions. This app has no separate online/offline form,
// so (unlike the legacy source) there is only ever one form per campaign.
export interface SubmissionRecord {
  id: string;
  campaignId: string;
  // A small per-campaign sequential ordinal — the local analog of
  // wp_fluentform_submissions.id shown as "SubmissionId" in the grid.
  sequenceNo: number;
  applicationId: string;
  // Every dynamic field captured from the campaign's form-builder canvas,
  // keyed by field name — the local analog of the submission's `response`
  // JSON blob.
  fields: Record<string, string>;
  program: string | null;
  yearGroup: string | null;
  isConverted: 0 | 1;
  // schema note: the legacy `is_active` column this mirrors uses an
  // inverted convention — '2' means visible/active, '1' means
  // soft-deleted — the opposite of the "1 = active" convention used
  // elsewhere in this app. Preserved deliberately, not "fixed".
  isActive: "1" | "2";
  createdAt: string;
}

// The local analog of campaign_form_status — one row per workflow
// transition actually applied to a submission.
export interface SubmissionStatusHistoryEntry {
  id: string;
  submissionId: string;
  campaignId: string;
  toState: string;
  displayName: string;
  remark: string;
  createdAt: string;
}

// The flattened, computed row the grid actually renders.
export interface ApplicationRow {
  submissionId: string;
  campaignId: string;
  sequenceNo: number;
  applicationId: string;
  wfStatus: string;
  fields: Record<string, string>;
  program: string | null;
  yearGroup: string | null;
  isConverted: 0 | 1;
  createdAt: string;
}

// Quick = the first field only; Requested = fields the admin flagged
// "Show in Grid" on the form builder canvas; Full = every field.
export type GridType = "quick" | "requested" | "full";

// This app has no SMS/Email gateway — a "sent" message is recorded here so
// the action has a real, honest effect (visible in the row's Messages tab)
// rather than pretending to reach an external provider.
export interface SubmissionMessage {
  id: string;
  submissionId: string;
  channel: "sms" | "email";
  body: string;
  createdAt: string;
}

export interface AvailableTransitionButton {
  // This app's WorkflowTransition has no stable id — position within the
  // workflow's own transitions array is used instead, scoped to one workflow.
  transitionIndex: number;
  displayName: string;
  toState: string;
  isAdmitAction: boolean;
  enableRemark: boolean;
}

export type FilterOperator =
  | "equal"
  | "not_equal"
  | "contains"
  | "not_contains"
  | "begins_with"
  | "ends_with"
  | "is_empty"
  | "is_not_empty";

export const FILTER_OPERATORS: { value: FilterOperator; label: string }[] = [
  { value: "equal", label: "Equals" },
  { value: "not_equal", label: "Not Equals" },
  { value: "contains", label: "Contains" },
  { value: "not_contains", label: "Does Not Contain" },
  { value: "begins_with", label: "Begins With" },
  { value: "ends_with", label: "Ends With" },
  { value: "is_empty", label: "Is Empty" },
  { value: "is_not_empty", label: "Is Not Empty" },
];

// A structured stand-in for the legacy raw-SQL query builder — field,
// operator and value only, evaluated safely in the repository layer.
// Never a raw string.
export interface ApplicationFilterRule {
  field: string;
  operator: FilterOperator;
  value?: string;
}

export interface ApplicationFilterTree {
  condition: "AND" | "OR";
  rules: ApplicationFilterRule[];
}
