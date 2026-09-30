import type {
  CampaignSeries,
  CampaignSeriesInput,
  CampaignSeriesListRow,
  DraftFormatBlock,
  GenerateNextNumberResult,
  SeriesFormatBlock,
} from "@/types/campaignSeries";

const SERIES_KEY = "campaignSeries";
const BLOCKS_KEY = "campaignSeriesFormatBlocks";

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

/** Mirrors the legacy Add screen's client-side block accumulation (the
 *  Add Number / Add Character buttons in main.js): each block appends to
 *  `format` with no separator, and to `formatVal` joined by a literal "$" —
 *  the string later split on "$" to walk the format at number-generation
 *  time (§4.6 in the module guide). */
export function buildFormatStrings(blocks: DraftFormatBlock[]): {
  format: string;
  formatVal: string;
} {
  let format = "";
  let formatVal = "";

  for (const block of blocks) {
    const piece = block.type === "numberwise" ? "{AB}" : block.startChar;
    format += piece;
    formatVal = formatVal === "" ? piece : `${formatVal}$${piece}`;
  }

  return { format, formatVal };
}

// Read-then-post-increment: the value returned is the current last_no, and
// only after issuing it does the counter advance and get zero-padded back
// out to noOfDigit characters.
function advanceCounter(
  lastNo: string,
  noOfDigit: number
): { issued: string; nextLastNo: string } {
  const issued = lastNo;
  const next = parseInt(lastNo, 10) + 1;
  const nextLastNo = String(next).padStart(noOfDigit, "0");
  return { issued, nextLastNo };
}

// Draft blocks -> child rows, each ordered 1-based within its own type: a
// char block's position among char blocks, independent of a number block's
// position among number blocks.
function draftBlocksToRows(
  seriesId: string,
  blocks: DraftFormatBlock[]
): SeriesFormatBlock[] {
  let numberOrder = 0;
  let charOrder = 0;

  return blocks.map((draft) => {
    if (draft.type === "numberwise") {
      numberOrder += 1;
      return {
        id: makeId(),
        seriesId,
        type: "numberwise",
        orderWise: numberOrder,
        startNumber: draft.startNumber,
        noOfDigit: draft.noOfDigit,
        lastNo: draft.startNumber, // seeded at creation
        startChar: null,
      };
    }
    charOrder += 1;
    return {
      id: makeId(),
      seriesId,
      type: "charwise",
      orderWise: charOrder,
      startNumber: null,
      noOfDigit: null,
      lastNo: null,
      startChar: draft.startChar,
    };
  });
}

export function getCampaignSeriesList(): CampaignSeriesListRow[] {
  return read<CampaignSeries>(SERIES_KEY).map((s) => ({
    ...s,
    // Usage counts come from fn_fee_invoice, which this admission-only
    // interim backend doesn't model — every series is treated as deletable
    // until a real invoicing feature exists to report real counts.
    invoiceUsageCount: 0,
    receiptUsageCount: 0,
    isDeletable: true,
  }));
}

export function getCampaignSeriesById(id: string): CampaignSeries | undefined {
  return read<CampaignSeries>(SERIES_KEY).find((s) => s.id === id);
}

export function getFormatBlocks(seriesId: string): SeriesFormatBlock[] {
  return read<SeriesFormatBlock>(BLOCKS_KEY)
    .filter((b) => b.seriesId === seriesId)
    .sort((a, b) => a.orderWise - b.orderWise);
}

/** Inverse of draftBlocksToRows — reconstructs the ordered draft block list
 *  the format builder needs to pre-populate Edit from a series' existing
 *  child rows. Number and character blocks are each already ordered within
 *  their own type, but the combined sequence (needed to rebuild the same
 *  `format` preview) is recovered by walking `format`'s placeholder pattern:
 *  every `{AB}` consumes the next numberwise block, everything else is
 *  reconstructed as a single charwise block matching that literal run. */
export function blocksToDraftBlocks(
  series: CampaignSeries,
  blocks: SeriesFormatBlock[]
): DraftFormatBlock[] {
  const numberBlocks = blocks
    .filter((b) => b.type === "numberwise")
    .sort((a, b) => a.orderWise - b.orderWise);
  const charBlocks = blocks
    .filter((b) => b.type === "charwise")
    .sort((a, b) => a.orderWise - b.orderWise);

  const tokens = series.format.split(/(\{AB\})/).filter((t) => t !== "");

  let numberIndex = 0;
  let charIndex = 0;

  return tokens.map((token): DraftFormatBlock => {
    if (token === "{AB}") {
      const block = numberBlocks[numberIndex++];
      return {
        type: "numberwise",
        startNumber: block?.startNumber ?? "",
        noOfDigit: block?.noOfDigit ?? 0,
      };
    }
    const block = charBlocks[charIndex++];
    return { type: "charwise", startChar: block?.startChar ?? token };
  });
}

/** Series Name must be unique per academic year, not globally. */
export function createCampaignSeries(input: CampaignSeriesInput): CampaignSeries {
  const existing = read<CampaignSeries>(SERIES_KEY);

  const duplicate = existing.some(
    (s) => s.seriesName === input.seriesName && s.academicYear === input.academicYear
  );
  if (duplicate) {
    throw new Error("A series with this name already exists for this academic year.");
  }

  const { format, formatVal } = buildFormatStrings(input.blocks);
  const now = new Date().toISOString();

  const series: CampaignSeries = {
    id: makeId(),
    createdAt: now,
    updatedAt: now,
    type: input.type,
    seriesName: input.seriesName,
    description: input.description,
    academicYear: input.academicYear,
    format,
    formatVal,
  };

  write(SERIES_KEY, [...existing, series]);
  write(BLOCKS_KEY, [
    ...read<SeriesFormatBlock>(BLOCKS_KEY),
    ...draftBlocksToRows(series.id, input.blocks),
  ]);

  return series;
}

/** Edit reuses the same block builder as Add, so `format`, `formatVal`, and
 *  the child format-block rows stay consistent with each other and with the
 *  blocks actually shown in the editor — unlike the legacy Edit screen,
 *  which only writes flat fields on the parent row and leaves `formatVal`
 *  and the child rows silently stale. */
export function updateCampaignSeries(
  id: string,
  input: CampaignSeriesInput
): CampaignSeries {
  const rows = read<CampaignSeries>(SERIES_KEY);
  const index = rows.findIndex((s) => s.id === id);
  if (index === -1) throw new Error(`Campaign series ${id} not found`);

  const duplicate = rows.some(
    (s) => s.id !== id && s.seriesName === input.seriesName && s.academicYear === input.academicYear
  );
  if (duplicate) {
    throw new Error("A series with this name already exists for this academic year.");
  }

  const { format, formatVal } = buildFormatStrings(input.blocks);

  const updated: CampaignSeries = {
    ...rows[index],
    type: input.type,
    seriesName: input.seriesName,
    description: input.description,
    academicYear: input.academicYear,
    format,
    formatVal,
    updatedAt: new Date().toISOString(),
  };
  rows[index] = updated;
  write(SERIES_KEY, rows);

  const remainingBlocks = read<SeriesFormatBlock>(BLOCKS_KEY).filter(
    (b) => b.seriesId !== id
  );
  write(BLOCKS_KEY, [...remainingBlocks, ...draftBlocksToRows(id, input.blocks)]);

  return updated;
}

export function deleteCampaignSeries(id: string): void {
  write(SERIES_KEY, read<CampaignSeries>(SERIES_KEY).filter((s) => s.id !== id));
  // Actively clean up child rows — the legacy delete only removes the
  // fn_fee_series row and orphans fn_fee_series_number_format rows.
  write(BLOCKS_KEY, read<SeriesFormatBlock>(BLOCKS_KEY).filter((b) => b.seriesId !== id));
}

/** Core purpose of a series: split formatVal on "$", walk the tokens, and
 *  for each {AB} placeholder pull + advance the matching numberwise block's
 *  counter. This is what a Campaign's Application/Admission number would
 *  ultimately call; not wired to a UI action within this management module. */
export function generateNextSeriesNumber(seriesId: string): GenerateNextNumberResult {
  const series = getCampaignSeriesById(seriesId);
  if (!series) throw new Error(`Campaign series ${seriesId} not found`);

  const blocks = read<SeriesFormatBlock>(BLOCKS_KEY);
  const tokens = series.formatVal ? series.formatVal.split("$") : [];

  let output = "";
  let orderWise = 0;

  for (const token of tokens) {
    if (token === "{AB}") {
      orderWise += 1;
      const block = blocks.find(
        (b) => b.seriesId === seriesId && b.type === "numberwise" && b.orderWise === orderWise
      );
      if (!block || block.lastNo === null || block.noOfDigit === null) {
        throw new Error(
          `Missing numberwise format block at position ${orderWise} for series ${seriesId}`
        );
      }
      const { issued, nextLastNo } = advanceCounter(block.lastNo, block.noOfDigit);
      output += issued;
      block.lastNo = nextLastNo;
    } else {
      output += token;
    }
  }

  write(BLOCKS_KEY, blocks);
  return { value: output, seriesId };
}
