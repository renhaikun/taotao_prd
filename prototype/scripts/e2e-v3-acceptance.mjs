import { chromium } from "playwright";

const baseURL = process.env.TAOTAO_BASE_URL ?? "http://127.0.0.1:5175";

const viewports = [
  { width: 430, height: 900, name: "canonical-phone" },
  { width: 390, height: 844, name: "iphone-compact" },
  { width: 375, height: 667, name: "short-phone" },
];

const forbiddenUserCopy = [
  "当前步骤",
  "开发要点",
  "生产流程",
  "onboardingStep",
  "authStatus",
  "V3.1",
  "原型",
  "今日行动",
  "低压力",
  "回到聊天",
  "房间",
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function assertNoButtonOverflow(page) {
  const overflowing = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("button, .primary-action, .option-row button"))
      .filter((element) => element.scrollWidth > element.clientWidth + 2)
      .map((element) => element.textContent.trim())
      .filter(Boolean)
      .slice(0, 8);
  });

  assert(overflowing.length === 0, `Text overflow in controls: ${overflowing.join(", ")}`);
}

async function assertNoUserVisibleInternalCopy(page) {
  const phoneText = await page.locator(".phone-screen").innerText();
  const hits = forbiddenUserCopy.filter((word) => phoneText.includes(word));
  assert(hits.length === 0, `Phone screen should not show internal copy: ${hits.join(", ")}`);
}

async function clickTestId(page, testId) {
  await page.getByTestId(testId).click();
  await page.waitForTimeout(90);
  await assertNoButtonOverflow(page);
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

async function runAppFlow(browser, viewport) {
  const page = await browser.newPage({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  });

  const pageErrors = [];
  const consoleErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.getByTestId("screen-chat").waitFor({ timeout: 3000 });
  assert(await page.getByTestId("chat-composer").isVisible(), "Chat composer should be visible on first screen");
  assert(await page.getByTestId("composer-shortcuts").isVisible(), "Chat composer shortcuts should be visible");
  assert(await page.locator(".prototype-rail").count() === 0, "Default user mode should not render review rail");
  assert(await page.getByTestId("bottom-nav").count() === 0, "Chat first screen should not show bottom nav");
  await assertNoUserVisibleInternalCopy(page);

  await clickTestId(page, "auth-submit-intent");
  await completeAuth(page);
  await page.waitForFunction(() => document.querySelector("[data-testid='screen-chat']")?.dataset.onboardingStep === "source");

  assert(await page.getByTestId("source-upload-input").count() === 1, "V4 creation should expose a source upload input");
  await clickTestId(page, "source-demo-photo");
  await page.getByTestId("source-photo-preview").waitFor({ timeout: 3000 });
  await clickTestId(page, "source-photo-unusable");
  await page.getByText("先别卡在照片上").waitFor({ timeout: 3000 });
  await clickTestId(page, "source-choice-default-embryo");
  await page.waitForFunction(() => document.querySelector("[data-testid='screen-chat']")?.dataset.generationStatus === "running");
  await clickTestId(page, "show-taotao-preview");
  await page.getByTestId("life-name-input").fill("小白");
  await clickTestId(page, "life-name-save");
  await page.waitForFunction(() => document.querySelector("[data-testid='screen-chat']")?.dataset.lifeDisplayName === "小白");
  await clickTestId(page, "self-confirm-taotao");

  await clickTestId(page, "open-taotao-life");
  await page.getByTestId("taotao-life-panel").waitFor({ timeout: 3000 });
  assert(await page.getByTestId("taotao-life-panel").getAttribute("data-life-status") === "pending_partner_confirm", "Life should wait for partner before becoming awake");
  const bottomLabels = await page.locator("[data-testid='bottom-nav'] button span").allTextContents();
  assert(JSON.stringify(bottomLabels) === JSON.stringify(["聊天", "小白", "小窝"]), `Bottom nav should use V4 order and renamed life: ${bottomLabels.join(", ")}`);
  await clickTestId(page, "bottom-nav-chat");

  await clickTestId(page, "create-invite");
  await page.waitForFunction(() => document.querySelector("[data-testid='screen-chat']")?.dataset.onboardingStep === "invite_created");
  await clickTestId(page, "open-mini-surface");
  await page.getByTestId("screen-mini").waitFor({ timeout: 3000 });
  assert(await page.getByTestId("bottom-nav").count() === 0, "Mini surface should not render App bottom nav");
  assert(await page.getByTestId("screen-mini").getAttribute("data-life-display-name") === "小白", "Mini surface should inherit renamed life");
  await assertNoUserVisibleInternalCopy(page);

  await clickTestId(page, "mini-auth-continue");
  await clickTestId(page, "mini-auth-allow");
  await clickTestId(page, "mini-later");
  await page.getByText("可以晚点再答").waitFor({ timeout: 3000 });
  await page.getByRole("button", { name: "回去再看看" }).click();
  await clickTestId(page, "mini-edit");
  await page.getByText("先让小雨换一张").waitFor({ timeout: 3000 });
  await page.getByRole("button", { name: "回到邀请" }).click();
  await clickTestId(page, "mini-auth-continue");
  await clickTestId(page, "mini-auth-allow");
  await clickTestId(page, "mini-confirm");
  await clickTestId(page, "mini-light-start");
  await page.getByTestId("mini-light-option").filter({ hasText: "去公园" }).click();
  await clickTestId(page, "mini-return-app");

  await page.getByTestId("screen-chat").waitFor({ timeout: 3000 });
  await page.waitForFunction(() => document.querySelector("[data-testid='screen-chat']")?.dataset.coupleStatus === "bound");
  await page.waitForFunction(() => document.querySelector("[data-testid='screen-chat']")?.dataset.lifeStatus === "awake");
  assert(await page.getByTestId("bottom-nav").count() === 0, "Bound chat keeps composer as the only bottom control");
  await page.getByText("阿川在微信里选了「去公园」").waitFor({ timeout: 3000 });
  await assertNoUserVisibleInternalCopy(page);

  await page.locator("[data-testid='chat-action-card'][data-card-type='proposal_sender']").waitFor({ timeout: 3000 });
  assert(await page.getByTestId("chat-action-card").getAttribute("data-card-status") === "accepted", "Proposal should return accepted after mini light action");
  await clickTestId(page, "agreement-complete");
  await page.waitForFunction(() => document.querySelector("[data-testid='chat-action-card']")?.dataset.cardStatus === "completed");
  await clickTestId(page, "chat-save-memory");
  await page.waitForFunction(() => document.querySelector("[data-testid='chat-action-card']")?.dataset.cardStatus === "memory_prompted");
  await clickTestId(page, "chat-save-memory");
  await page.getByTestId("screen-memory").waitFor({ timeout: 3000 });
  assert(await page.getByTestId("screen-memory").getAttribute("data-memory-status") === "draft", "Memory should be draft before confirmation");
  await clickTestId(page, "memory-confirm");
  await page.waitForFunction(() => document.querySelector("[data-testid='screen-memory']")?.dataset.memoryStatus === "pending_partner");
  await clickTestId(page, "memory-confirm");
  await page.waitForFunction(() => document.querySelector("[data-testid='screen-memory']")?.dataset.memoryStatus === "confirmed");
  assert((await page.getByText("已确认").count()) >= 1, "Confirmed memory should show confirmed copy");

  await assertNoButtonOverflow(page);
  await assertNoUserVisibleInternalCopy(page);
  assert(pageErrors.length === 0, `Page errors in ${viewport.name}: ${pageErrors.join(" | ")}`);
  assert(consoleErrors.length === 0, `Console errors in ${viewport.name}: ${consoleErrors.join(" | ")}`);

  await page.close();
  return viewport.name;
}

async function runReviewModeFlowPanelCheck(browser) {
  const page = await browser.newPage({
    viewport: { width: 1360, height: 960 },
    deviceScaleFactor: 1,
  });

  await page.goto(`${baseURL}?mode=review`, { waitUntil: "networkidle" });
  await page.getByTestId("flow-panel").waitFor({ timeout: 3000 });
  assert(await page.getByTestId("flow-panel").getAttribute("data-current-route") === "chat", "Flow panel should start on chat route");
  assert(await page.getByText("当前画面").isVisible(), "Review mode should explain the current screen");
  assert(await page.getByText("交付提醒").isVisible(), "Review mode should expose product handoff guidance");
  assert(await page.getByTestId("rail-nav-chat").innerText() === "聊天", "Rail nav should use chat naming");
  assert((await page.getByTestId("rail-nav-mini").count()) === 0, "Flow rail must not expose mini route as App nav");
  await clickTestId(page, "auth-submit-intent");
  await completeAuth(page);
  await page.waitForFunction(() => document.querySelector("[data-testid='flow-panel']")?.dataset.currentStep === "source");
  await page.close();
  return "review-mode-flow-panel";
}

async function runIndependentMiniEntry(browser) {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  });

  await page.goto(`${baseURL}?surface=mini&invite=taotao-demo`, { waitUntil: "networkidle" });
  await page.getByTestId("screen-mini").waitFor({ timeout: 3000 });
  assert(await page.getByTestId("app-shell").getAttribute("data-surface") === "mini", "Independent mini entry should expose mini surface state");
  assert(await page.locator(".prototype-rail").count() === 0, "Independent mini entry must not show App rail");
  assert(await page.getByTestId("bottom-nav").count() === 0, "Independent mini entry must not show App bottom nav");
  assert(await page.getByRole("heading", { name: "小雨想和你一起养桃桃" }).isVisible(), "Mini entry should show WeChat invite content");
  await assertNoUserVisibleInternalCopy(page);
  await page.close();
  return "independent-mini-entry";
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const passed = [];

  passed.push(await runReviewModeFlowPanelCheck(browser));
  passed.push(await runIndependentMiniEntry(browser));

  for (const viewport of viewports) {
    passed.push(await runAppFlow(browser, viewport));
  }

  await browser.close();
  console.log(JSON.stringify({ baseURL, passed }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
