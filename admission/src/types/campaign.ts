// "Stopped" mirrors campaign.status = 3 in the schema (1 draft | 2 published | 3 stopped).
export type CampaignStatus = "Draft" | "Published" | "Stopped";
export type YesNo = "Yes" | "No";

export interface SeatMatrixEntry {
  seatProgram: string;
  seatClass: string;
  campaignSeat: number | null;
  seatFromDate: string; // "YYYY-MM-DD" from <input type="date">
  seatToDate: string;
}

export interface Campaign {
  id: string;
  createdAt: string;

  // Core fields
  name: string;
  academicYear: string;
  // schema: campaign.pupilsightProgramID / classes are CSV columns — a
  // campaign can span more than one program/class, so these are arrays.
  programs: string[];
  classes: string[];
  limitMaxUsers: number | null;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  // No dedicated column on campaign for this in the schema; gates whether a
  // parent must complete campaign_parent_registration before applying.
  registrationRequired: YesNo;

  // Series / templates (all optional selects — no options wired to DB yet).
  // schema: campaign.campaign_series_id / application_series_id are bare
  // int columns with no relation defined anywhere in the reverse-engineered
  // schema — the "series" tables they point at aren't modeled, so these two
  // stay plain strings here too rather than guessing at a shape.
  applicationSeries: string;
  admissionSeries: string; // schema: campaign.admission_series_id -> fn_fee_series
  // schema: campaign.fn_fee_structure_id -> fn_fee_structure
  feeStructure: string;
  receiptTemplate: string;
  emailTemplate: string;
  smsTemplate: string;
  applicationFeeSettings: string;

  // Checkboxes
  publishForParent: boolean;
  allowMultipleSubmission: boolean;

  // Description
  description: string;

  // Seat matrix — one row for now; becomes an array once "Add More Seat Matrix" is wired
  // seatMatrix: SeatMatrixEntry;
  seatMatrix: SeatMatrixEntry[]; // ← was a single object, now an array
}