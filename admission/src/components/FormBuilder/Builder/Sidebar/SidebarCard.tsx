"use client";

interface SidebarCardProps {
  id: string;

  title: string;

  subtitle: string;

  badge?: string;

  dragData: string;
}

export default function SidebarCard({
  title,
  subtitle,
  badge,
  dragData,
}: SidebarCardProps) {
  function handleDragStart(
    event: React.DragEvent<HTMLButtonElement>
  ) {
    event.dataTransfer.setData(
      "drag-item",
      dragData
    );

    event.dataTransfer.effectAllowed = "copy";
  }

  return (
    <button
      draggable
      onDragStart={handleDragStart}
      style={{
        width: "100%",
        padding: "14px",
        borderRadius: "10px",
        border: "1px solid #d1d5db",
        background: "#fff",
        textAlign: "left",
        cursor: "grab",
        marginBottom: "12px",
      }}
    >
      <h3
        style={{
          marginBottom: 5,
        }}
      >
        {title}
      </h3>

      <small
        style={{
          color: "#6b7280",
        }}
      >
        {subtitle}
      </small>

      {badge && (
        <div
          style={{
            marginTop: 10,
            display: "inline-block",
            padding: "4px 8px",
            background: "#2563eb",
            color: "#fff",
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          {badge}
        </div>
      )}
    </button>
  );
}