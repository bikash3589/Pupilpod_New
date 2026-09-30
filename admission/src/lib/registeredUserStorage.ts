import { listAllSubmissions } from "@/lib/applicationListStorage";
import type {
  RegisteredUser,
  RegisteredUserListRow,
  RegisteredUserMessage,
  RegistrationStatus,
} from "@/types/registeredUser";

const REGISTRATIONS_KEY = "campaignParentRegistrations";
const MESSAGES_KEY = "campaignParentRegistrationMessages";

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

export function getRegistrations(): RegisteredUser[] {
  return read<RegisteredUser>(REGISTRATIONS_KEY);
}

/** The public lead-capture flow's write path (cms/register.php). This app
 *  has no parent-portal login/Person model, so — unlike the legacy flow,
 *  which also creates a pupilsightPerson in the same request — this only
 *  ever creates the registration record itself. */
export function registerInterest(
  campaignId: string,
  name: string,
  email: string,
  mobile: string
): RegisteredUser {
  const existing = getRegistrations();

  // Campaign-agnostic email-uniqueness gate, exactly as the legacy check —
  // any existing registration with this email blocks a new one, even for
  // a different campaign.
  const duplicate = existing.some(
    (r) => r.email.toLowerCase() === email.toLowerCase()
  );
  if (duplicate) {
    throw new Error("Email id already exists");
  }

  const registration: RegisteredUser = {
    id: makeId(),
    campaignId,
    name,
    email,
    mobile,
    createdAt: new Date().toISOString(),
  };

  write(REGISTRATIONS_KEY, [...existing, registration]);
  return registration;
}

/** Batched Applied/Not Apply computation — one pass over every submission
 *  across every campaign (deliberately not scoped to this campaign, same
 *  as the legacy query), not one query per registration row. Matched by
 *  email/mobile appearing in the submission's own field values, since this
 *  app has no shared Person id linking a registration to a submission. */
export function listRegisteredUsers(campaignId: string): RegisteredUserListRow[] {
  const registrations = getRegistrations()
    .filter((r) => r.campaignId === campaignId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const submissions = listAllSubmissions();
  const appliedValues = new Set<string>();
  for (const submission of submissions) {
    for (const value of Object.values(submission.fields)) {
      if (value) appliedValues.add(value.trim().toLowerCase());
    }
  }

  const hasApplied = (registration: RegisteredUser): boolean =>
    appliedValues.has(registration.email.trim().toLowerCase()) ||
    appliedValues.has(registration.mobile.trim().toLowerCase());

  return registrations.map((r) => ({
    ...r,
    status: (hasApplied(r) ? "Applied" : "Not Apply") as RegistrationStatus,
  }));
}

/** Client-side instant filter over already-loaded rows — the only search
 *  mechanism actually wired up in the legacy screen (§4.4); there is no
 *  server-driven QueryCriteria search here. */
export function filterRegisteredUsers(
  rows: RegisteredUserListRow[],
  query: string
): RegisteredUserListRow[] {
  const term = query.trim().toLowerCase();
  if (!term) return rows;
  return rows.filter((r) =>
    [r.name, r.email, r.mobile, r.status].some((v) => v.toLowerCase().includes(term))
  );
}

/** Logs one message row per recipient, each tagged with that recipient's
 *  own registration id — the legacy code logs the entire original
 *  comma-separated selection string against every row instead; not
 *  replicated here. */
export function sendRegisteredUserMessage(
  registrationIds: string[],
  channel: "email" | "sms",
  body: string,
  subject: string | null = null
): void {
  const registrations = getRegistrations();
  const log = read<RegisteredUserMessage>(MESSAGES_KEY);
  const now = new Date().toISOString();

  for (const id of registrationIds) {
    const registration = registrations.find((r) => r.id === id);
    if (!registration) continue;
    if (channel === "email" && !registration.email) continue;
    if (channel === "sms" && !registration.mobile) continue;

    log.push({
      id: makeId(),
      registrationId: id,
      campaignId: registration.campaignId,
      channel,
      subject: channel === "email" ? subject : null,
      body,
      createdAt: now,
    });
  }

  write(MESSAGES_KEY, log);
}

export function getMessagesForRegistration(registrationId: string): RegisteredUserMessage[] {
  return read<RegisteredUserMessage>(MESSAGES_KEY)
    .filter((m) => m.registrationId === registrationId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
