import { chromium } from "playwright";

const baseURL = process.env.TAOTAO_BASE_URL ?? "http://127.0.0.1:5175";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function clickTestId(page, testId) {
  await page.getByTestId(testId).click();
  await page.waitForTimeout(100);
}

async function completeAuth(page) {
  await page.getByTestId("screen-auth").waitFor({ timeout: 3000 });
  await page.getByTestId("auth-phone-input").fill("13852000520");
  await clickTestId(page, "auth-submit");
  await clickTestId(page, "auth-resend");
  await page.getByText("验证码已重新发送").waitFor({ timeout: 3000 });
  await clickTestId(page, "auth-submit");
  await clickTestId(page, "auth-submit");
  await page.getByTestId("screen-chat").waitFor({ timeout: 3000 });
}

async function createBoundCouple(page) {
  await page.goto(`${baseURL}?mode=review`, { waitUntil: "networkidle" });
  await clickTestId(page, "auth-submit-intent");
  await completeAuth(page);
  await clickTestId(page, "source-demo-photo");
  await page.getByRole("button", { name: "陶瓷杯 你们最近三次晚餐都带着它 最像", exact: true }).click();
  await page.waitForTimeout(100);
  await clickTestId(page, "show-taotao-preview");
  await clickTestId(page, "self-confirm-taotao");
  await clickTestId(page, "create-invite");
  await clickTestId(page, "open-mini-surface");
  await clickTestId(page, "mini-auth-continue");
  await clickTestId(page, "mini-auth-allow");
  await clickTestId(page, "mini-confirm");
  await clickTestId(page, "mini-light-start");
  await page.getByTestId("mini-light-option").filter({ hasText: "去公园" }).click();
  await clickTestId(page, "mini-return-app");
  await page.getByTestId("screen-chat").waitFor({ timeout: 3000 });
  await page.waitForFunction(() => document.querySelector("[data-testid='screen-chat']")?.dataset.coupleStatus === "bound");
}

async function runConversationEventLifecycle(browser) {
  const page = await browser.newPage({
    viewport: { width: 430, height: 900 },
    deviceScaleFactor: 1,
  });

  await createBoundCouple(page);
  assert(await page.getByTestId("app-shell").getAttribute("data-prototype-version") === "v5", "V5 prototype shell should expose version v5");

  await page.getByTestId("conversation-event-dock").waitFor({ timeout: 3000 });
  assert(await page.getByTestId("event-dock-pill-park-walk").isVisible(), "Chat should expose an event dock pill for the active park event");
  assert(await page.getByTestId("active-event-card").getAttribute("data-event-display") === "expanded", "Active event should start as one expanded working card");

  await clickTestId(page, "agreement-complete");
  await page.waitForFunction(() => document.querySelector("[data-testid='event-capsule-park-walk']")?.dataset.eventState === "completed");
  assert(await page.getByTestId("active-event-card").count() === 0, "Completed event should collapse out of the main chat card");
  assert(await page.getByTestId("event-capsule-park-walk").isVisible(), "Completed event should become a compact chat capsule");
  assert((await page.getByTestId("event-capsule-park-walk").innerText()).includes("已走完"), "Collapsed capsule should summarize completion");

  await clickTestId(page, "event-capsule-park-walk");
  await page.getByTestId("event-detail-sheet").waitFor({ timeout: 3000 });
  assert(await page.getByTestId("event-detail-sheet").getAttribute("data-event-id") === "park-walk-tonight", "Event detail sheet should reopen the same event");
  assert(await page.getByTestId("event-detail-sheet").innerText().then((text) => text.includes("双方记录") && text.includes("留下到小窝")), "Event sheet should show recoverable detail and next actions");

  await clickTestId(page, "event-sheet-save-memory");
  await page.getByTestId("screen-memory").waitFor({ timeout: 3000 });
  assert(await page.getByTestId("screen-memory").getAttribute("data-memory-status") === "draft", "Saving from event sheet should create a memory draft");
  await clickTestId(page, "memory-confirm");
  await page.waitForFunction(() => document.querySelector("[data-testid='screen-memory']")?.dataset.memoryStatus === "pending_partner");

  await page.close();
  return "conversation-event-lifecycle";
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const passed = [await runConversationEventLifecycle(browser)];
  await browser.close();
  console.log(JSON.stringify({ baseURL, passed }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
