import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { summarizeChain } from "../src/chain-summary.js";
import { HEADLINES } from "../src/copy.js";
import type { RawManifestStore } from "../src/types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadFixture(name: string): RawManifestStore {
  const raw = JSON.parse(readFileSync(path.join(__dirname, "fixtures", name), "utf8"));
  const { _provenance, ...rest } = raw;
  return rest as RawManifestStore;
}

describe("summarizeChain — the three states, against recorded lib outputs", () => {
  it("classifies a real recorded 'no manifest found' result (reader.fromBlob returned null) as no-chain", () => {
    const summary = summarizeChain(null);
    expect(summary.state).toBe("no-chain");
    expect(summary.headline).toBe(HEADLINES["no-chain"]);
    expect(summary.signer).toBeNull();
    expect(summary.assertions).toEqual([]);
    expect(summary.ingredients).toEqual([]);
    expect(summary.ambiguousFailure).toBe(false);
  });

  it("classifies a real recorded validation_state:'Valid' result as validates, with signer info surfaced", () => {
    const raw = loadFixture("recorded-validates.json");
    const summary = summarizeChain(raw);

    expect(summary.state).toBe("validates");
    expect(summary.headline).toBe(HEADLINES.validates);
    expect(summary.ambiguousFailure).toBe(false);
    expect(summary.signer).toEqual({
      issuer: "C2PA Test Signing Cert",
      commonName: "C2PA Signer",
      time: "2026-08-15T17:01:05+00:00",
      alg: "Es256",
    });
    expect(summary.activeManifestLabel).toBe("urn:uuid:01f267b8-38ee-453e-b697-6da6d3da38ca");
  });

  it("resolves every real assertion label in the recorded output to a plain-language proves/does-not-prove pair, with an honest fallback for the unrecognized one", () => {
    const raw = loadFixture("recorded-validates.json");
    const summary = summarizeChain(raw);

    expect(summary.assertions).toHaveLength(2);

    const actions = summary.assertions.find((a) => a.label === "c2pa.actions.v2");
    expect(actions?.humanLabel).toBe("Edit actions");
    expect(actions?.provesLine.proves).toMatch(/editing actions/i);
    expect(actions?.provesLine.doesNotProve).toMatch(/complete/i);

    // "my.assertion" is not in ASSERTION_COPY — must fall back to the
    // generic line, never be silently dropped or crash the transformer.
    const unknown = summary.assertions.find((a) => a.label === "my.assertion");
    expect(unknown).toBeDefined();
    expect(unknown?.humanLabel).toBe("my.assertion");
    expect(unknown?.provesLine.proves).toMatch(/signer's tool included/i);
  });

  it("classifies a real recorded validation_state:'Invalid' result (genuine post-signing byte tamper) as fails-validation, and always sets ambiguousFailure", () => {
    const raw = loadFixture("recorded-fails-validation.json");
    const summary = summarizeChain(raw);

    expect(summary.state).toBe("fails-validation");
    expect(summary.headline).toBe(HEADLINES["fails-validation"]);
    expect(summary.ambiguousFailure).toBe(true);
    // The honest headline must never claim to have resolved WHY it
    // failed — this is the exact point docs/SPEC.md requires ("where the
    // library cannot distinguish benign version drift from tampering,
    // SAY SO"), even though this specific recorded case IS genuine
    // tampering. The UI is not allowed to know that from headline alone.
    expect(summary.headline.toLowerCase()).not.toMatch(/definitely|confirmed tamper/);
  });

  it("surfaces the real validation_status codes verbatim so a technically curious reader can inspect specifics", () => {
    const raw = loadFixture("recorded-fails-validation.json");
    const summary = summarizeChain(raw);

    expect(summary.validationStatus).toEqual([
      {
        code: "signingCredential.untrusted",
        success: null,
        explanation: "signing certificate untrusted",
      },
      {
        code: "assertion.hashedURI.mismatch",
        success: null,
        explanation: "hash does not match assertion data: self#jumbf=c2pa.assertions/c2pa.thumbnail.claim.jpeg",
      },
    ]);
  });

  it("never defaults an absent validation_state to the reassuring outcome", () => {
    const raw = loadFixture("recorded-validates.json");
    const { validation_state: _dropped, ...withoutState } = raw;
    const summary = summarizeChain(withoutState);
    expect(summary.state).toBe("fails-validation");
  });

  it("treats a 'Trusted' validation_state the same honest way as 'Valid' — same headline, same refusal to claim more", () => {
    const raw = loadFixture("recorded-validates.json");
    const trusted: RawManifestStore = { ...raw, validation_state: "Trusted" };
    const summary = summarizeChain(trusted);
    expect(summary.state).toBe("validates");
    expect(summary.headline).toBe(HEADLINES.validates);
  });
});
