"use client";

import { useCallback, useState } from "react";
import type { ChainSummary } from "@provenote/core";
import { inspectFile } from "@/lib/inspect";

export type InspectorState =
  | { status: "idle" }
  | { status: "loading"; fileName: string }
  | { status: "result"; fileName: string; summary: ChainSummary }
  | { status: "error"; fileName: string; message: string };

/**
 * Owns the Inspector's state machine (docs/SPEC.md's three top-level
 * states, plus the real loading/error states BATCH-2-STANDARDS.md
 * requires). One hook instance is shared by the drop zone (a real
 * upload) and the Gallery of Limits (`inspectUrl` — a same-origin fetch
 * of a bundled fixture, then handed to the exact same `runInspection`
 * every upload goes through), so "load this fixture" is never a second,
 * divergent code path from a real upload.
 */
export function useInspector() {
  const [state, setState] = useState<InspectorState>({ status: "idle" });

  const runInspection = useCallback(async (file: File) => {
    setState({ status: "loading", fileName: file.name });
    const outcome = await inspectFile(file);
    setState(
      outcome.kind === "summary"
        ? { status: "result", fileName: file.name, summary: outcome.summary }
        : { status: "error", fileName: file.name, message: outcome.message },
    );
  }, []);

  const inspect = runInspection;

  /**
   * Loads a same-origin fixture (Gallery of Limits) by fetching it into
   * an in-memory File, then running it through the identical inspection
   * path a real drop/pick uses. Not a network dependency on the user's
   * dropped file — the fixture bytes are this app's own bundled demo
   * assets (apps/web/public/fixtures/, copied from fixtures/ at build
   * time), same as any other static asset the page loads.
   */
  const inspectUrl = useCallback(
    async (url: string, displayName: string) => {
      setState({ status: "loading", fileName: displayName });
      try {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`fixture fetch failed: ${res.status} ${res.statusText}`);
        }
        const blob = await res.blob();
        const file = new File([blob], displayName, { type: blob.type || "image/jpeg" });
        await runInspection(file);
      } catch (err) {
        const detail = err instanceof Error ? err.message : String(err);
        setState({
          status: "error",
          fileName: displayName,
          message: `Could not load this fixture (${detail}). Try reloading the page.`,
        });
      }
    },
    [runInspection],
  );

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, inspect, inspectUrl, reset };
}
