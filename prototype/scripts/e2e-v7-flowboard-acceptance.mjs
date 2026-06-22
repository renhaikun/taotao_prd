import { chromium } from "playwright";
import {
  getV7FlowboardStats,
  v7FlowboardLanes,
  v7FlowboardVersion,
  v7IntentRules,
} from "../src/data/v7FlowboardData.js";

const baseURL = process.env.TAOTAO_BASE_URL ?? "http://127.0.0.1:5175";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function runFlowboardAcceptance(browser) {
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 1,
  });

  await page.goto(baseURL, { waitUntil: "networkidle" });
  assert(await page.getByTestId("app-shell").getAttribute("data-prototype-version") === "v6", "Default app should remain V6");
  assert(await page.getByTestId("v7-flowboard").count() === 0, "Default app should not show the V7 flowboard");

  await page.goto(`${baseURL}?mode=review`, { waitUntil: "networkidle" });
  assert(await page.getByTestId("app-shell").getAttribute("data-prototype-version") === "v6", "Review mode should remain V6");
  assert(await page.getByTestId("v6-state-matrix").isVisible(), "V6 review matrix should remain available");

  await page.goto(`${baseURL}?surface=mini&invite=taotao-demo&mode=flowboard`, { waitUntil: "networkidle" });
  assert(await page.getByTestId("app-shell").getAttribute("data-surface") === "mini", "Mini surface should override flowboard mode");

  await page.goto(`${baseURL}?mode=flowboard`, { waitUntil: "networkidle" });
  assert(await page.getByTestId("app-shell").getAttribute("data-prototype-version") === "v7.1", "Flowboard should expose version v7.1");
  assert(await page.getByTestId("app-shell").getAttribute("data-surface") === "flowboard", "Flowboard should expose flowboard surface");
  assert(await page.getByTestId("v7-flowboard-overview").isVisible(), "Flowboard overview should be visible");
  assert(await page.getByTestId("v7-intent-rules").isVisible(), "AI intent rules should be visible");
  assert((await page.getByTestId("v7-flowboard-overview").innerText()).includes(v7FlowboardVersion), "Flowboard should show V7.1 in the overview");

  const stats = getV7FlowboardStats();
  const cards = page.getByTestId("flow-state-card");
  assert(await cards.count() === stats.stateCount, "Every V7 state should render as a flow state card");
  assert(stats.laneCount >= 14, "V7.1 should cover full production-review lanes");
  assert(stats.stateCount >= 75, "V7.1 should expose enough states for production review");
  assert(stats.unstructuredCount >= 12, "V7.1 should prove companion chat has many non-card states");

  const requiredLaneIds = [
    "auth_first",
    "wake_taotao",
    "invite_bind",
    "triad_start",
    "daily_companion",
    "intent_router",
    "say_better",
    "choice_flow",
    "proposal_flow",
    "reminder_flow",
    "memory_nest",
    "settings_life",
    "error_edge",
    "dev_handoff",
  ];
  for (const laneId of requiredLaneIds) {
    assert(v7FlowboardLanes.some((lane) => lane.id === laneId), `Missing required V7.1 lane: ${laneId}`);
  }

  const allStateIds = v7FlowboardLanes.flatMap((lane) => lane.states.map((state) => state.id));
  assert(v7FlowboardLanes[0].id === "auth_first", "Auth must be the first V7.1 lane");
  assert(!allStateIds.includes("a0_guest_chat"), "V7.1 must remove guest chat before auth");
  assert(allStateIds.includes("a0_app_entry"), "V7.1 must start from login/app entry");

  for (const lane of v7FlowboardLanes) {
    const laneLocator = page.getByTestId(`flow-lane-${lane.id}`);
    assert(await laneLocator.isVisible(), `Lane ${lane.id} should be visible`);
    assert(lane.states.length >= 2, `Lane ${lane.id} should contain multiple states`);
  }

  for (const rule of v7IntentRules) {
    assert(await page.getByTestId(`intent-rule-${rule.id}`).isVisible(), `Intent rule ${rule.id} should be visible`);
  }

  const renderedStateAudit = await page.locator("[data-testid='flow-state-card']").evaluateAll((nodes) => nodes.map((node) => ({
    stateId: node.getAttribute("data-state-id"),
    laneId: node.getAttribute("data-lane-id"),
    actor: node.getAttribute("data-actor"),
    intent: node.getAttribute("data-intent"),
    structure: node.getAttribute("data-structured"),
    priority: node.getAttribute("data-priority"),
    owner: node.getAttribute("data-owner"),
    phase: node.getAttribute("data-release-phase"),
    apiContract: node.getAttribute("data-api-contract"),
    analyticsKey: node.getAttribute("data-analytics-key"),
    hasPhone: !!node.querySelector("[data-testid='flow-phone-preview']"),
    hasHandoff: !!node.querySelector("[data-testid='flow-handoff-panel']"),
    hasNext: node.innerText.includes("下一步"),
    hasReview: !!node.querySelector("[data-testid='flow-state-review']"),
    reviewSlotCount: node.querySelectorAll("[data-testid^='review-']").length,
    devNoteCount: node.querySelectorAll(".flow-dev-notes li").length,
  })));

  const broken = renderedStateAudit.filter((state) => (!(state.hasPhone || state.hasHandoff)) || !state.hasNext || !state.hasReview || state.reviewSlotCount !== 4 || state.devNoteCount === 0);
  assert(broken.length === 0, `Every state card needs preview/handoff, 4 review slots, next step, and dev notes: ${JSON.stringify(broken.slice(0, 5))}`);
  const missingScheduleFields = renderedStateAudit.filter((state) => !state.priority || !state.owner || !state.phase || !state.apiContract || !state.analyticsKey);
  assert(missingScheduleFields.length === 0, `Every state needs schedulable fields: ${JSON.stringify(missingScheduleFields.slice(0, 5))}`);
  assert(renderedStateAudit.some((state) => state.intent === "companion_chat" && state.structure === "none"), "Flowboard must include pure companion chat states");
  assert(renderedStateAudit.some((state) => state.intent === "proposal_event" && state.structure === "event"), "Flowboard must still include real event states");
  assert(renderedStateAudit.some((state) => state.intent === "safety_handoff"), "Flowboard must include safety states");
  assert(renderedStateAudit.some((state) => state.laneId === "auth_first" && state.structure === "blocking"), "Flowboard must enforce login before app use");
  assert(renderedStateAudit.some((state) => state.laneId === "daily_companion" && state.structure === "none"), "Flowboard must include daily companion states without cards");
  assert(renderedStateAudit.some((state) => state.laneId === "error_edge" && state.structure === "error"), "Flowboard must include recoverable error states");
  assert(renderedStateAudit.filter((state) => state.laneId === "dev_handoff" && state.hasHandoff).length >= 3, "Dev handoff should use internal handoff panels, not phone previews");

  const appEntry = page.locator("[data-state-id='a0_app_entry']");
  assert(await appEntry.locator("[data-testid='flow-phone-composer']").count() === 0, "App entry must not expose chat composer before login");
  assert((await appEntry.innerText()).includes("手机号登录") && (await appEntry.innerText()).includes("微信登录"), "App entry must expose login actions");

  const mustStayUnstructured = ["d2_first_banter", "d3_taotao_silent", "e0_low_battery", "e1_inside_joke", "e2_photo_share", "e3_only_listen", "e4_goodnight", "e5_called_taotao", "e6_partner_care", "f0_default_reply", "f6_ambiguous_no_card", "f8_cancel_structure_back_to_chat"];
  for (const stateId of mustStayUnstructured) {
    const matched = renderedStateAudit.find((state) => state.stateId === stateId);
    assert(matched, `Missing required non-card companion state: ${stateId}`);
    assert(matched.structure === "none", `${stateId} must stay structure=none`);
  }

  for (const laneId of ["proposal_flow", "invite_bind", "memory_nest"]) {
    const laneStates = renderedStateAudit.filter((state) => state.laneId === laneId);
    assert(laneStates.some((state) => state.actor.includes("小雨")), `${laneId} needs initiator view`);
    assert(laneStates.some((state) => state.actor.includes("阿川")), `${laneId} needs receiver view`);
    assert(laneStates.some((state) => state.actor.includes("双方")), `${laneId} needs shared result view`);
  }

  const flowboardText = await page.locator("[data-testid='v7-flowboard']").innerText();
  for (const banned of ["先聊一句", "AI 心灵信号", "今日行动", "房间"]) {
    assert(!flowboardText.includes(banned), `Flowboard must not contain banned product wording: ${banned}`);
  }

  const userPhoneCopy = await page.locator("[data-testid='flow-state-card']:not([data-lane-id='dev_handoff']) [data-testid='flow-phone-preview']").evaluateAll((nodes) => nodes.map((node) => node.innerText).join("\n"));
  for (const banned of ["intent=", "event.status", "structuredCard", "data-", "不生成卡片", "生成事件草稿", "工具机器人", "机器人", "AI助手", "功能列表", "任务机", "每句建卡", "自动建卡"]) {
    assert(!userPhoneCopy.includes(banned), `Phone previews must not expose internal copy: ${banned}`);
  }

  const authFirstText = await page.getByTestId("flow-lane-auth_first").innerText();
  assert(authFirstText.includes("手机号登录"), "Auth lane must expose phone login");
  assert(authFirstText.includes("微信登录"), "Auth lane must expose WeChat login");

  await page.close();
  return "v7.1-flowboard-acceptance";
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const passed = [await runFlowboardAcceptance(browser)];
  await browser.close();
  console.log(JSON.stringify({ baseURL, passed }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
