'use client';

import React from 'react';
import Link from 'next/link';

interface HeaderBreadcrumbsProps {
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export const HeaderBreadcrumbs: React.FC<HeaderBreadcrumbsProps> = ({
  title = 'Take Attendance By Section',
  breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Attendance', href: '/attendance' },
    { label: 'Take Attendance By Section' },
  ],
}) => {
  return (
    <div className="page-header">
      <h1 className="page-title">{title}</h1>
      <nav aria-label="Breadcrumb" className="breadcrumb-nav">
        <ol className="breadcrumb-list">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <li key={index} className="breadcrumb-item">
                {item.href && !isLast ? (
                  <Link href={item.href} className="breadcrumb-link">
                    {item.label}
                  </Link>
                ) : (
                  <span className={`breadcrumb-text ${isLast ? 'active' : ''}`}>
                    {item.label}
                  </span>
                )}
                {!isLast && <span className="breadcrumb-separator">/</span>}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};
