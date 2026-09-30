// Interim stand-in for `INFORMATION_SCHEMA.TABLES` / `SHOW COLUMNS FROM <table>`
// (transitions.php / transitionsColumnList.php). This app has no live MySQL
// connection yet, so the table/column universe the field-mapping screen lets
// staff pick from is this fixed list — limited to the tables the bulk
// enrollment importer (transitionImportProcess.php) actually writes to.
// `required` mirrors a NOT NULL column and is flagged with "*" in the UI.

export interface TableColumn {
  column: string;
  required: boolean;
}

export const TRANSITION_TABLES: Record<string, TableColumn[]> = {
  pupilsightPerson: [
    { column: "firstName", required: true },
    { column: "lastName", required: true },
    { column: "email", required: true },
    { column: "phone", required: false },
    { column: "gender", required: false },
    { column: "dateOfBirth", required: false },
  ],
  pupilsightFamily: [
    { column: "familyName", required: true },
    { column: "address", required: false },
  ],
  pupilsightFamilyAdult: [
    { column: "familyId", required: true },
    { column: "personId", required: true },
    { column: "isPrimaryContact", required: false },
  ],
  pupilsightFamilyRelationship: [
    { column: "familyId", required: true },
    { column: "personId", required: true },
    { column: "relationshipType", required: true },
  ],
  pupilsightFamilyChild: [
    { column: "familyId", required: true },
    { column: "personId", required: true },
  ],
  pupilsightStudentEnrolment: [
    { column: "personId", required: true },
    { column: "programId", required: true },
    { column: "yearGroupId", required: true },
    { column: "enrolmentDate", required: false },
  ],
  seatmatrix: [
    { column: "campaignId", required: true },
    { column: "programId", required: true },
    { column: "className", required: true },
    { column: "usedSeats", required: false },
    { column: "remainingSeats", required: false },
  ],
};

export function getTableNames(): string[] {
  return Object.keys(TRANSITION_TABLES);
}

export function getColumnsForTable(tableName: string): TableColumn[] {
  return TRANSITION_TABLES[tableName] ?? [];
}
