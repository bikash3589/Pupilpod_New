"use client";

/**
 * ============================================================================
 *  RichTextField.tsx  —  the "Text" field's editable block
 * ============================================================================
 *
 *  What you see on screen:
 *
 *      [+]   [ the text you type goes here, big or small
 *              depending on which style button you pressed ]
 *
 *            [B] [I] [U] [H1] [H2] [H3] [H4] [H5] [H6] [P]
 *
 *  - The "+" is just a little handle. Clicking anywhere in this block
 *    (including the "+") selects this field — same as any other field.
 *    We don't need extra code for that; the click just bubbles up to
 *    the parent CanvasItem, which already selects whatever you click.
 *
 *  - Bold / Italic / Underline toggle real browser text formatting on
 *    whatever text is selected (or on whatever you type next, if nothing
 *    is selected).
 *
 *  - H1–H6 and P used to be a dropdown that lived in the Properties
 *    panel. Now they're plain buttons sitting right here in the
 *    toolbar, doing the exact same job: change this field's `blockType`,
 *    which changes how big the text looks (both while editing AND later
 *    in the Preview page), and reset `height` back to "auto" so the box
 *    is always free to grow/shrink to fit the new size.
 * ============================================================================
 */

import { useEffect, useRef, useState } from "react";
import styles from "./Field.module.css";
import { CanvasNode } from "@/types/form-builder/field";

interface RichTextFieldProps {
  field: CanvasNode;
  onUpdateNode: (id: string, updates: Partial<CanvasNode>) => void;
}

// Lookup table: "if blockType is h1, use THIS css class". This is what
// makes an H1 actually look bigger than a Paragraph while you type.
const blockTypeClass: Record<string, string> = {
  p: styles.richP,
  h1: styles.richH1,
  h2: styles.richH2,
  h3: styles.richH3,
  h4: styles.richH4,
  h5: styles.richH5,
  h6: styles.richH6,
};

export default function RichTextField({ field, onUpdateNode }: RichTextFieldProps) {
  // A direct handle to the real <div> in the browser, so we can read its
  // HTML or focus it ourselves without waiting on React re-renders.
  const editableRef = useRef<HTMLDivElement>(null);

  // Makes sure we only copy the saved text into the box ONCE — the very
  // first time this field appears. If we did it on every re-render,
  // React would keep resetting your typing cursor back to the start.
  const hasInitialized = useRef(false);

  // Tracks which of Bold/Italic/Underline are switched on right now,
  // purely so we can visually highlight their buttons. All three can be
  // true at the same time — that's the whole point of them being
  // independent toggles.
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  // ---------------------------------------------------------------------
  // Runs once, right when this field first shows up on the canvas.
  // Copies whatever text was saved before into the actual editable box.
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (editableRef.current && !hasInitialized.current) {
      editableRef.current.innerHTML = field.richText ?? field.label ?? "";
      hasInitialized.current = true;
    }
  }, [field.richText, field.label]);

  // Runs every time the admin types a letter — just saves whatever HTML
  // is currently sitting inside the box.
  function handleInput(event: React.FormEvent<HTMLDivElement>) {
    onUpdateNode(field.id, { richText: event.currentTarget.innerHTML });
    syncActiveFormats();
  }

  // Asks the browser "right now, is Bold/Italic/Underline switched on at
  // the cursor?" and updates our little state so the toolbar buttons
  // light up to match. Called after every click, key press, and click
  // inside the text (since that moves the cursor to a new spot).
  function syncActiveFormats() {
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
    });
  }

  // Runs when the admin clicks Bold, Italic, or Underline.
  function applyFormat(command: "bold" | "italic" | "underline") {
    const editable = editableRef.current;
    if (!editable) return;

    // Only re-focus if the box isn't ALREADY focused. Calling .focus()
    // on something already focused can quietly cancel out the other
    // styles you just turned on — that was the bug where only the last
    // clicked style ever stuck.
    if (document.activeElement !== editable) {
      editable.focus();
    }

    document.execCommand(command); // the real browser formatting command

    onUpdateNode(field.id, { richText: editable.innerHTML });
    syncActiveFormats();
  }

  // ---------------------------------------------------------------------
  // Changing the text "style" (Paragraph or Heading 1–6).
  // ---------------------------------------------------------------------
  // All seven buttons need to do the exact same two things, just with a
  // different blockType value each time:
  //   1. Save the new blockType, so the CSS class above changes and the
  //      text visually resizes right away.
  //   2. Reset height to "auto", so the container is always free to grow
  //      or shrink to fit — even if it was manually resized before.
  //
  // Instead of writing that logic seven separate times, we write it ONCE
  // in a small helper, and each button just tells the helper which style
  // it wants.
  // ---------------------------------------------------------------------
  function setBlockType(nextBlockType: NonNullable<CanvasNode["blockType"]>) {
    onUpdateNode(field.id, {
      blockType: nextBlockType,
      height: "auto",
    });
  }

  function applyh1() {
    setBlockType("h1");
  }
  function applyh2() {
    setBlockType("h2");
  }
  function applyh3() {
    setBlockType("h3");
  }
  function applyh4() {
    setBlockType("h4");
  }
  function applyh5() {
    setBlockType("h5");
  }
  function applyh6() {
    setBlockType("h6");
  }
  function applypara() {
    setBlockType("p");
  }

  // Which style is active right now — defaults to Paragraph if nothing
  // has been picked yet. Used both for the CSS size class, and for
  // deciding which H1–H6/P button should light up as "selected".
  const blockType = field.blockType ?? "p";

  return (
    <div className={styles.richTextWrapper}>
      {/* The little "+" handle beside the container. */}
      <button
        type="button"
        className={styles.richPlusButton}
        title="Select this text block"
        data-no-drag
      >
        +
      </button>

      <div className={styles.richTextBody}>
        {/* The actual editable text. `contentEditable` is a normal HTML
            attribute that turns this div into a typeable box — no
            special library needed. */}
        <div
          ref={editableRef}
          className={`${styles.richTextContent} ${blockTypeClass[blockType] ?? ""}`}
          contentEditable
          suppressContentEditableWarning
          data-placeholder="Type something..."
          data-no-drag
          onInput={handleInput}
          onKeyUp={syncActiveFormats}
          onMouseUp={syncActiveFormats}
          onFocus={syncActiveFormats}
        />

        {/* Toolbar sits UNDER the text, still inside the same container. */}
        <div className={styles.richTextToolbar}>
          <button
            type="button"
            className={`${styles.toolbarButton} ${activeFormats.bold ? styles.toolbarButtonActive : ""}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyFormat("bold")}
            title="Bold"
            data-no-drag
          >
            <b>B</b>
          </button>

          <button
            type="button"
            className={`${styles.toolbarButton} ${activeFormats.italic ? styles.toolbarButtonActive : ""}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyFormat("italic")}
            title="Italic"
            data-no-drag
          >
            <i>I</i>
          </button>

          <button
            type="button"
            className={`${styles.toolbarButton} ${activeFormats.underline ? styles.toolbarButtonActive : ""}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyFormat("underline")}
            title="Underline"
            data-no-drag
          >
            <u>U</u>
          </button>

          {/* H1–H6 and Paragraph: each button highlights itself
              (styles.toolbarButtonActive) whenever it matches the
              field's current blockType, so you can always see which
              one is picked. */}
          <button
            type="button"
            className={`${styles.toolbarButton} ${blockType === "h1" ? styles.toolbarButtonActive : ""}`}
            onClick={() => applyh1()}
            title="Heading 1"
            onMouseDown={(event) => event.preventDefault()}
            data-no-drag
          >
            <span>H1</span>
          </button>

          <button
            type="button"
            className={`${styles.toolbarButton} ${blockType === "h2" ? styles.toolbarButtonActive : ""}`}
            onClick={() => applyh2()}
            title="Heading 2"
            onMouseDown={(event) => event.preventDefault()}
            data-no-drag
          >
            <span>H2</span>
          </button>

          <button
            type="button"
            className={`${styles.toolbarButton} ${blockType === "h3" ? styles.toolbarButtonActive : ""}`}
            onClick={() => applyh3()}
            title="Heading 3"
            onMouseDown={(event) => event.preventDefault()}
            data-no-drag
          >
            <span>H3</span>
          </button>

          <button
            type="button"
            className={`${styles.toolbarButton} ${blockType === "h4" ? styles.toolbarButtonActive : ""}`}
            onClick={() => applyh4()}
            title="Heading 4"
            onMouseDown={(event) => event.preventDefault()}
            data-no-drag
          >
            <span>H4</span>
          </button>

          <button
            type="button"
            className={`${styles.toolbarButton} ${blockType === "h5" ? styles.toolbarButtonActive : ""}`}
            onClick={() => applyh5()}
            title="Heading 5"
            onMouseDown={(event) => event.preventDefault()}
            data-no-drag
          >
            <span>H5</span>
          </button>

          <button
            type="button"
            className={`${styles.toolbarButton} ${blockType === "h6" ? styles.toolbarButtonActive : ""}`}
            onClick={() => applyh6()}
            title="Heading 6"
            onMouseDown={(event) => event.preventDefault()}
            data-no-drag
          >
            <span>H6</span>
          </button>

          <button
            type="button"
            className={`${styles.toolbarButton} ${blockType === "p" ? styles.toolbarButtonActive : ""}`}
            onClick={() => applypara()}
            title="Paragraph"
            onMouseDown={(event) => event.preventDefault()}
            data-no-drag
          >
            <span>P</span>
          </button>
        </div>
      </div>
    </div>
  );
}