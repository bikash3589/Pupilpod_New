"use client";

export interface MultiSelectOption {
  id: number;
  label: string;
}

interface MultiSelectTagsProps {
  options: MultiSelectOption[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function MultiSelectTags({ options, selectedIds, onChange, placeholder = "Select…", disabled }: MultiSelectTagsProps) {
  const available = options.filter((o) => !selectedIds.includes(o.id));

  function add(id: number) {
    onChange([...selectedIds, id]);
  }

  function remove(id: number) {
    onChange(selectedIds.filter((x) => x !== id));
  }

  return (
    <div className="tag-input">
      {selectedIds.map((id) => {
        const opt = options.find((o) => o.id === id);
        if (!opt) return null;
        return (
          <span key={id} className="tag-chip">
            {opt.label}
            {!disabled && (
              <button type="button" onClick={() => remove(id)} aria-label={`Remove ${opt.label}`}>
                ×
              </button>
            )}
          </span>
        );
      })}
      {!disabled && (
        <select
          className="tag-add-select"
          value=""
          onChange={(e) => {
            if (e.target.value) add(Number(e.target.value));
          }}
        >
          <option value="">{selectedIds.length === 0 ? placeholder : "Add another…"}</option>
          {available.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
