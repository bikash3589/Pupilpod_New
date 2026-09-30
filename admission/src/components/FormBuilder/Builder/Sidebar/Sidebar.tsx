// "use client";

// import { useMemo, useState } from "react";

// import styles from "./Sidebar.module.css";

// import SidebarSection from "./SidebarSection";
// import PaletteItem from "./PaletteItem";

// import TemplateModal from "../../TemplateModal/TemplateModal";

// import { defaultLayouts } from "@/data/form-builder/defaultLayouts";
// import { useBuilderContext } from "@/context/form-builder/BuilderContext";

// export default function Sidebar() {
//   const { templates } = useBuilderContext();

//   const [openModal, setOpenModal] = useState(false);

//   const layouts = useMemo(
//     () =>
//       defaultLayouts.filter(
//         (layout) => layout.category === "layout"
//       ),
//     []
//   );

//   const grids = useMemo(
//     () =>
//       defaultLayouts.filter(
//         (layout) => layout.category === "grid"
//       ),
//     []
//   );

//   return (
//     <>
//       <aside className={styles.sidebar}>
//         {/* ---------- Layouts ---------- */}

//         <SidebarSection title="📐 Layouts">
//           <div className={styles.paletteGrid}>
//             {layouts.map((layout) => (
//               <PaletteItem
//                 key={layout.id}
//                 title={layout.name}
//                 subtitle={layout.description}
//                 icon={layout.icon}
//                 badge="Layout"
//                 dragData={layout.templateId}
//               />
//             ))}
//           </div>
//         </SidebarSection>

//         {/* ---------- Grid Layouts ---------- */}

//         <SidebarSection title="🧱 Grid Layouts">
//           <div className={styles.paletteGrid}>
//             {grids.map((layout) => (
//               <PaletteItem
//                 key={layout.id}
//                 title={layout.name}
//                 subtitle={layout.description}
//                 icon={layout.icon}
//                 badge="Grid"
//                 dragData={layout.templateId}
//               />
//             ))}
//           </div>
//         </SidebarSection>

//         {/* ---------- Fields ---------- */}

//         <SidebarSection title="📝 Fields">
//           <div className={styles.paletteGrid}>
//             {templates.map((template) => (
//               <PaletteItem
//                 key={template.id}
//                 title={template.name}
//                 subtitle={template.type}
//                 icon={template.name.charAt(0)}
//                 badge={
//                   template.builtIn
//                     ? "Built-In"
//                     : "Custom"
//                 }
//                 dragData={template.templateId}
//               />
//             ))}
//           </div>
//         </SidebarSection>

//         <button
//           className={styles.addTemplateButton}
//           onClick={() => setOpenModal(true)}
//         >
//           + Create Custom Field
//         </button>
//       </aside>

//       <TemplateModal
//         open={openModal}
//         onClose={() => setOpenModal(false)}
//       />
//     </>
//   );
// }

"use client";

import { useMemo, useState } from "react";

import {
  Type,
  Mail,
  Hash,
  Calendar,
  CheckSquare,
  CircleDot,
  ChevronDownSquare,
  Upload,
  Heading,
  FolderOpen,
  Square,
  Minus,
  Columns2,
  LayoutGrid,
  Search,
} from "lucide-react";

import styles from "./Sidebar.module.css";

import SidebarSection from "./SidebarSection";
import TileGrid from "./TileGrid";
import Tile from "./Tile";

import TemplateModal from "../../TemplateModal/TemplateModal";

import { useBuilderContext } from "@/context/form-builder/BuilderContext";

import { defaultLayouts } from "@/data/form-builder/defaultLayouts";

export default function Sidebar() {
  // const { templates } = useBuilderContext();
  const { templates, deleteTemplate } = useBuilderContext();

  const [search, setSearch] = useState("");

  const [openModal, setOpenModal] = useState(false);

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) =>
      template.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [templates, search]);

  const fieldIcons: Record<
    string,
    React.ReactNode
  > = {
    text: <Type size={18} />,
    email: <Mail size={18} />,
    number: <Hash size={18} />,
    date: <Calendar size={18} />,
    textarea: <Type size={18} />,
    checkbox: <CheckSquare size={18} />,
    radio: <CircleDot size={18} />,
    select: (
      <ChevronDownSquare size={18} />
    ),
    file: <Upload size={18} />,
    input: <Type size={18} />,
  };

  const layoutIcons: Record<
    string,
    React.ReactNode
  > = {
    header: <Heading size={18} />,

    section: <FolderOpen size={18} />,

    container: <Square size={18} />,

    divider: <Minus size={18} />,

    spacer: <Minus size={18} />,

    "grid-1": <Columns2 size={18} />,

    "grid-2": <Columns2 size={18} />,

    "grid-3": <LayoutGrid size={18} />,

    "grid-4": <LayoutGrid size={18} />,
  };

  return (
    <>
      <div className={styles.sidebar}>
        {/* Search */}

        <div className={styles.searchBox}>
          <Search size={16} />

          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        {/* Standard Fields */}

        {/* <SidebarSection title="Standard Fields">
          <TileGrid>
            {filteredTemplates.map(
              (template) => (
                <Tile
                  key={template.id}
                  title={template.name}
                  icon={
                    fieldIcons[
                      template.type
                    ]
                  }
                  dragData={
                    template.templateId
                  }
                />
              )
            )}
          </TileGrid>
        </SidebarSection> */}

        <SidebarSection title="Standard Fields">
  <TileGrid>
    {filteredTemplates.map((template) => (
      <div key={template.id} className={styles.tileWrapper}>
        <Tile
          title={template.name}
          icon={fieldIcons[template.type]}
          dragData={template.templateId}
        />

        {/* Only custom fields get a delete button.
            Built-in fields (Text, Email, etc.) never show one. */}
        {!template.builtIn && (
          <button
            type="button"
            className={styles.deleteTileButton}
            title="Delete this custom field"
            onClick={() => deleteTemplate(template.templateId)}
          >
            ✕
          </button>
        )}
      </div>
    ))}
  </TileGrid>
</SidebarSection>

        {/* Layout Components */}

        <SidebarSection title="Layout Components">
          <TileGrid>
            {defaultLayouts.map(
              (layout) => (
                <Tile
                  key={layout.id}
                  title={layout.name}
                  icon={
                    layoutIcons[
                      layout.type
                    ]
                  }
                  dragData={
                    layout.templateId
                  }
                />
              )
            )}
          </TileGrid>
        </SidebarSection>

        {/* Custom Fields */}

        <SidebarSection title="Custom Fields">
          <button
            className={
              styles.customButton
            }
            onClick={() =>
              setOpenModal(true)
            }
          >
            + Create Custom Field
          </button>
        </SidebarSection>
      </div>

      <TemplateModal
        open={openModal}
        onClose={() =>
          setOpenModal(false)
        }
      />
    </>
  );
}