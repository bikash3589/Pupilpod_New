"use client";

// Self-contained drag & drop file upload area. Keeps the selected file
// in local state, same way DateField keeps its selected day locally.

import { useRef, useState } from "react";
import { UploadCloud, File as FileIcon, X } from "lucide-react";
import styles from "./FileField.module.css";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileField({ disabled = false }: { disabled?: boolean }) {
  const [file, setFile] = useState<File | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(fileList: FileList | null) {
    if (fileList && fileList.length > 0) setFile(fileList[0]);
  }

  return (
    <div
      className={`${styles.dropZone} ${isDraggingOver ? styles.dragOver : ""}`}
      onDragOver={disabled ? undefined : (event) => {
        event.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={disabled ? undefined : () => setIsDraggingOver(false)}
      onDrop={disabled ? undefined : (event) => {
        event.preventDefault();
        setIsDraggingOver(false);
        handleFiles(event.dataTransfer.files);
      }}
      onClick={disabled ? undefined : () => inputRef.current?.click()}
      style={disabled ? { pointerEvents: "none", opacity: 0.6, cursor: "not-allowed" } : {}}
      data-no-drag
    >
      <input
        ref={inputRef}
        type="file"
        className={styles.hiddenInput}
        onChange={(event) => handleFiles(event.target.files)}
        data-no-drag
      />

      {file ? (
        <div className={styles.filePreview} onClick={(event) => event.stopPropagation()}>
          <FileIcon size={18} className={styles.fileIcon} />
          <div className={styles.fileMeta}>
            <span className={styles.fileName}>{file.name}</span>
            <span className={styles.fileSize}>{formatBytes(file.size)}</span>
          </div>
          <button
            type="button"
            className={styles.removeButton}
            onClick={() => setFile(null)}
            title="Remove file"
            data-no-drag
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <>
          <UploadCloud size={22} className={styles.uploadIcon} />
          <span className={styles.dropText}>Drag &amp; drop a file here, or click to browse</span>
        </>
      )}
    </div>
  );
}