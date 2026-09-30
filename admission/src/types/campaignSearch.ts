import type { Campaign } from "@/types/campaign";

export type SortDirection = "ASC" | "DESC";

export interface SearchBy {
  columns: string[];
  text: string;
}

/** Mirrors the legacy QueryCriteria object, including fields (multi-column sort,
 *  pagination) this page's UI never exposes, so the type stays reusable the same
 *  way QueryCriteria is shared across every list page in the source app. */
export interface CampaignSearchCriteria {
  page: number;
  pageSize: number;
  searchBy: SearchBy;
  filterBy: Record<string, string>;
  sortBy: Record<string, SortDirection>;
}

export const CAMPAIGN_SEARCHABLE_COLUMNS = ["name", "academic_year"] as const;
export type CampaignSearchableColumn = (typeof CAMPAIGN_SEARCHABLE_COLUMNS)[number];

export interface CampaignSearchResult {
  data: Campaign[];
  foundRows: number; // matches under the current search, pre-pagination
  totalRows: number; // grand total, ignoring search
  page: number;
  pageSize: number;
}

export function defaultCampaignSearchCriteria(searchText = ""): CampaignSearchCriteria {
  return {
    page: 1,
    pageSize: 5000,
    searchBy: { columns: [...CAMPAIGN_SEARCHABLE_COLUMNS], text: searchText },
    filterBy: {},
    sortBy: { id: "ASC" },
  };
}
