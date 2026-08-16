"use client";

export interface FixtureButtonProps {
  label: string;
  fileName: string;
  url: string;
  onLoad: (url: string, fileName: string) => void;
  disabled?: boolean;
}

/** One Gallery of Limits fixture, loadable with a single click/Enter — no drag required. */
export function FixtureButton({ label, fileName, url, onLoad, disabled }: FixtureButtonProps) {
  return (
    <button type="button" className="fixture-card" onClick={() => onLoad(url, fileName)} disabled={disabled}>
      <span className="fixture-card__label">{label}</span>
      <span className="fixture-card__filename">
        <code>{fileName}</code>
      </span>
    </button>
  );
}
