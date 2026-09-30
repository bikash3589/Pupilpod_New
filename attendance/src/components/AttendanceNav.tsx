'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

interface MenuItem {
  label: string;
  items: Array<{ label: string; href: string }>;
}

const menuItems: MenuItem[] = [
  {
    label: 'Attendance Configur',
    items: [
      { label: 'Attendance Configuration', href: '/attendance/configuration' },
      { label: 'Sms Configuration', href: '/attendance/sms-configuration' },
      { label: 'Manage sms Template', href: '/attendance/templates' },
      // { label: 'Add New Configuration', href: '/attendance/configuration/new' },
      // { label: 'Staff Configuration', href: '/attendance/staff-configuration' },
      // { label: 'Notification Templates', href: '/attendance/templates' },
    ],
  },
  {
    label: 'Blocked Attendance',
    items: [
      { label: 'Block attendance', href: '/attendance/blocked-dates' },
    ],
  },
  {
    label: 'Future Information',
    items: [
      { label: 'Set Future Absence', href: '/attendance/future-absence' },
    ],
  },
  {
    label: 'Reports',
    items: [
      { label: 'Attendance Not Taken', href: '/attendance/reports/attendance-not-taken' },
      { label: 'Attendance Not Taken timetable wise', href: '/attendance/reports/attendance-not-taken-timetable' },
      { label: 'Attendance Summary by Date', href: '/attendance/reports/summary/date' },
      { label: 'Attendance Summary by Date & Percentage', href: '/attendance/reports/summary/percentage' },
      { label: 'Attendance Summary by Date session wise', href: '/attendance/reports/summary/session' },
      { label: 'Attendance Summary Report by Date', href: '/attendance/reports/summary/report-by-date' },
      { label: 'Attendance Trends', href: '/attendance/reports/trends' },
      { label: 'Student History', href: '/attendance/reports/student-history' },
      { label: 'Students Not Present', href: '/attendance/reports/students-not-present' },
    ],
  },
  {
    label: 'Take Attendance',
    items: [
      { label: 'Attendance By Person', href: '/attendance/mark/student' },
      { label: 'Attendance By Person Period Wise', href: '/attendance/mark/person-period' },
      { label: 'Attendance By Roll Group', href: '/attendance/mark/roll-group' },
      { label: 'Attendance By Section', href: '/attendance/mark/section' },
      { label: 'Attendance By Subject', href: '/attendance/mark/subject' },
      { label: 'Attendance By TimeTable', href: '/attendance/mark/timetable' },
      { label: 'View Daily Attendance', href: '/attendance/daily' },
    ],
  },
];

export const AttendanceNav: React.FC = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleDropdown = (label: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenDropdown((prev) => (prev === label ? null : label));
  };

  const handleMouseEnter = (label: string) => {
    // If one dropdown is already open, hovering adjacent tabs switches to them (like desktop menu bars)
    if (openDropdown !== null && openDropdown !== label) {
      setOpenDropdown(label);
    }
  };

  return (
    <nav className="attendance-nav-bar" ref={navRef} aria-label="Attendance Submenu">
      <div className="attendance-nav-items">
        {menuItems.map((menu) => {
          const isOpen = openDropdown === menu.label;
          return (
            <div
              key={menu.label}
              className={`attendance-nav-dropdown ${isOpen ? 'is-open' : ''}`}
              onMouseEnter={() => handleMouseEnter(menu.label)}
            >
              <button
                type="button"
                className={`attendance-nav-trigger ${isOpen ? 'active' : ''}`}
                onClick={(e) => toggleDropdown(menu.label, e)}
                aria-expanded={isOpen}
                aria-haspopup="true"
              >
                <span>{menu.label}</span>
                <ChevronDown className="dropdown-chevron-icon" size={14} />
              </button>

              {isOpen && menu.items && (
                <div
                  className="attendance-dropdown-menu"
                  role="menu"
                  aria-orientation="vertical"
                >
                  {menu.items.map((subItem) => (
                    <Link
                      key={subItem.label}
                      href={subItem.href}
                      className="attendance-dropdown-link"
                      role="menuitem"
                      onClick={() => setOpenDropdown(null)}
                    >
                      <span className="dropdown-bullet-dot">•</span>
                      <span>{subItem.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
};
