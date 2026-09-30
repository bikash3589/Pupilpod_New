"use client";

import { useEffect, useState } from "react";

import { defaultTemplates } from "@/data/form-builder/defaultTemplates";
import { defaultLayouts } from "@/data/form-builder/defaultLayouts";

import {
  CanvasNode,
  CanvasNodeType,
} from "@/types/form-builder/field";

const DEFAULT_SPACER_HEIGHT = 32;

const DEFAULT_CANVAS_KEY = "formbuilder-canvas";

export default function useBuilder(storageKey: string = DEFAULT_CANVAS_KEY) {
//   const [templates, setTemplates] = useState(defaultTemplates);
//   // const [templatesLoaded, setTemplatesLoaded] = useState(false);

// We always start with the 9 built-in fields (Text, Email, etc).
const [templates, setTemplates] = useState(defaultTemplates);

// This keeps track of whether we've already tried loading saved
// custom fields from the browser. We need this so we don't
// accidentally save an empty list before we've had a chance to load.
const [templatesLoaded, setTemplatesLoaded] = useState(false);

// STEP A: When the app first opens, check if the browser remembers
// any custom fields the admin made before, and add them back in.


useEffect(() => {
  try {
    const saved = window.localStorage.getItem("formbuilder-custom-templates");
    if (saved) {
      const customTemplates = JSON.parse(saved);
      setTemplates((previous) => [...previous, ...customTemplates]);
    }
  } catch {
    // if something went wrong reading it, just ignore and move on
  }
  setTemplatesLoaded(true);
}, []);

// STEP B: Every time the list of templates changes, save only the
// CUSTOM ones (not the built-in 9) back to the browser, so they're
// still there next time.
useEffect(() => {
  if (!templatesLoaded) return; // wait until Step A has finished first
  const customOnly = templates.filter((template) => !template.builtIn);
  window.localStorage.setItem("formbuilder-custom-templates", JSON.stringify(customOnly));
}, [templates, templatesLoaded]);









//   const [templatesLoaded, setTemplatesLoaded] = useState(false);
  const [layouts] = useState(defaultLayouts);

  /* First version of the Toolbar Preview
  const [nodes, setNodes] = useState<CanvasNode[]>([]);

  useEffect(() => {
    window.localStorage.setItem("formbuilder-canvas", JSON.stringify(nodes));
  }, [nodes]);*/ 
const [nodes, setNodes] = useState<CanvasNode[]>([]);
const [hasLoaded, setHasLoaded] = useState(false);

// Runs only in the browser, after hydration — server and first client
// render both start from [], so there is no mismatch.
useEffect(() => {
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) setNodes(JSON.parse(saved) as CanvasNode[]);
  } catch {
    // ignore corrupt data
  } finally {
    setHasLoaded(true);
  }
  // storageKey is fixed for the lifetime of a given BuilderProvider mount
  // (it remounts per page/campaign), so this only needs to run once.
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

useEffect(() => {
  if (!hasLoaded) return; // don't overwrite saved data with [] before load finishes
  window.localStorage.setItem(storageKey, JSON.stringify(nodes));
}, [nodes, hasLoaded, storageKey]);

  /*//Preview Cashey  problem loop create here
//   const [nodes, setNodes] = useState<CanvasNode[]>(() => {
//   if (typeof window === "undefined") return [];
//   try {
//     const saved = window.localStorage.getItem("formbuilder-canvas");
//     return saved ? (JSON.parse(saved) as CanvasNode[]) : [];
//   } catch {
//     return [];
//   }
// });*/

  const [selectedNodeId, setSelectedNodeId] =
    useState<string | null>(null);

  function createNode(
    type: CanvasNodeType
  ): CanvasNode {
    const template = templates.find(
      (item) => item.templateId === type
    );

  // const nodeType = template ? template.type : type;
  const nodeType = template ? template.type : type;

    return {
      id: crypto.randomUUID(),

      type:nodeType,

      parentId: null,

      children: [],

      label: template?.defaultLabel ?? type,

      placeholder:
        template?.defaultPlaceholder ?? "",

      required:
        template?.defaultRequired ?? false,

      options:
        template?.defaultOptions ?? [],

      width: Number(
        template?.defaultWidth ?? 100
      ),

      height:
        type === "spacer"
          ? DEFAULT_SPACER_HEIGHT
          : "auto",

      selected: false,

      locked: false,

      hidden: false,

      styles: {},

      validation: {},
    };
  }

  function addTemplate(template: (typeof defaultTemplates)[number]) {
    setTemplates((previous) => [
      ...previous,
      template,
    ]);
  }


  // Removes one custom field by its templateId.
// (We don't need to protect built-in fields here, because the
// Sidebar will only ever show the delete button on custom ones.)
function deleteTemplate(templateId: string) {
  setTemplates((previous) =>
    previous.filter((template) => template.templateId !== templateId)
  );
}

  // 
  function addNode(
  type: CanvasNodeType,
  position?: { x: number; y: number }
) {

  const newNode = createNode(type);
  if (
  type !== "grid-1" &&
  type !== "grid-2" &&
  type !== "grid-3" &&
  type !== "grid-4"
) {
  setNodes((previous) => [
    ...previous,
    {
      ...newNode,
      width: type === "spacer" ? 100 : newNode.width,
    },
  ]);

  return;
}
  // ------------------------
  // Grid Layout
  // ------------------------

  // Grids need a concrete canvas footprint. The generic node defaults
  // (100% width and auto height) make a newly dropped grid look like a
  // full-width line until it is manually resized.
  newNode.width = 60;
  // newNode.height = 180;
  newNode.height = "auto";

  const columns: CanvasNode[] = [];

  let count = 1;

  if (type === "grid-2") {
    count = 2;
  }

  if (type === "grid-1") {
    count = 1;
  }

  if (type === "grid-3") {
    count = 3;
  }

  if (type === "grid-4") {
    count = 4;
  }

  for (
    let index = 0;
    index < count;
    index++
  ) {
    const column = createNode(
      "container"
    );

    column.parentId = newNode.id;

    column.label =
      "Column " + (index + 1);

    // A grid is a 12-unit worksheet.  Keeping the span on the column node
    // makes it possible to resize without changing the number of columns.
    column.width = 12 / count;
    // column.height = 160;
    column.height = "auto";

    columns.push(column);
  }

  setNodes((previous) => {
    const rootCount = previous.filter((node) => node.parentId === null).length;
    return [
      ...previous,
      {
        ...newNode,
        position: position ?? {
          x: 32 + (rootCount % 5) * 28,
          y: 32 + (rootCount % 5) * 28,
        },
      },
      ...columns,
    ];
  });
}

  function addNodeToParent(
    type: CanvasNodeType,
    parentId: string
  ) {
    const node = createNode(type);

    node.parentId = parentId;

    setNodes((oldNodes) => [
      ...oldNodes,
      node,
    ]);
  }

  function updateNode(
    id: string,
    updates: Partial<CanvasNode>
  ) {
    setNodes((oldNodes) =>
      oldNodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            ...updates,
          };
        }

        return node;
      })
    );
  }

  function deleteNode(id: string) {
    setNodes((oldNodes) => {
      const idsToDelete = new Set<string>([id]);

      let foundChild = true;
      while (foundChild) {
        foundChild = false;
        oldNodes.forEach((node) => {
          if (node.parentId && idsToDelete.has(node.parentId) && !idsToDelete.has(node.id)) {
            idsToDelete.add(node.id);
            foundChild = true;
          }
        });
      }

      return oldNodes.filter((node) => !idsToDelete.has(node.id));
    });

    if (selectedNodeId === id) {
      setSelectedNodeId(null);
    }
  }


  /*Moving Functions Here 
  Know which field is moving.
Know where it should go.
Update the array.
React redraws the UI.
That entire job is performed by this function. */
  function moveNode(
    id: string,
    parentId: string | null,
    beforeId?: string
  ) {
    setNodes((oldNodes) => {
      const movingNode = oldNodes.find((node) => node.id === id);
      if (!movingNode || id === beforeId) return oldNodes;

      // A node cannot be dropped into one of its own descendants.
      let cursor = parentId;
      while (cursor) {
        if (cursor === id) return oldNodes;
        cursor = oldNodes.find((node) => node.id === cursor)?.parentId ?? null;
      }

      const withoutMovingNode = oldNodes.filter((node) => node.id !== id);
      const targetIndex = beforeId
        ? withoutMovingNode.findIndex((node) => node.id === beforeId)
        : -1;
      const nextNode = { ...movingNode, parentId };

      if (targetIndex >= 0) {
        withoutMovingNode.splice(targetIndex, 0, nextNode);
      }else {
        const siblingIndexes = withoutMovingNode
          .map((node, index) => (node.parentId === parentId ? index : -1))
          .filter((index) => index >= 0);
        withoutMovingNode.splice(
          siblingIndexes.length ? siblingIndexes[siblingIndexes.length - 1] + 1 : withoutMovingNode.length,
          0,
          nextNode
        );
      }

      return withoutMovingNode;
    });
  }


  // Swaps a node with the sibling right before it (direction -1) or
// right after it (direction +1). "Sibling" means another node sharing
// the same parentId — so this only ever reorders within the same
// section/grid-column/root level, never jumps between them.
function moveSibling(id: string, direction: -1 | 1) {
  setNodes((oldNodes) => {
    const currentIndex = oldNodes.findIndex((node) => node.id === id);
    if (currentIndex === -1) return oldNodes;

    const parentId = oldNodes[currentIndex].parentId;

    // The array positions (in order) of every node sharing this parent.
    const siblingIndexes = oldNodes
      .map((node, index) => (node.parentId === parentId ? index : -1))
      .filter((index) => index !== -1);

    const positionAmongSiblings = siblingIndexes.indexOf(currentIndex);
    const targetPosition = positionAmongSiblings + direction;

    // Already first/last among its siblings — nothing to do.
    if (targetPosition < 0 || targetPosition >= siblingIndexes.length) {
      return oldNodes;
    }

    const targetIndex = siblingIndexes[targetPosition];

    // Just swap the two array positions — simplest possible way to
    // reorder two neighbors.
    const updated = [...oldNodes];
    [updated[currentIndex], updated[targetIndex]] = [updated[targetIndex], updated[currentIndex]];
    return updated;
  });
}


function moveNodeUp(id: string) {
  moveSibling(id, -1);
}

function moveNodeDown(id: string) {
  moveSibling(id, 1);
}



  function moveNodeFreely(id: string, x: number, y: number) {
    setNodes((oldNodes) => oldNodes.map((node) => (
      node.id === id
        ? { ...node, parentId: null, position: { x, y } }
        : node
    )));
  }

  function resizeGridColumns(
    leftColumnId: string,
    rightColumnId: string,
    change: number
  ) {
    setNodes((oldNodes) => {
      const left = oldNodes.find((node) => node.id === leftColumnId);
      const right = oldNodes.find((node) => node.id === rightColumnId);
      if (!left || !right || left.parentId !== right.parentId) return oldNodes;

      const nextLeft = Math.min(10, Math.max(2, left.width + change));
      const appliedChange = nextLeft - left.width;
      const nextRight = right.width - appliedChange;
      if (nextRight < 2) return oldNodes;

      return oldNodes.map((node) => {
        if (node.id === leftColumnId) return { ...node, width: nextLeft };
        if (node.id === rightColumnId) return { ...node, width: nextRight };
        return node;
      });
    });
  }

  function resizeGridRows(
    topColumnId: string,
    bottomColumnId: string,
    change: number
  ) {
    setNodes((oldNodes) => {
      const top = oldNodes.find((node) => node.id === topColumnId);
      const bottom = oldNodes.find((node) => node.id === bottomColumnId);
      if (!top || !bottom || top.parentId !== bottom.parentId) return oldNodes;

      const topHeight = typeof top.height === "number" ? top.height : 160;
      const bottomHeight = typeof bottom.height === "number" ? bottom.height : 160;
      const nextTop = Math.max(120, topHeight + change);
      const appliedChange = nextTop - topHeight;
      const nextBottom = bottomHeight - appliedChange;
      if (nextBottom < 120) return oldNodes;

      return oldNodes.map((node) => {
        if (node.id === topColumnId) return { ...node, height: nextTop };
        if (node.id === bottomColumnId) return { ...node, height: nextBottom };
        return node;
      });
    });
  }

  function resizeNode(
    id: string,
    width: number,
    height: number
  ) {
    setNodes((oldNodes) => oldNodes.map((node) => (
      node.id === id
        ? { ...node, width, height }
        : node
    )));
  }

  function selectNode(
    id: string | null
  ) {
    setSelectedNodeId(id);
  }

  function duplicateNode(id: string) {
    const node = nodes.find(
      (item) => item.id === id
    );

    if (!node) return;

    const copy = {
      ...node,

      id: crypto.randomUUID(),

      selected: false,
    };

    setNodes((oldNodes) => [
      ...oldNodes,
      copy,
    ]);
  }

  function clearCanvas() {
    setNodes([]);

    setSelectedNodeId(null);
  }


  /* ---------------------------- */
  /* Compatibility                */
  /* ---------------------------- */

  const fields = nodes;

  const selectedFieldId =
    selectedNodeId;

  function addField(
    templateId: string,
    x?: number,
    y?: number
  ){
    addNode(
      templateId as CanvasNodeType,
      x === undefined || y === undefined ? undefined : { x, y }
    );
  }

  function addFieldToParent(
    templateId: string,
    parentId: string
  ) {
    addNodeToParent(
      templateId as CanvasNodeType,
      parentId
    );
  }

  function deleteField(id: string) {
    deleteNode(id);
  }

  function selectField(
    id: string | null
  ) {
    selectNode(id);
  }

  return {
    templates,

    addTemplate,

    deleteTemplate,

    layouts,

    nodes,

    fields,

    selectedNodeId,

    selectedFieldId,

    addNode,

    addNodeToParent,

    updateNode,
    moveNode,
  moveNodeUp,    // <-- ADD THIS
  moveNodeDown,  // <-- ADD THIS
    moveNodeFreely,
    resizeGridColumns,
    resizeGridRows,
    resizeNode,

    deleteNode,

    duplicateNode,

    clearCanvas,

    selectNode,

    addField,

    addFieldToParent,

    deleteField,

    selectField,
  };
}
