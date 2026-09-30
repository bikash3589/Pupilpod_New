// fn_fee_series.type — this module only ever creates/shows the two values
// below; 'Finance' and 'TC' rows belong to other screens and are excluded
// wherever this module lists series.
export type CampaignSeriesType = "Admission" | "Application";

// fn_fee_series_number_format.type
export type FormatBlockType = "numberwise" | "charwise";

/** fn_fee_series_number_format — one ordered block of a series' format.
 *  orderWise is 1-based, scoped within its own type (a char block's position
 *  among char blocks, independent of a number block's position among number
 *  blocks) — not a position within the combined format string. */
export interface SeriesFormatBlock {
  id: string;
  seriesId: string;
  type: FormatBlockType;
  orderWise: number;
  startNumber: string | null; // numberwise only
  noOfDigit: number | null; // numberwise only
  lastNo: string | null; // numberwise only — the running counter
  startChar: string | null; // charwise only
}

/** fn_fee_series — the series master row */
export interface CampaignSeries {
  id: string;
  createdAt: string;
  updatedAt: string;
  type: CampaignSeriesType;
  seriesName: string;
  description: string;
  academicYear: string;
  format: string; // display string, {AB} placeholders for number blocks
  formatVal: string; // '$'-joined string actually used for number generation
}

/** List-row shape — CampaignSeries plus the usage counts that gate Delete */
export interface CampaignSeriesListRow extends CampaignSeries {
  invoiceUsageCount: number;
  receiptUsageCount: number;
  isDeletable: boolean;
}

/** One block as the format-builder UI accumulates it, before submit */
export type DraftFormatBlock =
  | { type: "numberwise"; startNumber: string; noOfDigit: number }
  | { type: "charwise"; startChar: string };

export interface CampaignSeriesInput {
  academicYear: string;
  type: CampaignSeriesType;
  seriesName: string;
  description: string;
  blocks: DraftFormatBlock[];
}

export interface GenerateNextNumberResult {
  value: string;
  seriesId: string;
}
