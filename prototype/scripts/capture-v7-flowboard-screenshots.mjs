import { mkdir, readdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { v7FlowboardLanes, v7FlowboardVersion } from "../src/data/v7FlowboardData.js";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const outputDir = join(rootDir, "screenshots", "v7", "flowboard", "current");
const baseURL = process.env.TAOTAO_BASE_URL ?? "http://127.0.0.1:5175";
const flowboardURL = `${baseURL}${baseURL.includes("?") ? "&" : "?"}mode=flowboard`;
const shots = [];

async function captureLocator(locator, filename, title) {
  await locator.screenshot({ path: join(outputDir, filename) });
  shots.push({ filename, title });
}

async function run() {
  await mkdir(outputDir, { recursive: true });
  const existingFiles = await readdir(outputDir);
  await Promise.all(
    existingFiles
      .filter((filename) => filename.endsWith(".png"))
      .map((filename) => rm(join(outputDir, filename)))
  );

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 1,
  });

  await page.goto(flowboardURL, { waitUntil: "networkidle" });
  await captureLocator(page.getByTestId("v7-flowboard-overview"), "flowboard-00-overview.png", `${v7FlowboardVersion} flowboard overview`);
  await captureLocator(page.getByTestId("v7-intent-rules"), "flowboard-01-intent-rules.png", `${v7FlowboardVersion} AI 意图分流规则`);

  for (const [index, lane] of v7FlowboardLanes.entries()) {
    const filename = `lane-${String(index + 1).padStart(2, "0")}-${lane.id}.png`;
    await captureLocator(page.getByTestId(`flow-lane-${lane.id}`), filename, lane.title);
  }

  await browser.close();
  console.log(JSON.stringify({ baseURL, outputDir, count: shots.length, shots }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
