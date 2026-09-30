// schema: campaign_transitions_form_map — maps a DB table+column to a
// campaign's application-form field, read later by the enrollment importer
// to know which application field writes into which downstream column.
export interface FieldMappingRow {
  id: string;
  campaignId: string;
  tableName: string;
  columnName: string;
  fluentFormColumnName: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateFieldMappingInput = Omit<
  FieldMappingRow,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateFieldMappingInput = Partial<CreateFieldMappingInput>;
