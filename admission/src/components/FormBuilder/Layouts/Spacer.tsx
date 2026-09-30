"use client";

interface SpacerProps {
  size?: "small" | "medium" | "large";
}

export default function Spacer({
  size = "medium",
}: SpacerProps) {
  const height = {
    small: 16,
    medium: 32,
    large: 60,
  };

  return (
    <div
      style={{
        height: height[size],
        width: "100%",
      }}
    />
  );
}