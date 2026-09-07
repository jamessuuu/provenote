"use client";

import { useEffect, useRef } from "react";
import type { ChainSummary } from "@provenote/core";
import { ChainSummaryView } from "./ChainSummaryView";
import { DropZone } from "./DropZone";
import { useInspector } from "./useInspector";

const STATE_LABEL = {
  validates: "VALIDATES",
  "fails-validation": "FAILS VALIDATION",
  "no-chain": "NO CHAIN",
} as const;

export interface InspectorProps {
  /**
   * Share an existing useInspector() instance instead of owning one
   * internally — the Gallery of Limits does this so its "load fixture"
   * buttons and this component's rendering read the exact same state.
   * Omitted on the homepage, where the Inspector is self-contained.
   */
  api?: ReturnType<typeof useInspector>;
  /**
   * A chain to render while nothing has been inspected yet, so the surface
   * is never an empty box. The home page passes a summary produced at build
   * time by running summarizeChain() — the same transformer a live read uses
   * — over a ManifestStore recorded verbatim from a real browser run.
   *
   * It is labelled RECORDED EXAMPLE on screen and the label switches to
   * READ IN THIS TAB the moment a real file is parsed. Showing a recorded
   * result without saying so would be exactly the kind of quiet overclaim
   * this product exists to argue against.
   */
  example?: ChainSummary;
}

/**
 * The Inspector: docs/SPEC.md's core surface, drop/choose → parse
 * client-side → the three honest states. Owns focus management (result
 * heading gets focus so a screen-reader user lands directly on the new
 * content, matching how a router would announce a route change) and an
 * aria-live region so the transition itself is announced too, not just
 * the end state.
 */
export function Inspector({ api: externalApi, example }: InspectorProps = {}) {
  const internalApi = useInspector();
  const { state, inspect, reset } = externalApi ?? internalApi;
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

  const showingExample = example !== undefined && state.status === "idle";

  return (
    <div className="inspector">
      <div className="inspector__bar">
        <span>inspector</span>
        <span className="inspector__tag">
          {showingExample
            ? "recorded example"
            : state.status === "result"
              ? "read in this tab"
              : state.status === "loading"
                ? "reading…"
                : "waiting for a file"}
        </span>
      </div>

      <DropZone onFile={inspect} busy={state.status === "loading"} />
      <div aria-live="polite" className="visually-hidden">
        {liveMessage}
      </div>

      {showingExample && (
        <div className="inspector-result">
          <ChainSummaryView summary={example} />
          <p className="inspector-result__filename">
            Recorded from a real browser run of <code>@contentauth/c2pa-web</code> against a
            c2patool-signed JPEG, then summarised by the same code a live read uses. Drop your own
            file above to replace it.
          </p>
        </div>
      )}

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
