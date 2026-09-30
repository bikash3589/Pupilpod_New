// "use client";

// /**
//  * DateField.tsx
//  * --------------
//  * A self-contained calendar-picker widget. It doesn't know anything about
//  * CanvasNode, the builder, or the preview — it just takes a few simple
//  * props (placeholder, min/max date, format) and manages its own
//  * open/closed state and selected day internally. That's what lets the
//  * EXACT same component be reused in two very different places:
//  *
//  *   1. Fields/TextField.tsx  -> shown on the builder canvas while designing
//  *   2. Preview/FormPreview.tsx -> shown on the live, fillable preview page
//  *
//  * Dates are always stored/compared internally as plain "YYYY-MM-DD"
//  * strings — that format happens to sort correctly with normal string
//  * comparison (">", "<"), which is what makes the min/max date checks
//  * below so simple.
//  */

// import { useEffect, useRef, useState } from "react";
// import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
// import styles from "./DateField.module.css";

// interface DateFieldProps {
//   placeholder?: string;
//   minDate?: string; // "YYYY-MM-DD", optional
//   maxDate?: string; // "YYYY-MM-DD", optional
//   dateFormat?: string; // e.g. "MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"
//   disabled?: boolean;
// }

// const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// const MONTH_LABELS = [
//   "January", "February", "March", "April", "May", "June",
//   "July", "August", "September", "October", "November", "December",
// ];

// // Turns a real JS Date object into a "YYYY-MM-DD" string.
// function toISODate(date: Date): string {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const day = String(date.getDate()).padStart(2, "0");
//   return `${year}-${month}-${day}`;
// }

// // Turns "2026-07-27" into "07/27/2026" (or whichever format was chosen).
// function formatDisplayDate(iso: string, format: string): string {
//   const [year, month, day] = iso.split("-");
//   if (!year || !month || !day) return "";
//   return format.replace("YYYY", year).replace("MM", month).replace("DD", day);
// }

// export default function DateField({
//   placeholder = "Select a date",
//   minDate,
//   maxDate,
//   dateFormat = "MM/DD/YYYY",
//   disabled = false,
// }: DateFieldProps) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [selectedDate, setSelectedDate] = useState<string | null>(null);

//   // Which month/year the calendar is currently showing (separate from
//   // which day is actually selected, so you can browse without picking).
//   const [viewDate, setViewDate] = useState<Date>(new Date());

//   const wrapperRef = useRef<HTMLDivElement>(null);

//   // Close the calendar panel if you click anywhere outside of it.
//   useEffect(() => {
//     if (!isOpen) return;

//     function handleOutsideClick(event: MouseEvent) {
//       if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//       }
//     }

//     document.addEventListener("mousedown", handleOutsideClick);
//     return () => document.removeEventListener("mousedown", handleOutsideClick);
//   }, [isOpen]);

//   // A date is "disabled" (greyed out, unclickable) if it falls outside
//   // the min/max range set in Properties.
//   function isDisabledDate(iso: string): boolean {
//     if (minDate && iso < minDate) return true;
//     if (maxDate && iso > maxDate) return true;
//     return false;
//   }

//   function handleSelectDay(day: number) {
//     const picked = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
//     const iso = toISODate(picked);
//     if (isDisabledDate(iso)) return; // ignore clicks on disabled days
//     setSelectedDate(iso);
//     setIsOpen(false);
//   }

//   function goToPreviousMonth() {
//     setViewDate((previous) => new Date(previous.getFullYear(), previous.getMonth() - 1, 1));
//   }

//   function goToNextMonth() {
//     setViewDate((previous) => new Date(previous.getFullYear(), previous.getMonth() + 1, 1));
//   }

//   // ------------------------------------------------------------------
//   // Building the calendar grid for whichever month is being viewed.
//   // ------------------------------------------------------------------
//   const year = viewDate.getFullYear();
//   const month = viewDate.getMonth();

//   // What weekday (0 = Sunday ... 6 = Saturday) does day 1 fall on?
//   // This tells us how many empty cells to pad at the start of the grid.
//   const firstWeekday = new Date(year, month, 1).getDay();

//   // "Day 0 of next month" is a neat trick that gives you the LAST day
//   // of THIS month.
//   const daysInMonth = new Date(year, month + 1, 0).getDate();

//   const leadingBlanks = Array.from({ length: firstWeekday });
//   const dayCells = Array.from({ length: daysInMonth }, (_, index) => index + 1);

//   const todayISO = toISODate(new Date());

//   return (
//     <div className={styles.wrapper} ref={wrapperRef} data-no-drag>
//       {/* The visible box you click on — looks like a normal input. */}
//       <button
//         type="button"
//         className={`${styles.trigger} ${disabled ? styles.disabledTrigger : ""}`}
//         onClick={disabled ? undefined : () => setIsOpen((previous) => !previous)}
//         disabled={disabled}
//         data-no-drag
//       >
//         <span className={selectedDate ? styles.valueText : styles.placeholderText}>
//           {selectedDate ? formatDisplayDate(selectedDate, dateFormat) : placeholder}
//         </span>
//         <Calendar size={16} className={styles.icon} />
//       </button>

//       {/* The calendar dropdown — only rendered while open. */}
//       {isOpen && (
//         <div className={styles.panel} data-no-drag>
//           <div className={styles.panelHeader}>
//             <button type="button" className={styles.navButton} onClick={goToPreviousMonth} data-no-drag>
//               <ChevronLeft size={16} />
//             </button>
//             <span className={styles.monthLabel}>
//               {MONTH_LABELS[month]} {year}
//             </span>
//             <button type="button" className={styles.navButton} onClick={goToNextMonth} data-no-drag>
//               <ChevronRight size={16} />
//             </button>
//           </div>

//           <div className={styles.weekdayRow}>
//             {WEEKDAY_LABELS.map((label) => (
//               <span key={label} className={styles.weekdayLabel}>{label}</span>
//             ))}
//           </div>

//           <div className={styles.dayGrid}>
//             {/* Empty cells so day 1 lines up under the correct weekday column */}
//             {leadingBlanks.map((_, index) => (
//               <span key={`blank-${index}`} className={styles.dayBlank} />
//             ))}

//             {dayCells.map((day) => {
//               const iso = toISODate(new Date(year, month, day));
//               const disabled = isDisabledDate(iso);
//               const isSelected = iso === selectedDate;
//               const isToday = iso === todayISO;

//               return (
//                 <button
//                   key={day}
//                   type="button"
//                   className={[
//                     styles.dayCell,
//                     isSelected ? styles.daySelected : "",
//                     isToday && !isSelected ? styles.dayToday : "",
//                   ].join(" ")}
//                   disabled={disabled}
//                   onClick={() => handleSelectDay(day)}
//                   data-no-drag
//                 >
//                   {day}
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       )}
//     </div>
//   );
//}


"use client";

/**
 * DateField.tsx
 * --------------
 * FIX: this used to keep the picked date in its OWN private state
 * (`selectedDate`), completely disconnected from the field's actual
 * data. That's why setting a date on the canvas felt like it "didn't
 * stick" — nothing was ever saving it anywhere.
 *
 * Now this is a CONTROLLED component: it doesn't own the selected date
 * at all. The parent passes in `value` (what's currently selected) and
 * `onChange` (called with the new date whenever you pick one) — same
 * pattern as a normal <input value={...} onChange={...} />.
 *
 *   - In TextField.tsx (the builder canvas), `value` comes from
 *     `field.defaultValue` and `onChange` saves straight back onto the
 *     node via `onUpdateNode`. This is what makes the admin's chosen
 *     date actually persist now.
 *   - In FormPreview.tsx (the live preview), a small wrapper keeps its
 *     own local state, seeded from that same saved default, so the
 *     field starts pre-filled but stays freely editable per visit.
 *
 * Everything about the calendar UI itself (opening/closing, browsing
 * months, min/max disabling) is unchanged.
 */

import { useState, useEffect, useRef } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./DateField.module.css";

interface DateFieldProps {
  value?: string;                      // the currently selected date, "YYYY-MM-DD"
  onChange?: (iso: string) => void;    // called with the new date when one is picked
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  dateFormat?: string;
  disabled?: boolean;
}

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Turns "2026-07-27" back into a real Date object. We parse the pieces
// out manually (rather than `new Date("2026-07-27")`) because the
// built-in parser treats that string as UTC midnight, which can quietly
// shift the displayed day by one depending on the browser's timezone.
function fromISODate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDisplayDate(iso: string, format: string): string {
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return "";
  return format.replace("YYYY", year).replace("MM", month).replace("DD", day);
}

export default function DateField({
  value,
  onChange,
  placeholder = "Select a date",
  minDate,
  maxDate,
  dateFormat = "MM/DD/YYYY",
  disabled = false,
}: DateFieldProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Which month the calendar is currently browsing. Starts on the
  // already-selected date's month if there is one, otherwise today.
  const [viewDate, setViewDate] = useState<Date>(() => (value ? fromISODate(value) : new Date()));

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleOutsideClick(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  function isDisabledDate(iso: string): boolean {
    if (minDate && iso < minDate) return true;
    if (maxDate && iso > maxDate) return true;
    return false;
  }

  function handleSelectDay(day: number) {
    const picked = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const iso = toISODate(picked);
    if (isDisabledDate(iso)) return;

    onChange?.(iso); // <-- tells the PARENT about the new date, instead of storing it locally
    setIsOpen(false);
  }

  function goToPreviousMonth() {
    setViewDate((previous) => new Date(previous.getFullYear(), previous.getMonth() - 1, 1));
  }

  function goToNextMonth() {
    setViewDate((previous) => new Date(previous.getFullYear(), previous.getMonth() + 1, 1));
  }

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = Array.from({ length: firstWeekday });
  const dayCells = Array.from({ length: daysInMonth }, (_, index) => index + 1);
  const todayISO = toISODate(new Date());

  return (
    <div className={styles.wrapper} ref={wrapperRef} data-no-drag>
      <button
        type="button"
        className={`${styles.trigger} ${disabled ? styles.disabledTrigger : ""}`}
        onClick={disabled ? undefined : () => setIsOpen((previous) => !previous)}
        disabled={disabled}
        data-no-drag
      >
        <span className={value ? styles.valueText : styles.placeholderText}>
          {value ? formatDisplayDate(value, dateFormat) : placeholder}
        </span>
        <Calendar size={16} className={styles.icon} />
      </button>

      {isOpen && (
        <div className={styles.panel} data-no-drag>
          <div className={styles.panelHeader}>
            <button type="button" className={styles.navButton} onClick={goToPreviousMonth} data-no-drag>
              <ChevronLeft size={16} />
            </button>
            <span className={styles.monthLabel}>
              {MONTH_LABELS[month]} {year}
            </span>
            <button type="button" className={styles.navButton} onClick={goToNextMonth} data-no-drag>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className={styles.weekdayRow}>
            {WEEKDAY_LABELS.map((label) => (
              <span key={label} className={styles.weekdayLabel}>{label}</span>
            ))}
          </div>

          <div className={styles.dayGrid}>
            {leadingBlanks.map((_, index) => (
              <span key={`blank-${index}`} className={styles.dayBlank} />
            ))}

            {dayCells.map((day) => {
              const iso = toISODate(new Date(year, month, day));
              const dayDisabled = isDisabledDate(iso);
              const isSelected = iso === value;
              const isToday = iso === todayISO;

              return (
                <button
                  key={day}
                  type="button"
                  className={[
                    styles.dayCell,
                    isSelected ? styles.daySelected : "",
                    isToday && !isSelected ? styles.dayToday : "",
                  ].join(" ")}
                  disabled={dayDisabled}
                  onClick={() => handleSelectDay(day)}
                  data-no-drag
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}