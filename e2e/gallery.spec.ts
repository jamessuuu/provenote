import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.resolve(__dirname, "..", "fixtures");
const fixture = (name: string) => path.join(FIXTURES_DIR, name);

/**
 * The full e2e suite docs/SPEC.md's M4 requires: every Gallery of Limits
 * fixture loads to its expected state, a keyboard-only walkthrough of the
 * whole flow, the zero-upload network-interception proof, and 320px with
 * no horizontal scroll. This is `pnpm run e2e:full` (no @smoke filter) —
 * e2e/inspector.smoke.spec.ts covers the fast subset independently.
 */

test.describe("Gallery of Limits — every fixture loads to its expected state", () => {
  test("Fixture 1: signed validates, never-signed and stripped both render NO CHAIN", async ({ page }) => {
    await page.goto("/gallery/");

    await page.getByRole("button", { name: /^Signed/ }).click();
    await expect(page.locator(".chain-summary__eyebrow")).toHaveText("VALIDATES");

    await page.getByRole("button", { name: /^Never signed/ }).click();
    await expect(page.locator(".chain-summary__eyebrow")).toHaveText("NO CHAIN");

    await page.getByRole("button", { name: /^Stripped/ }).click();
    await expect(page.locator(".chain-summary__eyebrow")).toHaveText("NO CHAIN");
  });

  test("Fixture 2: the fabricated scene validates, with an assertion declaring digitalCapture", async ({ page }) => {
    await page.goto("/gallery/");
    await page.getByRole("button", { name: /^Fabricated scene/ }).click();
    await expect(page.locator(".chain-summary__eyebrow")).toHaveText("VALIDATES");
    await expect(page.locator(".assertion-list")).toContainText("Edit actions");
  });

  test("Fixture 3: innocent re-encode and deliberate tamper both render FAILS VALIDATION with the same status codes", async ({
    page,
  }) => {
    await page.goto("/gallery/");

    await page.getByRole("button", { name: /^Innocent re-encode/ }).click();
    await expect(page.locator(".chain-summary__eyebrow")).toHaveText("FAILS VALIDATION");
    await page.locator(".validation-details summary").click();
    const innocentCodes = await page.locator(".validation-details li").allInnerTexts();

    await page.getByRole("button", { name: /^Deliberate tamper/ }).click();
    await expect(page.locator(".chain-summary__eyebrow")).toHaveText("FAILS VALIDATION");
    await page.locator(".validation-details summary").click();
    const tamperedCodes = await page.locator(".validation-details li").allInnerTexts();

    expect(innocentCodes).toEqual(tamperedCodes);
    expect(innocentCodes.join(" ")).toContain("assertion.dataHash.mismatch");
  });
});

test.describe("Keyboard-only walkthrough", () => {
  test("a fixture can be loaded and the result reached using only the keyboard", async ({ page }) => {
    await page.goto("/gallery/");

    // Tab from the top of the page to the first fixture button, activate it with Enter.
    let reachedFirstFixture = false;
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press("Tab");
      const isFirstFixtureButton = await page.evaluate(() => {
        const el = document.activeElement;
        return !!el && el.tagName === "BUTTON" && el.textContent?.includes("Signed") === true;
      });
      if (isFirstFixtureButton) {
        reachedFirstFixture = true;
        break;
      }
    }
    expect(reachedFirstFixture, "keyboard Tab order never reached the first fixture button").toBe(true);

    await page.keyboard.press("Enter");
    await expect(page.locator(".chain-summary__eyebrow")).toHaveText("VALIDATES");

    // Focus must have moved to the result heading (Inspector.tsx's focus management) —
    // a screen-reader user must not be stranded on the button that no longer does anything new.
    const focusedIsResultHeading = await page.evaluate(
      () => document.activeElement?.classList.contains("chain-summary__headline") === true,
    );
    expect(focusedIsResultHeading, "focus did not move to the result heading after loading a fixture").toBe(true);

    // From there, Tab must reach "Inspect another file" and Enter must reset the Inspector.
    let reachedResetButton = false;
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");
      const isResetButton = await page.evaluate(
        () => document.activeElement?.textContent === "Inspect another file",
      );
      if (isResetButton) {
        reachedResetButton = true;
        break;
      }
    }
    expect(reachedResetButton, "keyboard Tab order never reached 'Inspect another file'").toBe(true);
    await page.keyboard.press("Enter");
    await expect(page.locator(".dropzone__title")).toHaveText("Drop an image here, or choose a file");
  });
});

test.describe("Zero-upload proof", () => {
  test("inspecting a user-selected file never sends its bytes anywhere: only same-origin GET/HEAD requests, none with a body @smoke", async ({
    page,
  }) => {
    await page.goto("/");
    const origin = new URL(page.url()).origin;

    const requests: { method: string; url: string; hasBody: boolean }[] = [];
    page.on("request", (req) => {
      requests.push({ method: req.method(), url: req.url(), hasBody: req.postDataBuffer() !== null });
    });

    // The WASM SDK loads lazily, ON first use — inspecting a file is exactly
    // what triggers the c2pa_bg.wasm fetch below, which is the point: even
    // that fetch is same-origin, body-less, and carries none of the file's
    // bytes (Playwright never sees the dropped file at all — it goes straight
    // from the OS file picker simulation into the page's in-memory Blob API).
    await page.locator('input[type="file"]').setInputFiles(fixture("f2-fabricated-signed.jpg"));
    await expect(page.locator(".chain-summary__eyebrow")).toHaveText("VALIDATES");

    expect(requests.length, "expected at least the same-origin WASM fetch this triggers").toBeGreaterThan(0);

    const offenders = requests.filter((r) => {
      if (r.url.startsWith("blob:") || r.url.startsWith("data:")) return false;
      const sameOrigin = r.url.startsWith(origin);
      const safeMethod = r.method === "GET" || r.method === "HEAD";
      return !sameOrigin || !safeMethod || r.hasBody;
    });
    expect(offenders, `request(s) that could carry uploaded bytes: ${JSON.stringify(offenders)}`).toEqual([]);
  });

  test("loading a Gallery fixture behaves identically: same-origin GET/HEAD only, no bodies", async ({ page }) => {
    await page.goto("/gallery/");
    const origin = new URL(page.url()).origin;

    const requests: { method: string; url: string; hasBody: boolean }[] = [];
    page.on("request", (req) => {
      requests.push({ method: req.method(), url: req.url(), hasBody: req.postDataBuffer() !== null });
    });

    await page.getByRole("button", { name: /^Fabricated scene/ }).click();
    await expect(page.locator(".chain-summary__eyebrow")).toHaveText("VALIDATES");

    const offenders = requests.filter((r) => {
      if (r.url.startsWith("blob:") || r.url.startsWith("data:")) return false;
      const sameOrigin = r.url.startsWith(origin);
      const safeMethod = r.method === "GET" || r.method === "HEAD";
      return !sameOrigin || !safeMethod || r.hasBody;
    });
    expect(offenders, `request(s) that could carry uploaded bytes: ${JSON.stringify(offenders)}`).toEqual([]);
  });
});

test.describe("320px — no horizontal scroll", () => {
  test("the homepage and a loaded result both fit at 320px wide", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });

    await page.goto("/");
    let overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `homepage overflows by ${overflow}px at 320px`).toBeLessThanOrEqual(0);

    await page.locator('input[type="file"]').setInputFiles(fixture("f2-fabricated-signed.jpg"));
    await expect(page.locator(".chain-summary__eyebrow")).toHaveText("VALIDATES");
    overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `result view overflows by ${overflow}px at 320px`).toBeLessThanOrEqual(0);
    await page.screenshot({ path: "test-results/320px-result.png", fullPage: true });

    await page.goto("/gallery/");
    overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `gallery page overflows by ${overflow}px at 320px`).toBeLessThanOrEqual(0);
  });
});
