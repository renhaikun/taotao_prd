import { mkdir, readdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const outputDir = join(rootDir, "screenshots");
const baseURL = process.env.TAOTAO_BASE_URL ?? "http://127.0.0.1:5175";

const shots = [];

async function clickButton(page, name) {
  await page.getByRole("button", { name, exact: true }).click();
  await page.waitForTimeout(180);
}

async function capture(page, filename, title) {
  const frame = page.locator(".phone-frame");
  await frame.screenshot({ path: join(outputDir, filename) });
  shots.push({ filename, title });
}

async function run() {
  await mkdir(outputDir, { recursive: true });
  const existingFiles = await readdir(outputDir);
  await Promise.all(
    existingFiles
      .filter((filename) => filename.startsWith("current-") && filename.endsWith(".png"))
      .map((filename) => rm(join(outputDir, filename)))
  );

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 960 },
    deviceScaleFactor: 1,
  });

  await page.goto(baseURL, { waitUntil: "networkidle" });

  await capture(page, "current-01-auth-phone.png", "手机号登录");
  await clickButton(page, "发送验证码");
  await clickButton(page, "重新发送");
  await capture(page, "current-02-auth-code.png", "验证码重发反馈");
  await clickButton(page, "继续");
  await capture(page, "current-03-auth-profile.png", "轻资料保存");
  await clickButton(page, "保存并进入桃桃");

  await capture(page, "current-04-wake-upload.png", "首次唤醒上传");
  await clickButton(page, "选择一张照片");
  await capture(page, "current-05-wake-recognizing.png", "桃桃识别中");
  await clickButton(page, "看识别结果");
  await capture(page, "current-06-wake-confirm-object.png", "确认来源小物");
  await clickButton(page, "确认它是陶瓷杯");
  await capture(page, "current-07-wake-generating.png", "登录后生成桃桃");
  await clickButton(page, "看看它醒来");
  await capture(page, "current-08-wake-awakened.png", "桃桃第一次醒来");
  await clickButton(page, "带另一半进来");
  await capture(page, "current-09-wake-invite-partner.png", "App 发起邀请");
  await clickButton(page, "发给另一半");
  await capture(page, "current-10-app-invite-created.png", "App 邀请已创建");
  await clickButton(page, "查看邀请预览");

  await capture(page, "current-11-mini-invite-preview.png", "微信邀请预览");
  await clickButton(page, "微信授权继续");
  await capture(page, "current-12-mini-wechat-auth.png", "微信授权确认");
  await clickButton(page, "暂时不授权");
  await page.getByRole("button", { name: "复制邀请链接" }).click();
  await page.waitForTimeout(180);
  await capture(page, "current-13-mini-auth-failed.png", "授权失败与复制反馈");
  await clickButton(page, "重新授权");
  await clickButton(page, "允许并继续");

  await capture(page, "current-14-mini-invite-review.png", "另一半确认桃桃");
  await clickButton(page, "想改一下");
  await capture(page, "current-15-mini-needs-edit.png", "另一半请求修改");
  await clickButton(page, "回到邀请");
  await clickButton(page, "微信授权继续");
  await clickButton(page, "允许并继续");
  await clickButton(page, "不是这个");
  await capture(page, "current-16-mini-rejected.png", "另一半暂不确认");
  await clickButton(page, "重新看看");
  await clickButton(page, "微信授权继续");
  await clickButton(page, "允许并继续");
  await clickButton(page, "我也确认");

  await capture(page, "current-17-mini-confirmed.png", "双方确认完成");
  await clickButton(page, "打开 App 看它醒来");
  await page.getByRole("button", { name: "复制回 App 链接" }).click();
  await page.waitForTimeout(180);
  await capture(page, "current-18-mini-open-failed.png", "打开 App 失败兜底");
  await clickButton(page, "先在微信里用一次");
  await clickButton(page, "热汤面");
  await capture(page, "current-19-mini-light-action.png", "小程序轻行动选择");
  await clickButton(page, "选好了，回到 App");

  await capture(page, "current-20-chat-return-from-mini.png", "小程序回流到我们和桃桃");
  await clickButton(page, "去确认");
  await capture(page, "current-21-memory-draft.png", "记忆草稿待确认");
  await clickButton(page, "确认这件小事");
  await capture(page, "current-22-memory-confirmed.png", "记忆确认完成");
  await page.getByRole("button", { name: "今天", exact: true }).first().click();
  await capture(page, "current-23-today-decision.png", "今日主行动场景");
  await clickButton(page, "换一件事");
  await capture(page, "current-24-today-soften.png", "今日第二行动场景");

  await browser.close();

  console.log(JSON.stringify({ baseURL, outputDir, count: shots.length, shots }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
