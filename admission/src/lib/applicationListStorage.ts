import { getWorkflowsByCampaign } from "@/lib/workflowStorage";
import type {
  ApplicationFilterTree,
  ApplicationRow,
  AvailableTransitionButton,
  FilterOperator,
  GridType,
  SubmissionMessage,
  SubmissionRecord,
  SubmissionStatusHistoryEntry,
} from "@/types/applicationList";

const SUBMISSIONS_KEY = "campaignSubmissions";
const HISTORY_KEY = "campaignSubmissionStatusHistory";
const MESSAGES_KEY = "campaignSubmissionMessages";

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch (err) {
    console.error(`Failed to read ${key} from localStorage`, err);
    return [];
  }
}

function write<T>(key: string, rows: T[]): void {
  localStorage.setItem(key, JSON.stringify(rows));
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------
// Submissions
// ---------------------------------------------------------------

export function listSubmissions(campaignId: string): SubmissionRecord[] {
  return read<SubmissionRecord>(SUBMISSIONS_KEY).filter(
    (s) => s.campaignId === campaignId && s.isActive === "2"
  );
}

// Cross-campaign read — used by the Registered User module's Applied/Not
// Apply check (§4.3 in that guide), which is deliberately not scoped to one
// campaign, the same way the legacy query isn't.
export function listAllSubmissions(): SubmissionRecord[] {
  return read<SubmissionRecord>(SUBMISSIONS_KEY).filter((s) => s.isActive === "2");
}

export function getSubmissionById(id: string): SubmissionRecord | undefined {
  return read<SubmissionRecord>(SUBMISSIONS_KEY).find((s) => s.id === id);
}

export function createSubmission(
  campaignId: string,
  fields: Record<string, string>,
  program: string | null,
  yearGroup: string | null
): SubmissionRecord {
  const all = read<SubmissionRecord>(SUBMISSIONS_KEY);
  const seq = all.filter((s) => s.campaignId === campaignId).length + 1;

  const record: SubmissionRecord = {
    id: makeId(),
    campaignId,
    sequenceNo: seq,
    applicationId: `APP-${campaignId.slice(-4)}-${String(seq).padStart(4, "0")}`,
    fields,
    program,
    yearGroup,
    isConverted: 0,
    isActive: "2",
    createdAt: new Date().toISOString(),
  };

  write(SUBMISSIONS_KEY, [...all, record]);
  return record;
}

// Soft delete only — the row stays, flipped to the inverted-convention
// "inactive" value, exactly mirroring the legacy delete action.
export function softDeleteSubmission(id: string): void {
  const rows = read<SubmissionRecord>(SUBMISSIONS_KEY);
  const idx = rows.findIndex((r) => r.id === id);
  if (idx === -1) return;
  rows[idx] = { ...rows[idx], isActive: "1" };
  write(SUBMISSIONS_KEY, rows);
}

export function updateSubmissionProgramClass(
  id: string,
  program: string,
  yearGroup: string
): void {
  const rows = read<SubmissionRecord>(SUBMISSIONS_KEY);
  const idx = rows.findIndex((r) => r.id === id);
  if (idx === -1) return;
  rows[idx] = { ...rows[idx], program, yearGroup };
  write(SUBMISSIONS_KEY, rows);
}

export function checkConversionEligibility(id: string): boolean {
  const submission = getSubmissionById(id);
  return submission ? submission.isConverted === 0 : false;
}

// ---------------------------------------------------------------
// Status history (campaign_form_status analog) + the wf_status cascade
// ---------------------------------------------------------------

export function getHistoryForSubmission(id: string): SubmissionStatusHistoryEntry[] {
  return read<SubmissionStatusHistoryEntry>(HISTORY_KEY)
    .filter((h) => h.submissionId === id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function latestHistoryEntry(id: string): SubmissionStatusHistoryEntry | undefined {
  const rows = getHistoryForSubmission(id);
  return rows[rows.length - 1];
}

/** Priority cascade: converted -> "Admitted"; else the most recent
 *  transition's target state; else "Submitted". This app has no
 *  campaign-level fee-generation-mode concept, so the legacy cascade's
 *  Created-vs-Submitted branch (gated on that flag) doesn't apply here —
 *  a fresh, untransitioned submission is simply "Submitted". */
export function computeWfStatus(submission: SubmissionRecord): string {
  if (submission.isConverted === 1) return "Admitted";
  const latest = latestHistoryEntry(submission.id);
  if (latest) return latest.toState;
  return "Submitted";
}

export function getApplicationRows(campaignId: string): ApplicationRow[] {
  return listSubmissions(campaignId)
    .map((s) => ({
      submissionId: s.id,
      campaignId: s.campaignId,
      sequenceNo: s.sequenceNo,
      applicationId: s.applicationId,
      wfStatus: computeWfStatus(s),
      fields: s.fields,
      program: s.program,
      yearGroup: s.yearGroup,
      isConverted: s.isConverted,
      createdAt: s.createdAt,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// ---------------------------------------------------------------
// Grid columns
// ---------------------------------------------------------------

// A column literally named "application_no" (a Fluent-Form-style field, if
// a campaign's form happens to define one) is excluded by exact-string
// match — never confused with the real, system-generated `applicationId`.
const ALWAYS_EXCLUDED_FIELD = "application_no";

const UPPERCASE_DISPLAY_FIELDS = new Set([
  "student_name",
  "father_name",
  "mother_name",
  "father_education_qualification",
  "mother_education_qualification",
]);

export function isUppercaseDisplayField(fieldName: string): boolean {
  return UPPERCASE_DISPLAY_FIELDS.has(fieldName);
}

export function isUrlValue(value: string): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Quick = just the first field (this app's forms have no fixed
 *  student_name field to hardcode, unlike the legacy grid); Requested =
 *  fields the admin flagged "Show in Grid" on the canvas; Full = every
 *  field. All three always exclude the application_no naming-quirk field. */
export function resolveGridColumns(
  gridType: GridType,
  fields: { name: string; showInGrid?: boolean }[]
): string[] {
  const cleaned = fields.filter((f) => f.name !== ALWAYS_EXCLUDED_FIELD);
  if (gridType === "quick") return cleaned.slice(0, 1).map((f) => f.name);
  if (gridType === "requested") {
    const requested = cleaned.filter((f) => f.showInGrid).map((f) => f.name);
    return requested.length > 0 ? requested : cleaned.slice(0, 1).map((f) => f.name);
  }
  return cleaned.map((f) => f.name);
}

// ---------------------------------------------------------------
// Messages (Send SMS / Send Email) — no external gateway exists in this
// app, so "sending" means recording a real, visible message log entry
// against the submission rather than pretending to reach a provider.
// ---------------------------------------------------------------

export function sendMessage(
  submissionId: string,
  channel: "sms" | "email",
  body: string
): void {
  const rows = read<SubmissionMessage>(MESSAGES_KEY);
  rows.push({ id: makeId(), submissionId, channel, body, createdAt: new Date().toISOString() });
  write(MESSAGES_KEY, rows);
}

export function getMessagesForSubmission(submissionId: string): SubmissionMessage[] {
  return read<SubmissionMessage>(MESSAGES_KEY)
    .filter((m) => m.submissionId === submissionId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

// ---------------------------------------------------------------
// Advance Search — safe structured filter, never a SQL string
// ---------------------------------------------------------------

export function evaluateFilterTree(
  rows: ApplicationRow[],
  tree: ApplicationFilterTree,
  allowedFields: Set<string>
): ApplicationRow[] {
  return rows.filter((row) => {
    const results = tree.rules.map((rule) => evaluateRule(row, rule, allowedFields));
    return tree.condition === "AND" ? results.every(Boolean) : results.some(Boolean);
  });
}

function evaluateRule(
  row: ApplicationRow,
  rule: { field: string; operator: FilterOperator; value?: string },
  allowedFields: Set<string>
): boolean {
  if (!allowedFields.has(rule.field)) {
    throw new Error(`Field "${rule.field}" is not searchable for this campaign`);
  }
  const value = row.fields[rule.field] ?? "";
  const target = rule.value ?? "";

  switch (rule.operator) {
    case "equal":
      return value === target;
    case "not_equal":
      return value !== target;
    case "contains":
      return value.toLowerCase().includes(target.toLowerCase());
    case "not_contains":
      return !value.toLowerCase().includes(target.toLowerCase());
    case "begins_with":
      return value.toLowerCase().startsWith(target.toLowerCase());
    case "ends_with":
      return value.toLowerCase().endsWith(target.toLowerCase());
    case "is_empty":
      return value === "";
    case "is_not_empty":
      return value !== "";
    default:
      return true;
  }
}

// ---------------------------------------------------------------
// Workflow transitions — reuses the Workflow config already built by the
// Transition module. This app has no staff/login system, so (unlike the
// legacy permission gate keyed on the acting staff member) every
// transition whose fromState matches is shown to whoever is looking.
// ---------------------------------------------------------------

function currentStateForSubmission(submission: SubmissionRecord, defaultState: string): string {
  if (submission.isConverted === 1) return "Admitted";
  const latest = latestHistoryEntry(submission.id);
  return latest?.toState ?? defaultState;
}

export function getAvailableTransitions(
  campaignId: string,
  submissionIds: string[]
): AvailableTransitionButton[] {
  const workflow = getWorkflowsByCampaign(campaignId)[0];
  if (!workflow) return [];

  const defaultState =
    workflow.states.find((s) => s.stateName === "Submitted")?.stateName ??
    workflow.states[0]?.stateName ??
    "";

  const submissions = submissionIds
    .map((id) => getSubmissionById(id))
    .filter((s): s is SubmissionRecord => Boolean(s));

  const currentStates = new Set(
    submissions.map((s) => currentStateForSubmission(s, defaultState))
  );

  const seen = new Set<string>();
  const buttons: AvailableTransitionButton[] = [];

  workflow.transitions.forEach((transition, index) => {
    if (!currentStates.has(transition.fromState)) return;
    const key = `${transition.toState}:${transition.displayName}`;
    if (seen.has(key)) return;
    seen.add(key);

    buttons.push({
      transitionIndex: index,
      displayName: transition.displayName || transition.toState,
      toState: transition.toState,
      isAdmitAction: transition.displayName === "Admit",
      enableRemark: transition.enableRemark,
    });
  });

  return buttons;
}

export function applyTransition(
  campaignId: string,
  submissionIds: string[],
  transitionIndex: number,
  remark = ""
): void {
  const workflow = getWorkflowsByCampaign(campaignId)[0];
  const transition = workflow?.transitions[transitionIndex];
  if (!workflow || !transition) throw new Error("Transition not found");

  const historyRows = read<SubmissionStatusHistoryEntry>(HISTORY_KEY);
  const submissionRows = read<SubmissionRecord>(SUBMISSIONS_KEY);
  const now = new Date().toISOString();

  for (const submissionId of submissionIds) {
    historyRows.push({
      id: makeId(),
      submissionId,
      campaignId,
      toState: transition.toState,
      displayName: transition.displayName,
      remark,
      createdAt: now,
    });

    // "Admit" is the one transition that also marks the applicant
    // converted — this app has no separate bulk-enrollment/import flow to
    // set that flag the way the legacy transitionImportProcess.php does.
    if (transition.displayName === "Admit") {
      const idx = submissionRows.findIndex((s) => s.id === submissionId);
      if (idx !== -1) submissionRows[idx] = { ...submissionRows[idx], isConverted: 1 };
    }
  }

  write(HISTORY_KEY, historyRows);
  write(SUBMISSIONS_KEY, submissionRows);
}
