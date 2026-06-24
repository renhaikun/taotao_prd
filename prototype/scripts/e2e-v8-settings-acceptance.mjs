import { chromium } from "playwright";
import {
  settingsBoardFlows,
  settingsBoardStates,
  v8SettingsBoardVersion,
} from "../src/data/v8SettingsBoardData.js";

const baseURL = process.env.TAOTAO_BASE_URL ?? "http://127.0.0.1:5175";
const settingsURL = `${baseURL}${baseURL.includes("?") ? "&" : "?"}mode=settingsboard`;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function assertNoPhoneCopy(page, bannedCopy) {
  const phoneTexts = await page.locator("[data-testid='settings-page-preview']").evaluateAll((nodes) =>
    nodes.map((node) => node.innerText).join("\n")
  );

  for (const copy of bannedCopy) {
    assert(!phoneTexts.includes(copy), `手机稿里出现了禁用文案：${copy}`);
  }
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  });

  await page.goto(settingsURL, { waitUntil: "networkidle" });

  const shell = page.getByTestId("app-shell");
  await shell.waitFor();
  assert((await shell.getAttribute("data-surface")) === "settingsboard", "settingsboard surface 未生效");
  assert((await shell.getAttribute("data-prototype-version")) === "v8.0", "settingsboard 版本未标记为 v8.0");
  assert(await page.getByTestId("v8-settings-board-overview").isVisible(), "缺少 V8.0 基础控制概览");
  assert((await page.getByTestId("v8-settings-board-overview").innerText()).includes(v8SettingsBoardVersion), "概览未显示版本号");

  const flowCount = await page.getByTestId("settings-flow-lane").count();
  assert(flowCount === settingsBoardFlows.length, `链路数量不一致：${flowCount}`);

  const stateCount = await page.getByTestId("settings-board-state").count();
  assert(stateCount === settingsBoardStates.length, `状态数量不一致：${stateCount}`);
  assert(stateCount >= 18, "状态覆盖不足，基础控制分册不能指导开发");

  const phoneCount = await page.getByTestId("settings-page-preview").count();
  assert(phoneCount === settingsBoardStates.length, "每个状态都必须有手机稿");

  for (const flow of settingsBoardFlows) {
    const lane = page.locator(`[data-flow-id='${flow.id}']`);
    assert(await lane.count() > 0, `缺少链路：${flow.id}`);
    assert(Number(await lane.first().getAttribute("data-state-count")) === flow.stateIds.length, `链路状态数不一致：${flow.id}`);
  }

  for (const state of settingsBoardStates) {
    const card = page.locator(`[data-state-id='${state.id}']`);
    assert(await card.count() === 1, `状态未唯一渲染：${state.id}`);
    assert(await page.locator(`[data-phone-state-id='${state.id}']`).count() === 1, `状态缺少手机稿：${state.id}`);
  }

  assert(await page.locator(".bottom-nav").count() === 0, "settingsboard 不应出现底部 Tab");

  const homeBound = page.locator("[data-phone-state-id='st02_mine_home_bound']");
  const homeText = await homeBound.innerText();
  for (const required of ["我的", "账号", "另一半", "反馈", "更多"]) {
    assert(homeText.includes(required), `我的首页缺少入口：${required}`);
  }

  const relationshipText = await page.locator("[data-phone-state-id='st09_relationship_bound']").innerText();
  assert(relationshipText.includes("解除关系"), "另一半详情缺少解除关系入口");

  const feedbackText = await page.locator("[data-phone-state-id='st14_feedback_form']").innerText();
  assert(feedbackText.includes("问题或建议"), "反馈页缺少问题或建议输入");
  assert(feedbackText.includes("提交反馈"), "反馈页缺少提交反馈按钮");

  const moreText = await page.locator("[data-phone-state-id='st17_more_settings']").innerText();
  for (const required of ["通知", "安全", "关于桃桃", "删除账号"]) {
    assert(moreText.includes(required), `更多页缺少入口：${required}`);
  }

  await assertNoPhoneCopy(page, [
    "可见范围",
    "桃桃记住",
    "小窝",
    "上传照片",
    "生成形象",
    "会员",
    "状态机",
    "API",
    "开发",
    "工单",
    "ticket",
    "日志上传",
    "客服系统",
    "暂未开放",
    "敬请期待",
  ]);

  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto(settingsURL, { waitUntil: "networkidle" });
  const hasBodyOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  assert(!hasBodyOverflow, "390px 下页面出现横向溢出");

  await browser.close();
  console.log(JSON.stringify({
    baseURL,
    version: v8SettingsBoardVersion,
    flows: settingsBoardFlows.length,
    states: settingsBoardStates.length,
    status: "passed",
  }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
