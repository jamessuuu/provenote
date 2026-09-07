import { defineConfig, devices } from "@playwright/test";

// Overridable, and deliberately so. A hardcoded port plus
// reuseExistingServer:true is a silent-wrong-answer machine: another process
// listening on 4174 gets treated as this project's static export, and the
// whole suite asserts against someone else's HTML while reporting ordinary
// test failures. That happened. Set PORT to run beside anything.
const PORT = Number(process.env.PORT ?? 4174);
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  timeout: 60_000,
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `node scripts/serve-static.mjs ${PORT}`,
    // Never adopt a stranger's server: the reuse must be OUR server.
    reuseExistingServer: false,
    url: BASE_URL,
    timeout: 30_000,
  },
});
