// // import styles from "./Toolbar.module.css";
// // import Link from "next/link";

// // export default function Toolbar() {
// //   return (
// //     <div className={styles.toolbar}>
// //       <div className={styles.title}>
// //         Form Builder
// //       </div>

// //       <div className={styles.actions}>
// //         {/* <Link href="/preview">Preview</Link> */}
// //         <Link href="/preview" target="_blank" rel="noopener noreferrer">Preview</Link>
// //         <button>Save</button>
// //       </div>
// //     </div>
// //   );
// // }

// "use client";

// import { useState } from "react";
// import styles from "./Toolbar.module.css";
// import Link from "next/link";
// import { useBuilderContext } from "@/context/form-builder/BuilderContext";

// export default function Toolbar() {
//   const { nodes } = useBuilderContext();
//   const [jsonOpen, setJsonOpen] = useState(false);
//   const [copied, setCopied] = useState(false);

//   function handleCopy() {
//     navigator.clipboard.writeText(JSON.stringify(nodes, null, 2));
//     setCopied(true);
//     setTimeout(() => setCopied(false), 1500);
//   }

//   return (
//     <div className={styles.toolbar}>
//       <div className={styles.title}>Form Builder</div>

//       <div className={styles.actions}>
//         <button type="button" onClick={() => setJsonOpen(true)}>
//           {"</>"} View JSON
//         </button>

//         <Link href="/preview" target="_blank" rel="noopener noreferrer">
//           Preview
//         </Link>

//         <button>Save</button>
//       </div>

//       {jsonOpen && (
//         <div className={styles.jsonOverlay} onClick={() => setJsonOpen(false)}>
//           <div className={styles.jsonModal} onClick={(event) => event.stopPropagation()}>
//             <div className={styles.jsonHeader}>
//               <h3>Form Schema (JSON)</h3>
//               <button type="button" onClick={() => setJsonOpen(false)}>✕</button>
//             </div>
//             <pre className={styles.jsonBody}>
//               {JSON.stringify(nodes, null, 2)}
//             </pre>
//             <div className={styles.jsonFooter}>
//               <button type="button" onClick={handleCopy}>
//                 {copied ? "Copied!" : "Copy JSON"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Toolbar.module.css";
import Link from "next/link";
import { Link2, Copy, Check } from "lucide-react";
import { useBuilderContext } from "@/context/form-builder/BuilderContext";

// The localStorage key that stands in for "the ID our backend gave
// this form" until a real database exists. Tomorrow, when the backend
// is ready, this whole file only needs ONE change: replace
// getOrCreateShareId() with a real API call (e.g. POST /api/forms)
// that returns a real ID from the database instead of a random one.
const SHARE_ID_KEY = "formbuilder-share-id";

// Generates a short, URL-friendly random ID. Good enough as a stand-in
// for now — a real backend would generate this (or use its own
// database row ID) instead.
function generateShareId(): string {
  return crypto.randomUUID().slice(0, 8);
}

// Reads the existing share ID for this form if one was already saved
// before, otherwise creates a new one and remembers it — so clicking
// Save twice doesn't generate a different link each time.
function getOrCreateShareId(): string {
  const existing = window.localStorage.getItem(SHARE_ID_KEY);
  if (existing) return existing;

  const created = generateShareId();
  window.localStorage.setItem(SHARE_ID_KEY, created);
  return created;
}

type ToolbarProps = {
  backHref?: string;
  backLabel?: string;
};

export default function Toolbar({ backHref, backLabel }: ToolbarProps = {}) {
  const { nodes } = useBuilderContext();
  const [jsonOpen, setJsonOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // The full shareable link, e.g. "https://yourapp.com/preview?form=ab12cd34".
  // null = nothing has been saved/shared yet, so the Link button isn't shown.
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [linkPanelOpen, setLinkPanelOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const linkWrapperRef = useRef<HTMLDivElement>(null);

  // On first load, if this form was already saved/shared in a previous
  // visit, show the Link button right away instead of making the admin
  // click Save again just to see it.
  useEffect(() => {
    const existing = window.localStorage.getItem(SHARE_ID_KEY);
    if (existing) {
      setShareLink(`${window.location.origin}/form-preview?form=${existing}`);
    }
  }, []);

  // Close the link popover if you click anywhere outside of it —
  // same pattern used by DateField/SelectField's dropdowns.
  useEffect(() => {
    if (!linkPanelOpen) return;
    function handleOutsideClick(event: MouseEvent) {
      if (linkWrapperRef.current && !linkWrapperRef.current.contains(event.target as Node)) {
        setLinkPanelOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [linkPanelOpen]);

  function handleCopy() {
    navigator.clipboard.writeText(JSON.stringify(nodes, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  // Runs when the admin clicks "Save". For now this just generates
  // (or reuses) a share ID and immediately shows the link — there's no
  // real save-to-database happening yet, since the backend doesn't
  // exist. The canvas itself is already being saved to localStorage
  // continuously by useBuilder, so nothing is actually lost either way.
  function handleSave() {
    const id = getOrCreateShareId();
    const link = `${window.location.origin}/form-preview?form=${id}`;
    setShareLink(link);
    setLinkPanelOpen(true);
  }

  function handleCopyLink() {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1500);
  }

  return (
    <div className={styles.toolbar}>
      <div className={styles.title}>Form Builder</div>

      <div className={styles.actions}>
        <button type="button" onClick={() => setJsonOpen(true)}>
          {"</>"} View JSON
        </button>

        {backHref ? (
          <Link href={backHref}>← {backLabel ?? "Back"}</Link>
        ) : (
          <Link href="/form-preview" target="_blank" rel="noopener noreferrer">
            Preview
          </Link>
        )}

        {/* Link button only shows up once a share link actually exists
            (either from clicking Save just now, or from a previous
            visit). Clicking it just reopens the same popover Save
            opens — it doesn't generate a new link. */}
        {shareLink && (
          <div className={styles.linkWrapper} ref={linkWrapperRef}>
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => setLinkPanelOpen((previous) => !previous)}
            >
              <Link2 size={15} />
              Link
            </button>

            {linkPanelOpen && (
              <div className={styles.linkPanel}>
                <p className={styles.linkPanelLabel}>Shareable link</p>
                <div className={styles.linkRow}>
                  <input
                    type="text"
                    className={styles.linkInput}
                    value={shareLink}
                    readOnly
                    onFocus={(event) => event.target.select()}
                  />
                  <button type="button" className={styles.linkCopyButton} onClick={handleCopyLink}>
                    {linkCopied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
                <p className={styles.linkPanelHint}>
                  This link is generated locally for now — once the backend is connected,
                  it will point to the real saved form.
                </p>
              </div>
            )}
          </div>
        )}

        <button type="button" onClick={handleSave}>Save</button>
      </div>

      {jsonOpen && (
        <div className={styles.jsonOverlay} onClick={() => setJsonOpen(false)}>
          <div className={styles.jsonModal} onClick={(event) => event.stopPropagation()}>
            <div className={styles.jsonHeader}>
              <h3>Form Schema (JSON)</h3>
              <button type="button" onClick={() => setJsonOpen(false)}>✕</button>
            </div>
            <pre className={styles.jsonBody}>
              {JSON.stringify(nodes, null, 2)}
            </pre>
            <div className={styles.jsonFooter}>
              <button type="button" onClick={handleCopy}>
                {copied ? "Copied!" : "Copy JSON"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}