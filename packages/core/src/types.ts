/**
 * Domain types for provenote's chain-summary model. These are deliberately
 * NOT the same shape as @contentauth/c2pa-types' `ManifestStore` — they are
 * provenote's own plain-language model, produced BY the transformer in
 * chain-summary.ts FROM a raw ManifestStore-shaped object. Keeping the two
 * separate means the raw shape can be recorded verbatim as test fixtures
 * (docs/SPEC.md's "unit tests against recorded lib outputs") without this
 * package importing the browser-only c2pa-web library at all.
 */

/** The three top-level states docs/SPEC.md's Inspector surface defines. */
export type ChainState = "validates" | "fails-validation" | "no-chain";

export interface ProvesLine {
  /** What this piece of the chain actually establishes. */
  proves: string;
  /** What it is structurally incapable of establishing, stated plainly. */
  doesNotProve: string;
}

export interface SignerSummary {
  issuer: string | null;
  commonName: string | null;
  time: string | null;
  alg: string | null;
}

export interface AssertionSummary {
  /** Raw C2PA assertion label, e.g. "c2pa.actions.v2". */
  label: string;
  /** Plain-language name for display, e.g. "Edit actions". */
  humanLabel: string;
  provesLine: ProvesLine;
}

export interface IngredientSummary {
  title: string | null;
  format: string | null;
  relationship: string | null;
}

export interface ValidationStatusSummary {
  code: string;
  success: boolean | null;
  explanation: string | null;
}

export interface ChainSummary {
  state: ChainState;
  /** The exact honest headline for this state (docs/SPEC.md's three-state copy). */
  headline: string;
  /** Present only when state !== "no-chain". */
  signer: SignerSummary | null;
  assertions: AssertionSummary[];
  ingredients: IngredientSummary[];
  validationStatus: ValidationStatusSummary[];
  /**
   * True whenever state === "fails-validation" — always true for that
   * state, never conditionally computed. docs/SPEC.md: "where the library
   * cannot distinguish benign version drift from tampering, SAY SO." This
   * field exists (rather than being folded silently into headline copy)
   * so the UI and tests can both assert on it directly.
   */
  ambiguousFailure: boolean;
  /** The manifest label the store considered active, if any. */
  activeManifestLabel: string | null;
}

/**
 * The shape this package expects as input — a structural subset of
 * @contentauth/c2pa-types' ManifestStore, copied by hand (not imported)
 * so @provenote/core stays free of any dependency on the browser-only
 * c2pa-web package. Extra fields on the real object are ignored, not
 * rejected — [k: string]: unknown on every level upstream means the real
 * object always has more than this.
 */
export interface RawValidationStatus {
  code: string;
  success?: boolean | null;
  explanation?: string | null;
}

export interface RawSignatureInfo {
  issuer?: string | null;
  common_name?: string | null;
  time?: string | null;
  alg?: string | null;
}

export interface RawManifestAssertion {
  label: string;
}

export interface RawIngredient {
  title?: string | null;
  format?: string | null;
  relationship?: string | null;
}

export interface RawManifest {
  signature_info?: RawSignatureInfo | null;
  assertions?: RawManifestAssertion[];
  ingredients?: RawIngredient[];
  label?: string | null;
}

export interface RawManifestStore {
  active_manifest?: string | null;
  manifests?: Record<string, RawManifest>;
  validation_status?: RawValidationStatus[] | null;
  validation_state?: "Invalid" | "Valid" | "Trusted" | null;
}
