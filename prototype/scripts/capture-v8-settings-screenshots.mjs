import { mkdir, readdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { settingsBoardStates, v8SettingsBoardVersion } from "../src/data/v8SettingsBoardData.js";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const outputDir = join(rootDir, "screenshots", "v8", "settings", "current");
const baseURL = process.env.TAOTAO_BASE_URL ?? "http://127.0.0.1:5175";
const settingsURL = `${baseURL}${baseURL.includes("?") ? "&" : "?"}mode=settingsboard`;
const shots = [];

async function captureLocator(locator, filename, title) {
  await locator.scrollIntoViewIfNeeded();
  await locator.screenshot({ path: join(outputDir, filename) });
  shots.push({ filename, title });
}

async function captureState(page, state, filename) {
  const slot = page.locator(`[data-slot-state-id='${state.id}']`);
  await slot.evaluate((node) => {
    const strip = node.closest(".chat-step-state-strip");
    if (strip) {
      strip.scrollLeft = Math.max(0, node.offsetLeft - 4);
    }
  });
  await page.waitForTimeout(60);
  await captureLocator(page.locator(`[data-state-id='${state.id}']`), filename, state.title);
}

async function cleanOutput() {
  await mkdir(outputDir, { recursive: true });
  const existingFiles = await readdir(outputDir);
  await Promise.all(
    existingFiles
      .filter((filename) => filename.endsWith(".png"))
      .map((filename) => rm(join(outputDir, filename)))
  );
}

async function run() {
  await cleanOutput();

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1100 },
    deviceScaleFactor: 1,
  });

  await page.goto(settingsURL, { waitUntil: "networkidle" });
  await captureLocator(page.getByTestId("v8-settings-board-overview"), "settings-00-overview.png", `${v8SettingsBoardVersion} overview`);

  for (const [index, state] of settingsBoardStates.entries()) {
    const filename = `state-${String(index + 1).padStart(2, "0")}-${state.id}.png`;
    await captureState(page, state, filename);
  }

  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto(settingsURL, { waitUntil: "networkidle" });
  await page.screenshot({ path: join(outputDir, "responsive-390-full.png"), fullPage: true });
  shots.push({ filename: "responsive-390-full.png", title: "390px responsive full board" });

  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto(settingsURL, { waitUntil: "networkidle" });
  await page.screenshot({ path: join(outputDir, "responsive-1440-full.png"), fullPage: true });
  shots.push({ filename: "responsive-1440-full.png", title: "1440px responsive full board" });

  await browser.close();
  console.log(JSON.stringify({ baseURL, outputDir, count: shots.length, shots }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
