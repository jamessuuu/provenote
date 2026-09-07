"use client";

export interface FixtureButtonProps {
  label: string;
  fileName: string;
  url: string;
  onLoad: (url: string, fileName: string) => void;
  disabled?: boolean;
  /**
   * Describes what the image actually depicts. Required rather than optional:
   * every fixture here IS an image, and a gallery that shows evidence without
   * describing it is unreadable to anyone using a screen reader — on a page
   * whose whole argument is about what a file does and does not tell you.
   */
  alt: string;
  /** What this specific file demonstrates, in a few words. */
  note?: string;
}

/**
 * One Gallery of Limits fixture, loadable with a single click or Enter — no
 * drag required. The card now shows the fixture itself: three buttons reading
 * "Signed", "Never signed" and "Stripped" told a reader nothing about the
 * claim being made, and the claim is precisely that two of those pictures are
 * indistinguishable.
 */
export function FixtureButton({ label, fileName, url, onLoad, disabled, alt, note }: FixtureButtonProps) {
  return (
    /* DOM order is label-first and the thumbnail is lifted above it with CSS
       `order`. The button's accessible name is built from its contents, so
       putting the image first would make every fixture announce as "A flat
       illustration of… Signed" and would silently break the e2e sweep that
       identifies these buttons by their visible label. One focus stop, so a
       reading-order/visual-order split inside it costs nothing. */
    <button type="button" className="fixture-card" onClick={() => onLoad(url, fileName)} disabled={disabled}>
      <span className="fixture-card__body">
        <span className="fixture-card__label">{label}</span>
        {note && <span className="fixture-card__note">{note}</span>}
        <span className="fixture-card__filename">
          <code>{fileName}</code>
        </span>
      </span>
      <img className="fixture-card__thumb" src={url} alt={alt} width={320} height={240} loading="lazy" />
    </button>
  );
}
