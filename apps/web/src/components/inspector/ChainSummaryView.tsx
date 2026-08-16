import { INGREDIENT_LINE, SIGNER_LINE, type ChainSummary, type ProvesLine as ProvesLineType } from "@provenote/core";
import type { Ref } from "react";

const STATE_LABEL: Record<ChainSummary["state"], string> = {
  validates: "VALIDATES",
  "fails-validation": "FAILS VALIDATION",
  "no-chain": "NO CHAIN",
};

function formatTime(time: string | null): string | null {
  if (!time) return null;
  const date = new Date(time);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function ProvesLine({ line }: { line: ProvesLineType }) {
  return (
    <dl className="proves-line">
      <div className="proves-line__row proves-line__row--proves">
        <dt>Proves</dt>
        <dd>{line.proves}</dd>
      </div>
      <div className="proves-line__row proves-line__row--not">
        <dt>Does not prove</dt>
        <dd>{line.doesNotProve}</dd>
      </div>
    </dl>
  );
}

export interface ChainSummaryViewProps {
  summary: ChainSummary;
  /** Focused programmatically right after a new result renders — see Inspector.tsx. */
  headingRef?: Ref<HTMLHeadingElement>;
}

/**
 * Renders docs/SPEC.md's Inspector surface: the three-state headline, then
 * every chain element paired with its plain-language proves/does-not-prove
 * line. This component only ever reads `summary` — the honesty claims
 * live in @provenote/core's copy.ts, not here.
 */
export function ChainSummaryView({ summary, headingRef }: ChainSummaryViewProps) {
  const signerTime = formatTime(summary.signer?.time ?? null);

  return (
    <div className={`chain-summary chain-summary--${summary.state}`} data-testid="chain-summary">
      <p className="chain-summary__eyebrow">{STATE_LABEL[summary.state]}</p>
      <h2 ref={headingRef} tabIndex={-1} className="chain-summary__headline">
        {summary.headline}
      </h2>

      {summary.signer && (
        <section className="chain-block" aria-labelledby="signer-heading">
          <h3 id="signer-heading">Signer</h3>
          <dl className="kv">
            <dt>Issuer</dt>
            <dd>{summary.signer.issuer ?? "Not stated"}</dd>
            <dt>Common name</dt>
            <dd>{summary.signer.commonName ?? "Not stated"}</dd>
            <dt>Signed at</dt>
            <dd>
              {signerTime ?? "Not stated"}
              {summary.signer.time && (
                <>
                  {" "}
                  <code className="kv__raw">{summary.signer.time}</code>
                </>
              )}
            </dd>
            <dt>Algorithm</dt>
            <dd>{summary.signer.alg ?? "Not stated"}</dd>
          </dl>
          <ProvesLine line={SIGNER_LINE} />
        </section>
      )}

      {summary.assertions.length > 0 && (
        <section className="chain-block" aria-labelledby="assertions-heading">
          <h3 id="assertions-heading">Assertions ({summary.assertions.length})</h3>
          <ul className="assertion-list">
            {summary.assertions.map((assertion, i) => (
              <li key={`${assertion.label}-${i}`} className="assertion-list__item">
                <h4>
                  {assertion.humanLabel} <code className="assertion-list__raw-label">{assertion.label}</code>
                </h4>
                <ProvesLine line={assertion.provesLine} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {summary.ingredients.length > 0 && (
        <section className="chain-block" aria-labelledby="ingredients-heading">
          <h3 id="ingredients-heading">Ingredients ({summary.ingredients.length})</h3>
          <ul className="ingredient-list">
            {summary.ingredients.map((ingredient, i) => (
              <li key={i}>
                {ingredient.title ?? "Untitled"} — {ingredient.format ?? "unknown format"},{" "}
                {ingredient.relationship ?? "unstated relationship"}
              </li>
            ))}
          </ul>
          <ProvesLine line={INGREDIENT_LINE} />
        </section>
      )}

      {summary.validationStatus.length > 0 && (
        <details className="validation-details">
          <summary>Technical validation details ({summary.validationStatus.length})</summary>
          <ul>
            {summary.validationStatus.map((entry, i) => (
              <li key={i}>
                <code>{entry.code}</code>
                {entry.explanation ? ` — ${entry.explanation}` : ""}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
