"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import MultiSelectTags from "@/components/MultiSelectTags";
import { CAMPAIGN_MODULE_BUTTONS, STAFF_OPTIONS } from "@/data/buttonPermission";
import {
  getButtonPermissions,
  saveButtonPermissions,
} from "@/lib/buttonPermissionStorage";
import type { ButtonPermissionGrants } from "@/types/buttonPermission";
import styles from "./ButtonPermission.module.css";

const STAFF_NAME_BY_ID = new Map(STAFF_OPTIONS.map((s) => [s.id, s.name]));
const STAFF_ID_BY_NAME = new Map(STAFF_OPTIONS.map((s) => [s.name, s.id]));
const STAFF_NAMES = STAFF_OPTIONS.map((s) => s.name);

export default function ButtonPermission() {
  const [grants, setGrants] = useState<ButtonPermissionGrants>({});
  const [loaded, setLoaded] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    setGrants(getButtonPermissions());
    setLoaded(true);
  }, []);

  const handleChange = (buttonId: string, selectedNames: string[]) => {
    setSavedMessage(false);
    setGrants((prev) => ({
      ...prev,
      [buttonId]: selectedNames
        .map((name) => STAFF_ID_BY_NAME.get(name))
        .filter((id): id is string => Boolean(id)),
    }));
  };

  const handleSave = () => {
    saveButtonPermissions(grants);
    setSavedMessage(true);
  };

  return (
    <main className="page">
      <header>
        <nav className="navigation">
          <Link href="/" className="navigationButton">Home</Link>
          <Link href="/" className="navigationButton">Admission</Link>
          <Link href="/" className="navigationButton">Campaign</Link>
        </nav>
      </header>
      <h1 className="page-title">Campaign Button Permission</h1>
      <div className="application-container">
        <div className={styles.container}>
          {!loaded ? (
            <p>Loading button permissions...</p>
          ) : (
            <>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Sl No</th>
                    <th>Button Name</th>
                    <th>Staff</th>
                  </tr>
                </thead>
                <tbody>
                  {CAMPAIGN_MODULE_BUTTONS.map((button, index) => {
                    const selectedNames = (grants[button.id] ?? [])
                      .map((id) => STAFF_NAME_BY_ID.get(id))
                      .filter((name): name is string => Boolean(name));

                    return (
                      <tr key={button.id}>
                        <td>{index + 1}</td>
                        <td className={styles.buttonName}>{button.name}</td>
                        <td>
                          <MultiSelectTags
                            options={STAFF_NAMES}
                            selected={selectedNames}
                            onChange={(next) => handleChange(button.id, next)}
                            placeholder="Select Staff"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className={styles.footer}>
                {savedMessage && (
                  <span className={styles.savedMessage}>Permissions saved.</span>
                )}
                <button
                  type="button"
                  className="navigationButton buttonSize"
                  onClick={handleSave}
                >
                  Save
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
