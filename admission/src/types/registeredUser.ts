// campaign_parent_registration — a prospective parent expressing interest
// in a campaign before submitting a full application. This app has no
// parent-portal login/Person model, so (unlike the legacy flow, which
// creates a pupilsightPerson in the same request) registering interest
// here only ever creates this one record.
export interface RegisteredUser {
  id: string;
  campaignId: string;
  name: string;
  email: string;
  mobile: string;
  createdAt: string;
}

export type RegistrationStatus = "Applied" | "Not Apply";

// List-row shape — RegisteredUser plus the computed conversion status.
export interface RegisteredUserListRow extends RegisteredUser {
  status: RegistrationStatus;
}

// This app has no SMS/email gateway — a "sent" message is recorded here
// (one row per recipient, each tagged with its own registration id) so the
// action has a real, honest effect instead of pretending to reach a
// provider.
export interface RegisteredUserMessage {
  id: string;
  registrationId: string;
  campaignId: string;
  channel: "email" | "sms";
  subject: string | null; // email only
  body: string;
  createdAt: string;
}
