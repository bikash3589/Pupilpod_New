"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { getCampaignById } from "@/lib/campaignStorage";
import { filterRegisteredUsers, listRegisteredUsers } from "@/lib/registeredUserStorage";
import type { Campaign } from "@/types/campaign";

import RegisteredUserTable from "./components/RegisteredUserTable";
import SendMessageModal from "./components/SendMessageModal";
import styles from "./RegisteredUsers.module.css";

export default function RegisteredUsersPage() {
  const { id } = useParams<{ id: string }>();

  const [campaign, setCampaign] = useState<Campaign | null | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [messageChannel, setMessageChannel] = useState<"email" | "sms" | null>(null);

  useEffect(() => {
    setCampaign(getCampaignById(id) ?? null);
  }, [id]);

  const rows = useMemo(
    () => (campaign ? listRegisteredUsers(campaign.id) : []),
    [campaign, refreshKey]
  );

  const visibleRows = useMemo(
    () => filterRegisteredUsers(rows, query),
    [rows, query]
  );

  const refresh = () => setRefreshKey((k) => k + 1);

  const requireSelection = (channel: "email" | "sms") => {
    if (selectedIds.size === 0) {
      alert("You Have to select user first");
      return;
    }
    setMessageChannel(channel);
  };

  const toggleSelected = (registrationId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(registrationId)) next.delete(registrationId);
      else next.add(registrationId);
      return next;
    });
  };

  const toggleAll = (ids: string[]) => {
    setSelectedIds((prev) => {
      const allSelected = ids.length > 0 && ids.every((rowId) => prev.has(rowId));
      const next = new Set(prev);
      ids.forEach((rowId) => (allSelected ? next.delete(rowId) : next.add(rowId)));
      return next;
    });
  };

  if (campaign === undefined) {
    return (
      <main className="page">
        <p>Loading campaign...</p>
      </main>
    );
  }

  if (campaign === null) {
    return (
      <main className="page">
        <p>No campaign found for this id.</p>
        <Link href="/">Go to Home</Link>
      </main>
    );
  }

  return (
    <main className="page">
      <div className={styles.pageHeader}>
        <h1 className="page-title">Register User List</h1>
        <nav className={styles.breadcrumbNav}>
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/">Admission</Link>
          <span>/</span>
          <Link href="/">Campaign</Link>
        </nav>
      </div>

      <section className="application-container">
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className={styles.toolbarActions}>
            <button
              type="button"
              className={`navigationButton ${styles.sendButton}`}
              onClick={() => requireSelection("sms")}
            >
              Send SMS
            </button>
            <button
              type="button"
              className={`navigationButton ${styles.sendButton}`}
              onClick={() => requireSelection("email")}
            >
              Send Email
            </button>
          </div>
        </div>

        <RegisteredUserTable
          rows={visibleRows}
          query={query}
          onQueryChange={setQuery}
          selectedIds={selectedIds}
          onToggleSelected={toggleSelected}
          onToggleAll={toggleAll}
        />
      </section>

      {messageChannel && (
        <SendMessageModal
          channel={messageChannel}
          registrationIds={[...selectedIds]}
          onClose={() => setMessageChannel(null)}
          onSent={() => {
            setSelectedIds(new Set());
            refresh();
          }}
        />
      )}
    </main>
  );
}
