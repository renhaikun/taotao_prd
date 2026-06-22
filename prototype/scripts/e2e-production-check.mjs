import { chromium } from "playwright";

const baseURL = process.env.TAOTAO_BASE_URL ?? "http://127.0.0.1:5175";

const viewports = [
  { width: 430, height: 900, name: "canonical-phone" },
  { width: 390, height: 844, name: "iphone-compact" },
  { width: 375, height: 812, name: "small-phone" },
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function clickButton(page, name) {
  await page.getByRole("button", { name, exact: true }).click();
  await page.waitForTimeout(80);
  await assertNoButtonOverflow(page);
}

async function assertNoButtonOverflow(page) {
  const overflowing = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("button, .primary-action, .option-row button"))
      .filter((element) => element.scrollWidth > element.clientWidth + 2)
      .map((element) => element.textContent.trim())
      .filter(Boolean)
      .slice(0, 5);
  });

  assert(overflowing.length === 0, `Text overflow in controls: ${overflowing.join(", ")}`);
}

async function runCriticalFlow(browser, viewport) {
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

  await page.getByText("先确认是你").waitFor({ timeout: 3000 });
  await assertNoButtonOverflow(page);
  await clickButton(page, "发送验证码");
  await clickButton(page, "重新发送");
  await page.getByText("验证码已重新发送").waitFor({ timeout: 3000 });
  await clickButton(page, "继续");
  await clickButton(page, "保存并进入桃桃");
  await page.getByText("唤醒你们的小东西").waitFor({ timeout: 3000 });
  await clickButton(page, "选择一张照片");
  await clickButton(page, "看识别结果");
  await clickButton(page, "确认它是陶瓷杯");
  await clickButton(page, "看看它醒来");
  await clickButton(page, "带另一半进来");
  await clickButton(page, "发给另一半");
  await page.getByText("邀请已经创建").waitFor({ timeout: 3000 });
  await clickButton(page, "查看邀请预览");
  await clickButton(page, "微信授权继续");
  await clickButton(page, "暂时不授权");
  await page.getByRole("button", { name: "复制邀请链接" }).click();
  await page.getByText("邀请链接已复制").waitFor({ timeout: 3000 });
  await clickButton(page, "重新授权");
  await clickButton(page, "允许并继续");
  await clickButton(page, "想改一下");
  await page.getByText("先让小雨换一张").waitFor({ timeout: 3000 });
  await clickButton(page, "回到邀请");
  await clickButton(page, "微信授权继续");
  await clickButton(page, "允许并继续");
  await clickButton(page, "不是这个");
  await page.getByText("桃桃会先等一等").waitFor({ timeout: 3000 });
  await clickButton(page, "重新看看");
  await clickButton(page, "微信授权继续");
  await clickButton(page, "允许并继续");
  await clickButton(page, "我也确认");
  await clickButton(page, "打开 App 看它醒来");
  await page.getByRole("button", { name: "复制回 App 链接" }).click();
  await page.getByText("回 App 链接已复制").waitFor({ timeout: 3000 });
  await clickButton(page, "先在微信里用一次");
  await clickButton(page, "热汤面");
  await clickButton(page, "选好了，回到 App");
  await page.getByText("阿川在微信里选了「热汤面」").waitFor({ timeout: 3000 });
  assert(await page.locator(".bottom-nav").count() === 0, "Chat screen should not show bottom navigation");
  assert(await page.locator(".composer").isVisible(), "Chat composer should stay visible as the only bottom control");
  await clickButton(page, "去确认");
  await page.getByText("今晚先选了热汤面").waitFor({ timeout: 3000 });
  await clickButton(page, "确认这件小事");
  await page.getByText("已确认").first().waitFor({ timeout: 3000 });

  await assertNoButtonOverflow(page);
  assert(pageErrors.length === 0, `Page errors in ${viewport.name}: ${pageErrors.join(" | ")}`);
  assert(consoleErrors.length === 0, `Console errors in ${viewport.name}: ${consoleErrors.join(" | ")}`);

  await page.close();

  return viewport.name;
}

async function runGuardCheck(browser) {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 960 },
    deviceScaleFactor: 1,
  });

  await page.goto(baseURL, { waitUntil: "networkidle" });
  for (const navName of ["唤醒桃桃", "今天", "我们", "记忆小窝", "邀请确认"]) {
    await page.getByRole("button", { name: navName, exact: true }).first().click();
    await page.getByText("先确认是你").waitFor({ timeout: 3000 });
  }
  await page.close();
  return "pre-auth-route-guard-matrix";
}

async function runUnboundGuardCheck(browser) {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 960 },
    deviceScaleFactor: 1,
  });

  await page.goto(baseURL, { waitUntil: "networkidle" });
  await clickButton(page, "发送验证码");
  await clickButton(page, "继续");
  await clickButton(page, "保存并进入桃桃");
  await page.getByText("唤醒你们的小东西").waitFor({ timeout: 3000 });
  await page.getByRole("button", { name: "今天", exact: true }).first().click();
  await page.getByText("给另一半一条轻链接").waitFor({ timeout: 3000 });
  await page.getByRole("button", { name: "我们", exact: true }).first().click();
  await page.getByText("给另一半一条轻链接").waitFor({ timeout: 3000 });
  await page.getByRole("button", { name: "邀请确认", exact: true }).first().click();
  await page.getByText("给另一半一条轻链接").waitFor({ timeout: 3000 });
  await page.close();
  return "post-auth-unbound-guard-matrix";
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const passed = [];

  passed.push(await runGuardCheck(browser));
  passed.push(await runUnboundGuardCheck(browser));

  for (const viewport of viewports) {
    passed.push(await runCriticalFlow(browser, viewport));
  }

  await browser.close();
  console.log(JSON.stringify({ baseURL, passed }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
