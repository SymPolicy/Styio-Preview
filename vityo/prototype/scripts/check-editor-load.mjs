#!/usr/bin/env node

import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright-core";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROTOTYPE_ROOT = path.resolve(__dirname, "..");
const DEFAULT_URL = process.env.STYIO_EDITOR_URL ?? "http://127.0.0.1:4173/editor.html";
const CHROME_PATH =
  process.env.STYIO_CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const ARTIFACT_DIR = path.join(PROTOTYPE_ROOT, ".artifacts");
const SCREENSHOT_PATH = path.join(ARTIFACT_DIR, "editor-load-failure.png");
const SERVER_READY_TIMEOUT_MS = 15000;

function log(message) {
  process.stdout.write(`${message}\n`);
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}

async function ensureArtifactDir() {
  await fs.mkdir(ARTIFACT_DIR, { recursive: true });
}

async function canReach(url) {
  try {
    const response = await fetch(url, { redirect: "follow" });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForReachable(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await canReach(url)) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return false;
}

async function ensureServer(url) {
  if (await canReach(url)) {
    return { child: null, started: false };
  }

  log("editor url is not reachable, starting prototype/dev_server.py");
  const child = spawn("python3", ["dev_server.py"], {
    cwd: PROTOTYPE_ROOT,
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (chunk) => {
    process.stdout.write(`[selftest:server] ${chunk}`);
  });
  child.stderr.on("data", (chunk) => {
    process.stderr.write(`[selftest:server] ${chunk}`);
  });

  const ready = await waitForReachable(url, SERVER_READY_TIMEOUT_MS);
  if (!ready) {
    child.kill("SIGTERM");
    throw new Error(`dev server did not become ready within ${SERVER_READY_TIMEOUT_MS}ms`);
  }

  return { child, started: true };
}

async function runSelfTest() {
  if (!(await fs.stat(CHROME_PATH).then(() => true).catch(() => false))) {
    throw new Error(`chrome executable not found: ${CHROME_PATH}`);
  }

  const server = await ensureServer(DEFAULT_URL);
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME_PATH,
    args: ["--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check"],
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 1200 },
  });

  const consoleErrors = [];
  const consoleWarnings = [];
  const requestFailures = [];
  const pageErrors = [];
  let currentStep = "boot";

  async function runStep(name, fn) {
    currentStep = name;
    log(`step: ${name}`);
    return await fn();
  }

  page.on("console", (message) => {
    const type = message.type();
    const text = message.text();
    if (type === "error") {
      consoleErrors.push(text);
      return;
    }
    if (type === "warning") {
      consoleWarnings.push(text);
    }
  });

  page.on("pageerror", (error) => {
    pageErrors.push(error?.stack || error?.message || String(error));
  });

  page.on("requestfailed", (request) => {
    requestFailures.push(`${request.method()} ${request.url()} :: ${request.failure()?.errorText ?? "unknown"}`);
  });

  try {
    log(`opening ${DEFAULT_URL}`);
    const response = await runStep("open-page", () =>
      page.goto(DEFAULT_URL, {
        waitUntil: "networkidle",
        timeout: 20000,
      }),
    );
    if (!response?.ok()) {
      throw new Error(`page load returned ${response?.status() ?? "unknown status"}`);
    }

    await runStep("wait-shell", () => page.waitForSelector("#workspaceShell", { timeout: 10000 }));
    await runStep("wait-toggle-sidebar", () => page.waitForSelector("#toggleSidebar", { timeout: 10000 }));
    await runStep("wait-render-layer", () => page.waitForSelector("#renderLayer", { timeout: 10000 }));
    await runStep("wait-settings-root-attached", () =>
      page.waitForSelector("#settingsFactoryRoot", { state: "attached", timeout: 10000 }),
    );

    await runStep("open-sidebar", async () => {
      await page.click("#toggleSidebar");
      await page.waitForFunction(() => document.body.classList.contains("sidebar-open"), null, { timeout: 10000 });
    });

    await runStep("switch-to-settings-tab", async () => {
      await page.click('[data-drawer-tab="settings"]');
      await page.waitForFunction(() => document.getElementById("drawerPanelSettings")?.classList.contains("is-active"), null, {
        timeout: 10000,
      });
      await page.waitForSelector("#settingsFactoryRoot", { state: "visible", timeout: 10000 });
    });

    await runStep("wait-theme-editor-controls", async () => {
      await page.waitForSelector("#linkedSurfaceModeCard", { timeout: 10000 });
      await page.waitForSelector("#linkedSurfaceThemePanel", { timeout: 10000 });
      await page.waitForSelector("#linkedSurfaceModeToggle", { timeout: 10000 });
      await page.waitForSelector("#styleButton", { timeout: 10000 });
      await page.waitForSelector("#styleOptions", { state: "attached", timeout: 10000 });
      await page.waitForSelector("#themePaletteButton", { timeout: 10000 });
      await page.waitForSelector("#interfaceFontButton", { timeout: 10000 });
    });

    await runStep("switch-style-flat", async () => {
      await page.click("#styleButton");
      await page.waitForFunction(() => document.getElementById("styleOptions")?.classList.contains("is-open"), null, {
        timeout: 10000,
      });
      await page.click('[data-setting-option-for="style"][data-setting-option-value="flat"]');
      await page.waitForFunction(() => document.getElementById("styleButton")?.textContent?.trim() === "Flat", null, {
        timeout: 10000,
      });
    });

    await runStep("switch-style-dynamic", async () => {
      await page.click("#styleButton");
      await page.waitForFunction(() => document.getElementById("styleOptions")?.classList.contains("is-open"), null, {
        timeout: 10000,
      });
      await page.click('[data-setting-option-for="style"][data-setting-option-value="dynamic"]');
      await page.waitForFunction(() => document.getElementById("styleButton")?.textContent?.trim() === "Dynamic", null, {
        timeout: 10000,
      });
    });

    await runStep("switch-style-grid", async () => {
      await page.click("#styleButton");
      await page.waitForFunction(() => document.getElementById("styleOptions")?.classList.contains("is-open"), null, {
        timeout: 10000,
      });
      await page.click('[data-setting-option-for="style"][data-setting-option-value="grid"]');
      await page.waitForFunction(
        () =>
          document.getElementById("styleButton")?.textContent?.trim() === "Grid" &&
          document.body.dataset.uiStyle === "grid" &&
          getComputedStyle(document.documentElement).getPropertyValue("--style-toggle-radius").trim() === "10px",
        null,
        { timeout: 10000 },
      );
    });

    await runStep("restore-style-dynamic", async () => {
      await page.click("#styleButton");
      await page.waitForFunction(() => document.getElementById("styleOptions")?.classList.contains("is-open"), null, {
        timeout: 10000,
      });
      await page.click('[data-setting-option-for="style"][data-setting-option-value="dynamic"]');
      await page.waitForFunction(
        () =>
          document.getElementById("styleButton")?.textContent?.trim() === "Dynamic" &&
          document.body.dataset.uiStyle === "dynamic",
        null,
        { timeout: 10000 },
      );
    });

    await runStep("open-theme-palette", async () => {
      await page.click("#themePaletteButton");
      await page.waitForFunction(() => {
        const menu = document.getElementById("themePaletteOptions");
        return !!menu && !menu.hidden && menu.children.length > 0;
      }, null, { timeout: 10000 });
    });

    await runStep("switch-theme-light", async () => {
      await page.click("#linkedSurfaceModeLight");
      await page.waitForFunction(() => document.getElementById("linkedSurfaceModeToggle")?.dataset.mode === "light", null, {
        timeout: 10000,
      });
    });

    await runStep("switch-theme-dark", async () => {
      await page.click("#linkedSurfaceModeDark");
      await page.waitForFunction(() => document.getElementById("linkedSurfaceModeToggle")?.dataset.mode === "dark", null, {
        timeout: 10000,
      });
    });

    await runStep("expand-symbol-highlight", async () => {
      await page.click("#linkedSurfaceEditorTab");
      await page.waitForFunction(() => document.getElementById("linkedSurfaceEditorPanel")?.hidden === false, null, {
        timeout: 10000,
      });
      await page.click("#symbolHighlightDisclosure > summary");
      await page.waitForFunction(() => document.getElementById("symbolHighlightDisclosure")?.open === true, null, {
        timeout: 10000,
      });
      await page.waitForFunction(() => {
        const list = document.getElementById("glyphColorList");
        return !!list && list.children.length > 0;
      }, null, { timeout: 10000 });
      await page.click("#linkedSurfaceThemeTab");
      await page.waitForFunction(() => document.getElementById("linkedSurfaceThemePanel")?.hidden === false, null, {
        timeout: 10000,
      });
    });

    await runStep("linked-surface-tabs-defaults", async () => {
      await page.waitForSelector("#linkedSurfaceThemeTab", { timeout: 10000 });
      await page.waitForSelector("#linkedSurfaceEditorTab", { timeout: 10000 });
      await page.waitForSelector("#linkedSurfaceModeToggle", { timeout: 10000 });
      await page.waitForFunction(() => {
        const themeTab = document.getElementById("linkedSurfaceThemeTab");
        const editorTab = document.getElementById("linkedSurfaceEditorTab");
        const linkButton = document.getElementById("linkedEditorModeLinkButton");
        return (
          themeTab?.classList.contains("is-active") === true &&
          editorTab?.classList.contains("is-active") === false &&
          document.getElementById("linkedSurfaceThemePanel")?.hidden === false &&
          document.getElementById("linkedSurfaceEditorPanel")?.hidden === true &&
          linkButton?.hidden === true
        );
      }, null, { timeout: 10000 });
    });

    await runStep("linked-surface-editor-locked", async () => {
      await page.click("#linkedSurfaceEditorTab");
      await page.waitForFunction(() => {
        const linkButton = document.getElementById("linkedEditorModeLinkButton");
        const darkButton = document.getElementById("linkedSurfaceModeDark");
        const lightButton = document.getElementById("linkedSurfaceModeLight");
        return (
          linkButton?.hidden === false &&
          linkButton?.classList.contains("is-linked") === true &&
          darkButton?.disabled === true &&
          lightButton?.disabled === true
        );
      }, null, { timeout: 10000 });
    });

    await runStep("linked-surface-editor-unlocked", async () => {
      await page.click("#linkedEditorModeLinkButton");
      await page.waitForFunction(() => {
        const linkButton = document.getElementById("linkedEditorModeLinkButton");
        const darkButton = document.getElementById("linkedSurfaceModeDark");
        const lightButton = document.getElementById("linkedSurfaceModeLight");
        return (
          linkButton?.classList.contains("is-linked") === false &&
          darkButton?.disabled === false &&
          lightButton?.disabled === false
        );
      }, null, { timeout: 10000 });
      await page.click("#linkedSurfaceModeLight");
      await page.waitForFunction(() => document.getElementById("linkedSurfaceModeToggle")?.dataset.mode === "light", null, {
        timeout: 10000,
      });
      await page.click("#linkedEditorModeLinkButton");
      await page.waitForFunction(() => {
        const linkButton = document.getElementById("linkedEditorModeLinkButton");
        const toggle = document.getElementById("linkedSurfaceModeToggle");
        return linkButton?.classList.contains("is-linked") === true && toggle?.dataset.mode === "dark";
      }, null, { timeout: 10000 });
    });

    if (pageErrors.length || consoleErrors.length || requestFailures.length) {
      await ensureArtifactDir();
      await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
      const detail = [
        pageErrors.length ? `page errors:\n- ${pageErrors.join("\n- ")}` : "",
        consoleErrors.length ? `console errors:\n- ${consoleErrors.join("\n- ")}` : "",
        requestFailures.length ? `request failures:\n- ${requestFailures.join("\n- ")}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");
      throw new Error(`step ${currentStep} failed validation\n${detail}\nfailure screenshot: ${SCREENSHOT_PATH}`);
    }

    log("editor load self-test passed");
    if (consoleWarnings.length) {
      log(`warnings (${consoleWarnings.length}):`);
      for (const warning of consoleWarnings) {
        log(`- ${warning}`);
      }
    }
  } catch (error) {
    await ensureArtifactDir();
    await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true }).catch(() => {});
    const detail = [
      pageErrors.length ? `page errors:\n- ${pageErrors.join("\n- ")}` : "",
      consoleErrors.length ? `console errors:\n- ${consoleErrors.join("\n- ")}` : "",
      requestFailures.length ? `request failures:\n- ${requestFailures.join("\n- ")}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
    throw new Error(
      [`step ${currentStep} failed`, error?.message ?? String(error), detail, `failure screenshot: ${SCREENSHOT_PATH}`]
        .filter(Boolean)
        .join("\n\n"),
    );
  } finally {
    await browser.close();
    if (server.started && server.child) {
      server.child.kill("SIGTERM");
    }
  }
}

runSelfTest().catch(async (error) => {
  fail(`editor load self-test failed: ${error?.message ?? error}`);
  process.exitCode = 1;
});
