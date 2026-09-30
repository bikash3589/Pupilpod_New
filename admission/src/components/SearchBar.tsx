"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, usePathname } from "next/navigation";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  initialSearch?: string;
}

export default function SearchBar({ initialSearch = "" }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [text, setText] = useState(initialSearch);

  // Keep the input in sync when the URL's ?search= changes from elsewhere
  // (Clear Search navigation completing, browser back/forward).
  useEffect(() => {
    setText(initialSearch);
  }, [initialSearch]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(text ? `${pathname}?search=${encodeURIComponent(text)}` : pathname);
  };

  // A real navigation that drops the `search` query param entirely, not just
  // clearing the input client-side — otherwise a stale filtered list would
  // stay on screen until the next Go.
  const handleClear = () => {
    router.push(pathname);
  };

  return (
    <form className="searchContainer" onSubmit={handleSubmit}>
      <label htmlFor="searchInput" className={styles.searchLabel}>
        Search For (name, Academic Year)
      </label>

      <div className={styles.searchRow}>
        <input
          id="searchInput"
          type="text"
          className={styles.searchInput}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button type="button" className={styles.clearButton} onClick={handleClear}>
          Clear Search
        </button>

        <button type="submit" className={styles.goButton}>
          Go
        </button>
      </div>
    </form>
  );
}
