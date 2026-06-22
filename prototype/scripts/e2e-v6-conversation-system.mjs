import { chromium } from "playwright";

const baseURL = process.env.TAOTAO_BASE_URL ?? "http://127.0.0.1:5175";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function clickTestId(page, testId) {
  await page.getByTestId(testId).click();
  await page.waitForTimeout(120);
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
  await page.waitForTimeout(120);
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

async function phoneText(page) {
  return page.locator(".phone-screen").innerText();
}

async function assertNoUserFacingInternalCopy(page) {
  const text = await phoneText(page);
  const forbidden = [
    "桃桃会在合适的时候接一句",
    "它会怎么陪",
    "留下小事",
    "今日行动",
    "评审小雨视角",
    "评审阿川视角",
    "TemporaryChat",
    "pendingAction",
    "状态字段",
    "心灵信号",
    "房间",
    "在微信里选了",
    "已经接上这件小事",
  ];
  const found = forbidden.filter((item) => text.includes(item));
  assert(found.length === 0, `User-facing phone copy contains forbidden text: ${found.join(", ")}`);
}

async function runConversationSystem(browser) {
  const page = await browser.newPage({
    viewport: { width: 1360, height: 960 },
    deviceScaleFactor: 1,
  });

  await createBoundCouple(page);
  assert(await page.getByTestId("app-shell").getAttribute("data-prototype-version") === "v6", "V6 prototype shell should expose version v6");
  await assertNoUserFacingInternalCopy(page);

  await page.getByTestId("conversation-event-dock").waitFor({ timeout: 3000 });
  assert(await page.getByTestId("v6-state-matrix").isVisible(), "Review surface should expose the V6 state matrix for production handoff");
  assert(await page.getByTestId("event-dock-pill-park-walk").isVisible(), "Top dock should remain the single persistent event status");
  const taotaoMessageAudit = await page.locator(".phone-screen").evaluate((phone) => {
    const messages = [...phone.querySelectorAll(".message.taotao")];
    return {
      count: messages.length,
      missingAvatar: messages.filter((message) => !message.querySelector("[data-testid='taotao-message-avatar']")).length,
      stillSystemLike: phone.innerText.includes("我听到的是") || phone.innerText.includes("桃桃在这里"),
    };
  });
  assert(taotaoMessageAudit.count > 0, "Bound chat should render Taotao as a real third participant");
  assert(taotaoMessageAudit.missingAvatar === 0, "Every Taotao chat message should include Taotao avatar");
  assert(!taotaoMessageAudit.stillSystemLike, "Taotao should speak as a participant, not as a system summary/status pill");
  assert(await page.getByTestId("event-context-tray").isVisible(), "Composer area should expose contextual next actions");
  assert(await page.getByTestId("composer-shortcuts").count() === 0, "Bound chat should not show fixed feature shortcut chips");
  assert(await page.getByTestId("active-event-card").count() === 0, "Bound chat should not duplicate the dock with a large persistent proposal card");
  assert(await page.locator(".generated-event-card").count() === 0, "Bound chat should not create bottom recommendation cards while an event dock is active");

  const acceptedTray = await page.getByTestId("event-context-tray").innerText();
  assert(acceptedTray.includes("我们回来了"), "Accepted state tray should offer completion as the primary next action");
  assert(!acceptedTray.includes("今晚 20:30 已约好"), "Context tray should not repeat the same event title already shown in the top dock");

  await clickTestId(page, "agreement-complete");
  await page.waitForFunction(() => document.querySelector("[data-testid='event-capsule-park-walk']")?.dataset.eventState === "completed");
  assert(await page.getByTestId("active-event-card").count() === 0, "Completed event should stay out of the main chat card stack");
  assert(await page.getByTestId("event-capsule-park-walk").isVisible(), "Completed event should become a compact recoverable chat capsule");
  const completedTray = await page.getByTestId("event-context-tray").innerText();
  assert(completedTray.includes("留下到小窝"), "Completed state should offer memory capture from the contextual tray");
  assert(completedTray.includes("不留下"), "Completed state should offer a clear dismiss path");

  await clickTestId(page, "event-capsule-park-walk");
  await page.getByTestId("event-detail-sheet").waitFor({ timeout: 3000 });
  const sheetText = await page.getByTestId("event-detail-sheet").innerText();
  assert(sheetText.includes("今晚这件事") && sheetText.includes("留下到小窝"), "Event detail should preserve record and handoff actions");

  await clickTestId(page, "event-sheet-save-memory");
  await page.getByTestId("screen-memory").waitFor({ timeout: 3000 });
  assert(await page.getByTestId("screen-memory").getAttribute("data-memory-status") === "draft", "Saving from event detail should create a memory draft");

  await page.goto(`${baseURL}?mode=review`, { waitUntil: "networkidle" });
  await createBoundCouple(page);
  await page.getByRole("button", { name: "等待回应", exact: true }).click();
  await page.getByRole("button", { name: "接收方", exact: true }).click();
  await page.getByTestId("event-context-tray").waitFor({ timeout: 3000 });
  const receiverTray = await page.getByTestId("event-context-tray").innerText();
  assert(receiverTray.includes("可以，20:30") && receiverTray.includes("晚点 21:00"), "Receiver view should expose direct response actions");
  assert((await phoneText(page)).includes("小雨想少做一个决定"), "Receiver view should explain the event through Taotao's chat bubble");

  await page.getByTestId("chat-input").fill("今晚吃什么");
  await clickTestId(page, "chat-send");
  assert(await page.locator(".generated-event-card").count() === 0, "Typing a new intent should not spawn a second large card under the dock");
  assert(await page.getByTestId("event-candidate-strip").isVisible(), "Typing a new intent should become a lightweight recoverable strip");
  assert(await page.getByTestId("event-candidate-strip").locator("[data-testid='taotao-message-avatar']").count() === 1, "Recoverable strips created by Taotao should carry Taotao's avatar");

  await page.close();
  return "conversation-system-v6";
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const passed = [await runConversationSystem(browser)];
  await browser.close();
  console.log(JSON.stringify({ baseURL, passed }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
