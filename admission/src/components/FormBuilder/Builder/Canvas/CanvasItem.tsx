// "use client";

// import { ReactNode, useState } from "react";

// import styles from "./CanvasItem.module.css";

// interface CanvasItemProps {
//   id: string;
//   selected: boolean;
//   children: ReactNode;
//   onSelect: (id: string | null) => void;
//   onDelete: (id: string) => void;
//   parentId: string | null;
//   onMove: (id: string, parentId: string | null, beforeId?: string) => void;
//   onMoveUp?: () => void;
// onMoveDown?: () => void;
//   width: number;
//   height: number | "auto";
//   square?: boolean;
//   spacer?: boolean;
//   onResize: (id: string, width: number, height: number) => void;
//   // NEW: the id of whichever field comes right after this one in the
//   // list. We need this so that dropping something in the BOTTOM half
//   // of this card can correctly insert it "after me" instead of always
//   // "before me".
//   nextSiblingId?: string;
// }

// export default function CanvasItem({
//   id,
//   selected,
//   children,
//   onSelect,
//   onDelete,
//   parentId,
// onMoveUp,
//     onMoveDown,
//   onMove,
//   width,
//   height,
//   square = false,
//   spacer = false,
//   onResize,
//   nextSiblingId,
// }: CanvasItemProps) {
//   // Instead of a plain true/false, this now tracks WHICH half of the
//   // card is being hovered over during a drag: "before" (top half) or
//   // "after" (bottom half) — or null when nothing is being dragged over it.
//   const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(null);

//   function startResize(event: React.PointerEvent<HTMLButtonElement>) {
//     event.preventDefault();
//     event.stopPropagation();

//     const item = event.currentTarget.parentElement;
//     const parent = item?.parentElement;
//     if (!item || !parent) return;

//     const itemRect = item.getBoundingClientRect();
//     const parentRect = parent.getBoundingClientRect();
//     const startX = event.clientX;
//     const startY = event.clientY;
//     const startWidth = itemRect.width;
//     const startHeight = itemRect.height;

//     const onMove = (moveEvent: PointerEvent) => {
//       const nextWidth = Math.max(
//         20,
//         Math.min(100, ((startWidth + moveEvent.clientX - startX) / parentRect.width) * 100)
//       );
//       const nextHeight = Math.max(80, startHeight + moveEvent.clientY - startY);
//       onResize(id, Math.round(nextWidth), Math.round(nextHeight));
//     };
//     const onEnd = () => {
//       window.removeEventListener("pointermove", onMove);
//       window.removeEventListener("pointerup", onEnd);
//     };

//     window.addEventListener("pointermove", onMove);
//     window.addEventListener("pointerup", onEnd);
//   }

//   // Lets the admin drag the whole field to reorder it — grabbing
//   // anywhere on the card, not just a tiny icon. If the drag actually
//   // started on something interactive (an input, a button, an option
//   // text box, etc.), we cancel the drag so typing/clicking still works
//   // completely normally.
//   function handleDragStart(event: React.DragEvent<HTMLDivElement>) {
//     const startedOnInteractiveElement =
//       event.target instanceof Element &&
//       event.target.closest(
//         "button, input, textarea, select, option, a, [data-no-drag]"
//       );

//     if (startedOnInteractiveElement) {
//       event.preventDefault();
//       return;
//     }

//     event.dataTransfer.setData("canvasNodeId", id);
//     event.dataTransfer.effectAllowed = "move";
//   }

//   // Works out whether the cursor is currently over the top half or
//   // bottom half of this card.
//   function getHoverPosition(event: React.DragEvent<HTMLDivElement>): "before" | "after" {
//     const rect = event.currentTarget.getBoundingClientRect();
//     const isAfter = event.clientY > rect.top + rect.height / 2;
//     return isAfter ? "after" : "before";
//   }

//   return (
//     <div
//       className={`${styles.item} ${
//         selected ? styles.selected : ""
//       } ${square ? styles.square : ""} ${
//         spacer ? styles.spacerItem : ""
//       } ${dropPosition === "before" ? styles.dropBefore : ""} ${
//         dropPosition === "after" ? styles.dropAfter : ""
//       }`}
//       data-canvas-item={id}
//       data-parent-id={parentId ?? ""}
//       onClick={() => onSelect(id)}
//       draggable
//       onDragStart={handleDragStart}
//       onDragOver={(event) => {
//         if (Array.from(event.dataTransfer.types).includes("canvasnodeid")) {
//           event.preventDefault();
//           event.stopPropagation();
//           event.dataTransfer.dropEffect = "move";
//           setDropPosition(getHoverPosition(event));
//         }
//       }}
//       onDragLeave={() => setDropPosition(null)}
//       onDrop={(event) => {
//         const movingId = event.dataTransfer.getData("canvasNodeId");
//         if (!movingId) {
//           setDropPosition(null);
//           return;
//         }
//         event.preventDefault();
//         event.stopPropagation();

//         const position = getHoverPosition(event);
//         setDropPosition(null);

//         // Top half -> insert right before ME.
//         // Bottom half -> insert right before whoever comes after me
//         // (which is the same thing as "right after me"). If I'm the
//         // last item, nextSiblingId is undefined, which correctly means
//         // "just put it at the very end".
//         const targetBeforeId = position === "before" ? id : nextSiblingId;
//         onMove(movingId, parentId, targetBeforeId);
//       }}
//       style={{
//         width: parentId === null ? "100%" : `${Math.max(20, Math.min(100, width))}%`,
//         height: height === "auto" ? undefined : height,
//         minHeight: height === "auto" ? undefined : height,
//       }}
//     >
//       {/* Toolbar */}
//       {/* <div className={styles.toolbar}>
//         <button
//           type="button"
//           className={styles.iconButton}
//           title="Duplicate"
//         >
//           ⧉
//         </button>

//         <button
//           type="button"
//           className={styles.iconButton}
//           title="Delete"
//           onClick={(event) => {
//             event.stopPropagation();
//             onDelete(id);
//           }}
//         >
//           🗑
//         </button>
//       </div> */}
//       {/* Toolbar */}
// <div className={styles.toolbar}>
//   {onMoveUp && (
//     <button
//       type="button"
//       className={styles.iconButton}
//       title="Move up"
//       onClick={(event) => {
//         event.stopPropagation();
//         onMoveUp();
//       }}
//     >
//       ▲
//     </button>
//   )}

//   {onMoveDown && (
//     <button
//       type="button"
//       className={styles.iconButton}
//       title="Move down"
//       onClick={(event) => {
//         event.stopPropagation();
//         onMoveDown();
//       }}
//     >
//       ▼
//     </button>
//   )}

//   <button
//     type="button"
//     className={styles.iconButton}
//     title="Duplicate"
//   >
//     ⧉
//   </button>

//   <button
//     type="button"
//     className={styles.iconButton}
//     title="Delete"
//     onClick={(event) => {
//       event.stopPropagation();
//       onDelete(id);
//     }}
//   >
//     🗑
//   </button>
// </div>

//       {/* Content */}
//       <div className={styles.content}>
//         {children}
//       </div>

//       <button
//         type="button"
//         className={styles.resizeHandle}
//         aria-label="Resize item"
//         title="Drag to resize"
//         onPointerDown={startResize}
//       />
//     </div>
//   );
// }


"use client";

import { ReactNode, useState } from "react";
import { ChevronUp, ChevronDown, Copy, Trash2 } from "lucide-react";

import styles from "./CanvasItem.module.css";

interface CanvasItemProps {
  id: string;
  selected: boolean;
  children: ReactNode;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
  parentId: string | null;
  onMove: (id: string, parentId: string | null, beforeId?: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  width: number;
  height: number | "auto";
  square?: boolean;
  spacer?: boolean;
  onResize: (id: string, width: number, height: number) => void;
  nextSiblingId?: string;
}

export default function CanvasItem({
  id,
  selected,
  children,
  onSelect,
  onDelete,
  parentId,
  onMoveUp,
  onMoveDown,
  onMove,
  width,
  height,
  square = false,
  spacer = false,
  onResize,
  nextSiblingId,
}: CanvasItemProps) {
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(null);

  function startResize(event: React.PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    const item = event.currentTarget.parentElement;
    const parent = item?.parentElement;
    if (!item || !parent) return;

    const itemRect = item.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = itemRect.width;
    const startHeight = itemRect.height;

    const onMoveResize = (moveEvent: PointerEvent) => {
      const nextWidth = Math.max(
        20,
        Math.min(100, ((startWidth + moveEvent.clientX - startX) / parentRect.width) * 100)
      );
      const nextHeight = Math.max(80, startHeight + moveEvent.clientY - startY);
      onResize(id, Math.round(nextWidth), Math.round(nextHeight));
    };
    const onEnd = () => {
      window.removeEventListener("pointermove", onMoveResize);
      window.removeEventListener("pointerup", onEnd);
    };

    window.addEventListener("pointermove", onMoveResize);
    window.addEventListener("pointerup", onEnd);
  }

  function handleDragStart(event: React.DragEvent<HTMLDivElement>) {
    const startedOnInteractiveElement =
      event.target instanceof Element &&
      event.target.closest(
        "button, input, textarea, select, option, a, [data-no-drag]"
      );

    if (startedOnInteractiveElement) {
      event.preventDefault();
      return;
    }

    event.dataTransfer.setData("canvasNodeId", id);
    event.dataTransfer.effectAllowed = "move";
  }

  function getHoverPosition(event: React.DragEvent<HTMLDivElement>): "before" | "after" {
    const rect = event.currentTarget.getBoundingClientRect();
    const isAfter = event.clientY > rect.top + rect.height / 2;
    return isAfter ? "after" : "before";
  }

  return (
    <div
      className={`${styles.item} ${
        selected ? styles.selected : ""
      } ${square ? styles.square : ""} ${
        spacer ? styles.spacerItem : ""
      } ${dropPosition === "before" ? styles.dropBefore : ""} ${
        dropPosition === "after" ? styles.dropAfter : ""
      }`}
      data-canvas-item={id}
      data-parent-id={parentId ?? ""}
      onClick={() => onSelect(id)}
      draggable
      onDragStart={handleDragStart}
      onDragOver={(event) => {
        if (Array.from(event.dataTransfer.types).includes("canvasnodeid")) {
          event.preventDefault();
          event.stopPropagation();
          event.dataTransfer.dropEffect = "move";
          setDropPosition(getHoverPosition(event));
        }
      }}
      onDragLeave={() => setDropPosition(null)}
      onDrop={(event) => {
        const movingId = event.dataTransfer.getData("canvasNodeId");
        if (!movingId) {
          setDropPosition(null);
          return;
        }
        event.preventDefault();
        event.stopPropagation();

        const position = getHoverPosition(event);
        setDropPosition(null);

        const targetBeforeId = position === "before" ? id : nextSiblingId;
        onMove(movingId, parentId, targetBeforeId);
      }}
      style={{
        width: parentId === null ? "100%" : `${Math.max(20, Math.min(100, width))}%`,
        height: height === "auto" ? undefined : height,
        minHeight: height === "auto" ? undefined : height,
      }}
    >
      {/* Toolbar */}
      <div className={styles.toolbar}>
        {onMoveUp && (
          <button
            type="button"
            className={styles.iconButton}
            title="Move up"
            onClick={(event) => {
              event.stopPropagation();
              onMoveUp();
            }}
          >
            <ChevronUp size={15} />
          </button>
        )}

        {onMoveDown && (
          <button
            type="button"
            className={styles.iconButton}
            title="Move down"
            onClick={(event) => {
              event.stopPropagation();
              onMoveDown();
            }}
          >
            <ChevronDown size={15} />
          </button>
        )}

        <button
          type="button"
          className={styles.iconButton}
          title="Duplicate"
        >
          <Copy size={14} />
        </button>

        <button
          type="button"
          className={styles.iconButtonDanger}
          title="Delete"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(id);
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {children}
      </div>

      <button
        type="button"
        className={styles.resizeHandle}
        aria-label="Resize item"
        title="Drag to resize"
        onPointerDown={startResize}
      />
    </div>
  );
}