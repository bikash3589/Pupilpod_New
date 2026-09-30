'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

export interface MultiSelectOption {
  id: string;
  label: string;
  subLabel?: string;
  badge?: string;
  avatarText?: string;
}

interface MultiSelectDropdownProps {
  id: string;
  label: string;
  required?: boolean;
  options: MultiSelectOption[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  searchPlaceholder?: string;
  enableSelectAll?: boolean;
  maxDisplayCount?: number;
  itemTypeLabel?: string;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  id,
  label,
  required = false,
  options,
  selectedIds,
  onChange,
  placeholder = 'Select options',
  disabled = false,
  searchPlaceholder = 'Search...',
  enableSelectAll = true,
  maxDisplayCount = 2,
  itemTypeLabel = 'items',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filter options based on search query
  const filteredOptions = options.filter((opt) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      opt.label.toLowerCase().includes(q) ||
      (opt.subLabel && opt.subLabel.toLowerCase().includes(q)) ||
      (opt.badge && opt.badge.toLowerCase().includes(q))
    );
  });

  const allFilteredSelected =
    filteredOptions.length > 0 &&
    filteredOptions.every((opt) => selectedIds.includes(opt.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      // Deselect all filtered options
      const filteredIds = new Set(filteredOptions.map((o) => o.id));
      onChange(selectedIds.filter((id) => !filteredIds.has(id)));
    } else {
      // Select all filtered options
      const combined = Array.from(
        new Set([...selectedIds, ...filteredOptions.map((o) => o.id)])
      );
      onChange(combined);
    }
  };

  const handleToggleOption = (optionId: string) => {
    if (selectedIds.includes(optionId)) {
      onChange(selectedIds.filter((id) => id !== optionId));
    } else {
      onChange([...selectedIds, optionId]);
    }
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  // Compute trigger button label
  const getDisplayText = () => {
    if (selectedIds.length === 0) {
      return placeholder;
    }

    const selectedOptions = options.filter((o) => selectedIds.includes(o.id));

    if (selectedIds.length <= maxDisplayCount) {
      return selectedOptions.map((o) => o.label).join(', ');
    }

    return `${selectedIds.length} ${itemTypeLabel} selected`;
  };

  return (
    <div
      className={`form-group choose-field multi-select-container ${
        disabled ? 'is-disabled' : ''
      }`}
      ref={dropdownRef}
    >
      <label htmlFor={id} className="form-label">
        {label} {required && <span className="required-star">*</span>}
      </label>

      <div className="multi-select-wrapper">
        {/* Trigger Button */}
        <button
          type="button"
          id={id}
          className={`form-control multi-select-trigger ${
            isOpen ? 'is-open' : ''
          } ${selectedIds.length > 0 ? 'has-selection' : ''}`}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span
            className={`trigger-text ${
              selectedIds.length === 0 ? 'placeholder-text' : ''
            }`}
            title={getDisplayText()}
          >
            {getDisplayText()}
          </span>

          <div className="trigger-right-group">
            {selectedIds.length > 0 && !disabled && (
              <span className="selection-badge-pill" title={`${selectedIds.length} selected`}>
                {selectedIds.length}
              </span>
            )}
            <ChevronDown
              className={`select-chevron-icon transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
              size={16}
            />
          </div>
        </button>

        {/* Dropdown Menu Popover */}
        {isOpen && !disabled && (
          <div className="multi-select-popover" role="listbox" aria-multiselectable="true">
            {/* Search Input Box */}
            <div className="multi-select-search-box">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                className="multi-select-search-input"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Quick Actions Header: Select All / Clear All */}
            {enableSelectAll && options.length > 0 && (
              <div className="multi-select-toolbar">
                <button
                  type="button"
                  className="btn-toolbar-action"
                  onClick={toggleSelectAll}
                >
                  {allFilteredSelected ? 'Deselect All' : 'Select All'}
                  <span className="toolbar-count">({filteredOptions.length})</span>
                </button>

                {selectedIds.length > 0 && (
                  <button
                    type="button"
                    className="btn-toolbar-clear"
                    onClick={handleClearAll}
                  >
                    Clear All ({selectedIds.length})
                  </button>
                )}
              </div>
            )}

            {/* Options List */}
            <div className="multi-select-options-list">
              {filteredOptions.length === 0 ? (
                <div className="multi-select-empty">
                  <span>No matching options found</span>
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isChecked = selectedIds.includes(option.id);
                  return (
                    <div
                      key={option.id}
                      className={`multi-select-option-row ${
                        isChecked ? 'is-selected' : ''
                      }`}
                      onClick={() => handleToggleOption(option.id)}
                      role="option"
                      aria-selected={isChecked}
                    >
                      {/* Checkbox indicator */}
                      <div className={`custom-checkbox-box ${isChecked ? 'checked' : ''}`}>
                        {isChecked && <Check size={12} strokeWidth={3} />}
                      </div>

                      {/* Optional Avatar Initials */}
                      {option.avatarText && (
                        <div className="option-avatar-circle">
                          {option.avatarText}
                        </div>
                      )}

                      {/* Main Label and Sublabel */}
                      <div className="option-info-col">
                        <span className="option-main-label">{option.label}</span>
                        {option.subLabel && (
                          <span className="option-sub-label">{option.subLabel}</span>
                        )}
                      </div>

                      {/* Optional Badge */}
                      {option.badge && (
                        <span className="option-badge-tag">{option.badge}</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Summary */}
            <div className="multi-select-footer">
              <span className="footer-count">
                {selectedIds.length} of {options.length} selected
              </span>
              <button
                type="button"
                className="btn-popover-done"
                onClick={() => setIsOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
