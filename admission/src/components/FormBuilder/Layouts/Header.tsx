// "use client";

// import styles from "./Layout.module.css";

// interface HeaderProps {
//   title?: string;
//   description?: string;
// }

// export default function Header({
//   title = "Application Form",
//   description = "Please fill all required fields before submitting.",
// }: HeaderProps) {
//   return (
//     <div className={`${styles.layout} ${styles.header}`}>
//       <h1 className={styles.headerTitle}>
//         {title}
//       </h1>

//       <p className={styles.headerDescription}>
//         {description}
//       </p>
//     </div>
//   );
// }



//Very Updated Code Here 
// "use client";
// import { useRef } from "react";
// import styles from "./Layout.module.css";
// // const MAX_LOGO_BYTES = 5 * 1024 * 1024; // 5MB
// const MAX_LOGO_BYTES = 5 * 1024 * 1024; // 5MB
// interface HeaderProps {
//   title?: string;
//   description?: string;
//   onTitleChange?: (value: string) => void;
//   onDescriptionChange?: (value: string) => void;
//   // logoUrl?: string;
//   //  onLogoChange?: (dataUrl: string) => void;
//   logoUrl?: string;
//    onLogoChange?: (dataUrl: string) => void;
// }

// export default function Header({
//   title = "Application Form",
//   description = "Please fill all required fields before submitting.",
//   // // logoUrl,
//   // onLogoChange,
//   logoUrl,
//   onTitleChange,
//   onDescriptionChange,
//   onLogoChange,
// }: HeaderProps) {
//   return (
//     <div className={`${styles.layout} ${styles.header}`}>
//       <input
//         type="text"
//         className={styles.headerTitle}
//         value={title}
//         onChange={(event) => onTitleChange?.(event.target.value)}
//         placeholder="Form title"
//         data-no-drag
//       />

//       <textarea
//         className={styles.headerDescription}
//         value={description}
//         onChange={(event) => onDescriptionChange?.(event.target.value)}
//         placeholder="Add a description (optional)"
//         rows={2}
//         data-no-drag
//       />
//     </div>
//   );
// }


//Latest Updated code 17/07/2026 

/*
"use client";

import { useRef } from "react";
import styles from "./Layout.module.css";

const MAX_LOGO_BYTES = 5 * 1024 * 1024; // 5MB

interface HeaderProps {
  title?: string;
  description?: string;
  logoUrl?: string;
  onTitleChange?: (value: string) => void;
  onDescriptionChange?: (value: string) => void;
  onLogoChange?: (dataUrl: string) => void;
}

export default function Header({
  title = "Application Form",
  description = "Please fill all required fields before submitting.",
  logoUrl,
  onTitleChange,
  onDescriptionChange,
  onLogoChange,
}: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    // if (file.size > MAX_LOGO_BYTES) {
    //   alert("Logo must be 5MB or smaller.");
    //   return;
    // }

    const MAX_LOGO_BYTES = 5 * 1024 * 1024; // 5MB

if (file.size > MAX_LOGO_BYTES) {
  alert("Logo must be 5MB or smaller.");
  return;
}

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onLogoChange?.(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className={`${styles.layout} ${styles.header}`}>
      <button
        type="button"
        className={styles.logoButton}
        onClick={() => fileInputRef.current?.click()}
        title={logoUrl ? "Change logo" : "Upload logo"}
        data-no-drag
      >
        {logoUrl ? (
          <img src={logoUrl} alt="Form logo" className={styles.logoImage} />
        ) : (
          <span className={styles.logoPlaceholder} aria-hidden="true">🖼</span>
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className={styles.logoInput}
        onChange={handleFileSelect}
        data-no-drag
      />

      <input
        type="text"
        className={styles.headerTitle}
        value={title}
        onChange={(event) => onTitleChange?.(event.target.value)}
        placeholder="Form title"
        data-no-drag
      />

      <textarea
        className={styles.headerDescription}
        value={description}
        onChange={(event) => onDescriptionChange?.(event.target.value)}
        placeholder="Add a description (optional)"
        rows={2}
        data-no-drag
      />
    </div>
  );
} */

"use client";

import { useRef } from "react";
import styles from "./Layout.module.css";

const MAX_LOGO_BYTES = 5 * 1024 * 1024; // 5MB
const MIN_LOGO_SIZE = 32;
const MAX_LOGO_SIZE = 200;

interface HeaderProps {
  title?: string;
  description?: string;
  logoUrl?: string;
  logoPosition?: { x: number; y: number };
  logoSize?: number;
   onLogoRemove?: () => void;   // ← new
  onTitleChange?: (value: string) => void;
  onDescriptionChange?: (value: string) => void;
  onLogoChange?: (dataUrl: string) => void;
  onLogoPositionChange?: (position: { x: number; y: number }) => void;
  onLogoSizeChange?: (size: number) => void;
}

export default function Header({
  title = "Application Form",
  description = "Please fill all required fields before submitting.",
  logoUrl,
  logoPosition = { x: 20, y: 20 },
  logoSize = 64,
  onTitleChange,
  onDescriptionChange,
  onLogoChange,
  onLogoPositionChange,
  onLogoSizeChange,
   onLogoRemove,   // ← new
}: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      alert("Logo must be 5MB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onLogoChange?.(reader.result);
    };
    reader.readAsDataURL(file);
  }

  // Lets the admin drag the logo anywhere inside the header box.
  function startLogoDrag(event: React.PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    const headerEl = headerRef.current;
    if (!headerEl) return;

    const headerRect = headerEl.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const startLeft = logoPosition.x;
    const startTop = logoPosition.y;

    function onMove(moveEvent: PointerEvent) {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      const nextX = Math.max(0, Math.min(headerRect.width - logoSize, startLeft + deltaX));
      const nextY = Math.max(0, Math.min(headerRect.height - logoSize, startTop + deltaY));
      onLogoPositionChange?.({ x: Math.round(nextX), y: Math.round(nextY) });
    }
    function onEnd() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
  }

  // Lets the admin drag a corner handle to make the logo bigger/smaller.
  function startLogoResize(event: React.PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startSize = logoSize;

    function onMove(moveEvent: PointerEvent) {
      const delta = moveEvent.clientX - startX;
      const nextSize = Math.max(MIN_LOGO_SIZE, Math.min(MAX_LOGO_SIZE, startSize + delta));
      onLogoSizeChange?.(Math.round(nextSize));
    }
    function onEnd() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
  }

  return (
    <div ref={headerRef} className={`${styles.layout} ${styles.header}`} data-no-drag>
      {/* Logo box — draggable anywhere inside the header, resizable via its corner handle */}
      <div
        className={styles.logoBox}
        style={{ left: logoPosition.x, top: logoPosition.y, width: logoSize, height: logoSize }}
        onPointerDown={logoUrl ? startLogoDrag : undefined}
        data-no-drag
      >
        {logoUrl ? (
          <>
            <img src={logoUrl} alt="Form logo" className={styles.logoImage} />
            <button
              type="button"
              className={styles.logoChangeButton}
              onClick={(event) => { event.stopPropagation(); fileInputRef.current?.click(); }}
              title="Change logo"
            >
              ✎
            </button>

             {/* NEW: delete button */}
            <button
              type="button"
              className={styles.logoDeleteButton}
              onClick={(event) => { event.stopPropagation(); onLogoRemove?.(); }}
              title="Remove logo"
            >
              ✕
            </button>

            <button
              type="button"
              className={styles.logoResizeHandle}
              onPointerDown={startLogoResize}
              title="Drag to resize"
            />
          </>
        ) : (
          <button
            type="button"
            className={styles.logoUploadButton}
            onClick={() => fileInputRef.current?.click()}
            title="Upload logo"
          >
            🖼
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className={styles.logoInput}
        onChange={handleFileSelect}
        data-no-drag
      />

      <div className={styles.headerTextArea}>
        <input
          type="text"
          className={styles.headerTitle}
          value={title}
          onChange={(event) => onTitleChange?.(event.target.value)}
          placeholder="Form title"
          data-no-drag
        />
        <textarea
          className={styles.headerDescription}
          value={description}
          onChange={(event) => onDescriptionChange?.(event.target.value)}
          placeholder="Add a description (optional)"
          rows={2}
          data-no-drag
        />
      </div>
    </div>
  );
}