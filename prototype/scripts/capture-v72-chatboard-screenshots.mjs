import { mkdir, readdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { chatDisplayStates, v72ChatBoardVersion } from "../src/data/v72ChatBoardData.js";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const outputDir = join(rootDir, "screenshots", "v7", "chatboard", "current");
const baseURL = process.env.TAOTAO_BASE_URL ?? "http://127.0.0.1:5175";
const chatboardURL = `${baseURL}${baseURL.includes("?") ? "&" : "?"}mode=chatboard`;
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
  await page.waitForTimeout(50);
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
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 1,
  });

  await page.goto(chatboardURL, { waitUntil: "networkidle" });
  await captureLocator(page.getByTestId("v72-chatboard-overview"), "chatboard-00-overview.png", `${v72ChatBoardVersion} overview`);
  await captureLocator(page.getByTestId("v72-chatboard-layout-rules"), "chatboard-01-layout-rules.png", `${v72ChatBoardVersion} layout rules`);
  await captureLocator(page.getByTestId("v8-production-contracts"), "chatboard-02-v8-production-contracts.png", "V8 production flow contracts");
  await captureLocator(page.getByTestId("v78-coverage-matrix"), "chatboard-03-coverage-matrix.png", `${v72ChatBoardVersion} coverage matrix`);

  for (const [index, state] of chatDisplayStates.entries()) {
    const filename = `state-${String(index + 1).padStart(2, "0")}-${state.id}.png`;
    await captureState(page, state, filename);
  }

  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto(chatboardURL, { waitUntil: "networkidle" });
  await page.screenshot({ path: join(outputDir, "responsive-390-full.png"), fullPage: true });
  shots.push({ filename: "responsive-390-full.png", title: "390px responsive full board" });

  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto(chatboardURL, { waitUntil: "networkidle" });
  await page.screenshot({ path: join(outputDir, "responsive-1440-full.png"), fullPage: true });
  shots.push({ filename: "responsive-1440-full.png", title: "1440px responsive full board" });

  await browser.close();
  console.log(JSON.stringify({ baseURL, outputDir, count: shots.length, shots }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
