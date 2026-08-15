/**
 * @provenote/core — pure, framework-free logic shared by the web app and
 * the unit test suite. No browser globals, no network, no filesystem.
 */
export const CORE_VERSION = "0.1.0";

export { summarizeChain, SIGNER_LINE, INGREDIENT_LINE } from "./chain-summary.js";
export { HEADLINES, ASSERTION_COPY, GENERIC_ASSERTION_LINE } from "./copy.js";
export type {
  AssertionSummary,
  ChainState,
  ChainSummary,
  IngredientSummary,
  ProvesLine,
  RawIngredient,
  RawManifest,
  RawManifestAssertion,
  RawManifestStore,
  RawSignatureInfo,
  RawValidationStatus,
  SignerSummary,
  ValidationStatusSummary,
} from "./types.js";
