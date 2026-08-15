"use client";

import { createC2pa, type C2paSdk } from "@contentauth/c2pa-web";
import type { RawManifestStore } from "@provenote/core";

/**
 * Client-side-only C2PA reading. The whole product's central claim
 * (docs/SPEC.md D1: "zero-upload IS the product") lives in this file: the
 * WASM binary is fetched from same-origin `/c2pa/c2pa_bg.wasm`
 * (scripts/copy-c2pa-wasm.mjs copies it in at build time, referenced by a
 * plain string — no bundler-specific asset syntax), the reader runs
 * inside a Worker the library itself spins up from an inline Blob URL
 * (no network fetch for worker code, no bundler asset resolution either),
 * and the file being inspected is never passed to fetch/XHR/WebSocket —
 * only to the library's own in-memory Blob API. See e2e/zero-upload.spec.ts
 * for the running proof.
 */

let sdkPromise: Promise<C2paSdk> | null = null;

function getSdk(): Promise<C2paSdk> {
  if (!sdkPromise) {
    sdkPromise = createC2pa({
      wasmSrc: "/c2pa/c2pa_bg.wasm",
      // See docs/DEVIATIONS.md: our own fixtures are signed with
      // c2patool's built-in TEST certificate (the only kind
      // docs/SPEC.md's D2 permits — "do not fake a signed artifact").
      // Without a trust anchor, every one of our own fixtures would
      // report validation_state "Valid" but always carry a
      // "signingCredential.untrusted" status line — real, honest, and
      // arguably the MORE interesting demo (nobody should trust a test
      // cert). We ship it anyway, unadorned, so F2's "chain VALIDATES"
      // claim is visibly true without special-casing our own fixtures'
      // trust configuration differently from what a real visitor's own
      // uploaded file gets. Trust config stays at the library default.
    });
  }
  return sdkPromise;
}

export interface ReadResult {
  /** null when the library found no C2PA manifest at all (NO CHAIN). */
  manifestStore: RawManifestStore | null;
}

/**
 * Reads a File/Blob entirely client-side and returns the raw manifest
 * store (or null). No network request is made with the file's bytes —
 * everything below is calls into the WASM/Worker instance created above.
 */
export async function readManifestStore(file: File): Promise<ReadResult> {
  const c2pa = await getSdk();
  const reader = await c2pa.reader.fromBlob(file.type, file);
  if (!reader) {
    return { manifestStore: null };
  }
  try {
    const store = await reader.manifestStore();
    return { manifestStore: store as unknown as RawManifestStore };
  } finally {
    await reader.free();
  }
}
