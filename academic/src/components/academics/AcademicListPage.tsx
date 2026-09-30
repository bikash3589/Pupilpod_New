"use client";

import Link from "next/link";
import { ReactNode } from "react";

export interface Crumb {
  label: string;
  href?: string;
}

interface AcademicListPageProps {
  title: string;
  subtitle?: string;
  breadcrumb?: Crumb[];
  actions?: ReactNode;
  helperNote?: string;
  children: ReactNode;
}

export default function AcademicListPage({
  title,
  subtitle,
  breadcrumb = [],
  actions,
  helperNote,
  children,
}: AcademicListPageProps) {
  const crumbs: Crumb[] = [{ label: "Home", href: "/academics" }, ...breadcrumb];

  return (
    <div>
      <div className="page-header-bar">
        <div>
          <div className="page-title">{title}</div>
          {subtitle && <div className="page-subtitle">{subtitle}</div>}
        </div>
        <div className="page-breadcrumb">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-6">
              {c.href && i < crumbs.length - 1 ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}
              {i < crumbs.length - 1 && <span>/</span>}
            </span>
          ))}
        </div>
      </div>
      {helperNote && <div className="helper-note">{helperNote}</div>}
      {actions && <div className="page-actions">{actions}</div>}
      {children}
    </div>
  );
}
