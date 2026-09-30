"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { academicNavGroups } from "./navConfig";

// Other top-level modules from the production nav bar — out of scope for this
// build (Academic module only), rendered inert so the chrome matches without
// implying functionality that doesn't exist yet.
const inertModules = ["Admission", "Attendance", "Finance", "Transport", "Admin", "Assess", "Learn", "Other", "Reports", "LMS"];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close the mega-menu on navigation — adjusting state during render (rather
  // than in an effect) when a "prop" (the route) changes, per
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <header className="navbar" ref={containerRef}>
      <div className="navbar-inner">
        <div className="navbar-item navbar-brand-item">
          <span className="navbar-icon" aria-hidden>
            🎓
          </span>
          Pupilsight
        </div>

        <button type="button" className={`navbar-item navbar-dropdown-trigger ${open ? "open" : ""}`} onClick={() => setOpen((v) => !v)}>
          Academics
          <span className="navbar-caret">▾</span>
        </button>

        {inertModules.map((m) => (
          <span key={m} className="navbar-item navbar-item-inert" title="Outside this build's scope (Academic module only)">
            {m}
          </span>
        ))}

        <div className="navbar-right">
          <span className="badge badge-neutral">Academic Year 2025-26</span>
        </div>

        {open && (
          <div className="mega-menu">
            {academicNavGroups.map((group) => (
              <div key={group.title} className="mega-menu-col">
                <div className="mega-menu-heading">{group.title.toUpperCase()}</div>
                <ul>
                  {group.items.map((item) => {
                    const active = pathname === item.href || pathname?.startsWith(item.href + "/");
                    return (
                      <li key={item.href}>
                        <Link href={item.href} className={active ? "active" : ""}>
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
