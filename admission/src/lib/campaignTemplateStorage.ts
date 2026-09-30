import type {
  CampaignTemplate,
  ImageFieldCoordinates,
  PhotoFieldName,
  SaveImageFieldCoordinatesInput,
  TemplateType,
  UploadCampaignTemplateInput,
} from "@/types/uploadTemplate";
import {
  deleteTemplateFile,
  getTemplateFileObjectUrl,
  putTemplateFile,
} from "./uploadTemplateFileStore";

const TEMPLATES_KEY = "campaignTemplates";
const IMAGE_FIELDS_KEY = "campaignImageFieldCoordinates";

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch (err) {
    console.error(`Failed to read ${key} from localStorage`, err);
    return [];
  }
}

function write<T>(key: string, rows: T[]): void {
  localStorage.setItem(key, JSON.stringify(rows));
}

function emptyTemplate(campaignId: string, type: TemplateType): CampaignTemplate {
  return {
    campaignId,
    type,
    name: null,
    fileKey: null,
    fileName: null,
    fileUrl: null,
    uploadedAt: null,
  };
}

// The stored filename is namespaced by campaign+type instead of the legacy
// app's flat shared folder (§4.1 point 3), and the original filename is
// sanitized before it becomes part of a storage key.
function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function makeFileKey(campaignId: string, type: TemplateType, fileName: string): string {
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${campaignId}/${type}/${uid}-${sanitizeFileName(fileName)}`;
}

// ---------------------------------------------------------------
// A. PDF template upload
// ---------------------------------------------------------------

export async function getCampaignTemplates(
  campaignId: string
): Promise<{ online: CampaignTemplate; offline: CampaignTemplate }> {
  const rows = read<CampaignTemplate>(TEMPLATES_KEY).filter(
    (t) => t.campaignId === campaignId
  );
  const online = rows.find((t) => t.type === "Online") ?? emptyTemplate(campaignId, "Online");
  const offline = rows.find((t) => t.type === "Offline") ?? emptyTemplate(campaignId, "Offline");

  // Object URLs don't survive a reload, so resolve fresh ones on every read.
  const resolvedOnline = online.fileKey
    ? { ...online, fileUrl: await getTemplateFileObjectUrl(online.fileKey) }
    : online;
  const resolvedOffline = offline.fileKey
    ? { ...offline, fileUrl: await getTemplateFileObjectUrl(offline.fileKey) }
    : offline;

  return { online: resolvedOnline, offline: resolvedOffline };
}

export async function uploadCampaignTemplate(
  input: UploadCampaignTemplateInput
): Promise<CampaignTemplate> {
  // Replicates form_template_addProcess.php / form_template_editProcess.php:
  // add and edit are the exact same write path (§4.1).
  const rows = read<CampaignTemplate>(TEMPLATES_KEY);
  const idx = rows.findIndex(
    (t) => t.campaignId === input.campaignId && t.type === input.type
  );
  const previous = idx >= 0 ? rows[idx] : null;

  const fileKey = makeFileKey(input.campaignId, input.type, input.file.name);
  await putTemplateFile(fileKey, input.file);

  // Unlike the legacy app (§4.1 point 5), actively clean up the superseded file.
  if (previous?.fileKey) {
    await deleteTemplateFile(previous.fileKey);
  }

  const record: CampaignTemplate = {
    campaignId: input.campaignId,
    type: input.type,
    name: input.name,
    fileKey,
    fileName: input.file.name,
    fileUrl: await getTemplateFileObjectUrl(fileKey),
    uploadedAt: new Date().toISOString(),
  };

  if (idx >= 0) {
    rows[idx] = record;
  } else {
    rows.push(record);
  }
  write(TEMPLATES_KEY, rows);
  return record;
}

export async function deleteCampaignTemplate(
  campaignId: string,
  type: TemplateType
): Promise<void> {
  const rows = read<CampaignTemplate>(TEMPLATES_KEY);
  const idx = rows.findIndex((t) => t.campaignId === campaignId && t.type === type);
  if (idx === -1) return;

  if (rows[idx].fileKey) {
    await deleteTemplateFile(rows[idx].fileKey);
  }

  // Matches form_template_deleteProcess.php: blank the slot, don't touch the campaign.
  rows[idx] = emptyTemplate(campaignId, type);
  write(TEMPLATES_KEY, rows);
}

// ---------------------------------------------------------------
// C. Image field coordinates
// ---------------------------------------------------------------

export function listImageFieldCoordinates(
  campaignId: string,
  templateType: TemplateType
): ImageFieldCoordinates[] {
  return read<ImageFieldCoordinates>(IMAGE_FIELDS_KEY).filter(
    (r) => r.campaignId === campaignId && r.templateType === templateType
  );
}

export function getImageFieldCoordinates(
  campaignId: string,
  fieldName: PhotoFieldName,
  templateType: TemplateType
): ImageFieldCoordinates | undefined {
  return read<ImageFieldCoordinates>(IMAGE_FIELDS_KEY).find(
    (r) =>
      r.campaignId === campaignId &&
      r.fieldName === fieldName &&
      r.templateType === templateType
  );
}

export function saveImageFieldCoordinates(
  input: SaveImageFieldCoordinatesInput
): ImageFieldCoordinates {
  // Replicates campaign_template_configure_imageProcess.php's delete-then-insert
  // (§4.3) — there's no unique constraint to rely on an upsert against.
  const rows = read<ImageFieldCoordinates>(IMAGE_FIELDS_KEY).filter(
    (r) =>
      !(
        r.campaignId === input.campaignId &&
        r.fieldName === input.fieldName &&
        r.templateType === input.templateType
      )
  );

  const record: ImageFieldCoordinates = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...input,
  };
  rows.push(record);
  write(IMAGE_FIELDS_KEY, rows);
  return record;
}

export function deleteImageFieldCoordinates(
  campaignId: string,
  fieldName: PhotoFieldName,
  templateType: TemplateType
): void {
  const rows = read<ImageFieldCoordinates>(IMAGE_FIELDS_KEY).filter(
    (r) =>
      !(
        r.campaignId === campaignId &&
        r.fieldName === fieldName &&
        r.templateType === templateType
      )
  );
  write(IMAGE_FIELDS_KEY, rows);
}
