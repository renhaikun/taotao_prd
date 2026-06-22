import { mkdir, readdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const screenshotVersion = process.env.TAOTAO_SCREENSHOT_VERSION ?? "v33";
const outputDir = join(rootDir, "screenshots", screenshotVersion, "current");
const baseURL = process.env.TAOTAO_BASE_URL ?? "http://127.0.0.1:5175";
const reviewURL = `${baseURL}${baseURL.includes("?") ? "&" : "?"}mode=review`;
const shots = [];

async function clickTestId(page, testId) {
  await page.getByTestId(testId).click();
  await page.waitForTimeout(180);
}

async function clickButton(page, name) {
  await page.getByRole("button", { name, exact: true }).click();
  await page.waitForTimeout(180);
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
  await captureShell(page, "review-01-chat-default.png", "评审面板 + 默认聊天");
  await capture(page, "app-01-chat-default.png", "App 默认聊天入口");

  await clickTestId(page, "auth-submit-intent");
  await capture(page, "app-02-phone-auth.png", "手机号登录");
  await completeAuth(page);
  await captureShell(page, "review-02-source-recognition.png", "来源识别 + 流程说明");
  await capture(page, "app-03-source-upload.png", "创建桃桃上传入口");
  await clickTestId(page, "source-demo-photo");
  await capture(page, "app-04-source-preview.png", "照片预览与来源确认");

  await clickTestId(page, "source-photo-unusable");
  await capture(page, "app-05-source-recovery.png", "照片看不清恢复态");
  await clickTestId(page, "source-choice-default-embryo");
  await capture(page, "app-06-generating-default-source.png", "默认来源生成中");
  await clickTestId(page, "show-taotao-preview");
  await page.getByTestId("life-name-input").fill("小白");
  await clickTestId(page, "life-name-save");
  await capture(page, "app-07-life-preview-renamed.png", "自定义名预览");
  await clickTestId(page, "self-confirm-taotao");
  await clickTestId(page, "open-taotao-life");
  await capture(page, "app-08-life-pending-partner.png", "自定义名等待另一半确认");
  await clickTestId(page, "bottom-nav-chat");
  await clickTestId(page, "create-invite");
  await capture(page, "app-09-invite-created.png", "聊天内微信邀请卡");
  await clickButton(page, "邀请已打开");
  await capture(page, "app-10-invite-opened-status.png", "邀请已打开状态");
  await clickTestId(page, "open-mini-surface");

  await capture(page, "mini-01-invite-preview.png", "小程序邀请打开");
  await clickTestId(page, "mini-auth-continue");
  await capture(page, "mini-02-wechat-auth.png", "微信授权确认身份");
  await clickTestId(page, "mini-auth-allow");
  await capture(page, "mini-03-partner-review.png", "另一半确认自定义名");
  await clickTestId(page, "mini-later");
  await capture(page, "mini-04-later.png", "另一半晚点再答");
  await clickButton(page, "回去再看看");
  await clickTestId(page, "mini-edit");
  await capture(page, "mini-05-counter-source.png", "另一半想改一下");
  await clickButton(page, "回到邀请");
  await clickTestId(page, "mini-auth-continue");
  await clickTestId(page, "mini-auth-allow");
  await clickTestId(page, "mini-confirm");
  await capture(page, "mini-06-confirmed.png", "双方确认完成");
  await clickTestId(page, "mini-light-start");
  await page.getByTestId("mini-light-option").filter({ hasText: "去公园" }).click();
  await capture(page, "mini-07-light-action.png", "小程序轻用一次");
  await clickTestId(page, "mini-return-app");

  await page.getByTestId("screen-chat").waitFor({ timeout: 3000 });
  await captureShell(page, "review-03-bound-chat-accepted.png", "共同聊天 + 已约好");
  await capture(page, "app-10-bound-chat-accepted.png", "双方确认后共同聊天");
  await clickButton(page, "等待回应");
  await clickButton(page, "接收方");
  await capture(page, "app-11-receiver-proposal.png", "阿川视角收到提议");
  await clickButton(page, "发起方");
  await clickButton(page, "对方轻改");
  await capture(page, "app-12-initiator-countered.png", "小雨视角看到轻改");
  await clickButton(page, "已约好");
  await clickTestId(page, "agreement-complete");
  await capture(page, "app-13-completed-event.png", "事情完成后准备沉淀");
  await clickTestId(page, "chat-save-memory");
  await capture(page, "app-14-memory-prompted.png", "聊天里建议留下");
  await clickTestId(page, "chat-save-memory");
  await capture(page, "app-15-memory-draft.png", "小窝待确认记忆");
  await clickTestId(page, "memory-confirm");
  await capture(page, "app-16-memory-confirmed.png", "小窝记忆确认完成");

  await browser.close();
  console.log(JSON.stringify({ baseURL, outputDir, count: shots.length, shots }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
