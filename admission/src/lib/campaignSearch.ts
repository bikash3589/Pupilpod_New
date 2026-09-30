import { getCampaigns } from "@/lib/campaignStorage";
import type { Campaign } from "@/types/campaign";
import { parseAdvancedSearchFilters } from "@/lib/search/advancedFilter";
import {
  CAMPAIGN_SEARCHABLE_COLUMNS,
  type CampaignSearchCriteria,
  type CampaignSearchResult,
} from "@/types/campaignSearch";

function getSearchableColumnValue(campaign: Campaign, column: string): string {
  switch (column) {
    case "name":
      return campaign.name;
    case "academic_year":
      return campaign.academicYear;
    default:
      return "";
  }
}

/**
 * Runs the search box's full criteria (search + sort + pagination) against the
 * campaigns in storage. Advanced-filter tokens (e.g. `status:2`) are extracted
 * out of the search text but — matching the legacy AdmissionGateway, which
 * defines no filter rules for this page — never applied to narrow the results;
 * their only effect is removing that token from the literal free-text search.
 */
export function searchCampaigns(criteria: CampaignSearchCriteria): CampaignSearchResult {
  const all = getCampaigns();
  const totalRows = all.length;

  const { text: searchText } = parseAdvancedSearchFilters(criteria.searchBy.text);

  // Any requested column not in the searchable whitelist is silently skipped.
  const searchColumns = criteria.searchBy.columns.filter((col) =>
    (CAMPAIGN_SEARCHABLE_COLUMNS as readonly string[]).includes(col)
  );

  let rows = all;
  if (searchText && searchColumns.length > 0) {
    const needle = searchText.toLowerCase();
    rows = all.filter((c) =>
      searchColumns.some((col) => getSearchableColumnValue(c, col).toLowerCase().includes(needle))
    );
  }

  const foundRows = rows.length;

  const sortEntries = Object.entries(criteria.sortBy);
  if (sortEntries.length > 0) {
    rows = [...rows].sort((a, b) => {
      for (const [column, direction] of sortEntries) {
        const av = column === "id" ? a.id : getSearchableColumnValue(a, column);
        const bv = column === "id" ? b.id : getSearchableColumnValue(b, column);
        if (av === bv) continue;
        const cmp = av > bv ? 1 : -1;
        return direction === "DESC" ? -cmp : cmp;
      }
      return 0;
    });
  }

  const start = (criteria.page - 1) * criteria.pageSize;
  const end = criteria.pageSize > 0 ? start + criteria.pageSize : undefined;
  const data = rows.slice(start, end);

  return { data, foundRows, totalRows, page: criteria.page, pageSize: criteria.pageSize };
}
