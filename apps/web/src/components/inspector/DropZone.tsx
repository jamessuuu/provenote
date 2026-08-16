"use client";

import { useId, useState, type DragEvent } from "react";

export interface DropZoneProps {
  onFile: (file: File) => void;
  busy: boolean;
}

/**
 * The Inspector's entry point. A real, labeled <input type="file"> is the
 * accessible core (tabbable, opens the native picker on Enter/Space,
 * screen-reader-announced by its label) — drag-and-drop is a progressive
 * enhancement layered on top of it, never a replacement for it. Nothing
 * here is a div with a click handler and no keyboard path.
 */
export function DropZone({ onFile, busy }: DropZoneProps) {
  const inputId = useId();
  const [isDragOver, setIsDragOver] = useState(false);

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (!busy) setIsDragOver(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragOver(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragOver(false);
    if (busy) return;
    const file = event.dataTransfer.files?.[0];
    if (file) onFile(file);
  }

  return (
    <div
      className={`dropzone${isDragOver ? " dropzone--over" : ""}${busy ? " dropzone--busy" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <label htmlFor={inputId} className="dropzone__label">
        <span className="dropzone__title">{busy ? "Reading…" : "Drop an image here, or choose a file"}</span>
        <span className="dropzone__hint">
          JPEG, PNG, WebP, AVIF, or HEIC. Nothing uploads — parsing happens entirely in your browser; check the
          Network tab.
        </span>
        <input
          id={inputId}
          className="visually-hidden"
          type="file"
          accept="image/*"
          disabled={busy}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (file) onFile(file);
            // Reset so choosing the same file twice in a row still fires onChange.
            event.currentTarget.value = "";
          }}
        />
      </label>
    </div>
  );
}
