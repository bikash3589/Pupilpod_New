// schema: campaign.template_* / offline_template_* — one PDF template per
// campaign per flow (Online/Offline). "type" picks which triplet of columns
// a given upload writes to.
export type TemplateType = "Online" | "Offline";

// schema: campaign_configure_image_template.field_name — fixed, 4 values,
// not user-extensible in the legacy UI.
export type PhotoFieldName =
  | "student_photo"
  | "father_photo"
  | "mother_photo"
  | "guardian_photo";

export const PHOTO_FIELDS: PhotoFieldName[] = [
  "student_photo",
  "father_photo",
  "mother_photo",
  "guardian_photo",
];

export interface CampaignTemplate {
  campaignId: string;
  type: TemplateType;
  name: string | null;
  fileKey: string | null; // IndexedDB key the PDF bytes are stored under
  fileName: string | null;
  fileUrl: string | null; // derived object URL — not persisted, regenerated on read
  uploadedAt: string | null;
}

// schema: campaign_configure_image_template
export interface ImageFieldCoordinates {
  id: string;
  campaignId: string;
  fieldName: PhotoFieldName;
  templateType: TemplateType;
  x: number | null;
  y: number | null;
  pageNo: number | null;
  width: number | null;
  height: number | null;
}

export interface TemplateFieldReference {
  fieldName: string;
  label: string;
  placeholder: string; // "${" + fieldName + "}"
}

export interface UploadCampaignTemplateInput {
  campaignId: string;
  type: TemplateType;
  name: string;
  file: File;
}

export interface SaveImageFieldCoordinatesInput {
  campaignId: string;
  fieldName: PhotoFieldName;
  templateType: TemplateType;
  x: number | null;
  y: number | null;
  pageNo: number | null;
  width: number | null;
  height: number | null;
}
