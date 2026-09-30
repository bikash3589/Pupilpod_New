// // "use client";

// // // import { useState } from "react";
// // // import { CanvasNode, LayoutType } from "@/types/form-builder/field";
// // // import styles from "./FormPreview.module.css";
// // import { useEffect, useState } from "react";
// // import { CanvasNode, LayoutType } from "@/types/form-builder/field";
// // import styles from "./FormPreview.module.css";

// // const grids = new Set<LayoutType>(["grid-1", "grid-2", "grid-3", "grid-4"]);
// // const layouts = new Set<LayoutType>([
// //   "header", "section", "container", "divider", "spacer", ...grids,
// // ]);

// // function Control({ node }: { node: CanvasNode }) {
// //   if (node.type === "textarea") return <textarea placeholder={node.placeholder} />;
// //   if (node.type === "select") return <select>{node.options.map((option) => <option key={option}>{option}</option>)}</select>;
// //   // if (node.type === "checkbox" || node.type === "radio") return <input type={node.type} />;

// //   return <input type={node.type} placeholder={node.placeholder} />;
// // }

// // /*
// // interface FormPreviewProps {
// //   nodes?: CanvasNode[];
// // }*/


// // interface FormPreviewProps {
// //   nodes?: CanvasNode[];
// // }

// // // export default function FormPreview() {
// // //   const [nodes] = useState<CanvasNode[]>(() => {
// // //     if (typeof window === "undefined") return [];
// // //     try {
// // //       return JSON.parse(window.localStorage.getItem("formbuilder-canvas") ?? "[]") as CanvasNode[];
// // //     } catch {
// // //       return [];
// // //     }
// // //   });
// // export default function FormPreview({ nodes: externalNodes }: FormPreviewProps = {}) {
// //   const [localNodes, setLocalNodes] = useState<CanvasNode[]>([]);
// //   const [hasLoaded, setHasLoaded] = useState(false);

// //   useEffect(() => {
// //     if (externalNodes) {
// //       setHasLoaded(true);
// //       return;
// //     }
// //     try {
// //       const raw = window.localStorage.getItem("formbuilder-canvas");
// //       setLocalNodes(raw ? (JSON.parse(raw) as CanvasNode[]) : []);
// //     } catch {
// //       setLocalNodes([]);
// //     } finally {
// //       setHasLoaded(true);
// //     }
// //   }, [externalNodes]);

// //   const nodes = externalNodes ?? localNodes;

// //   function renderNode(node: CanvasNode): React.ReactNode {
// //     const children = nodes.filter((item) => item.parentId === node.id);
// //     if (grids.has(node.type as LayoutType)) {
// //       return (
// //         <div
// //           key={node.id}
// //           className={styles.grid}
// //           style={{
// //             gridTemplateColumns: children
// //               .map((column) => `minmax(0, ${Math.max(2, column.width)}fr)`)
// //               .join(" "),
// //           }}
// //         >
// //           {children.map((column) => (
// //             <div
// //               key={column.id}
// //               className={styles.column}
// //             >
// //               {nodes.filter((item) => item.parentId === column.id).map(renderNode)}
// //             </div>
// //           ))}
// //         </div>
// //       );
// //     }
// // //     if (node.type === "checkbox" || node.type === "radio") {
// // //   const options = node.options.length > 0 ? node.options : ["Option 1"];
// // //   return (
// // //     <div key={node.id} className={styles.field}>
// // //       <span>{node.label}{node.required && <b> *</b>}</span>
// // //       <div className={styles.choiceGroup}>
// // //         {options.map((option, index) => (
// // //           <label key={index} className={styles.choiceRow}>
// // //             <input type={node.type} name={node.id} />
// // //             <span>{option}</span>
// // //           </label>
// // //         ))}
// // //       </div>
// // //       {node.helpText && <small>{node.helpText}</small>}
// // //     </div>
// // //   );
// // // }

// // // return (
// // //   <label key={node.id} className={styles.field}>
// // //     <span>{node.label}{node.required && <b> *</b>}</span>
// // //     <Control node={node} />
// // //     {node.helpText && <small>{node.helpText}</small>}
// // //   </label>
// // // );


// // if (node.type === "checkbox" || node.type === "radio") {
// //   const options = node.options.length > 0 ? node.options : ["Option 1"];
// //   return (
// //     <div key={node.id} className={styles.field}>
// //       <span>{node.label}{node.required && <b> *</b>}</span>
// //       <div className={styles.choiceGroup}>
// //         {options.map((option, index) => (
// //           <label key={index} className={styles.choiceRow}>
// //             <input type={node.type} name={node.id} />
// //             <span>{option}</span>
// //           </label>
// //         ))}
// //       </div>
// //       {node.helpText && <small>{node.helpText}</small>}
// //     </div>
// //   );
// // }

// // return (
// //   <label key={node.id} className={styles.field}>
// //     <span>{node.label}{node.required && <b> *</b>}</span>
// //     <Control node={node} />
// //     {node.helpText && <small>{node.helpText}</small>}
// //   </label>
// // );


// //   //   // if (node.type === "header") return <header key={node.id} className={styles.header}><h1>{node.label}</h1></header>;
// //   // if (node.type === "header")return (<header key={node.id} className={styles.header}><h1>{node.label}</h1>{node.helpText && <p>{node.helpText}</p>}</header>);

// //   // if (node.type === "header")
// //   // return (
// //   //   <header key={node.id} className={styles.header}>
// //   //     {node.logoUrl && <img src={node.logoUrl} alt="Form logo" className={styles.logo} />}
// //   //     <h1>{node.label}</h1>
// //   //     {node.helpText && <p>{node.helpText}</p>}
// //   //   </header>
// //   // );

// // if (node.type === "header") {
// //   const size = node.logoSize ?? 64;
// //   const pos = node.logoPosition ?? { x: 20, y: 20 };
// //   return (
// //     <header key={node.id} className={styles.header} style={{ position: "relative", minHeight: node.logoUrl ? Math.max(160, pos.y + size + 60) : 160 }}>
// //       {node.logoUrl && (
// //         <img
// //           src={node.logoUrl}
// //           alt="Form logo"
// //           style={{ position: "absolute", left: pos.x, top: pos.y, width: size, height: size, objectFit: "contain" }}
// //         />
// //       )}
// //       <div style={{ paddingTop: node.logoUrl ? size + 20 : 0 }}>
// //         <h1>{node.label}</h1>
// //         {node.helpText && <p>{node.helpText}</p>}
// //       </div>
// //     </header>
// //   );
// // }




// //     if (node.type === "divider") return <hr key={node.id} />;
// //     if (node.type === "spacer") return <div key={node.id} className={styles.spacer} />;
// //     if (layouts.has(node.type as LayoutType)) {
// //       return <section key={node.id} className={styles.layout}><h2>{node.label}</h2>{children.map(renderNode)}</section>;
// //     }
// //     return (
// //       <label key={node.id} className={styles.field}>
// //         <span>{node.label}{node.required && <b> *</b>}</span>
// //         <Control node={node} />
// //         {node.helpText && <small>{node.helpText}</small>}
// //       </label>
// //     );
// //   }
// // // if (!hasLoaded) return <main className={styles.preview} />;

// // if (!hasLoaded) return <main className={styles.preview} />;
// //   // const rootNodes = nodes.filter((node) => node.parentId === null);
// //   // return <main className={styles.preview}>{rootNodes.length ? rootNodes.map(renderNode) : <p>Your form has no fields yet.</p>}</main>;
// //   const rootNodes = nodes.filter((node) => node.parentId === null);

// // // Group root-level fields into visual "rows" based on where the
// // // admin actually placed them on the canvas (their y position),
// // // so fields placed side-by-side stay side-by-side in the preview,
// // // instead of always stacking one-per-line.
// // function groupIntoRows(items: CanvasNode[]) {
// //   // Work with a safe copy, sorted top-to-bottom, then left-to-right.
// //   const sorted = [...items].sort((a, b) => {
// //     const ay = a.position?.y ?? 0;
// //     const by = b.position?.y ?? 0;
// //     if (ay !== by) return ay - by;
// //     const ax = a.position?.x ?? 0;
// //     const bx = b.position?.x ?? 0;
// //     return ax - bx;
// //   });

// //   const rows: CanvasNode[][] = [];

// //   sorted.forEach((node) => {
// //     const nodeTop = node.position?.y ?? 0;
// //     const nodeHeight = typeof node.height === "number" ? node.height : 60;
// //     const nodeBottom = nodeTop + nodeHeight;

// //     // Try to find an existing row this field overlaps with vertically.
// //     const matchingRow = rows.find((row) =>
// //       row.some((existing) => {
// //         const existingTop = existing.position?.y ?? 0;
// //         const existingHeight = typeof existing.height === "number" ? existing.height : 60;
// //         const existingBottom = existingTop + existingHeight;
// //         // "Overlap" means they share some vertical space.
// //         return nodeTop < existingBottom && nodeBottom > existingTop;
// //       })
// //     );

// //     if (matchingRow) {
// //       matchingRow.push(node);
// //     } else {
// //       rows.push([node]);
// //     }
// //   });

// //   // Within each row, keep fields ordered left-to-right.
// //   rows.forEach((row) => row.sort((a, b) => (a.position?.x ?? 0) - (b.position?.x ?? 0)));

// //   return rows;
// // }

// // const rows = groupIntoRows(rootNodes);

// // return (
// //   <main className={styles.preview}>
// //     {rootNodes.length ? (
// //       rows.map((row, index) => (
// //         <div key={index} className={styles.previewRow}>
// //           {row.map((node) => (
// //             <div
// //               key={node.id}
// //               className={styles.previewRowItem}
// //               style={{ flex: `0 0 ${Math.max(20, Math.min(100, node.width))}%` }}
// //             >
// //               {renderNode(node)}
// //             </div>
// //           ))}
// //         </div>
// //       ))
// //     ) : (
// //       <p>Your form has no fields yet.</p>
// //     )}
// //   </main>
// // );
// // }



// // //Latest Update only because of this header and before thise everything worked correctly 


// "use client";

// import { useEffect, useState } from "react";
// import { CanvasNode, LayoutType } from "@/types/form-builder/field";
// import styles from "./FormPreview.module.css";

// const grids = new Set<LayoutType>(["grid-1", "grid-2", "grid-3", "grid-4"]);
// const layouts = new Set<LayoutType>([
//   "header", "section", "container", "divider", "spacer", ...grids,
// ]);

// function Control({ node }: { node: CanvasNode }) {
//   if (node.type === "textarea") return <textarea placeholder={node.placeholder} />;
  
//   if (node.type === "select")
//     return (
//       <select defaultValue="">
//         <option value="" disabled>{node.placeholder || "Select an option"}</option>
//         {node.options.map((option) => <option key={option} value={option}>{option}</option>)}
//       </select>
//     );
//   return <input type={node.type} placeholder={node.placeholder} />;
// }

// interface FormPreviewProps {
//   nodes?: CanvasNode[];
// }

// export default function FormPreview({ nodes: externalNodes }: FormPreviewProps = {}) {
//   const [localNodes, setLocalNodes] = useState<CanvasNode[]>([]);
//   const [hasLoaded, setHasLoaded] = useState(false);

//   useEffect(() => {
//     if (externalNodes) {
//       setHasLoaded(true);
//       return;
//     }
//     try {
//       const raw = window.localStorage.getItem("formbuilder-canvas");
//       setLocalNodes(raw ? (JSON.parse(raw) as CanvasNode[]) : []);
//     } catch {
//       setLocalNodes([]);
//     } finally {
//       setHasLoaded(true);
//     }
//   }, [externalNodes]);

//   const nodes = externalNodes ?? localNodes;

//   function renderNode(node: CanvasNode): React.ReactNode {
//     const children = nodes.filter((item) => item.parentId === node.id);

//     if (grids.has(node.type as LayoutType)) {
//       return (
//         <div
//           key={node.id}
//           className={styles.grid}
//           style={{
//             gridTemplateColumns: children
//               .map((column) => `minmax(0, ${Math.max(2, column.width)}fr)`)
//               .join(" "),
//           }}
//         >
//           {children.map((column) => (
//             <div key={column.id} className={styles.column}>
//               {nodes.filter((item) => item.parentId === column.id).map(renderNode)}
//             </div>
//           ))}
//         </div>
//       );
//     }

//     if (node.type === "checkbox" || node.type === "radio") {
//       const options = node.options.length > 0 ? node.options : ["Option 1"];
//       return (
//         <div key={node.id} className={styles.field}>
//           <span>{node.label}{node.required && <b> *</b>}</span>
//           <div className={styles.choiceGroup}>
//             {options.map((option, index) => (
//               <label key={index} className={styles.choiceRow}>
//                 <input type={node.type} name={node.id} />
//                 <span>{option}</span>
//               </label>
//             ))}
//           </div>
//           {node.helpText && <small>{node.helpText}</small>}
//         </div>
//       );
//     }


    
//     // if (node.type === "header") {
//     //   const size = node.logoSize ?? 64;
//     //   const pos = node.logoPosition ?? { x: 20, y: 20 };
//     //   return (
//     //     <header
//     //       key={node.id}
//     //       className={styles.header}
//     //       style={{
//     //         position: "relative",
//     //         minHeight: node.logoUrl ? Math.max(160, pos.y + size + 60) : 160,
//     //       }}
//     //     >
//     //       {node.logoUrl && (
//     //         <img
//     //           src={node.logoUrl}
//     //           alt="Form logo"
//     //           style={{
//     //             position: "absolute",
//     //             left: pos.x,
//     //             top: pos.y,
//     //             width: size,
//     //             height: size,
//     //             objectFit: "contain",
//     //           }}
//     //         />
//     //       )}
//     //       <div style={{ paddingTop: node.logoUrl ? size + 20 : 0 }}>
//     //         <h1>{node.label}</h1>
//     //         {node.helpText && <p>{node.helpText}</p>}
//     //       </div>
//     //     </header>
//     //   );
//     // }

// if (node.type === "header") {
//   const size = node.logoSize ?? 64;
//   const pos = node.logoPosition ?? { x: 20, y: 20 };
//   return (
//     <header key={node.id} className={styles.header} style={{ position: "relative", minHeight: 160 }}>
//       {node.logoUrl && (
//         <img
//           src={node.logoUrl}
//           alt="Form logo"
//           style={{
//             position: "absolute",
//             left: pos.x,
//             top: pos.y,
//             width: size,
//             height: size,
//             objectFit: "contain",
//           }}
//         />
//       )}
//       <div className={styles.headerTextArea}>
//         <h1>{node.label}</h1>
//         {node.helpText && <p>{node.helpText}</p>}
//       </div>
//     </header>
//   );
// }


//     if (node.type === "divider") return <hr key={node.id} />;
//     if (node.type === "spacer") return <div key={node.id} className={styles.spacer} />;

//     if (layouts.has(node.type as LayoutType)) {
//       return (
//         <section key={node.id} className={styles.layout}>
//           <h2>{node.label}</h2>
//           {children.map(renderNode)}
//         </section>
//       );
//     }

//     return (
//       <label key={node.id} className={styles.field}>
//         <span>{node.label}{node.required && <b> *</b>}</span>
//         <Control node={node} />
//         {node.helpText && <small>{node.helpText}</small>}
//       </label>
//     );
//   }

//   if (!hasLoaded) return <main className={styles.preview} />;

//   const rootNodes = nodes.filter((node) => node.parentId === null);

//   // Group root-level fields into visual "rows" based on where the
//   // admin actually placed them on the canvas (their y position),
//   // so fields placed side-by-side stay side-by-side in the preview,
//   // instead of always stacking one-per-line.
//   function groupIntoRows(items: CanvasNode[]) {
//     const sorted = [...items].sort((a, b) => {
//       const ay = a.position?.y ?? 0;
//       const by = b.position?.y ?? 0;
//       if (ay !== by) return ay - by;
//       const ax = a.position?.x ?? 0;
//       const bx = b.position?.x ?? 0;
//       return ax - bx;
//     });

//     const rows: CanvasNode[][] = [];

//     sorted.forEach((node) => {
//       const nodeTop = node.position?.y ?? 0;
//       const nodeHeight = typeof node.height === "number" ? node.height : 60;
//       const nodeBottom = nodeTop + nodeHeight;

//       const matchingRow = rows.find((row) =>
//         row.some((existing) => {
//           const existingTop = existing.position?.y ?? 0;
//           const existingHeight = typeof existing.height === "number" ? existing.height : 60;
//           const existingBottom = existingTop + existingHeight;
//           return nodeTop < existingBottom && nodeBottom > existingTop;
//         })
//       );

//       if (matchingRow) {
//         matchingRow.push(node);
//       } else {
//         rows.push([node]);
//       }
//     });

//     rows.forEach((row) => row.sort((a, b) => (a.position?.x ?? 0) - (b.position?.x ?? 0)));

//     return rows;
//   }

//   const rows = groupIntoRows(rootNodes);

//   return (
//     <main className={styles.preview}>
//       {rootNodes.length ? (
//         rows.map((row, index) => (
//           <div key={index} className={styles.previewRow}>
//             {row.map((node) => (
//               <div
//                 key={node.id}
//                 className={styles.previewRowItem}
//                 style={{ flex: `0 0 ${Math.max(20, Math.min(100, node.width))}%` }}
//               >
//                 {renderNode(node)}
//               </div>
//             ))}
//           </div>
//         ))
//       ) : (
//         <p>Your form has no fields yet.</p>
//       )}
//     </main>
//   );
// }

// "use client";

// import { useEffect, useState } from "react";
// import { CanvasNode, LayoutType } from "@/types/form-builder/field";
// import styles from "./FormPreview.module.css";

// const grids = new Set<LayoutType>(["grid-1", "grid-2", "grid-3", "grid-4"]);
// const layouts = new Set<LayoutType>([
//   "header", "section", "container", "divider", "spacer", ...grids,
// ]);

// function Control({ node }: { node: CanvasNode }) {
//   if (node.type === "textarea") return <textarea placeholder={node.placeholder} />;
//   if (node.type === "select")
//     return (
//       <select defaultValue="">
//         <option value="" disabled>{node.placeholder || "Select an option"}</option>
//         {node.options.map((option) => <option key={option} value={option}>{option}</option>)}
//       </select>
//     );
//   return <input type={node.type} placeholder={node.placeholder} />;
// }

// interface FormPreviewProps {
//   nodes?: CanvasNode[];
// }

// export default function FormPreview({ nodes: externalNodes }: FormPreviewProps = {}) {
//   const [localNodes, setLocalNodes] = useState<CanvasNode[]>([]);
//   const [hasLoaded, setHasLoaded] = useState(false);

//   useEffect(() => {
//     if (externalNodes) {
//       setHasLoaded(true);
//       return;
//     }
//     try {
//       const raw = window.localStorage.getItem("formbuilder-canvas");
//       setLocalNodes(raw ? (JSON.parse(raw) as CanvasNode[]) : []);
//     } catch {
//       setLocalNodes([]);
//     } finally {
//       setHasLoaded(true);
//     }
//   }, [externalNodes]);

//   const nodes = externalNodes ?? localNodes;

//   function renderNode(node: CanvasNode): React.ReactNode {
//     const children = nodes.filter((item) => item.parentId === node.id);

//     if (grids.has(node.type as LayoutType)) {
//       return (
//         <div
//           key={node.id}
//           className={styles.grid}
//           style={{
//             gridTemplateColumns: children
//               .map((column) => `minmax(0, ${Math.max(2, column.width)}fr)`)
//               .join(" "),
//           }}
//         >
//           {children.map((column) => (
//             <div key={column.id} className={styles.column}>
//               {nodes.filter((item) => item.parentId === column.id).map(renderNode)}
//             </div>
//           ))}
//         </div>
//       );
//     }

//     if (node.type === "checkbox" || node.type === "radio") {
//       const options = node.options.length > 0 ? node.options : ["Option 1"];
//       return (
//         <div key={node.id} className={styles.field}>
//           <span>{node.label}{node.required && <b> *</b>}</span>
//           <div className={styles.choiceGroup}>
//             {options.map((option, index) => (
//               <label key={index} className={styles.choiceRow}>
//                 <input type={node.type} name={node.id} />
//                 <span>{option}</span>
//               </label>
//             ))}
//           </div>
//           {node.helpText && <small>{node.helpText}</small>}
//         </div>
//       );
//     }

//     if (node.type === "header") {
//       const size = node.logoSize ?? 64;
//       const pos = node.logoPosition ?? { x: 20, y: 20 };
//       return (
//         <header
//           key={node.id}
//           className={styles.header}
//           style={{ position: "relative", minHeight: 160 }}
//         >
//           {node.logoUrl && (
//             <img
//               src={node.logoUrl}
//               alt="Form logo"
//               style={{
//                 position: "absolute",
//                 left: pos.x,
//                 top: pos.y,
//                 width: size,
//                 height: size,
//                 objectFit: "contain",
//               }}
//             />
//           )}
//           <div className={styles.headerTextArea}>
//             <h1>{node.label}</h1>
//             {node.helpText && <p>{node.helpText}</p>}
//           </div>
//         </header>
//       );
//     }

//     // NEW: the rich-text Text field. Renders as a real <p> or
//     // <h1>-<h6> tag (whichever the admin picked in Properties),
//     // showing the actual formatted content (bold/italic/underline/
//     // strikethrough/links) exactly as it was written in the builder.
//     // if (node.type === "text") {
//     //   const Tag = (node.blockType ?? "p") as keyof JSX.IntrinsicElements;
//     if (node.type === "text") {
//   const Tag = (node.blockType ?? "p") as
//     | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
//       return (
//         <Tag
//           key={node.id}
//           className={styles.richText}
//           dangerouslySetInnerHTML={{ __html: node.richText ?? node.label }}
//         />
//       );
//     }

//     if (node.type === "divider") return <hr key={node.id} />;
//     if (node.type === "spacer") return <div key={node.id} className={styles.spacer} />;

//     if (layouts.has(node.type as LayoutType)) {
//       return (
//         <section key={node.id} className={styles.layout}>
//           <h2>{node.label}</h2>
//           {children.map(renderNode)}
//         </section>
//       );
//     }

//     return (
//       <label key={node.id} className={styles.field}>
//         <span>{node.label}{node.required && <b> *</b>}</span>
//         <Control node={node} />
//         {node.helpText && <small>{node.helpText}</small>}
//       </label>
//     );
//   }

//   if (!hasLoaded) return <main className={styles.preview} />;

//   const rootNodes = nodes.filter((node) => node.parentId === null);

//   // Group root-level fields into visual "rows" based on where the
//   // admin actually placed them on the canvas (their y position),
//   // so fields placed side-by-side stay side-by-side in the preview,
//   // instead of always stacking one-per-line.
//   function groupIntoRows(items: CanvasNode[]) {
//     const sorted = [...items].sort((a, b) => {
//       const ay = a.position?.y ?? 0;
//       const by = b.position?.y ?? 0;
//       if (ay !== by) return ay - by;
//       const ax = a.position?.x ?? 0;
//       const bx = b.position?.x ?? 0;
//       return ax - bx;
//     });

//     const rows: CanvasNode[][] = [];

//     sorted.forEach((node) => {
//       const nodeTop = node.position?.y ?? 0;
//       const nodeHeight = typeof node.height === "number" ? node.height : 60;
//       const nodeBottom = nodeTop + nodeHeight;

//       const matchingRow = rows.find((row) =>
//         row.some((existing) => {
//           const existingTop = existing.position?.y ?? 0;
//           const existingHeight = typeof existing.height === "number" ? existing.height : 60;
//           const existingBottom = existingTop + existingHeight;
//           return nodeTop < existingBottom && nodeBottom > existingTop;
//         })
//       );

//       if (matchingRow) {
//         matchingRow.push(node);
//       } else {
//         rows.push([node]);
//       }
//     });

//     rows.forEach((row) => row.sort((a, b) => (a.position?.x ?? 0) - (b.position?.x ?? 0)));

//     return rows;
//   }

//   const rows = groupIntoRows(rootNodes);

//   return (
//     <main className={styles.preview}>
//       {rootNodes.length ? (
//         rows.map((row, index) => (
//           <div key={index} className={styles.previewRow}>
//             {row.map((node) => (
//               <div
//                 key={node.id}
//                 className={styles.previewRowItem}
//                 style={{ flex: `0 0 ${Math.max(20, Math.min(100, node.width))}%` }}
//               >
//                 {renderNode(node)}
//               </div>
//             ))}
//           </div>
//         ))
//       ) : (
//         <p>Your form has no fields yet.</p>
//       )}
//     </main>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import { CanvasNode, LayoutType } from "@/types/form-builder/field";
import "../variable.css";
import "../reset.css";
import styles from "./FormPreview.module.css";
import DateField from "@/components/FormBuilder/Fields/Datefield";
import EmailField from "@/components/FormBuilder/Fields/EmailField";
import NumberField from "@/components/FormBuilder/Fields/NumberField";
import TextAreaField from "@/components/FormBuilder/Fields/TextAreaField";
import FileField from "@/components/FormBuilder/Fields/FileField";
import SelectField from "@/components/FormBuilder/Fields/SelectField";
import CheckboxGroupField from "@/components/FormBuilder/Fields/CheckboxGroupField";
import RadioGroupField from "@/components/FormBuilder/Fields/RadioGroupField";

const grids = new Set<LayoutType>(["grid-1", "grid-2", "grid-3", "grid-4"]);
const layouts = new Set<LayoutType>([
  "header", "section", "container", "divider", "spacer", ...grids,
]);

// Every field type now renders its REAL component here — the exact
// same ones used on the builder canvas, so what you designed is what
// you get.
function PreviewDateField({ node }: { node: CanvasNode }) {
  const [value, setValue] = useState<string | undefined>(node.defaultValue);

  return (
    <DateField
      value={value}
      onChange={setValue}
      placeholder={node.placeholder}
      minDate={node.validation?.minDate}
      maxDate={node.validation?.maxDate}
      dateFormat={node.validation?.dateFormat || "MM/DD/YYYY"}
    />
  );
}
function Control({ node }: { node: CanvasNode }) {
  if (node.type === "textarea") {
    return <TextAreaField placeholder={node.placeholder} maxLength={node.validation?.maxLength} />;
  }

  if (node.type === "select") {
    return <SelectField options={node.options} placeholder={node.placeholder} />;
  }

  if (node.type === "date") {

    return (
      // <DateField
      //   placeholder={node.placeholder}
      //   minDate={node.validation?.minDate}
      //   maxDate={node.validation?.maxDate}
      //   dateFormat={node.validation?.dateFormat || "MM/DD/YYYY"}
      <PreviewDateField node={node} />
    );
  }

  if (node.type === "email") {
    return <EmailField placeholder={node.placeholder} pattern={node.validation?.pattern} />;
  }

  if (node.type === "number") {
    return (
      <NumberField
        placeholder={node.placeholder}
        minDigits={node.validation?.min}
        maxDigits={node.validation?.max}
        step={node.validation?.step}
      />
    );
  }

  if (node.type === "file") {
    return <FileField />;
  }

  return <input type={node.type} placeholder={node.placeholder} />;
}

interface FormPreviewProps {
  nodes?: CanvasNode[];
  storageKey?: string;
}

export default function FormPreview({
  nodes: externalNodes,
  storageKey = "formbuilder-canvas",
}: FormPreviewProps = {}) {
  const [localNodes, setLocalNodes] = useState<CanvasNode[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (externalNodes) {
      setHasLoaded(true);
      return;
    }
    try {
      const raw = window.localStorage.getItem(storageKey);
      setLocalNodes(raw ? (JSON.parse(raw) as CanvasNode[]) : []);
    } catch {
      setLocalNodes([]);
    } finally {
      setHasLoaded(true);
    }
  }, [externalNodes, storageKey]);

  const nodes = externalNodes ?? localNodes;

  function renderNode(node: CanvasNode): React.ReactNode {
    const children = nodes.filter((item) => item.parentId === node.id);

    if (grids.has(node.type as LayoutType)) {
      return (
        <div
          key={node.id}
          className={styles.grid}
          style={{
            gridTemplateColumns: children
              .map((column) => `minmax(0, ${Math.max(2, column.width)}fr)`)
              .join(" "),
          }}
        >
          {children.map((column) => (
            <div key={column.id} className={styles.column}>
              {nodes.filter((item) => item.parentId === column.id).map(renderNode)}
            </div>
          ))}
        </div>
      );
    }

    // Checkbox/radio groups now use the custom-styled, interactive
    // group components instead of plain native inputs.
    if (node.type === "checkbox" || node.type === "radio") {
      const options = node.options.length > 0 ? node.options : ["Option 1"];
      return (
        <div key={node.id} className={styles.field}>
          <span>{node.label}{node.required && <b> *</b>}</span>
          {node.type === "checkbox" ? (
            <CheckboxGroupField options={options} />
          ) : (
            <RadioGroupField options={options} />
          )}
          {node.helpText && <small>{node.helpText}</small>}
        </div>
      );
    }

    if (node.type === "header") {
      const size = node.logoSize ?? 64;
      const pos = node.logoPosition ?? { x: 20, y: 20 };
      return (
        <header
          key={node.id}
          className={styles.header}
          style={{ position: "relative", minHeight: 160 }}
        >
          {node.logoUrl && (
            <img
              src={node.logoUrl}
              alt="Form logo"
              style={{
                position: "absolute",
                left: pos.x,
                top: pos.y,
                width: size,
                height: size,
                objectFit: "contain",
              }}
            />
          )}
          <div className={styles.headerTextArea}>
            <h1>{node.label}</h1>
            {node.helpText && <p>{node.helpText}</p>}
          </div>
        </header>
      );
    }

    // The rich-text Text field. Renders as a real <p> or <h1>-<h6> tag
    // (whichever was picked in the builder), showing the actual
    // formatted content (bold/italic/underline) exactly as it was
    // written.
    if (node.type === "text") {
      const Tag = (node.blockType ?? "p") as
        | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      return (
        <Tag
          key={node.id}
          className={styles.richText}
          dangerouslySetInnerHTML={{ __html: node.richText ?? node.label }}
        />
      );
    }

    if (node.type === "divider") return <hr key={node.id} />;
    if (node.type === "spacer") return <div key={node.id} className={styles.spacer} />;

    if (layouts.has(node.type as LayoutType)) {
      return (
        <section key={node.id} className={styles.layout}>
          <h2>{node.label}</h2>
          {children.map(renderNode)}
        </section>
      );
    }

    return (
      <label key={node.id} className={styles.field}>
        <span>{node.label}{node.required && <b> *</b>}</span>
        <Control node={node} />
        {node.helpText && <small>{node.helpText}</small>}
      </label>
    );
  }

  if (!hasLoaded) return <main className={styles.preview} />;

  const rootNodes = nodes.filter((node) => node.parentId === null);

  // Group root-level fields into visual "rows" based on where the
  // admin actually placed them on the canvas (their y position),
  // so fields placed side-by-side stay side-by-side in the preview,
  // instead of always stacking one-per-line.
  function groupIntoRows(items: CanvasNode[]) {
    const sorted = [...items].sort((a, b) => {
      const ay = a.position?.y ?? 0;
      const by = b.position?.y ?? 0;
      if (ay !== by) return ay - by;
      const ax = a.position?.x ?? 0;
      const bx = b.position?.x ?? 0;
      return ax - bx;
    });

    const rows: CanvasNode[][] = [];

    sorted.forEach((node) => {
      const nodeTop = node.position?.y ?? 0;
      const nodeHeight = typeof node.height === "number" ? node.height : 60;
      const nodeBottom = nodeTop + nodeHeight;

      const matchingRow = rows.find((row) =>
        row.some((existing) => {
          const existingTop = existing.position?.y ?? 0;
          const existingHeight = typeof existing.height === "number" ? existing.height : 60;
          const existingBottom = existingTop + existingHeight;
          return nodeTop < existingBottom && nodeBottom > existingTop;
        })
      );

      if (matchingRow) {
        matchingRow.push(node);
      } else {
        rows.push([node]);
      }
    });

    rows.forEach((row) => row.sort((a, b) => (a.position?.x ?? 0) - (b.position?.x ?? 0)));

    return rows;
  }

  const rows = groupIntoRows(rootNodes);

  return (
    <main className={`${styles.preview} fbRoot`}>
      {rootNodes.length ? (
        rows.map((row, index) => (
          <div key={index} className={styles.previewRow}>
            {row.map((node) => (
              <div
                key={node.id}
                className={styles.previewRowItem}
                // style={{ flex: `0 0 ${Math.max(20, Math.min(100, node.width))}%` }}
                style={{ flex: "0 0 100%" }}
              >
                {renderNode(node)}
              </div>
            ))}
          </div>
        ))
      ) : (
        <p>Your form has no fields yet.</p>
      )}
    </main>
  );
}