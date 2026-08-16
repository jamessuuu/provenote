import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.resolve(__dirname, "..", "fixtures");
const fixture = (name: string) => path.join(FIXTURES_DIR, name);

/**
 * Smoke coverage for the Inspector (docs/SPEC.md M3): the three honest
 * states render with their pinned headline copy, plus the real error
 * state BATCH-2-STANDARDS.md requires. The FULL fixture-by-fixture sweep
 * — every Gallery of Limits fixture, the zero-upload network-interception
 * proof, the keyboard-only walkthrough, and the 320px screenshot — is
 * M4's `e2e:full` scope (`pnpm run e2e:full`, no @smoke tag); this file is
 * the fast subset `pnpm run e2e:smoke` runs.
 */
test.describe("Inspector — three states @smoke", () => {
  test("idle state: the drop zone is a real, labeled file input", async ({ page }) => {
    await page.goto("/");
    const input = page.locator('input[type="file"]');
    await expect(input).toBeAttached();
    await expect(input).toHaveAttribute("accept", "image/*");
    await expect(page.getByText("Drop an image here, or choose a file")).toBeVisible();
  });

  test("VALIDATES: a signed fixture renders the honest 'says nothing about whether real' headline", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator('input[type="file"]').setInputFiles(fixture("f1-signed.jpg"));
    await expect(page.locator(".chain-summary__eyebrow")).toHaveText("VALIDATES");
    await expect(page.locator(".chain-summary__headline")).toContainText(
      "says nothing about whether the depicted scene is real",
    );
    await expect(page.locator("#signer-heading")).toBeVisible();
    await expect(page.getByText("C2PA Test Signing Cert")).toBeVisible();
  });

  test("NO CHAIN: a never-signed fixture renders the absence-proves-nothing headline, no signer block", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator('input[type="file"]').setInputFiles(fixture("f1-never-signed.jpg"));
    await expect(page.locator(".chain-summary__eyebrow")).toHaveText("NO CHAIN");
    await expect(page.locator(".chain-summary__headline")).toContainText("absence proves nothing");
    await expect(page.locator("#signer-heading")).toHaveCount(0);
  });

  test("FAILS VALIDATION: a tampered fixture renders the honest-ambiguity headline, never claims certainty", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator('input[type="file"]').setInputFiles(fixture("f3-tampered.jpg"));
    await expect(page.locator(".chain-summary__eyebrow")).toHaveText("FAILS VALIDATION");
    await expect(page.locator(".chain-summary__headline")).toContainText("Standard validators cannot tell you which");
  });

  test("same badge, different crimes: the innocent re-encode and the deliberate tamper render identically", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator('input[type="file"]').setInputFiles(fixture("f3-innocent-reencode.jpg"));
    await expect(page.locator(".chain-summary__eyebrow")).toHaveText("FAILS VALIDATION");
    await page.getByRole("button", { name: "Inspect another file" }).click();
    await page.locator('input[type="file"]').setInputFiles(fixture("f3-tampered.jpg"));
    await expect(page.locator(".chain-summary__eyebrow")).toHaveText("FAILS VALIDATION");
  });

  test("error state: an unsupported file gets a real, specific, recoverable error — never a silent no-chain result", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator('input[type="file"]').setInputFiles(fixture("README.md"));
    await expect(page.locator(".inspector-error")).toBeVisible();
    await expect(page.locator(".inspector-error p")).toContainText("Could not read this file");
    await expect(page.getByRole("button", { name: "Try another file" })).toBeVisible();
  });
});
