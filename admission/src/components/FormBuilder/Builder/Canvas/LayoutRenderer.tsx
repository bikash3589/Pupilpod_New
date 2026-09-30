"use client";

import { CanvasNode } from "@/types/form-builder/field";

import Header from "@/components/FormBuilder/Layouts/Header";
import Section from "@/components/FormBuilder/Layouts/Section";
import Container from "@/components/FormBuilder/Layouts/Container";
import Row from "@/components/FormBuilder/Layouts/Row";
import Divider from "@/components/FormBuilder/Layouts/Divider";
import Spacer from "@/components/FormBuilder/Layouts/Spacer";

interface LayoutRendererProps {
  node: CanvasNode;

  selected: boolean;

  onSelect: (id: string | null) => void;

  onDropNode: (event: React.DragEvent<HTMLElement>, parentId: string) => void;
  // onUpdateNode: (id: string, updates: Partial<CanvasNode>) => void; // ← new
  onUpdateNode: (id: string, updates: Partial<CanvasNode>) => void; // ← new
  gridTemplateColumns?: string;

  children?: React.ReactNode;
}

export default function LayoutRenderer({
  node,
  selected,
  onSelect,
  onDropNode,
  // onUpdateNode,
  onUpdateNode,
  children,
  gridTemplateColumns,
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

    onDropNode(event, node.id);
  }

  switch (node.type) {
    case "header":
      return (
    //      <Header
    //   title={node.label}
    //   description={node.helpText ?? ""}
    //   logoUrl={node.logoUrl}
    //   onTitleChange={(value) => onUpdateNode(node.id, { label: value })}
    //   onDescriptionChange={(value) => onUpdateNode(node.id, { helpText: value })}
    //   onLogoChange={(dataUrl) => onUpdateNode(node.id, { logoUrl: dataUrl })}
    // />
     <Header
      title={node.label}
      description={node.helpText ?? ""}
      logoUrl={node.logoUrl}
      logoPosition={node.logoPosition}
      logoSize={node.logoSize}
      onTitleChange={(value) => onUpdateNode(node.id, { label: value })}
      onDescriptionChange={(value) => onUpdateNode(node.id, { helpText: value })}
      onLogoChange={(dataUrl) => onUpdateNode(node.id, { logoUrl: dataUrl })}
      onLogoPositionChange={(position) => onUpdateNode(node.id, { logoPosition: position })}
      onLogoSizeChange={(size) => onUpdateNode(node.id, { logoSize: size })}
      onLogoRemove={() => onUpdateNode(node.id, { logoUrl: undefined })}
    />
      );

    case "section":
      return (
        <Section
          title={node.label}
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
          gridTemplateColumns={gridTemplateColumns}
        >
          {children}
        </Row>
      );

    case "grid-3":
      return (
        <Row
          selected={selected}
          onClick={() => onSelect(node.id)}
          gridTemplateColumns={gridTemplateColumns}
        >
          {children}
        </Row>
      );

    case "grid-4":
      return (
        <Row
          selected={selected}
          onClick={() => onSelect(node.id)}
          gridTemplateColumns={gridTemplateColumns}
        >
          {children}
        </Row>
      );

    case "grid-1":
      return (
        <Row
          selected={selected}
          onClick={() => onSelect(node.id)}
          gridTemplateColumns={gridTemplateColumns}
        >
          {children}
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
