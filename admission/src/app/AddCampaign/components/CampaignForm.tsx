"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import styles from "../AddCampaign.module.css";
import campaignFieldStyles from "@/components/CampaignField.module.css";
import CampaignField, {
  type CampaignFieldHandle,
} from "@/components/CampaignField";
import MultiSelectTags from "@/components/MultiSelectTags";
import { getCampaignById, updateCampaign } from "@/lib/campaignStorage";
import { saveDraftCampaign } from "@/lib/campaignDraftStorage";
import type { Campaign, SeatMatrixEntry } from "@/types/campaign";

// schema: campaign.pupilsightProgramID is a CSV of Program ids — a campaign
// can target more than one program, so this is a fixed catalog, not free text.
const PROGRAM_OPTIONS = ["ICSE", "CBSE"];

// schema: campaign.classes is a CSV of pupilsightYearGroupID — Class/YearGroup
// is a fixed catalog (pupilsightYearGroup), not free text either.
const CLASS_OPTIONS = [
  "Nursery",
  "LKG",
  "UKG",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
];

// Small stroke icons for the Application Forms row — no icon library in
// this project, so these are inlined rather than pulling in a dependency.
const iconProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function EyeIcon() {
  return (
    <svg {...iconProps}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg {...iconProps}>
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg {...iconProps}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg {...iconProps}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export type CampaignFormValues = Omit<Campaign, "id" | "createdAt">;

type CampaignFormProps = {
  initialValues?: Campaign;
  onSubmit: (values: CampaignFormValues) => void;
  submitLabel?: string;
  // True right after coming back from the form builder having saved a
  // form for this campaign — shows a small "Form Created" note under the
  // Online Form icons.
  formJustSaved?: boolean;
};

const emptySeatEntry: SeatMatrixEntry = {
  seatProgram: "",
  seatClass: "",
  campaignSeat: null,
  seatFromDate: "",
  seatToDate: "",
};

export default function CampaignForm({
  initialValues,
  onSubmit,
  submitLabel = "Submit",
  formJustSaved = false,
}: CampaignFormProps) {
  const router = useRouter();

  const formRef = useRef<HTMLFormElement | null>(null);
  const nameRef = useRef<CampaignFieldHandle | null>(null);
  const startDateRef = useRef<CampaignFieldHandle | null>(null);
  const endDateRef = useRef<CampaignFieldHandle | null>(null);

  // Tracked live (not just via the ref) so the Online Form eye/edit icons
  // can be gated on it being filled in.
  const [name, setName] = useState(initialValues?.name ?? "");

  const [programs, setPrograms] = useState<string[]>(
    initialValues?.programs ?? []
  );
  const [classes, setClasses] = useState<string[]>(
    initialValues?.classes ?? []
  );
  const [programError, setProgramError] = useState("");
  const [classError, setClassError] = useState("");

  // ---- Seat Matrix state — pre-filled from initialValues when editing ----
  // Initial row ids must be deterministic (not crypto.randomUUID()) — this
  // runs during the initial useState call on both the server render and the
  // client's first render before hydration, and random ids would produce
  // two different values, causing a hydration mismatch. Rows added later
  // via addSeatRow are a client-only interaction, so those are fine to
  // randomize.
  const [seatRows, setSeatRows] = useState<
    { id: string; initial: SeatMatrixEntry }[]
  >(() => {
    const seed = initialValues?.seatMatrix?.length
      ? initialValues.seatMatrix
      : [emptySeatEntry];
    return seed.map((entry, index) => ({
      id: `seat-initial-${index}`,
      initial: entry,
    }));
  });

  const [seatTotals, setSeatTotals] = useState<Record<string, number>>(() => {
    const totals: Record<string, number> = {};
    seatRows.forEach((row) => {
      totals[row.id] = row.initial.campaignSeat ?? 0;
    });
    return totals;
  });

  const addSeatRow = () => {
    setSeatRows((rows) => [
      ...rows,
      { id: crypto.randomUUID(), initial: emptySeatEntry },
    ]);
  };

  const removeSeatRow = (id: string) => {
    if (seatRows.length === 1) return;

    setSeatRows((rows) => rows.filter((row) => row.id !== id));
    setSeatTotals((totals) => {
      const updated = { ...totals };
      delete updated[id];
      return updated;
    });
  };

  const handleSeatChange = (id: string, value: string) => {
    const num = Number(value);
    setSeatTotals((totals) => ({
      ...totals,
      [id]: Number.isNaN(num) ? 0 : num,
    }));
  };

  const totalSeats = Object.values(seatTotals).reduce(
    (sum, n) => sum + n,
    0
  );

  // Reads whatever is currently typed into the form (valid or not) and
  // builds a CampaignFormValues snapshot out of it. Shared by the real
  // submit handler and by the draft-save triggered from the Online Form
  // eye/edit buttons, which can fire before the admin has finished
  // filling the campaign out.
  const buildValuesFromCurrentForm = (): CampaignFormValues => {
    const formData = new FormData(formRef.current ?? undefined);

    const getStr = (key: string) =>
      (formData.get(key)?.toString() ?? "").trim();

    const getNum = (key: string) => {
      const val = getStr(key);
      if (val === "") return null;
      const num = Number(val);
      return Number.isNaN(num) ? null : num;
    };

    const seatMatrix: SeatMatrixEntry[] = seatRows.map(({ id }) => ({
      seatProgram: getStr(`seatProgram_${id}`),
      seatClass: getStr(`seatClass_${id}`),
      campaignSeat: getNum(`campaignSeat_${id}`),
      seatFromDate: getStr(`seatFromDate_${id}`),
      seatToDate: getStr(`seatToDate_${id}`),
    }));

    return {
      name: getStr("name"),
      academicYear: getStr("academicYear"),
      programs,
      classes,
      limitMaxUsers: getNum("limitMaxUsers"),
      status: getStr("status") as Campaign["status"],
      startDate: getStr("startDate"),
      endDate: getStr("endDate"),
      registrationRequired: getStr(
        "registrationRequired"
      ) as Campaign["registrationRequired"],
      applicationSeries: getStr("applicationSeries"),
      admissionSeries: getStr("admissionSeries"),
      feeStructure: getStr("feeStructure"),
      receiptTemplate: getStr("receiptTemplate"),
      emailTemplate: getStr("emailTemplate"),
      smsTemplate: getStr("smsTemplate"),
      applicationFeeSettings: getStr("applicationFeeSettings"),
      publishForParent: formData.get("publishForParent") === "on",
      allowMultipleSubmission:
        formData.get("allowMultipleSubmission") === "on",
      description: getStr("description"),
      seatMatrix,
    };
  };

  // ---- Submit handler ----
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nameValid = nameRef.current?.validate() ?? true;
    const startDateValid = startDateRef.current?.validate() ?? true;
    const endDateValid = endDateRef.current?.validate() ?? true;

    const programValid = programs.length > 0;
    const classValid = classes.length > 0;
    setProgramError(programValid ? "" : "Can't be empty!");
    setClassError(classValid ? "" : "Can't be empty!");

    if (!nameValid || !programValid || !classValid || !startDateValid || !endDateValid) {
      return;
    }

    onSubmit(buildValuesFromCurrentForm());
  };

  // Persists whatever has been filled in so far (valid or not — the
  // campaign's own mandatory fields don't need to be complete yet) under
  // `id`, so navigating into the form builder never loses it. A campaign
  // that's already real (submitted at least once) gets updated in place;
  // anything else is kept as a draft — NOT in the real "campaigns" list —
  // so an incomplete, in-progress campaign never shows up on the Home page
  // table. It only becomes real when the admin actually finishes filling
  // it in and submits.
  const persistCurrentSnapshot = (id: string) => {
    const values = buildValuesFromCurrentForm();
    if (getCampaignById(id)) {
      updateCampaign(id, values);
      return;
    }
    saveDraftCampaign({
      id,
      createdAt: initialValues?.createdAt ?? new Date().toISOString(),
      ...values,
    });
  };

  const goToOnlineFormView = () => {
    if (initialValues?.id) {
      persistCurrentSnapshot(initialValues.id);
      router.push(`/campaign/${initialValues.id}/view`);
      return;
    }
    const id = crypto.randomUUID();
    persistCurrentSnapshot(id);
    // replace, not push: this "Add Campaign" screen has nothing saved to
    // come back to — /campaign/[id]/edit (which the builder's Back link
    // points at) is the real continuation now, so it should be what the
    // browser's own Back button lands on too, not a blank form.
    router.replace(`/campaign/${id}/form-builder?from=edit`);
  };

  const goToOnlineFormBuilder = () => {
    const id = initialValues?.id ?? crypto.randomUUID();
    persistCurrentSnapshot(id);
    if (initialValues?.id) {
      router.push(`/campaign/${id}/form-builder?from=edit`);
    } else {
      router.replace(`/campaign/${id}/form-builder?from=edit`);
    }
  };

  const currentYear = new Date().getFullYear();
  const academicYears = Array.from(
    new Set([
      initialValues?.academicYear,
      `${currentYear}-${currentYear + 1}`,
      `${currentYear + 1}-${currentYear + 2}`,
    ])
  ).filter((year): year is string => Boolean(year));

  return (
    <form
      ref={formRef}
      className={styles.applicationContainer}
      onSubmit={handleSubmit}
    >
      {/* ================= FORM GRID ================= */}
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <CampaignField
            ref={nameRef}
            label="Name"
            name="name"
            required
            defaultValue={initialValues?.name}
            errorMessage="Can't be empty!"
            onValueChange={setName}
          />
        </div>

        <div className={styles.formGroup}>
          <CampaignField
            label="Academic Year"
            name="academicYear"
            type="select"
            defaultValue={initialValues?.academicYear ?? academicYears[0]}
            options={academicYears.map((year) => ({
              value: year,
              label: year,
            }))}
          />
        </div>

        <div className={styles.formGroup}>
          <div className={campaignFieldStyles.field}>
            <label>
              Program<span className={campaignFieldStyles.required}> *</span>
            </label>
            <MultiSelectTags
              options={PROGRAM_OPTIONS}
              selected={programs}
              onChange={(next) => {
                setPrograms(next);
                if (next.length > 0) setProgramError("");
              }}
              placeholder="Select Program"
            />
            {programError && (
              <p className={campaignFieldStyles.error}>{programError}</p>
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <div className={campaignFieldStyles.field}>
            <label>
              Class<span className={campaignFieldStyles.required}> *</span>
            </label>
            <MultiSelectTags
              options={CLASS_OPTIONS}
              selected={classes}
              onChange={(next) => {
                setClasses(next);
                if (next.length > 0) setClassError("");
              }}
              placeholder="Select Class"
            />
            {classError && (
              <p className={campaignFieldStyles.error}>{classError}</p>
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <CampaignField
            label="Limit Max Users"
            name="limitMaxUsers"
            type="number"
            defaultValue={initialValues?.limitMaxUsers?.toString()}
          />
        </div>

        <div className={styles.formGroup}>
          <CampaignField
            label="Status"
            type="select"
            required
            name="status"
            defaultValue={initialValues?.status ?? "Draft"}
            options={[
              { value: "Draft", label: "Draft" },
              { value: "Published", label: "Published" },
              { value: "Stopped", label: "Stopped" },
            ]}
          />
        </div>

        <div className={styles.formGroup}>
          <CampaignField
            ref={startDateRef}
            label="Start Date"
            required
            name="startDate"
            type="date"
            placeholder="dd/mm/yyyy"
            defaultValue={initialValues?.startDate}
            errorMessage="Cant be empty!"
          />
        </div>

        <div className={styles.formGroup}>
          <CampaignField
            ref={endDateRef}
            label="End Date"
            required
            name="endDate"
            type="date"
            defaultValue={initialValues?.endDate}
            errorMessage="Can't be empty!"
          />
        </div>

        <div className={styles.formGroup}>
          <CampaignField
            label="Registration Required"
            type="select"
            required
            name="registrationRequired"
            defaultValue={initialValues?.registrationRequired ?? "No"}
            options={[
              { value: "No", label: "No" },
              { value: "Yes", label: "Yes" },
            ]}
          />
        </div>

        <div className={styles.formGroup}>
          <CampaignField
            label="Application Series"
            type="select"
            name="applicationSeries"
            defaultValue={initialValues?.applicationSeries}
            options={[{ value: "", label: "Select Series" }]}
          />
        </div>

        <div className={styles.formGroup}>
          <CampaignField
            label="Admission Series"
            type="select"
            name="admissionSeries"
            defaultValue={initialValues?.admissionSeries}
            options={[{ value: "", label: "Select Series" }]}
          />
        </div>

        <div className={styles.formGroup}>
          <CampaignField
            label="Fee Structure"
            type="select"
            name="feeStructure"
            defaultValue={initialValues?.feeStructure}
            options={[{ value: "", label: "Select Fee Structure" }]}
          />
        </div>

        <div className={styles.formGroup}>
          <CampaignField
            label="Receipt Template"
            type="select"
            name="receiptTemplate"
            defaultValue={initialValues?.receiptTemplate}
            options={[{ value: "", label: "Select Receipt Template" }]}
          />
        </div>

        <div className={styles.formGroup}>
          <CampaignField
            label="Email Template"
            type="select"
            name="emailTemplate"
            defaultValue={initialValues?.emailTemplate}
            options={[{ value: "", label: "Select Email Template" }]}
          />
        </div>

        <div className={styles.formGroup}>
          <CampaignField
            label="Sms Template"
            type="select"
            name="smsTemplate"
            defaultValue={initialValues?.smsTemplate}
            options={[{ value: "", label: "Select Sms Template" }]}
          />
        </div>

        <div className={styles.formGroup}>
          <CampaignField
            label="Application Fee Settings"
            type="select"
            name="applicationFeeSettings"
            defaultValue={initialValues?.applicationFeeSettings}
            options={[{ value: "", label: "Select Setting" }]}
          />
        </div>
      </div>

      {/* ================= CHECKBOXES ================= */}
      <div className={styles.checkboxRow}>
        <div className={styles.checkboxGroup}>
          <label>Publish For Parent</label>
          <input
            type="checkbox"
            name="publishForParent"
            defaultChecked={initialValues?.publishForParent}
          />
        </div>
        <div className={styles.checkboxGroup}>
          <label>Allow Multiple Submission</label>
          <input
            type="checkbox"
            name="allowMultipleSubmission"
            defaultChecked={initialValues?.allowMultipleSubmission}
          />
        </div>
      </div>

      {/* ================= DESCRIPTION ================= */}
      <div className={styles.descriptionGroup}>
        <label>Description</label>
        <textarea name="description" defaultValue={initialValues?.description} />
      </div>

      {/* ================= APPLICATION FORMS ================= */}
      <div className={styles.applicationFormsSection}>
        <p className={styles.applicationFormsTitle}>Application Forms</p>
        <div className={styles.applicationFormsRow}>
          <div className={styles.onlineFormColumn}>
            <div className={styles.formTypeGroup}>
              <span>Online Form :</span>
              {name.trim() ? (
                <>
                  <button
                    type="button"
                    className={styles.iconButton}
                    title="View Online Form"
                    onClick={goToOnlineFormView}
                  >
                    <EyeIcon />
                  </button>
                  <button
                    type="button"
                    className={styles.iconButton}
                    title="Edit Online Form"
                    onClick={goToOnlineFormBuilder}
                  >
                    <EditIcon />
                  </button>
                  <button
                    type="button"
                    className={styles.iconButton}
                    title="Duplicate Online Form"
                  >
                    <CopyIcon />
                  </button>
                </>
              ) : (
                <span className={styles.onlineFormHint}>
                  Enter a campaign name to create the application form
                </span>
              )}
            </div>

            {formJustSaved && name.trim() && (
              <span className={styles.formSavedNote}>Form Created</span>
            )}
          </div>

          <div className={styles.formTypeGroup}>
            <span>Offline Form :</span>
            <button
              type="button"
              className={styles.iconButton}
              title="Create Offline Form"
            >
              <PlusIcon />
            </button>
          </div>
        </div>
      </div>

      {/* ================= SEAT MATRIX ================= */}
      <div className={styles.seatHeader}>
        <button type="button" onClick={addSeatRow}>
          Add More Seat Matrix
        </button>
        <span>Total Seats : {totalSeats}</span>
      </div>

      {seatRows.map(({ id, initial }) => (
        <div className={styles.seatGrid} key={id}>
          <div className={styles.formGroup}>
            <CampaignField
              label="Program"
              type="select"
              name={`seatProgram_${id}`}
              defaultValue={initial.seatProgram}
              options={[{ value: "", label: "Select Program" }]}
            />
          </div>

          <div className={styles.formGroup}>
            <CampaignField
              label="Class"
              type="select"
              name={`seatClass_${id}`}
              defaultValue={initial.seatClass}
              options={[{ value: "", label: "Select Class" }]}
            />
          </div>

          <div className={styles.formGroup}>
            <CampaignField
              label="Campaign Seat"
              name={`campaignSeat_${id}`}
              type="number"
              defaultValue={initial.campaignSeat?.toString()}
              onValueChange={(value) => handleSeatChange(id, value)}
            />
          </div>

          <div className={styles.formGroup}>
            <CampaignField
              label="From Date"
              name={`seatFromDate_${id}`}
              type="date"
              defaultValue={initial.seatFromDate}
            />
          </div>

          <div className={styles.formGroup}>
            <CampaignField
              label="To Date"
              name={`seatToDate_${id}`}
              type="date"
              defaultValue={initial.seatToDate}
            />
          </div>

          <button
            type="button"
            className={styles.removeRowButton}
            onClick={() => removeSeatRow(id)}
            title="Remove this row"
            disabled={seatRows.length === 1}
          >
            ✕
          </button>
        </div>
      ))}

      {/* ================= FOOTER ================= */}
      <div className={styles.formFooter}>
        <span>* denotes a required field</span>
        <button type="submit">{submitLabel}</button>
      </div>
    </form>
  );
}
