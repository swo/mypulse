// Drives the running app in a headless browser to catch runtime errors that
// typecheck/build can't see (bad fetch calls, protobuf decode issues, stale-data
// bugs) — see e.g. the stale-arrival and direction-filtering bugs this caught during
// development. Run with `pnpm verify`.
//
// One-time setup: `pnpm exec playwright install chromium`.

import { spawn } from "node:child_process";
import { chromium } from "playwright";

const PORT = 5183;
const URL = `http://localhost:${PORT}`;

function waitForServer(url, timeoutMs = 30_000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = async () => {
      try {
        const res = await fetch(url);
        if (res.ok) return resolve();
      } catch {
        // server not up yet
      }
      if (Date.now() - start > timeoutMs) return reject(new Error("dev server did not start in time"));
      setTimeout(attempt, 300);
    };
    attempt();
  });
}

const server = spawn("pnpm", ["exec", "vite", "--port", String(PORT)], { stdio: "ignore" });

try {
  await waitForServer(URL);

  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto(URL);
  await page.waitForSelector("text=mypulse");
  await page.waitForTimeout(3000); // let the first poll resolve

  console.log((await page.textContent("body")).trim().replace(/\s+/g, " "));
  await browser.close();

  if (errors.length > 0) {
    console.error("\nConsole errors:");
    errors.forEach((e) => console.error(" -", e));
    process.exitCode = 1;
  } else {
    console.log("\nNo console errors.");
  }
} finally {
  server.kill();
}
