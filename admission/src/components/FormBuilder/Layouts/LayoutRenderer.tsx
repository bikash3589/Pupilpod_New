// "use client";

// import { CanvasNode } from "@/types/form-builder/field";
// import styles from "./Layout.module.css";

// import Header from "@/components/FormBuilder/Layouts/Header";
// import Section from "@/components/FormBuilder/Layouts/Section";
// import Container from "@/components/FormBuilder/Layouts/Container";
// import Row from "@/components/FormBuilder/Layouts/Row";
// import Column from "@/components/FormBuilder/Layouts/Column";
// import Divider from "@/components/FormBuilder/Layouts/Divider";
// import Spacer from "@/components/FormBuilder/Layouts/Spacer";

// interface LayoutRendererProps {
//   node: CanvasNode;

//   selected: boolean;

//   children?: React.ReactNode;

//   onSelect: (id: string | null) => void;

//   onDropNode: (
//     templateId: string,
//     parentId: string
//   ) => void;
// }

// export default function LayoutRenderer({
//   node,
//   selected,
//   children,
//   onSelect,
//   onDropNode,
// }: LayoutRendererProps) {

//   function handleDragOver(
//     event: React.DragEvent<HTMLElement>
//   ) {
//     event.preventDefault();

//     event.stopPropagation();
//   }

//   function handleDrop(
//     event: React.DragEvent<HTMLElement>
//   ) {
//     event.preventDefault();

//     event.stopPropagation();

//     const templateId =
//       event.dataTransfer.getData(
//         "templateId"
//       );

//     if (!templateId) {
//       return;
//     }

//     onDropNode(
//       templateId,
//       node.id
//     );
//   }

//   switch (node.type) {

//     case "header":
//       return (
//         <Header
//           title={node.label}
//           description=""
//         />
//       );

//     case "section":
//       return (
//         <Section
//           title={node.label}
//           selected={selected}
//           onClick={() =>
//             onSelect(node.id)
//           }
//           onDrop={handleDrop}
//           onDragOver={handleDragOver}
//         >
//           {children}
//         </Section>
//       );

//     case "container":
//       return (
//         <Container
//           title={node.label}
//           selected={selected}
//           onClick={() =>
//             onSelect(node.id)
//           }
//           onDrop={handleDrop}
//           onDragOver={handleDragOver}
//         >
//           {children}
//         </Container>
//       );

//     // case "grid-2":
//     //   return (
//     //     <Row
//     //       selected={selected}
//     //       onClick={() =>
//     //         onSelect(node.id)
//     //       }
//     //     >
//     //       <Column span={6}>
//     //         Drop Here
//     //       </Column>

//     //       <Column span={6}>
//     //         Drop Here
//     //       </Column>
//     //     </Row>
//     //   );

//     // case "grid-3":
//     //   return (
//     //     <Row
//     //       selected={selected}
//     //       onClick={() =>
//     //         onSelect(node.id)
//     //       }
//     //     >
//     //       <Column span={4}>
//     //         Drop Here
//     //       </Column>

//     //       <Column span={4}>
//     //         Drop Here
//     //       </Column>

//     //       <Column span={4}>
//     //         Drop Here
//     //       </Column>
//     //     </Row>
//     //   );

//     // case "grid-4":
//     //   return (
//     //     <Row
//     //       selected={selected}
//     //       onClick={() =>
//     //         onSelect(node.id)
//     //       }
//     //     >
//     //       <Column span={3}>
//     //         Drop Here
//     //       </Column>

//     //       <Column span={3}>
//     //         Drop Here
//     //       </Column>

//     //       <Column span={3}>
//     //         Drop Here
//     //       </Column>

//     //       <Column span={3}>
//     //         Drop Here
//     //       </Column>
//     //     </Row>
//     //   );
//     case "grid-2":
//   return (
//     <Row
//       selected={selected}
//       onClick={() => onSelect(node.id)}
//     >
//       <Column
//         span={6}
//         onDrop={handleDrop}
//         onDragOver={handleDragOver}
//       >
//         {children}
//       </Column>

//       <Column
//         span={6}
//         onDrop={handleDrop}
//         onDragOver={handleDragOver}
//       >
//         <div className={styles.dropZone}>
//           Drop Here
//         </div>
//       </Column>
//     </Row>
//   );

// case "grid-3":
//   return (
//     <Row
//       selected={selected}
//       onClick={() => onSelect(node.id)}
//     >
//       <Column
//         span={4}
//         onDrop={handleDrop}
//         onDragOver={handleDragOver}
//       >
//         {children}
//       </Column>

//       <Column
//         span={4}
//         onDrop={handleDrop}
//         onDragOver={handleDragOver}
//       >
//         <div className={styles.dropZone}>
//           Drop Here
//         </div>
//       </Column>

//       <Column
//         span={4}
//         onDrop={handleDrop}
//         onDragOver={handleDragOver}
//       >
//         <div className={styles.dropZone}>
//           Drop Here
//         </div>
//       </Column>
//     </Row>
//   );

// case "grid-4":
//   return (
//     <Row
//       selected={selected}
//       onClick={() => onSelect(node.id)}
//     >
//       <Column
//         span={3}
//         onDrop={handleDrop}
//         onDragOver={handleDragOver}
//       >
//         {children}
//       </Column>

//       <Column
//         span={3}
//         onDrop={handleDrop}
//         onDragOver={handleDragOver}
//       >
//         <div className={styles.dropZone}>
//           Drop Here
//         </div>
//       </Column>

//       <Column
//         span={3}
//         onDrop={handleDrop}
//         onDragOver={handleDragOver}
//       >
//         <div className={styles.dropZone}>
//           Drop Here
//         </div>
//       </Column>

//       <Column
//         span={3}
//         onDrop={handleDrop}
//         onDragOver={handleDragOver}
//       >
//         <div className={styles.dropZone}>
//           Drop Here
//         </div>
//       </Column>
//     </Row>
//   );

//     case "divider":
//       return <Divider />;

//     case "spacer":
//       return <Spacer />;

//     default:
//       return null;
//   }
// }
"use client";

import { CanvasNode } from "@/types/form-builder/field";

import Header from "@/components/FormBuilder/Layouts/Header";
import Section from "@/components/FormBuilder/Layouts/Section";
import Container from "@/components/FormBuilder/Layouts/Container";
import Row from "@/components/FormBuilder/Layouts/Row";
import Column from "@/components/FormBuilder/Layouts/Column";
import Divider from "@/components/FormBuilder/Layouts/Divider";
import Spacer from "@/components/FormBuilder/Layouts/Spacer";

interface LayoutRendererProps {
  node: CanvasNode;

  selected: boolean;

  children?: React.ReactNode;

  onSelect: (id: string | null) => void;

  onDropNode: (
    templateId: string,
    parentId: string
  ) => void;
}

export default function LayoutRenderer({
  node,
  selected,
  children,
  onSelect,
  onDropNode,
}: LayoutRendererProps) {

  function handleDragOver(
    event: React.DragEvent<HTMLElement>
  ) {
    event.preventDefault();
    event.stopPropagation();
  }

  function handleDrop(
    event: React.DragEvent<HTMLElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    const templateId =
      event.dataTransfer.getData("templateId");

    if (!templateId) {
      return;
    }

    onDropNode(templateId, node.id);
  }

  switch (node.type) {

    case "header":
      return (
        <Header
          title={node.label}
          description=""
        />
      );
    case "section":
      return (
        <Section
          title={node.label}
          selected={selected}
          onClick={() => onSelect(node.id)}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {children}
        </Section>
      );

    case "container":
      return (
        <Container
          title={node.label}
          selected={selected}
          onClick={() => onSelect(node.id)}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {children}
        </Container>
      );

    case "grid-2":
      return (
        <Row
          selected={selected}
          onClick={() => onSelect(node.id)}
        >
          <Column
            span={6}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {children}
          </Column>
        </Row>
      );

    case "grid-3":
      return (
        <Row
          selected={selected}
          onClick={() => onSelect(node.id)}
        >
          <Column
            span={4}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {children}
          </Column>
        </Row>
      );

    case "grid-4":
      return (
        <Row
          selected={selected}
          onClick={() => onSelect(node.id)}
        >
          <Column
            span={3}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {children}
          </Column>
        </Row>
      );

    case "divider":
      return <Divider />;

    case "spacer":
      return <Spacer />;

    default:
      return null;
  }
}