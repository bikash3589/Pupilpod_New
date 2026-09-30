"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "danger-solid" | "ghost" | "link";
type Size = "md" | "sm" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  disabledReason?: string;
}

const variantClass: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  danger: "btn-danger",
  "danger-solid": "btn-danger-solid",
  ghost: "btn-ghost",
  link: "btn-link",
};

const sizeClass: Record<Size, string> = {
  md: "",
  sm: "btn-sm",
  icon: "btn-icon",
};

export default function Button({
  variant = "secondary",
  size = "md",
  icon,
  disabledReason,
  className = "",
  children,
  title,
  ...rest
}: ButtonProps) {
  const classes = ["btn", variantClass[variant], sizeClass[size], className].filter(Boolean).join(" ");
  return (
    <button
      className={classes}
      title={disabledReason && rest.disabled ? disabledReason : title}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
