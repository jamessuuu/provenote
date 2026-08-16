import { summarizeChain, type ChainSummary } from "@provenote/core";
import { readManifestStore } from "./c2pa-client";

export type InspectOutcome = { kind: "summary"; summary: ChainSummary } | { kind: "error"; message: string };

/**
 * Orchestrates a single client-side inspection: read the file's manifest
 * store (apps/web/src/lib/c2pa-client.ts — the zero-upload boundary),
 * then hand it to @provenote/core's pure summarizeChain(). Every failure
 * mode surfaces as a real, worded error state (BATCH-2-STANDARDS.md:
 * "every failure names its recovery") — never a silent no-chain result,
 * so a corrupt file or a WASM load failure is never mistaken for "this
 * file simply has no C2PA data" (the exact undifferentiated-error failure
 * mode this project's own gate research documents against the reference
 * verifier — see showcase-program/research/batch2-c2pa-verify.md §2.1).
 */
export async function inspectFile(file: File): Promise<InspectOutcome> {
  if (file.size === 0) {
    return {
      kind: "error",
      message: "That file is empty (0 bytes) — there's nothing to read. Try a different file.",
    };
  }
  try {
    const { manifestStore } = await readManifestStore(file);
    return { kind: "summary", summary: summarizeChain(manifestStore) };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return {
      kind: "error",
      message: `Could not read this file (${detail}). It may not be an image format the C2PA reader supports — try a JPEG, PNG, WebP, AVIF, or HEIC file.`,
    };
  }
}
