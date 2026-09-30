"use client";

import { useState } from "react";
import { buildFormatStrings } from "@/lib/campaignSeriesStorage";
import type { DraftFormatBlock } from "@/types/campaignSeries";
import styles from "./SeriesFormatBuilder.module.css";

type SeriesFormatBuilderProps = {
  blocks: DraftFormatBlock[];
  onChange: (blocks: DraftFormatBlock[]) => void;
};

export default function SeriesFormatBuilder({
  blocks,
  onChange,
}: SeriesFormatBuilderProps) {
  const [mode, setMode] = useState<"numberwise" | "charwise" | null>(null);
  const [startNumber, setStartNumber] = useState("");
  const [noOfDigit, setNoOfDigit] = useState("");
  const [startChar, setStartChar] = useState("");

  const { format } = buildFormatStrings(blocks);

  const addNumber = () => {
    const digit = Number(noOfDigit);
    if (!startNumber || !digit || startNumber.length !== digit) {
      alert("Start Number is Not Match with No of Digit");
      return;
    }
    onChange([...blocks, { type: "numberwise", startNumber, noOfDigit: digit }]);
    setStartNumber("");
    setNoOfDigit("");
    setMode(null);
  };

  const addChar = () => {
    if (!startChar) return;
    onChange([...blocks, { type: "charwise", startChar }]);
    setStartChar("");
    setMode(null);
  };

  // Clearing the format also clears the accumulated block list — the
  // legacy Delete button only blanked the preview text and left the
  // already-added hidden fields behind, so a rebuilt format could submit
  // both the old and new blocks together. That bug is not replicated here.
  const clearFormat = () => {
    onChange([]);
    setMode(null);
    setStartNumber("");
    setNoOfDigit("");
    setStartChar("");
  };

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.preview}>
        <input type="text" value={format} readOnly placeholder="Format" />
        {blocks.length > 0 && (
          <button
            type="button"
            className={styles.clearButton}
            title="Clear format"
            onClick={clearFormat}
          >
            ✕
          </button>
        )}
      </div>

      {blocks.length > 0 && (
        <ul className={styles.blockList}>
          {blocks.map((block, index) => (
            <li key={index}>
              {block.type === "numberwise"
                ? `Number: start ${block.startNumber} (${block.noOfDigit} digits)`
                : `Character: "${block.startChar}"`}
              <button type="button" onClick={() => removeBlock(index)} aria-label="Remove block">
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.actions}>
        <button type="button" className="navigationButton" onClick={() => setMode("numberwise")}>
          Add Number
        </button>
        <button type="button" className="navigationButton" onClick={() => setMode("charwise")}>
          Add Character
        </button>
      </div>

      {mode === "numberwise" && (
        <div className={styles.blockForm}>
          <label>
            Start No
            <input
              type="text"
              value={startNumber}
              onChange={(e) => setStartNumber(e.target.value)}
              placeholder="e.g. 00001"
            />
          </label>
          <label>
            No of Digit
            <input
              type="number"
              value={noOfDigit}
              onChange={(e) => setNoOfDigit(e.target.value)}
              placeholder="e.g. 5"
            />
          </label>
          <button type="button" className="navigationButton" onClick={addNumber}>
            Add
          </button>
          <button type="button" className="navigationButton" onClick={() => setMode(null)}>
            Cancel
          </button>
        </div>
      )}

      {mode === "charwise" && (
        <div className={styles.blockForm}>
          <label>
            Text
            <input
              type="text"
              value={startChar}
              onChange={(e) => setStartChar(e.target.value)}
              placeholder="e.g. APP-2026-"
            />
          </label>
          <button type="button" className="navigationButton" onClick={addChar}>
            Add
          </button>
          <button type="button" className="navigationButton" onClick={() => setMode(null)}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
