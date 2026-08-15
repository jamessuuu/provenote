import { ASSERTION_COPY, GENERIC_ASSERTION_LINE, HEADLINES, INGREDIENT_LINE, SIGNER_LINE } from "./copy.js";
import type {
  AssertionSummary,
  ChainSummary,
  IngredientSummary,
  RawManifest,
  RawManifestStore,
  ValidationStatusSummary,
} from "./types.js";

/**
 * The chain-summary transformer: raw c2pa-web lib output -> provenote's
 * plain-language model. Pure and framework-free (docs/SPEC.md's
 * Verification plan: "chain-summary transformer... against recorded lib
 * outputs for all three states").
 *
 * @param raw `null` when the c2pa-web Reader factory itself returned
 *   `null` (its documented signal for "no C2PA metadata was found" — the
 *   NO CHAIN state covers both a never-signed asset and one with its
 *   manifest stripped; the library cannot and does not try to tell them
 *   apart, which is fixture 1's whole point). Otherwise the real
 *   ManifestStore-shaped object from `reader.manifestStore()`.
 */
export function summarizeChain(raw: RawManifestStore | null): ChainSummary {
  if (raw === null) {
    return {
      state: "no-chain",
      headline: HEADLINES["no-chain"],
      signer: null,
      assertions: [],
      ingredients: [],
      validationStatus: [],
      ambiguousFailure: false,
      activeManifestLabel: null,
    };
  }

  const activeLabel = raw.active_manifest ?? null;
  const manifest: RawManifest | null =
    (activeLabel && raw.manifests?.[activeLabel]) ||
    (raw.manifests ? Object.values(raw.manifests)[0] : undefined) ||
    null;

  const validationStatus = summarizeValidationStatus(raw);
  const state = classifyState(raw);

  const signer = manifest?.signature_info
    ? {
        issuer: manifest.signature_info.issuer ?? null,
        commonName: manifest.signature_info.common_name ?? null,
        time: manifest.signature_info.time ?? null,
        alg: manifest.signature_info.alg ?? null,
      }
    : null;

  const assertions = summarizeAssertions(manifest);
  const ingredients = summarizeIngredients(manifest);

  return {
    state,
    headline: HEADLINES[state],
    signer,
    assertions,
    ingredients,
    validationStatus,
    ambiguousFailure: state === "fails-validation",
    activeManifestLabel: manifest?.label ?? activeLabel,
  };
}

function classifyState(raw: RawManifestStore): "validates" | "fails-validation" {
  // "Trusted" is C2PA's strongest validation state (trust-list checked, not
  // just structurally/cryptographically consistent); both it and "Valid"
  // land in provenote's single VALIDATES state — the honest headline copy
  // (SIGNER_LINE / HEADLINES.validates) already refuses to claim more than
  // "these bytes, this signer, this time" for either. Anything else,
  // including a missing/undefined validation_state on a manifest that IS
  // present, is treated as failing: never default an ambiguous or absent
  // verdict to the reassuring outcome.
  if (raw.validation_state === "Valid" || raw.validation_state === "Trusted") {
    return "validates";
  }
  return "fails-validation";
}

function summarizeValidationStatus(raw: RawManifestStore): ValidationStatusSummary[] {
  if (!raw.validation_status) return [];
  return raw.validation_status.map((entry) => ({
    code: entry.code,
    success: entry.success ?? null,
    explanation: entry.explanation ?? null,
  }));
}

function summarizeAssertions(manifest: RawManifest | null): AssertionSummary[] {
  if (!manifest?.assertions) return [];
  return manifest.assertions.map((assertion) => {
    const known = ASSERTION_COPY[assertion.label];
    return {
      label: assertion.label,
      humanLabel: known?.humanLabel ?? assertion.label,
      provesLine: known?.provesLine ?? GENERIC_ASSERTION_LINE,
    };
  });
}

function summarizeIngredients(manifest: RawManifest | null): IngredientSummary[] {
  if (!manifest?.ingredients) return [];
  return manifest.ingredients.map((ingredient) => ({
    title: ingredient.title ?? null,
    format: ingredient.format ?? null,
    relationship: ingredient.relationship ?? null,
  }));
}

export { SIGNER_LINE, INGREDIENT_LINE };
