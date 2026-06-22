import { mkdir, readdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const outputDir = join(rootDir, "screenshots", "v6", "current");
const baseURL = process.env.TAOTAO_BASE_URL ?? "http://127.0.0.1:5175";
const reviewURL = `${baseURL}${baseURL.includes("?") ? "&" : "?"}mode=review`;
const shots = [];

async function clickTestId(page, testId) {
  await page.getByTestId(testId).click();
  await page.waitForTimeout(160);
}

async function clickButton(page, name) {
  await page.getByRole("button", { name, exact: true }).click();
  await page.waitForTimeout(160);
}

async function capture(page, filename, title) {
  const frame = page.locator(".phone-frame");
  await frame.screenshot({ path: join(outputDir, filename) });
  shots.push({ filename, title });
}

async function captureShell(page, filename, title) {
  const shell = page.getByTestId("app-shell");
  await shell.screenshot({ path: join(outputDir, filename) });
  shots.push({ filename, title });
}

async function completeAuth(page) {
  await page.getByTestId("auth-phone-input").fill("13852000520");
  await clickTestId(page, "auth-submit");
  await clickTestId(page, "auth-resend");
  await page.getByText("验证码已重新发送").waitFor({ timeout: 3000 });
  await clickTestId(page, "auth-submit");
  await clickTestId(page, "auth-submit");
  await page.getByTestId("screen-chat").waitFor({ timeout: 3000 });
}

async function createBoundCouple(page) {
  await clickTestId(page, "auth-submit-intent");
  await completeAuth(page);
  await capture(page, "app-03-source-upload.png", "创建桃桃上传入口");
  await clickTestId(page, "source-demo-photo");
  await capture(page, "app-04-source-preview.png", "照片预览与来源确认");
  await page.getByRole("button", { name: "陶瓷杯 你们最近三次晚餐都带着它 最像", exact: true }).click();
  await page.waitForTimeout(160);
  await clickTestId(page, "show-taotao-preview");
  await capture(page, "app-05-life-preview.png", "桃桃预览与改名");
  await clickTestId(page, "self-confirm-taotao");
  await clickTestId(page, "create-invite");
  await capture(page, "app-06-invite-created.png", "聊天内微信邀请卡");
  await clickTestId(page, "open-mini-surface");
  await capture(page, "mini-01-invite-preview.png", "小程序邀请打开");
  await clickTestId(page, "mini-auth-continue");
  await capture(page, "mini-02-wechat-auth.png", "微信授权确认身份");
  await clickTestId(page, "mini-auth-allow");
  await clickTestId(page, "mini-confirm");
  await capture(page, "mini-03-confirmed.png", "双方确认完成");
  await clickTestId(page, "mini-light-start");
  await page.getByTestId("mini-light-option").filter({ hasText: "去公园" }).click();
  await capture(page, "mini-04-light-action.png", "小程序轻用一次");
  await clickTestId(page, "mini-return-app");
  await page.getByTestId("screen-chat").waitFor({ timeout: 3000 });
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
    viewport: { width: 1360, height: 960 },
    deviceScaleFactor: 1,
  });

  await page.goto(reviewURL, { waitUntil: "networkidle" });
  await captureShell(page, "review-01-v6-state-matrix.png", "V6 传统原型状态矩阵");
  await capture(page, "app-01-chat-default.png", "App 默认聊天入口");
  await clickTestId(page, "auth-submit-intent");
  await capture(page, "app-02-phone-auth.png", "手机号登录");
  await completeAuth(page);
  await clickTestId(page, "source-demo-photo");
  await page.getByRole("button", { name: "陶瓷杯 你们最近三次晚餐都带着它 最像", exact: true }).click();
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

  await captureShell(page, "review-02-bound-accepted.png", "绑定聊天 + V6 状态矩阵");
  await capture(page, "app-07-bound-accepted-context.png", "已约好：顶部胶囊 + 底部动作");

  await clickButton(page, "等待回应");
  await clickButton(page, "接收方");
  await capture(page, "app-08-receiver-waiting-actions.png", "接收方待回应");

  await clickButton(page, "发起方");
  await clickButton(page, "对方轻改");
  await capture(page, "app-09-initiator-countered.png", "发起方看到轻改");

  await clickButton(page, "已约好");
  await clickTestId(page, "agreement-complete");
  await capture(page, "app-10-completed-capsule.png", "完成后收起为胶囊");

  await clickTestId(page, "event-capsule-park-walk");
  await capture(page, "app-11-event-detail-sheet.png", "事件详情 Sheet");

  await clickTestId(page, "event-sheet-save-memory");
  await capture(page, "app-12-memory-draft.png", "小窝草稿待自己确认");
  await clickTestId(page, "memory-confirm");
  await capture(page, "app-13-memory-pending-partner.png", "小窝等待另一半点头");

  await page.goto(reviewURL, { waitUntil: "networkidle" });
  await createBoundCouple(page);
  await page.getByTestId("chat-input").fill("今晚吃什么");
  await clickTestId(page, "chat-send");
  await capture(page, "app-14-event-candidate-strip.png", "输入触发轻量事件条");

  await browser.close();
  console.log(JSON.stringify({ baseURL, outputDir, count: shots.length, shots }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
