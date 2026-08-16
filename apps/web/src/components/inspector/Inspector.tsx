"use client";

import { useEffect, useRef } from "react";
import { ChainSummaryView } from "./ChainSummaryView";
import { DropZone } from "./DropZone";
import { useInspector } from "./useInspector";

const STATE_LABEL = {
  validates: "VALIDATES",
  "fails-validation": "FAILS VALIDATION",
  "no-chain": "NO CHAIN",
} as const;

/**
 * The Inspector: docs/SPEC.md's core surface, drop/choose → parse
 * client-side → the three honest states. Owns focus management (result
 * heading gets focus so a screen-reader user lands directly on the new
 * content, matching how a router would announce a route change) and an
 * aria-live region so the transition itself is announced too, not just
 * the end state.
 */
export function Inspector() {
  const { state, inspect, reset } = useInspector();
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const errorHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (state.status === "result") resultHeadingRef.current?.focus();
    if (state.status === "error") errorHeadingRef.current?.focus();
  }, [state.status]);

  const liveMessage =
    state.status === "loading"
      ? `Reading ${state.fileName}…`
      : state.status === "result"
        ? `Provenance chain read: ${STATE_LABEL[state.summary.state]}.`
        : state.status === "error"
          ? `Could not read ${state.fileName}.`
          : "";

  return (
    <div className="inspector">
      <DropZone onFile={inspect} busy={state.status === "loading"} />
      <div aria-live="polite" className="visually-hidden">
        {liveMessage}
      </div>

      {state.status === "error" && (
        <div className="inspector-error" role="alert">
          <h2 ref={errorHeadingRef} tabIndex={-1} className="inspector-error__heading">
            Could not read {state.fileName}
          </h2>
          <p>{state.message}</p>
          <button type="button" className="button-secondary" onClick={reset}>
            Try another file
          </button>
        </div>
      )}

      {state.status === "result" && (
        <div className="inspector-result">
          <ChainSummaryView summary={state.summary} headingRef={resultHeadingRef} />
          <p className="inspector-result__filename">
            File: <code>{state.fileName}</code>
          </p>
          <button type="button" className="button-secondary" onClick={reset}>
            Inspect another file
          </button>
        </div>
      )}
    </div>
  );
}
