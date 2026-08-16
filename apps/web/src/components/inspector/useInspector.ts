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
 * requires). A single hook instance is shared by the drop zone on the
 * homepage and — from M4 — the Gallery of Limits, so "load this fixture
 * into the inspector" is exactly the same code path as a real upload,
 * never a second, divergent rendering.
 */
export function useInspector() {
  const [state, setState] = useState<InspectorState>({ status: "idle" });

  const inspect = useCallback(async (file: File) => {
    setState({ status: "loading", fileName: file.name });
    const outcome = await inspectFile(file);
    setState(
      outcome.kind === "summary"
        ? { status: "result", fileName: file.name, summary: outcome.summary }
        : { status: "error", fileName: file.name, message: outcome.message },
    );
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, inspect, reset };
}
