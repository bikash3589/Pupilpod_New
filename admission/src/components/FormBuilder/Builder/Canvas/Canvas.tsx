
// "use client";

// import styles from "./Canvas.module.css";

// import { useBuilderContext } from "@/context/form-builder/BuilderContext";
// import CanvasItem from "./CanvasItem";
// import LayoutRenderer from "./LayoutRenderer";
// import FieldRenderer from "@/components/FormBuilder/Fields/FieldRenderer";
// import Column from "@/components/FormBuilder/Layouts/Column";
// import { CanvasNode, LayoutType } from "@/types/form-builder/field";

// const layoutTypes: LayoutType[] = [
//   "header", "section", "container", "divider", "spacer",
//   "grid-1", "grid-2", "grid-3", "grid-4",
// ];

// const gridTypes = new Set<LayoutType>(["grid-1", "grid-2", "grid-3", "grid-4"]);
// export default function Canvas() {
//   const {
//     fields,
//     addField,
//     addFieldToParent,
//     deleteField,
//     selectField,
//     selectedFieldId,
//     moveNode,
//     moveNodeUp,
//     moveNodeDown,
//     resizeGridColumns,
//     resizeNode,
//     updateNode,
//   } = useBuilderContext();

//   function dropInto(event: React.DragEvent<HTMLElement>, parentId: string | null) {
//     event.preventDefault();
//     event.stopPropagation();

//     const movingId = event.dataTransfer.getData("canvasNodeId");
//     if (movingId) {
//       moveNode(movingId, parentId);
//       return;
//     }

//     const templateId = event.dataTransfer.getData("templateId");
//     if (!templateId) return;
//     if (parentId) addFieldToParent(templateId, parentId);
//     else addField(templateId);
//   }

//   // `nextSiblingId` is the id of whichever field comes right after this
//   // one, at the same nesting level. CanvasItem needs this to correctly
//   // support "drop in the bottom half of this card = insert after it".
//   function renderNode(node: CanvasNode, nextSiblingId?: string): React.ReactNode {
//      const showReorderArrows = node.type === "email";
//     const isLayout = layoutTypes.includes(node.type as LayoutType);
//     const isGrid = gridTypes.has(node.type as LayoutType);
//     const children = fields.filter((item) => item.parentId === node.id);
//     const gridTemplateColumns = isGrid
//       ? children
//         .map((column) => `minmax(0, ${Math.max(2, column.width)}fr)`)
//         .join(" ")
//       : undefined;

//     let content: React.ReactNode;
//     if (isGrid) {
//       const columns = children.map((column, index) => {
//         const nextColumn = children[index + 1];
//         const columnChildren = fields.filter((item) => item.parentId === column.id);

//         return (
//           <Column
//             key={column.id}
//             gridColumn="auto"
//             onDragOver={(event) => event.preventDefault()}
//             onDrop={(event) => dropInto(event, column.id)}
//             onResizeStart={nextColumn ? (event) => {
//               event.preventDefault();
//               event.stopPropagation();
//               const row = event.currentTarget.closest("[data-grid-row]");
//               const rowWidth = row?.getBoundingClientRect().width ?? 1;
//               const startX = event.clientX;
//               let appliedUnits = 0;

//               const onMove = (moveEvent: PointerEvent) => {
//                 const units = Math.round(((moveEvent.clientX - startX) / rowWidth) * 12);
//                 const change = units - appliedUnits;
//                 if (change) {
//                   resizeGridColumns(column.id, nextColumn.id, change);
//                   appliedUnits = units;
//                 }
//               };
//               const onEnd = () => {
//                 window.removeEventListener("pointermove", onMove);
//                 window.removeEventListener("pointerup", onEnd);
//               };
//               window.addEventListener("pointermove", onMove);
//               window.addEventListener("pointerup", onEnd);
//             } : undefined}
//           >
//             {columnChildren.map((child, index, arr) =>
//               renderNode(child, arr[index + 1]?.id)
//             )}
//           </Column>
//         );
//       });

//       content = (
//         <LayoutRenderer
//           node={node}
//           selected={selectedFieldId === node.id}
//           onSelect={selectField}
//           onDropNode={dropInto}
//           onUpdateNode={updateNode}
//           gridTemplateColumns={gridTemplateColumns}
//         >
//           {columns}
//         </LayoutRenderer>
//       );
//     } else if (isLayout) {
//       content = (
//         <LayoutRenderer
//           node={node}
//           selected={selectedFieldId === node.id}
//           onSelect={selectField}
//           onDropNode={dropInto}
//           onUpdateNode={updateNode}
//           gridTemplateColumns={gridTemplateColumns}
//         >
//           {children.map((child, index, arr) =>
//             renderNode(child, arr[index + 1]?.id)
//           )}
//         </LayoutRenderer>
//       );
//     } else {
//       content = (
//         <FieldRenderer
//           field={node}
//           onUpdateNode={updateNode}
//         />
//       );
//     }

//     return (
//       <CanvasItem
//         key={node.id}
//         id={node.id}
//         parentId={node.parentId}
//         selected={selectedFieldId === node.id}
//         onSelect={selectField}
//         onDelete={deleteField}
//         onMove={moveNode}
//     // onMoveUp={showReorderArrows ? () => moveNodeUp(node.id) : undefined}
//     //     onMoveDown={showReorderArrows ? () => moveNodeDown(node.id) : undefined}
//      onMoveUp={showReorderArrows ? () => moveNodeUp(node.id) : undefined}
//         onMoveDown={showReorderArrows ? () => moveNodeDown(node.id) : undefined}
//         width={node.width}
//         height={node.height}
//         square={isGrid}
//         spacer={node.type === "spacer"}
//         onResize={resizeNode}
//         nextSiblingId={nextSiblingId}
//       >
//         {content}
//       </CanvasItem>
//     );
//   }

//   const rootNodes = fields.filter((node) => node.parentId === null);

//   return (
//     <div
//       className={styles.canvas}
//       data-canvas-root
//       onDragOver={(event) => {
//         event.preventDefault();
//         event.dataTransfer.dropEffect = Array.from(event.dataTransfer.types)
//           .includes("canvasnodeid")
//           ? "move"
//           : "copy";
//       }}
//       onDrop={(event) => {// first function which triggered 
//         event.preventDefault();

//         const movingId = event.dataTransfer.getData("canvasNodeId");
//         if (movingId) {
//           moveNode(movingId, null);
//           return;
//         }

//         const templateId = event.dataTransfer.getData("templateId");
//         if (!templateId) return;
//         addField(templateId);
//       }}
//     >
//       {rootNodes.length > 0 && (
//         <div className={styles.designModeBanner}>
//           <span className={styles.designModeLock}>🔒</span>
//           <span className={styles.designModeText}>
//             <strong>Design Mode</strong> — Input fields are locked.
//             Click <strong>Preview</strong> in the toolbar to test form validations.
//           </span>
//         </div>
//       )}
//       {rootNodes.length === 0 ? (
//         <div className={styles.empty}>Drag fields or layouts here</div>
//       ) : (
//         rootNodes.map((node, index, arr) => renderNode(node, arr[index + 1]?.id))
//       )}
//     </div>
//   );
// }
"use client";

import styles from "./Canvas.module.css";

import { useBuilderContext } from "@/context/form-builder/BuilderContext";
import CanvasItem from "./CanvasItem";
import LayoutRenderer from "./LayoutRenderer";
import FieldRenderer from "@/components/FormBuilder/Fields/FieldRenderer";
import Column from "@/components/FormBuilder/Layouts/Column";
import { CanvasNode, LayoutType } from "@/types/form-builder/field";

const layoutTypes: LayoutType[] = [
  "header", "section", "container", "divider", "spacer",
  "grid-1", "grid-2", "grid-3", "grid-4",
];

const gridTypes = new Set<LayoutType>(["grid-1", "grid-2", "grid-3", "grid-4"]);

export default function Canvas() {
  const {
    fields,
    addField,
    addFieldToParent,
    deleteField,
    selectField,
    selectedFieldId,
    moveNode,
    moveNodeUp,
    moveNodeDown,
    resizeGridColumns,
    resizeNode,
    updateNode,
  } = useBuilderContext();

  function dropInto(event: React.DragEvent<HTMLElement>, parentId: string | null) {
    event.preventDefault();
    event.stopPropagation();

    const movingId = event.dataTransfer.getData("canvasNodeId");
    if (movingId) {
      moveNode(movingId, parentId);
      return;
    }

    const templateId = event.dataTransfer.getData("templateId");
    if (!templateId) return;
    if (parentId) addFieldToParent(templateId, parentId);
    else addField(templateId);
  }

  // `nextSiblingId` is the id of whichever field comes right after this
  // one, at the same nesting level. CanvasItem needs this to correctly
  // support "drop in the bottom half of this card = insert after it".
  function renderNode(node: CanvasNode, nextSiblingId?: string): React.ReactNode {
    const isLayout = layoutTypes.includes(node.type as LayoutType);
    const isGrid = gridTypes.has(node.type as LayoutType);
    const children = fields.filter((item) => item.parentId === node.id);
    const gridTemplateColumns = isGrid
      ? children
        .map((column) => `minmax(0, ${Math.max(2, column.width)}fr)`)
        .join(" ")
      : undefined;

    let content: React.ReactNode;
    if (isGrid) {
      const columns = children.map((column, index) => {
        const nextColumn = children[index + 1];
        const columnChildren = fields.filter((item) => item.parentId === column.id);

        return (
          <Column
            key={column.id}
            gridColumn="auto"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => dropInto(event, column.id)}
            onResizeStart={nextColumn ? (event) => {
              event.preventDefault();
              event.stopPropagation();
              const row = event.currentTarget.closest("[data-grid-row]");
              const rowWidth = row?.getBoundingClientRect().width ?? 1;
              const startX = event.clientX;
              let appliedUnits = 0;

              const onMove = (moveEvent: PointerEvent) => {
                const units = Math.round(((moveEvent.clientX - startX) / rowWidth) * 12);
                const change = units - appliedUnits;
                if (change) {
                  resizeGridColumns(column.id, nextColumn.id, change);
                  appliedUnits = units;
                }
              };
              const onEnd = () => {
                window.removeEventListener("pointermove", onMove);
                window.removeEventListener("pointerup", onEnd);
              };
              window.addEventListener("pointermove", onMove);
              window.addEventListener("pointerup", onEnd);
            } : undefined}
          >
            {columnChildren.map((child, index, arr) =>
              renderNode(child, arr[index + 1]?.id)
            )}
          </Column>
        );
      });

      content = (
        <LayoutRenderer
          node={node}
          selected={selectedFieldId === node.id}
          onSelect={selectField}
          onDropNode={dropInto}
          onUpdateNode={updateNode}
          gridTemplateColumns={gridTemplateColumns}
        >
          {columns}
        </LayoutRenderer>
      );
    } else if (isLayout) {
      content = (
        <LayoutRenderer
          node={node}
          selected={selectedFieldId === node.id}
          onSelect={selectField}
          onDropNode={dropInto}
          onUpdateNode={updateNode}
          gridTemplateColumns={gridTemplateColumns}
        >
          {children.map((child, index, arr) =>
            renderNode(child, arr[index + 1]?.id)
          )}
        </LayoutRenderer>
      );
    } else {
      content = (
        <FieldRenderer
          field={node}
          onUpdateNode={updateNode}
        />
      );
    }

    return (
      <CanvasItem
        key={node.id}
        id={node.id}
        parentId={node.parentId}
        selected={selectedFieldId === node.id}
        onSelect={selectField}
        onDelete={deleteField}
        onMove={moveNode}
        // Enabled for every field/layout now — no more type check here.
        onMoveUp={() => moveNodeUp(node.id)}
        onMoveDown={() => moveNodeDown(node.id)}
        width={node.width}
        height={node.height}
        square={isGrid}
        spacer={node.type === "spacer"}
        onResize={resizeNode}
        nextSiblingId={nextSiblingId}
      >
        {content}
      </CanvasItem>
    );
  }

  const rootNodes = fields.filter((node) => node.parentId === null);

  return (
    <div
      className={styles.canvas}
      data-canvas-root
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = Array.from(event.dataTransfer.types)
          .includes("canvasnodeid")
          ? "move"
          : "copy";
      }}
      onDrop={(event) => {
        event.preventDefault();

        const movingId = event.dataTransfer.getData("canvasNodeId");
        if (movingId) {
          moveNode(movingId, null);
          return;
        }

        const templateId = event.dataTransfer.getData("templateId");
        if (!templateId) return;
        addField(templateId);
      }}
    >
      {rootNodes.length > 0 && (
        <div className={styles.designModeBanner}>
          <span className={styles.designModeLock}>🔒</span>
          <span className={styles.designModeText}>
            <strong>Design Mode</strong> — Input fields are locked.
            Click <strong>Preview</strong> in the toolbar to test form validations.
          </span>
        </div>
      )}
      {rootNodes.length === 0 ? (
        <div className={styles.empty}>Drag fields or layouts here</div>
      ) : (
        rootNodes.map((node, index, arr) => renderNode(node, arr[index + 1]?.id))
      )}
    </div>
  );
}