import { chromium } from "playwright";
import {
  chatCoverageLayers,
  chatDisplayStates,
  chatProductionFlows,
  getV72ChatBoardStats,
  topCapsulePriorityRules,
  v72ChatBoardVersion,
} from "../src/data/v72ChatBoardData.js";

const baseURL = process.env.TAOTAO_BASE_URL ?? "http://127.0.0.1:5175";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function sameList(actual, expected) {
  return actual.length === expected.length && actual.every((item, index) => item === expected[index]);
}

function withQuery(query) {
  return `${baseURL}${baseURL.includes("?") ? "&" : "?"}${query}`;
}

async function runChatboardAcceptance(browser) {
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 1,
  });

  await page.goto(baseURL, { waitUntil: "networkidle" });
  assert(await page.getByTestId("app-shell").getAttribute("data-prototype-version") === "v6", "Default app should remain V6");
  assert(await page.getByTestId("v72-chatboard").count() === 0, "Default app should not show V7.8 chatboard");

  await page.goto(withQuery("mode=review"), { waitUntil: "networkidle" });
  assert(await page.getByTestId("app-shell").getAttribute("data-prototype-version") === "v6", "Review mode should remain V6");
  assert(await page.getByTestId("v6-state-matrix").isVisible(), "V6 review matrix should remain available");

  await page.goto(withQuery("mode=flowboard"), { waitUntil: "networkidle" });
  assert(await page.getByTestId("app-shell").getAttribute("data-prototype-version") === "v7.1", "Flowboard should remain V7.1");

  await page.goto(withQuery("surface=mini&invite=taotao-demo&mode=chatboard"), { waitUntil: "networkidle" });
  assert(await page.getByTestId("app-shell").getAttribute("data-surface") === "mini", "Mini surface should override chatboard mode");

  await page.goto(withQuery("mode=chatboard"), { waitUntil: "networkidle" });
  assert(await page.getByTestId("app-shell").getAttribute("data-prototype-version") === "v7.8", "Chatboard should expose version v7.8");
  assert(await page.getByTestId("app-shell").getAttribute("data-surface") === "chatboard", "Chatboard should expose chatboard surface");
  assert(await page.getByTestId("v72-chatboard-overview").isVisible(), "Chatboard overview should be visible");
  assert(await page.getByTestId("v72-chatboard-layout-rules").isVisible(), "Chatboard layout rules should be visible");
  assert(await page.getByTestId("v8-production-contracts").isVisible(), "V8 production contracts should be visible");
  assert((await page.getByTestId("v72-chatboard-overview").innerText()).includes(v72ChatBoardVersion), "Overview should show V7.8");

  const productionFlowCards = page.getByTestId("production-flow-contract");
  assert(await productionFlowCards.count() === chatProductionFlows.length, "Every V8 production flow contract should render");
  assert(await page.getByTestId("top-capsule-priority").isVisible(), "Top capsule priority should render");
  const renderedPriorityRanks = await page.locator("[data-priority-rank]").evaluateAll((nodes) => nodes.map((node) => Number(node.getAttribute("data-priority-rank"))));
  assert(renderedPriorityRanks.join(",") === topCapsulePriorityRules.map((rule) => rule.rank).join(","), "Top capsule priority should render in rank order");

  const coverageLayers = page.getByTestId("coverage-layer");
  assert(await page.getByTestId("v78-coverage-matrix").isVisible(), "V7.8 coverage matrix should be visible");
  assert(await coverageLayers.count() === chatCoverageLayers.length, "Every V7.8 coverage layer should render");
  assert(chatCoverageLayers.length === 7, "V7.8 should map the seven review layers");
  const knownStateIds = new Set(chatDisplayStates.map((state) => state.id));
  const knownFlowIds = new Set(chatProductionFlows.map((flow) => flow.id));
  const sendFailureStateIds = [
    "s0e_message_failed_retry",
    "s3p_private_to_group_send_failed",
    "s3s_petition_send_failed",
    "s6i_petition_revision_return_failed",
    "s11_error_recovery",
  ];
  assert(chatProductionFlows.length >= 8, "V8 should define complete production flow contracts");
  for (const flow of chatProductionFlows) {
    assert(flow.id && flow.title && flow.summary && flow.trigger && flow.surface && flow.visibility && flow.recovery && flow.mustNot, `Flow contract is incomplete: ${flow.id}`);
    assert(["P0", "P1", "P2"].includes(flow.priority), `Flow contract priority should be normalized: ${flow.id}`);
    assert(flow.stateIds.length >= 2, `Flow contract needs mapped states: ${flow.id}`);
    assert(flow.steps.length >= 2, `Flow contract needs journey steps: ${flow.id}`);
    for (const stateId of flow.stateIds) {
      assert(knownStateIds.has(stateId), `Flow contract ${flow.id} references missing state: ${stateId}`);
    }
    for (const step of flow.steps) {
      assert(step.id && step.title && step.surface, `Flow step is incomplete in ${flow.id}`);
      for (const stateId of step.stateIds) {
        assert(knownStateIds.has(stateId), `Flow step ${flow.id}/${step.id} references missing state: ${stateId}`);
      }
    }
  }
  for (const rule of topCapsulePriorityRules) {
    assert(rule.rank && rule.id && rule.title && rule.condition && rule.tone, `Capsule priority rule is incomplete: ${rule.id}`);
    for (const stateId of rule.stateIds) {
      assert(knownStateIds.has(stateId), `Capsule priority rule ${rule.id} references missing state: ${stateId}`);
    }
  }
  const topCapsuleSendFailureLeaks = topCapsulePriorityRules.filter((rule) =>
    rule.stateIds.some((stateId) => sendFailureStateIds.includes(stateId))
  );
  assert(topCapsuleSendFailureLeaks.length === 0, `Send failures must not enter top capsule priority rules: ${JSON.stringify(topCapsuleSendFailureLeaks)}`);
  for (const state of chatDisplayStates) {
    assert(knownFlowIds.has(state.flowId), `State should belong to a production flow: ${state.id}`);
    assert(state.productionContract?.flowId === state.flowId, `State production contract should use the same flow: ${state.id}`);
    assert(state.productionContract.trigger && state.productionContract.surface && state.productionContract.visibility && state.productionContract.next && state.productionContract.recovery && state.productionContract.sourceAnchor, `State production contract is incomplete: ${state.id}`);
  }
  for (const layer of chatCoverageLayers) {
    assert(layer.stateIds.length >= 4, `Coverage layer needs enough mapped states: ${layer.id}`);
    for (const stateId of layer.stateIds) {
      assert(knownStateIds.has(stateId), `Coverage layer ${layer.id} references missing state: ${stateId}`);
    }
  }

  const stats = getV72ChatBoardStats();
  assert(await page.getByTestId("v8-chatboard-journeys").isVisible(), "V8 journey board should render as the primary stateboard");
  const flowLanes = page.getByTestId("chatboard-flow-lane");
  assert(await flowLanes.count() === chatProductionFlows.length, "Every production flow should render as one journey lane");
  const renderedLaneFlowIds = await flowLanes.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-flow-id")));
  assert(sameList(renderedLaneFlowIds, chatProductionFlows.map((flow) => flow.id)), "Journey lanes should follow production flow order");
  const flowSteps = page.getByTestId("chatboard-flow-step");
  const expectedStepCount = chatProductionFlows.reduce((count, flow) => count + flow.steps.length, 0);
  assert(await flowSteps.count() >= expectedStepCount, "Journey board should expose step strips for each flow");
  const cards = page.getByTestId("chatboard-state");
  assert(await cards.count() === stats.stateCount, "Every V7.8 chat state should render");
  assert(stats.stateCount >= 98, "V7.8 should cover enough production chat-surface states for review after duplicate drawer states are merged");
  const renderedCardStateIds = await cards.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-state-id")));
  const uniqueRenderedCardStateIds = new Set(renderedCardStateIds);
  assert(uniqueRenderedCardStateIds.size === renderedCardStateIds.length, "Each state should render exactly once in the journey board");
  assert(chatDisplayStates.every((state) => uniqueRenderedCardStateIds.has(state.id)), "Journey board should include every chat state");
  const stateSlots = page.getByTestId("chatboard-step-state-slot");
  assert(await stateSlots.count() === stats.stateCount, "Each rendered state should sit inside one flow/step slot");
  const slotStateIds = await stateSlots.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-slot-state-id")));
  assert(new Set(slotStateIds).size === slotStateIds.length, "State slots should not duplicate a state");
  assert(await page.getByTestId("chatboard-unmapped-state").count() === 0, "No state should be left outside the flow journey board");
  assert(stats.preconditionCount >= 5, "V7.8 should cover login, binding, and Taotao creation gates");
  assert(stats.capsuleCount >= 76, "V7.8 should cover capsule recovery states");
  assert(stats.capabilityCount >= 22, "V7.8 should cover message-attached AI capability states");
  assert(stats.overlayCount >= 23, "V7.8 should cover explicit half-sheet states");

  const requiredStateIds = [
    "p0_auth_required",
    "p0a_auth_code_sent",
    "p0b_auth_code_failed",
    "p1_partner_not_bound",
    "p1a_partner_invite_sheet",
    "p1b_partner_share_card_ready",
    "p1c_partner_share_waiting",
    "p1d_partner_share_opened_by_partner",
    "p1e_partner_share_accept_success",
    "p1f_partner_phone_search",
    "p1g_partner_phone_prompt_sent",
    "p1h_partner_phone_prompt_received",
    "p1i_partner_phone_accept_success",
    "s0a_first_time_triad_empty",
    "s0b_call_taotao_affordance",
    "s0c_input_focused_keyboard",
    "s0d_message_sending_receipt",
    "s0e_message_failed_retry",
    "s0f_message_recalled",
    "s0g_message_quote_reply",
    "s0j_message_delivered_unread",
    "s0k_message_read_by_partner",
    "s0m_partner_typing",
    "s0p_long_press_own_sent_menu",
    "s0q_long_press_taotao_message_menu",
    "s0h_chat_attachment_panel",
    "s0i_message_media_voice_emoji",
    "s0_default_chat",
    "s1_taotao_light_suggestion",
    "s2_user_requests_expand",
    "s2d_group_organize_visible",
    "s2f_group_recipe_result_card",
    "s2g_group_recipe_detail_edit",
    "s2h_recipe_revision_generating",
    "s2i_recipe_revision_ready",
    "s2r_recipe_revision_failed_inline",
    "s2e_group_to_shared_choice",
    "s2a_taotao_quiet",
    "s2b_emotion_hold",
    "s2c_ambiguous_intent",
    "s2j_at_taotao_public_call",
    "s3_private_compose_entry",
    "s3f_private_generating",
    "s3n_private_card_ready_to_send",
    "s3m_private_to_group_confirm",
    "s3o_private_to_group_sending",
    "s3p_private_to_group_send_failed",
    "s3q_petition_confirm",
    "s3r_petition_sending",
    "s3s_petition_send_failed",
    "s3j_private_generation_failed",
    "s3g_private_preview_before_send",
    "s3d_private_exit_unsaved",
    "s4_private_sent_to_group",
    "s4a_no_approval_direct_capsule",
    "s4a_saved_item_detail",
    "s4d_sender_sent_unseen",
    "s4h_sender_after_send_actions",
    "s4e_sender_seen_no_decision",
    "s4f_receiver_later",
    "s4g_receiver_decline_soft",
    "s4b_approval_card_for_partner",
    "s4c_card_read_collapsed",
    "s5_receiver_pending",
    "s5a_receiver_first_open_from_chat",
    "s6y_revision_in_today_drawer",
    "s6_receiver_opens_capsule",
    "s6d_today_things_drawer_empty",
    "s6c_drawer_item_returns_source",
    "s6b_detail_editing",
    "s6e_petition_revision_generating",
    "s6g_petition_revision_failed",
    "s6f_petition_revision_preview",
    "s6h_petition_revision_returning",
    "s6i_petition_revision_return_failed",
    "s7a_partner_edit_sends_back",
    "s7_partner_counter",
    "s7c_initiator_reedit_revision",
    "s7d_initiator_revision_generating",
    "s7e_initiator_revision_preview",
    "s7f_initiator_revision_returns",
    "s7g_partner_reviews_v3",
    "s7b_initiator_rejects_revision",
    "s7h_initiator_closes_petition",
    "s8_settled_light",
    "s8a_settled_fade_out",
    "s9_completed_memory_hint",
    "s9a_memory_pending",
    "s9b_memory_partner_edit_or_reject",
    "s10_multiple_contexts",
    "s11_error_recovery",
    "s11e_misfire_pending_with_cancel",
    "s11a_misfire_cancel_structure",
    "s11b_duplicate_send_merged",
    "s11c_partner_long_unread",
    "s11d_generation_wrong_feedback",
    "s11h_wrong_feedback_updating_inline",
    "s12_reminder_permission",
    "s12a_permission_sheet",
    "s13_safety_boundary",
  ];
  for (const stateId of requiredStateIds) {
    assert(chatDisplayStates.some((state) => state.id === stateId), `Missing required chatboard state: ${stateId}`);
  }
  const removedStateIds = [
    "s3l_private_visibility_banner",
    "s3b_private_draft_saved",
    "s3k_partner_view_no_private_draft",
    "s3e_private_draft_list",
    "s3c_resume_private_draft",
    "s6x_single_capsule_opens_drawer",
    "s3j_private_generation_failed_saved",
  ];
  for (const stateId of removedStateIds) {
    assert(!chatDisplayStates.some((state) => state.id === stateId), `Removed duplicate/confusing state should not return: ${stateId}`);
  }

  const renderedAudit = await cards.evaluateAll((nodes) => nodes.map((node) => ({
    stateId: node.getAttribute("data-state-id"),
    chatMode: node.getAttribute("data-chat-mode"),
    phoneKind: node.getAttribute("data-phone-kind"),
    viewerRole: node.getAttribute("data-viewer-role"),
    visibility: node.getAttribute("data-visibility"),
    intent: node.getAttribute("data-intent"),
    structured: node.getAttribute("data-structured"),
    capsule: node.getAttribute("data-capsule"),
    overlay: node.getAttribute("data-overlay"),
    cardCount: Number(node.getAttribute("data-card-count")),
    messageCapabilityCount: Number(node.getAttribute("data-capability-count")),
    messageCapabilityStatuses: Array.from(node.querySelectorAll("[data-testid='chat-message-capability']")).map((el) => el.getAttribute("data-capability-status")),
    messageCapabilityIds: Array.from(node.querySelectorAll("[data-testid='chat-message-capability']")).map((el) => el.getAttribute("data-capability-id")),
    messageCapabilitySourceMessageIds: Array.from(node.querySelectorAll("[data-testid='chat-message-capability']")).map((el) => el.getAttribute("data-source-message-id")),
    messageCapabilityActions: Array.from(node.querySelectorAll("[data-testid='chat-message-capability']")).map((el) => el.getAttribute("data-capability-action")),
    messageCapabilityActors: Array.from(node.querySelectorAll("[data-testid='chat-message-capability']")).map((el) => el.getAttribute("data-capability-actor")),
    messageCapabilityTexts: Array.from(node.querySelectorAll("[data-testid='chat-message-capability']")).map((el) => el.textContent?.trim() ?? ""),
    taotaoTexts: Array.from(node.querySelectorAll("[data-speaker='taotao'] p")).map((el) => el.textContent?.trim() ?? ""),
    orphanCapabilityCount: node.querySelectorAll("[data-testid='chat-message-capability']").length - node.querySelectorAll("[data-speaker='taotao'] [data-testid='chat-message-capability']").length,
    messageStatusTexts: Array.from(node.querySelectorAll(".chat-message-status")).map((el) => el.textContent?.trim() ?? ""),
    messageRetryCount: node.querySelectorAll("[data-testid='chat-message-retry']").length,
    bubbleSpeakerLabelCount: node.querySelectorAll("[data-testid='chat-message'] .chat-bubble-stack > p > em").length,
    messageReceiptTexts: Array.from(node.querySelectorAll("[data-testid='chat-message-receipt']")).map((el) => el.textContent?.trim() ?? ""),
    typingCount: node.querySelectorAll("[data-testid='chat-typing']").length,
    systemMessageCount: node.querySelectorAll("[data-speaker='system']").length,
    quoteCount: node.querySelectorAll(".chat-message-quote").length,
    attachmentCount: node.querySelectorAll("[data-testid='chat-message-attachment']").length,
    messageMenuCount: node.querySelectorAll("[data-testid='chat-message-menu']").length,
    inputPanelCount: node.querySelectorAll("[data-testid='chat-input-panel']").length,
    reactionCount: node.querySelectorAll(".chat-message-reaction").length,
    dockCount: Number(node.getAttribute("data-dock-count")),
    capsuleTone: node.querySelector("[data-testid='chat-event-dock']")?.getAttribute("data-capsule-tone") ?? "",
    capsuleText: node.querySelector("[data-testid='chat-event-dock']")?.textContent?.trim() ?? "",
    actionCount: Number(node.getAttribute("data-context-action-count")),
    overlayActions: Array.from(node.querySelectorAll("[data-testid='chat-detail-sheet'] .chat-overlay-actions button")).map((el) => el.textContent?.trim() ?? ""),
    sheetCloseCount: node.querySelectorAll("[data-testid='chat-sheet-close']").length,
    sheetCloseActions: Array.from(node.querySelectorAll("[data-testid='chat-sheet-close']")).map((el) => el.getAttribute("data-close-action")),
    priority: node.getAttribute("data-priority"),
    owner: node.getAttribute("data-owner"),
    flowId: node.getAttribute("data-flow-id"),
    contractSurface: node.getAttribute("data-contract-surface"),
    sourceAnchor: node.getAttribute("data-source-anchor"),
    objectType: node.getAttribute("data-object-type"),
    lifecycleStatus: node.getAttribute("data-lifecycle-status"),
    visibilityScope: node.getAttribute("data-visibility-scope"),
    participantStatus: node.getAttribute("data-participant-status"),
    apiContract: node.getAttribute("data-api-contract"),
    analyticsKey: node.getAttribute("data-analytics-key"),
    hasPhone: !!node.querySelector("[data-testid='chatboard-phone-preview']"),
    hasHeader: !!node.querySelector("[data-testid='chat-main-header']"),
    hasMessages: !!node.querySelector("[data-testid='chat-message-list']"),
    messageCount: node.querySelectorAll("[data-testid='chat-message']").length,
    taotaoMessageCount: node.querySelectorAll("[data-speaker='taotao']").length,
    taotaoAvatarCount: node.querySelectorAll("[data-testid='taotao-message-avatar']").length,
    hasComposer: !!node.querySelector("[data-testid='chat-composer']"),
    composerText: node.querySelector("[data-testid='chat-composer']")?.textContent?.trim() ?? "",
    hasGate: !!node.querySelector("[data-testid='chat-precondition-gate']"),
    gateVariant: node.querySelector("[data-testid='chat-precondition-gate']")?.getAttribute("data-gate-variant") ?? "",
    gateCodeCellCount: node.querySelectorAll("[data-testid='chat-gate-code'] i").length,
    gateCodeCellRects: Array.from(node.querySelectorAll("[data-testid='chat-gate-code'] i")).map((el) => {
      const rect = el.getBoundingClientRect();
      return { width: Math.round(rect.width), height: Math.round(rect.height) };
    }),
    gateNoticeText: node.querySelector("[data-testid='chat-gate-notice']")?.textContent?.trim() ?? "",
    gateStatusText: node.querySelector("[data-testid='chat-gate-status']")?.textContent?.trim() ?? "",
    hasOverlay: !!node.querySelector("[data-testid='chat-detail-sheet']"),
    sheetMode: node.querySelector("[data-testid='chat-detail-sheet']")?.getAttribute("data-sheet-mode") ?? "",
    sheetEditingState: node.querySelector("[data-testid='chat-detail-sheet']")?.getAttribute("data-editing-state") ?? "",
    overlayOpenedBy: node.querySelector("[data-testid='chat-detail-sheet']")?.getAttribute("data-opened-by") ?? "",
    overlaySourceCapabilityId: node.querySelector("[data-testid='chat-detail-sheet']")?.getAttribute("data-source-capability-id") ?? "",
    overlaySourceMessageId: node.querySelector("[data-testid='chat-detail-sheet']")?.getAttribute("data-source-message-id") ?? "",
    overlayActionStyle: node.querySelector("[data-testid='chat-detail-sheet'] .chat-overlay-actions")?.getAttribute("data-action-style") ?? "",
    hasSheetSuggestions: !!node.querySelector("[data-testid='chat-sheet-suggestions']"),
    hasPrivateThread: !!node.querySelector("[data-testid='chat-sheet-private-thread']"),
    privateThreadAvatarCount: node.querySelectorAll("[data-testid='chat-sheet-private-avatar']").length,
    hasEditComposer: !!node.querySelector("[data-testid='chat-sheet-edit-composer']"),
    hasEditInput: !!node.querySelector("[data-testid='chat-sheet-edit-input']"),
    editInputTag: node.querySelector("[data-testid='chat-sheet-edit-input']")?.tagName.toLowerCase() ?? "",
    hasResultPreview: !!node.querySelector("[data-testid='chat-sheet-result-preview']"),
    versionBoardCount: node.querySelectorAll("[data-testid='chat-sheet-version-board'] .chat-overlay-version").length,
    quickEditCount: node.querySelectorAll("[data-testid='chat-sheet-quick-edits'] button").length,
    drawerItemCount: node.querySelectorAll("[data-testid='chat-drawer-item']").length,
    drawerItemStatuses: Array.from(node.querySelectorAll("[data-testid='chat-drawer-item']")).map((el) => el.getAttribute("data-drawer-status")),
    drawerFilterCount: node.querySelectorAll("[data-testid='chat-drawer-filters'] [data-drawer-filter]").length,
    drawerFilters: Array.from(node.querySelectorAll("[data-testid='chat-drawer-filters'] [data-drawer-filter]")).map((el) => el.textContent?.trim() ?? ""),
    hasDock: !!node.querySelector("[data-testid='chat-event-dock']"),
    hasCapsuleAdd: !!node.querySelector("[data-testid='chat-capsule-add']"),
    hasApprovalCard: !!node.querySelector("[data-testid='chat-approval-card']"),
    cardKind: node.querySelector("[data-testid='chat-approval-card']")?.getAttribute("data-card-kind") ?? "",
    reviewSlotCount: node.querySelectorAll("[data-testid^='review-']").length,
    productionContractCount: node.querySelectorAll("[data-testid='state-production-contract']").length,
    productionActionIds: Array.from(node.querySelectorAll(".chat-contract-actions span")).map((el) => el.getAttribute("data-action-id")),
    phoneRelation: node.querySelector("[data-testid='chatboard-phone-preview']")?.getAttribute("data-relation") ?? "",
    relationAvatarCount: node.querySelectorAll("[data-testid='chat-relation-avatars']").length,
    phoneText: node.querySelector("[data-testid='chatboard-phone-preview']")?.innerText ?? "",
    phoneDomText: node.querySelector("[data-testid='chatboard-phone-preview']")?.textContent ?? "",
  })));

  const messageOptionalStateIds = new Set(["s3d_private_exit_unsaved", "s4a_no_approval_direct_capsule", "s4a_saved_item_detail", "s6_receiver_opens_capsule"]);
  const brokenBase = renderedAudit.filter((state) => {
    if (!state.hasPhone || !state.hasHeader || state.reviewSlotCount !== 6 || state.productionContractCount !== 1) return true;
    if (state.phoneKind === "gate") {
      return !state.hasGate || state.hasMessages || state.messageCount !== 0 || state.hasComposer || state.dockCount !== 0 || state.hasCapsuleAdd;
    }
    if (messageOptionalStateIds.has(state.stateId)) {
      return !state.hasMessages || !state.hasComposer || state.hasGate;
    }
    return !state.hasMessages || state.messageCount === 0 || !state.hasComposer || state.hasGate;
  });
  assert(brokenBase.length === 0, `Every state needs a valid phone preview shape and six review slots: ${JSON.stringify(brokenBase.slice(0, 5))}`);

  const missingSchedulableFields = renderedAudit.filter((state) => !state.priority || !state.owner || !state.objectType || !state.lifecycleStatus || !state.visibilityScope || !state.participantStatus || !state.apiContract || !state.analyticsKey);
  assert(missingSchedulableFields.length === 0, `Every state needs production handoff fields: ${JSON.stringify(missingSchedulableFields.slice(0, 5))}`);
  const allowedPriorities = new Set(["P0", "P1", "P2"]);
  const allowedVisibilityScopes = new Set(["group_visible", "private_owner_only", "private_owner_only_until_sent", "partner_visible_unhandled", "shared_editable", "shared_readonly"]);
  const allowedLifecycleStatuses = new Set(["auth_required", "auth_code_sent", "auth_code_failed", "partner_not_bound", "invite_pending", "source_missing", "sent", "sending", "failed", "generating", "previewing", "private_saved", "private_editing", "pending_partner", "pending_partner_ack", "pending_initiator_ack", "viewed", "visible", "delivered", "recalled", "rejected", "revision_rejected", "index_open", "archived", "settled"]);
  const allowedParticipantStatuses = new Set(["visible", "not_visible", "visible_unread", "pending_my_confirm", "viewed", "deferred", "rejected", "countered", "counter_rejected", "closed", "approved", "accepted"]);
  const invalidEnums = renderedAudit.filter((state) => (
    !allowedPriorities.has(state.priority) ||
    !allowedVisibilityScopes.has(state.visibilityScope) ||
    !allowedLifecycleStatuses.has(state.lifecycleStatus) ||
    !allowedParticipantStatuses.has(state.participantStatus) ||
    !knownFlowIds.has(state.flowId) ||
    !state.contractSurface ||
    !state.sourceAnchor
  ));
  assert(invalidEnums.length === 0, `Production contract enums should be normalized: ${JSON.stringify(invalidEnums.slice(0, 5))}`);
  const bubbleSpeakerLabelLeaks = renderedAudit.filter((state) => state.bubbleSpeakerLabelCount !== 0);
  assert(bubbleSpeakerLabelLeaks.length === 0, `Chat bubbles should not render speaker-name labels inside the bubble: ${JSON.stringify(bubbleSpeakerLabelLeaks.slice(0, 5))}`);
  const triadHeaderLeaks = renderedAudit.filter((state) => state.phoneRelation === "小雨 · 阿川 · 桃桃" && state.relationAvatarCount !== 1);
  assert(triadHeaderLeaks.length === 0, `Triad chat headers should render an avatar group instead of relation text: ${JSON.stringify(triadHeaderLeaks.slice(0, 5))}`);
  const composerCopyLeaks = renderedAudit.filter((state) => state.hasComposer && state.composerText.length !== 0);
  assert(composerCopyLeaks.length === 0, `Chat composer should not render default placeholder copy: ${JSON.stringify(composerCopyLeaks.slice(0, 5))}`);
  assert(new Set(renderedAudit.map((state) => state.apiContract)).size === renderedAudit.length, "API contracts should be unique per state");
  assert(new Set(renderedAudit.map((state) => state.analyticsKey)).size === renderedAudit.length, "Analytics keys should be unique per state");
  assert(renderedAudit.every((state) => state.analyticsKey.startsWith("taotao_v78_")), "Analytics keys should use V7.8 namespace");

  const taotaoWithoutAvatar = renderedAudit.filter((state) => state.taotaoMessageCount !== state.taotaoAvatarCount);
  assert(taotaoWithoutAvatar.length === 0, `Every Taotao message must use Taotao avatar: ${JSON.stringify(taotaoWithoutAvatar.slice(0, 5))}`);

  const visibleCards = renderedAudit.filter((state) => state.cardCount !== 0);
  assert(visibleCards.length === 0, `V7.8 should not use detached inline cards as the default result surface: ${JSON.stringify(visibleCards.slice(0, 5))}`);

  const capabilityStates = renderedAudit.filter((state) => state.messageCapabilityCount > 0);
  assert(capabilityStates.length >= 18, "V7.8 should render enough message-attached capability capsules");
  const orphanCapabilityStates = capabilityStates.filter((state) => state.orphanCapabilityCount !== 0);
  assert(orphanCapabilityStates.length === 0, `Message capability capsules must live inside Taotao messages: ${JSON.stringify(orphanCapabilityStates.slice(0, 5))}`);
  const allCapabilityStatuses = new Set(capabilityStates.flatMap((state) => state.messageCapabilityStatuses));
  for (const status of ["generating", "ready", "updating", "updated", "failed"]) {
    assert(allCapabilityStatuses.has(status), `V7.8 should include ${status} message capability state`);
  }

  const invalidDock = renderedAudit.filter((state) => {
    if (state.phoneKind === "gate") return state.dockCount !== 0 || state.hasDock || state.hasCapsuleAdd || state.capsule !== "none";
    return state.dockCount !== 1 || !state.hasDock || !state.hasCapsuleAdd;
  });
  assert(invalidDock.length === 0, `Chat states must expose one persistent capsule; gates must not: ${JSON.stringify(invalidDock.slice(0, 5))}`);

  const invalidOverlay = renderedAudit.filter((state) => {
    if (state.overlay === "active") {
      const nonInteractiveSendingState = state.lifecycleStatus === "sending" && state.hasResultPreview;
      return !state.hasOverlay || (!state.hasEditComposer && state.actionCount === 0 && !nonInteractiveSendingState) || !["message-capability", "top-capsule", "drawer-item", "explicit-private-entry", "approval-action", "safety-boundary", "message-long-press"].includes(state.overlayOpenedBy);
    }
    return state.hasOverlay || state.actionCount !== 0;
  });
  assert(invalidOverlay.length === 0, `Half-sheet states must only appear on active overlays: ${JSON.stringify(invalidOverlay.slice(0, 5))}`);

  assert(renderedAudit.some((state) => state.chatMode === "pure-chat" && state.structured === "none"), "Chatboard needs pure chat states");
  assert(renderedAudit.some((state) => state.chatMode === "pre-chat" && state.phoneKind === "gate"), "Chatboard needs pre-chat gate states");
  assert(renderedAudit.some((state) => state.chatMode === "shared-context" && state.capsule === "active"), "Chatboard needs shared context capsule states");
  assert(renderedAudit.some((state) => state.chatMode === "private-compose" && state.visibility === "private"), "Chatboard needs explicit private compose states");
  assert(renderedAudit.some((state) => state.intent === "receiver_pending" && state.viewerRole === "receiver"), "Chatboard needs receiver pending view");
  assert(renderedAudit.some((state) => state.intent === "multi_context" && state.capsule === "summary"), "Chatboard needs multi-context recovery");
  assert(renderedAudit.some((state) => state.intent === "safety_boundary" && state.overlay === "active"), "Chatboard needs safety boundary state");

  const sendingMessage = renderedAudit.find((state) => state.stateId === "s0d_message_sending_receipt");
  assert(sendingMessage?.messageStatusTexts.includes("发送中") && sendingMessage.capsule === "idle", "Plain chat sending should be a message-level state");

  const failedMessage = renderedAudit.find((state) => state.stateId === "s0e_message_failed_retry");
  assert(failedMessage?.messageRetryCount === 1 && failedMessage.messageStatusTexts.length === 0 && failedMessage.capsule === "idle", "Plain chat failure should use a compact retry icon beside the failed bubble without occupying the top capsule");

  for (const stateId of sendFailureStateIds) {
    const failedSendState = renderedAudit.find((state) => state.stateId === stateId);
    assert(failedSendState?.lifecycleStatus === "failed", `${stateId} should remain a failed send state`);
    assert(failedSendState.overlay === "none" && !failedSendState.hasOverlay, `${stateId} must not open a half-sheet on send failure`);
    assert(failedSendState.cardCount === 0 && failedSendState.versionBoardCount === 0 && !failedSendState.hasResultPreview, `${stateId} must not render a heavy card preview after send failure`);
    assert(failedSendState.actionCount === 0 && failedSendState.overlayActions.length === 0, `${stateId} must not use sheet actions for retry`);
    assert(failedSendState.messageRetryCount === 1 && failedSendState.messageStatusTexts.length === 0, `${stateId} should show a compact retry icon on the original message bubble`);
    assert(failedSendState.taotaoMessageCount === 0, `${stateId} must not become a Taotao status broadcast`);
    assert(!/没发|未送达|重试|发送失败|未发出/.test(failedSendState.capsuleText), `${stateId} must not enter the top transaction capsule`);
    if (stateId !== "s0e_message_failed_retry") {
      assert(failedSendState.visibility === "private" && failedSendState.participantStatus === "not_visible", `${stateId} should stay invisible to the partner until send succeeds`);
    }
  }

  const recalledMessage = renderedAudit.find((state) => state.stateId === "s0f_message_recalled");
  assert(recalledMessage?.systemMessageCount === 1 && recalledMessage.taotaoMessageCount === 0 && recalledMessage.phoneText.includes("撤回"), "Recall should render as a light system row without Taotao commentary");

  const quoteReply = renderedAudit.find((state) => state.stateId === "s0g_message_quote_reply");
  assert(quoteReply?.quoteCount === 1 && quoteReply.phoneText.includes("近一点"), "Quote reply should render inside the message flow");

  const deliveredUnread = renderedAudit.find((state) => state.stateId === "s0j_message_delivered_unread");
  assert(deliveredUnread?.messageReceiptTexts.includes("已送达") && deliveredUnread.capsule === "idle", "Delivered unread should remain a plain message receipt");

  const readByPartner = renderedAudit.find((state) => state.stateId === "s0k_message_read_by_partner");
  assert(readByPartner?.messageReceiptTexts.includes("阿川已看") && readByPartner.capsule === "idle" && readByPartner.taotaoMessageCount === 0, "Read receipt should not become a task-like item or Taotao commentary");

  const partnerTyping = renderedAudit.find((state) => state.stateId === "s0m_partner_typing");
  assert(partnerTyping?.typingCount === 1 && partnerTyping.capsule === "idle", "Partner typing should render as a lightweight chat affordance");

  const longPressOwn = renderedAudit.find((state) => state.stateId === "s0p_long_press_own_sent_menu");
  assert(longPressOwn?.messageMenuCount === 1 && longPressOwn.phoneText.includes("引用") && longPressOwn.phoneText.includes("放成小事") && !longPressOwn.phoneText.includes("好好说"), "Long-press own message should expose hidden chat actions without a separate say-better feature");

  const longPressTaotao = renderedAudit.find((state) => state.stateId === "s0q_long_press_taotao_message_menu");
  assert(longPressTaotao?.messageMenuCount === 1 && longPressTaotao.phoneText.includes("引用") && longPressTaotao.phoneText.includes("复制") && longPressTaotao.phoneText.includes("放成小事") && !longPressTaotao.phoneText.includes("换个说法"), "Long-press Taotao message should be a compact native action menu");

  const attachmentPanel = renderedAudit.find((state) => state.stateId === "s0h_chat_attachment_panel");
  assert(attachmentPanel?.inputPanelCount === 1 && attachmentPanel.phoneText.includes("照片") && attachmentPanel.phoneText.includes("找桃桃"), "Plus entry should open a lightweight input panel");

  const mediaVoiceEmoji = renderedAudit.find((state) => state.stateId === "s0i_message_media_voice_emoji");
  assert(mediaVoiceEmoji?.attachmentCount >= 2 && mediaVoiceEmoji.reactionCount === 1, "Media, voice, and reactions should render as chat messages");

  const atTaotao = renderedAudit.find((state) => state.stateId === "s2j_at_taotao_public_call");
  assert(atTaotao?.messageCapabilityCount === 0 && atTaotao.phoneText.includes("@桃桃"), "@Taotao should remain public chat until the user asks for a capability");

  const groupOrganize = renderedAudit.find((state) => state.stateId === "s2d_group_organize_visible");
  assert(groupOrganize?.visibility === "group" && groupOrganize.capsule === "rotating" && groupOrganize.overlay === "none" && groupOrganize.messageCapabilityCount === 1, "Group organize should stay visible in group chat with a Taotao-attached capability capsule");
  assert(groupOrganize.phoneText.includes("桃桃帮我整理一下") && groupOrganize.phoneText.includes("这个总结我认"), "Group organize should show both sides seeing the result");

  const groupChoice = renderedAudit.find((state) => state.stateId === "s2e_group_to_shared_choice");
  assert(groupChoice?.visibility === "group" && groupChoice.capsule === "idle" && groupChoice.messageCapabilityCount === 0 && groupChoice.phoneText.includes("不做成小事"), "Ordinary group choice should remain chat unless users explicitly ask Taotao to create an item");

  const recipeCard = renderedAudit.find((state) => state.stateId === "s2f_group_recipe_result_card");
  assert(recipeCard?.visibility === "group" && recipeCard.cardCount === 0 && recipeCard.messageCapabilityCount === 1, "Group recipe request should render one Taotao-attached result capsule");
  assert(recipeCard.phoneText.includes("番茄炒蛋") && recipeCard.phoneText.includes("看做法"), "Recipe result capsule should be inspectable from group chat");

  const recipeDetail = renderedAudit.find((state) => state.stateId === "s2g_group_recipe_detail_edit");
  assert(
    recipeDetail?.overlay === "active" &&
    recipeDetail.sheetMode === "recipe" &&
    recipeDetail.overlayOpenedBy === "message-capability" &&
    recipeDetail.hasEditComposer &&
    recipeDetail.hasEditInput &&
    recipeDetail.editInputTag === "input" &&
    recipeDetail.hasResultPreview &&
    recipeDetail.quickEditCount >= 3 &&
    recipeDetail.phoneText.includes("少油一点") &&
    !recipeDetail.phoneText.includes("让桃桃改"),
    "Recipe detail should open an editable conversational sheet from a message capability"
  );

  const recipeUpdating = renderedAudit.find((state) => state.stateId === "s2h_recipe_revision_generating");
  assert(recipeUpdating?.overlay === "none" && recipeUpdating.messageCapabilityStatuses.includes("updating") && recipeUpdating.messageCapabilityActors.includes("小雨") && recipeUpdating.cardCount === 0, "Recipe revision should return to the original message as an updating capsule with the editor avatar");

  const recipeUpdated = renderedAudit.find((state) => state.stateId === "s2i_recipe_revision_ready");
  assert(recipeUpdated?.overlay === "none" && recipeUpdated.messageCapabilityStatuses.includes("updated") && recipeUpdated.messageCapabilityActors.includes("小雨") && recipeUpdated.phoneText.includes("少油版"), "Recipe revision should finish as an updated message capsule with the editor avatar");

  const recipeRevisionFailed = renderedAudit.find((state) => state.stateId === "s2r_recipe_revision_failed_inline");
  assert(
    recipeRevisionFailed?.overlay === "none" &&
      recipeRevisionFailed.messageCapabilityStatuses.includes("failed") &&
      recipeRevisionFailed.messageCapabilityActions.includes("重试") &&
      recipeRevisionFailed.messageCapabilityTexts.some((text) => text.includes("重试")) &&
      recipeRevisionFailed.phoneText.includes("改好了，少油版") &&
      recipeRevisionFailed.messageCapabilityActors.includes("小雨") &&
      recipeRevisionFailed.messageCapabilitySourceMessageIds.includes("taotao_recipe_ready") &&
      !recipeRevisionFailed.phoneText.includes("这次没改成") &&
      !recipeRevisionFailed.phoneText.includes("修改没成功") &&
      !recipeRevisionFailed.phoneText.includes("再试一次"),
    "Recipe revision failure should keep the updated Taotao message and turn the existing updated capsule into retry"
  );

  const groupExpand = renderedAudit.find((state) => state.stateId === "s2_user_requests_expand");
  assert(groupExpand?.overlay === "none" && groupExpand.messageCapabilityStatuses.includes("generating") && groupExpand.phoneText.includes("36%"), "Group expand request should start as Taotao bubble plus generating capability, not an automatic sheet");

  const privateCompose = renderedAudit.find((state) => state.stateId === "s3_private_compose_entry");
  assert(privateCompose?.visibility === "private" && privateCompose.overlay === "active" && privateCompose.capsule === "idle", "Private compose should use explicit private half-sheet and no shared capsule state");
  assert(privateCompose.participantStatus === "not_visible" && privateCompose.flowId === "private_create", "Private compose should be private in the production contract");
  assert(privateCompose.phoneText.includes("新建小事") && privateCompose.phoneText.includes("补齐信息") && privateCompose.phoneText.includes("创建") && privateCompose.sheetCloseCount === 1 && !privateCompose.overlayActions.includes("放弃") && !privateCompose.phoneText.includes("整理一下") && !privateCompose.phoneText.includes("想到什么都可以先放下") && !privateCompose.phoneText.includes("好好说"), "Private compose entry should create a concrete small-item card with a natural close control, not a generic organize flow");
  assert(!/给阿川看|只提醒我|一起定|放小窝|保存|发送|上书|发给阿川|请阿川确认/.test(privateCompose.phoneDomText), "Private compose entry must not choose destination before generation");
  assert(privateCompose.hasSheetSuggestions && privateCompose.hasPrivateThread && privateCompose.privateThreadAvatarCount >= 2 && privateCompose.sheetMode === "private-create", "Private compose sheet must include lightweight create chips and an avatar-based Taotao private thread");

  const privateReadyToSend = renderedAudit.find((state) => state.stateId === "s3n_private_card_ready_to_send");
  assert(privateReadyToSend?.visibility === "private" && privateReadyToSend.overlay === "active" && privateReadyToSend.hasResultPreview && privateReadyToSend.overlayActionStyle === "destination" && privateReadyToSend.sheetCloseCount === 1 && !privateReadyToSend.hasEditComposer && privateReadyToSend.phoneText.includes("保存") && privateReadyToSend.phoneText.includes("发送") && privateReadyToSend.phoneText.includes("上书") && !privateReadyToSend.phoneText.includes("放弃") && !privateReadyToSend.phoneText.includes("发给阿川") && !privateReadyToSend.phoneText.includes("请阿川确认") && privateReadyToSend.phoneText.includes("今晚吃饭") && privateReadyToSend.phoneText.includes("时间：") && privateReadyToSend.phoneText.includes("地点：") && privateReadyToSend.phoneText.includes("备注："), "Private generated card should be a concrete item preview without input, then offer save/send/petition destinations plus a natural close control");
  assert(sameList(privateReadyToSend.overlayActions, ["保存", "发送", "上书"]) && privateReadyToSend.productionActionIds.includes("save_private") && privateReadyToSend.productionActionIds.includes("send_to_chat") && privateReadyToSend.productionActionIds.includes("petition_partner") && !privateReadyToSend.productionActionIds.includes("discard_create"), "Private preview should expose exactly save/send/petition actions; closing is the sheet X");

  const privateToGroupConfirm = renderedAudit.find((state) => state.stateId === "s3m_private_to_group_confirm");
  assert(privateToGroupConfirm?.visibility === "private" && privateToGroupConfirm.overlay === "active" && privateToGroupConfirm.phoneText.includes("发送到聊天？") && privateToGroupConfirm.phoneText.includes("发送") && privateToGroupConfirm.phoneText.includes("取消") && privateToGroupConfirm.phoneText.includes("今晚吃饭"), "Private-to-group transition should require an explicit send confirmation with generic product copy");

  const privateToGroupSending = renderedAudit.find((state) => state.stateId === "s3o_private_to_group_sending");
  assert(privateToGroupSending?.visibility === "private" && privateToGroupSending.lifecycleStatus === "sending" && privateToGroupSending.phoneText.includes("正在发送") && privateToGroupSending.phoneText.includes("发送中") && !privateToGroupSending.phoneText.includes("发给阿川"), "Private-to-group sending should bridge private preview and shared chat without leaking early");

  const privateToGroupFailed = renderedAudit.find((state) => state.stateId === "s3p_private_to_group_send_failed");
  assert(privateToGroupFailed?.visibility === "private" && privateToGroupFailed.lifecycleStatus === "failed" && privateToGroupFailed.messageRetryCount === 1 && privateToGroupFailed.capsuleTone === "idle", "Private-to-group failure should remain on the sender bubble with a WeChat-like retry icon");
  assert(privateToGroupFailed.participantStatus === "not_visible" && privateToGroupFailed.overlay === "none", "Private send failure should stay recoverable only for the creator without a sheet");

  const petitionConfirm = renderedAudit.find((state) => state.stateId === "s3q_petition_confirm");
  assert(petitionConfirm?.visibility === "private" && petitionConfirm.overlay === "active" && petitionConfirm.phoneText.includes("保存") && petitionConfirm.phoneText.includes("发送") && petitionConfirm.phoneText.includes("上书") && !petitionConfirm.phoneText.includes("放弃") && petitionConfirm.sheetCloseCount === 1 && petitionConfirm.versionBoardCount >= 1 && !petitionConfirm.phoneText.includes("上书给对方批阅？"), "Petition should be a destination action inside the generated preview, not a blank extra confirmation page");
  assert(sameList(petitionConfirm.overlayActions, ["保存", "发送", "上书"]) && petitionConfirm.flowId === "destination", "Petition confirm should be the same generated preview destination set");

  const petitionSending = renderedAudit.find((state) => state.stateId === "s3r_petition_sending");
  assert(petitionSending?.visibility === "private" && petitionSending.lifecycleStatus === "sending" && petitionSending.phoneText.includes("上书发送中") && petitionSending.versionBoardCount >= 1 && !petitionSending.phoneText.includes("发给阿川"), "Petition sending should not expose a partner-facing item until it succeeds");
  assert(petitionSending.participantStatus === "not_visible" && petitionSending.visibilityScope === "private_owner_only_until_sent", "Petition sending should remain private until the send succeeds");

  const petitionSendFailed = renderedAudit.find((state) => state.stateId === "s3s_petition_send_failed");
  assert(petitionSendFailed?.visibility === "private" && petitionSendFailed.lifecycleStatus === "failed" && petitionSendFailed.messageRetryCount === 1 && petitionSendFailed.overlay === "none", "Petition send failure should stay on the sender bubble instead of reopening the preview");
  assert(petitionSendFailed.participantStatus === "not_visible" && petitionSendFailed.versionBoardCount === 0, "Petition send failure must not appear on the partner side or render a version board");

  const privateGenerating = renderedAudit.find((state) => state.stateId === "s3f_private_generating");
  assert(
    privateGenerating?.overlay === "active" &&
      privateGenerating.hasResultPreview &&
      privateGenerating.phoneText.includes("正在创建") &&
      privateGenerating.sheetCloseCount === 1 &&
      !privateGenerating.phoneText.includes("放弃") &&
      !privateGenerating.phoneText.includes("保存") &&
      !privateGenerating.phoneText.includes("发送") &&
      !privateGenerating.phoneText.includes("上书") &&
      !privateGenerating.phoneText.includes("发给阿川") &&
      !privateGenerating.phoneText.includes("请阿川确认"),
    "Private generating should keep a preview shell without exposing destination controls before completion"
  );

  const privateGenerationFailed = renderedAudit.find((state) => state.stateId === "s3j_private_generation_failed");
  assert(privateGenerationFailed?.visibility === "private" && privateGenerationFailed.overlay === "active" && privateGenerationFailed.phoneText.includes("没创建好") && privateGenerationFailed.phoneText.includes("重试") && privateGenerationFailed.sheetCloseCount === 1 && !privateGenerationFailed.phoneText.includes("放弃") && !privateGenerationFailed.phoneText.includes("草稿"), "Private generation failure should offer retry plus sheet close without creating a draft");

  const privatePreview = renderedAudit.find((state) => state.stateId === "s3g_private_preview_before_send");
  assert(privatePreview?.overlay === "active" && privatePreview.phoneText.includes("今晚吃饭") && privatePreview.hasResultPreview && privatePreview.overlayActionStyle === "destination" && privatePreview.sheetCloseCount === 1 && !privatePreview.hasEditComposer && privatePreview.phoneText.includes("保存") && privatePreview.phoneText.includes("发送") && privatePreview.phoneText.includes("上书") && !privatePreview.phoneText.includes("放弃"), "Private preview should choose save/send/petition after generation without an edit composer; close is the X");
  assert(sameList(privatePreview.overlayActions, ["保存", "发送", "上书"]), "Private preview action set should stay identical across preview states");

  const exitUnsaved = renderedAudit.find((state) => state.stateId === "s3d_private_exit_unsaved");
  assert(exitUnsaved?.overlay === "active" && exitUnsaved.phoneText.includes("继续创建") && exitUnsaved.sheetCloseCount === 1 && !exitUnsaved.phoneText.includes("放弃") && !exitUnsaved.phoneText.includes("保存") && !exitUnsaved.phoneText.includes("删除"), "Closing private compose should use the sheet X, without draft/save/delete/abandon branches");

  const privateSent = renderedAudit.find((state) => state.stateId === "s4_private_sent_to_group");
  assert(privateSent?.visibility === "shared" && privateSent.capsule === "active", "Private compose should become shared only after sending to chat");

  const noApproval = renderedAudit.find((state) => state.stateId === "s4a_no_approval_direct_capsule");
  assert(noApproval?.visibility === "private" && noApproval.cardCount === 0 && noApproval.messageCount === 0 && noApproval.taotaoMessageCount === 0 && noApproval.capsule === "quiet", "No-approval saves should return to chat through the user's capsule without sending any chat bubble");
  assert(noApproval.capsuleText.includes("今晚吃饭") && noApproval.capsuleText.includes("已保存") && !noApproval.phoneText.includes("我先自己记一下"), "Private save should be recoverable from the owner capsule only, with no group-chat copy");

  const savedItemDetail = renderedAudit.find((state) => state.stateId === "s4a_saved_item_detail");
  assert(savedItemDetail?.visibility === "private" && savedItemDetail.overlay === "active" && savedItemDetail.messageCount === 0 && savedItemDetail.hasResultPreview && savedItemDetail.phoneText.includes("修改内容") && savedItemDetail.phoneText.includes("删除") && savedItemDetail.phoneText.includes("发送") && savedItemDetail.phoneText.includes("上书") && !savedItemDetail.phoneText.includes("打开刚才保存的那件事"), "Saved private item should reopen as a plain card detail from the capsule, without fake chat messages");

  const approvalCard = renderedAudit.find((state) => state.stateId === "s4b_approval_card_for_partner");
  assert(approvalCard?.phoneText.includes("等对方看") && approvalCard.phoneText.includes("上书") && approvalCard.cardCount === 0 && approvalCard.messageCapabilityCount === 1 && approvalCard.messageCapabilityTexts.some((text) => text.includes("今晚吃饭")), "Petition entry should be a Taotao-attached capability capsule without repeated review labels");

  const cardCollapsed = renderedAudit.find((state) => state.stateId === "s4c_card_read_collapsed");
  assert(cardCollapsed?.cardCount === 0 && cardCollapsed.messageCapabilityCount === 1 && cardCollapsed.phoneText.includes("看过了") && cardCollapsed.messageCapabilityTexts.some((text) => text.includes("今晚吃饭")), "Opened petition entry should become lighter while preserving the source message capsule");

  const sentUnseen = renderedAudit.find((state) => state.stateId === "s4d_sender_sent_unseen");
  assert(sentUnseen?.participantStatus === "visible_unread" && sentUnseen.phoneText.includes("等对方看") && sentUnseen.phoneText.includes("未打开"), "Sender should see petition delivered-but-unopened state");

  const senderAfterSend = renderedAudit.find((state) => state.stateId === "s4h_sender_after_send_actions");
  assert(senderAfterSend?.overlay === "active" && senderAfterSend.overlayOpenedBy === "drawer-item" && senderAfterSend.drawerItemCount >= 3 && senderAfterSend.phoneText.includes("撤回小事卡"), "Sender drawer item should provide return, edit, and withdraw control without pushing chat");

  const seenNoDecision = renderedAudit.find((state) => state.stateId === "s4e_sender_seen_no_decision");
  assert(seenNoDecision?.participantStatus === "viewed" && seenNoDecision.phoneText.includes("对方看过了"), "Sender should see viewed-but-not-decided state");

  const receiverLater = renderedAudit.find((state) => state.stateId === "s4f_receiver_later");
  assert(receiverLater?.participantStatus === "deferred" && receiverLater.phoneText.includes("晚点看"), "Later action should be explicit feedback");

  const receiverDecline = renderedAudit.find((state) => state.stateId === "s4g_receiver_decline_soft");
  assert(receiverDecline?.participantStatus === "rejected" && receiverDecline.phoneText.includes("已收起") && receiverDecline.phoneText.includes("这次先不这样"), "Rejecting a petition should gently collapse the item without hard internal wording");

  const receiverFirstOpen = renderedAudit.find((state) => state.stateId === "s5a_receiver_first_open_from_chat");
  assert(receiverFirstOpen?.viewerRole === "him" && receiverFirstOpen.overlay === "active" && receiverFirstOpen.overlayOpenedBy === "message-capability" && receiverFirstOpen.phoneText.includes("准奏") && receiverFirstOpen.phoneText.includes("修改") && receiverFirstOpen.phoneText.includes("驳回") && receiverFirstOpen.versionBoardCount >= 1 && !receiverFirstOpen.phoneText.includes("还没改过") && !receiverFirstOpen.phoneText.includes("修改记录"), "Receiver first open should expose a complete petition review detail with approve/edit/reject in user-facing copy");
  assert(sameList(receiverFirstOpen.overlayActions, ["准奏", "修改", "驳回"]) && receiverFirstOpen.overlaySourceCapabilityId === "approval_first_open_inline" && receiverFirstOpen.overlaySourceMessageId === "taotao_approval_pending", "Receiver first open should preserve the source capability and exact review actions");

  const receiverPending = renderedAudit.find((state) => state.stateId === "s5_receiver_pending");
  assert(receiverPending?.capsuleTone === "action" && receiverPending.participantStatus === "pending_my_confirm" && receiverPending.visibilityScope === "partner_visible_unhandled", "Receiver pending should be the highest-priority top capsule state for the current viewer");

  const revisionDrawer = renderedAudit.find((state) => state.stateId === "s6y_revision_in_today_drawer");
  assert(revisionDrawer?.overlay === "active" && revisionDrawer.drawerItemCount >= 2 && revisionDrawer.phoneText.includes("对方改了") && revisionDrawer.phoneText.includes("时间线") && !revisionDrawer.phoneText.includes("原版"), "Returned revisions should be recoverable from the today drawer without internal version labels");

  const todayDrawer = renderedAudit.find((state) => state.stateId === "s6_receiver_opens_capsule");
  assert(
    todayDrawer?.overlay === "active" &&
      todayDrawer.overlayOpenedBy === "top-capsule" &&
      todayDrawer.drawerFilterCount >= 6 &&
      todayDrawer.drawerItemCount >= 5 &&
      todayDrawer.phoneText.includes("今天的小事 5 件") &&
      todayDrawer.phoneText.includes("全部") &&
      todayDrawer.phoneText.includes("等我看") &&
      todayDrawer.phoneText.includes("等TA看") &&
      todayDrawer.phoneText.includes("已定") &&
      todayDrawer.phoneText.includes("已保存") &&
      todayDrawer.phoneText.includes("提醒") &&
      todayDrawer.phoneText.includes("回聊天") &&
      !todayDrawer.phoneText.includes("待准奏") &&
      !todayDrawer.hasEditComposer &&
      todayDrawer.messageCount === 0,
    "Top capsule should open the single comprehensive categorized today drawer without a duplicate inline composer"
  );
  assert(todayDrawer.capsuleTone === "summary" && todayDrawer.lifecycleStatus === "index_open", "Top capsule drawer should be an index state, not a direct task detail");

  const emptyDrawer = renderedAudit.find((state) => state.stateId === "s6d_today_things_drawer_empty");
  assert(emptyDrawer?.overlay === "active" && emptyDrawer.drawerItemCount === 1 && emptyDrawer.phoneText.includes("今天还很轻") && emptyDrawer.phoneText.includes("记一件") && !emptyDrawer.hasEditComposer, "Persistent top capsule needs a calm empty drawer state with one creation entry");
  assert(emptyDrawer.capsuleTone === "idle" && emptyDrawer.lifecycleStatus === "archived", "Empty top capsule should stay low priority");

  const drawerReturnsSource = renderedAudit.find((state) => state.stateId === "s6c_drawer_item_returns_source");
  assert(drawerReturnsSource?.overlay === "none" && drawerReturnsSource.messageCapabilityCount === 1 && drawerReturnsSource.phoneText.includes("刚才的做法在这儿"), "Drawer item should be able to return to the original message when source is still available");

  const partnerEditing = renderedAudit.find((state) => state.stateId === "s6b_detail_editing");
  assert(partnerEditing?.visibility === "private" && partnerEditing.overlay === "active" && partnerEditing.hasPrivateThread && partnerEditing.privateThreadAvatarCount >= 2 && partnerEditing.phoneText.includes("整理一下") && partnerEditing.phoneText.includes("小雨发起") && partnerEditing.versionBoardCount >= 2 && !partnerEditing.phoneText.includes("还没改过") && !partnerEditing.phoneText.includes("修改记录"), "Petition edit should happen privately with Taotao before returning to group");

  const petitionRevisionGenerating = renderedAudit.find((state) => state.stateId === "s6e_petition_revision_generating");
  assert(petitionRevisionGenerating?.visibility === "private" && petitionRevisionGenerating.lifecycleStatus === "generating" && petitionRevisionGenerating.phoneText.includes("生成中") && !petitionRevisionGenerating.phoneText.includes("修改记录"), "Petition revision needs a private generating state before return");

  const petitionRevisionFailed = renderedAudit.find((state) => state.stateId === "s6g_petition_revision_failed");
  assert(petitionRevisionFailed?.visibility === "private" && petitionRevisionFailed.lifecycleStatus === "failed" && petitionRevisionFailed.phoneText.includes("重试") && !petitionRevisionFailed.phoneText.includes("刚才那版还在"), "Failed petition revision should stay private and preserve the previous visible item");

  const petitionRevisionPreview = renderedAudit.find((state) => state.stateId === "s6f_petition_revision_preview");
  assert(petitionRevisionPreview?.visibility === "private" && petitionRevisionPreview.lifecycleStatus === "previewing" && petitionRevisionPreview.phoneText.includes("发送") && petitionRevisionPreview.phoneText.includes("小雨发起") && petitionRevisionPreview.versionBoardCount >= 2 && !petitionRevisionPreview.phoneText.includes("你改了一版") && !petitionRevisionPreview.phoneText.includes("修改记录"), "Petition revision needs a private preview before sending back");

  const petitionRevisionReturning = renderedAudit.find((state) => state.stateId === "s6h_petition_revision_returning");
  assert(petitionRevisionReturning?.visibility === "private" && petitionRevisionReturning.lifecycleStatus === "sending" && petitionRevisionReturning.phoneText.includes("发送中") && !petitionRevisionReturning.phoneText.includes("修改记录"), "Petition revision return should have a private sending state");

  const petitionRevisionReturnFailed = renderedAudit.find((state) => state.stateId === "s6i_petition_revision_return_failed");
  assert(petitionRevisionReturnFailed?.visibility === "private" && petitionRevisionReturnFailed.lifecycleStatus === "failed" && petitionRevisionReturnFailed.messageRetryCount === 1 && petitionRevisionReturnFailed.overlay === "none", "Petition revision return failure should stay on the sender bubble with retry");

  const counterReturn = renderedAudit.find((state) => state.stateId === "s7a_partner_edit_sends_back");
  assert(counterReturn?.cardCount === 0 && counterReturn.messageCapabilityCount === 1 && counterReturn.phoneText.includes("对方改了") && counterReturn.phoneText.includes("等你看看") && !counterReturn.phoneText.includes("修改版待批阅") && !counterReturn.phoneText.includes("修改记录"), "Partner edits should return to group as a linked revision capability capsule");
  assert(counterReturn.capsuleTone === "changed", "Returned revisions should outrank settled or empty capsule summaries");

  const initiatorReviewsRevision = renderedAudit.find((state) => state.stateId === "s7_partner_counter");
  assert(initiatorReviewsRevision?.overlay === "active" && initiatorReviewsRevision.phoneText.includes("对方改了") && initiatorReviewsRevision.phoneText.includes("准奏") && initiatorReviewsRevision.phoneText.includes("再改") && initiatorReviewsRevision.phoneText.includes("驳回") && initiatorReviewsRevision.versionBoardCount >= 2 && !initiatorReviewsRevision.phoneText.includes("修改版待批阅"), "Initiator should review the returned revision as the same petition thread");
  assert(sameList(initiatorReviewsRevision.overlayActions, ["准奏", "再改", "驳回"]), "Returned revision review should expose approve/re-edit/reject only");

  const initiatorReedit = renderedAudit.find((state) => state.stateId === "s7c_initiator_reedit_revision");
  assert(initiatorReedit?.visibility === "private" && initiatorReedit.overlay === "active" && initiatorReedit.hasPrivateThread && initiatorReedit.phoneText.includes("整理一下") && initiatorReedit.versionBoardCount >= 2, "Initiator re-edit should open a private Taotao revision flow");

  const initiatorRevisionGenerating = renderedAudit.find((state) => state.stateId === "s7d_initiator_revision_generating");
  assert(initiatorRevisionGenerating?.visibility === "private" && initiatorRevisionGenerating.lifecycleStatus === "generating" && initiatorRevisionGenerating.phoneText.includes("生成中"), "Initiator v3 should have a private generating state");

  const initiatorRevisionPreview = renderedAudit.find((state) => state.stateId === "s7e_initiator_revision_preview");
  assert(initiatorRevisionPreview?.visibility === "private" && initiatorRevisionPreview.lifecycleStatus === "previewing" && initiatorRevisionPreview.phoneText.includes("阿川改动") && initiatorRevisionPreview.phoneText.includes("发送") && !initiatorRevisionPreview.phoneText.includes("你又改了一版"), "Initiator repeat edit should preview before return");

  const initiatorRevisionReturns = renderedAudit.find((state) => state.stateId === "s7f_initiator_revision_returns");
  assert(initiatorRevisionReturns?.visibility === "shared" && initiatorRevisionReturns.messageCapabilityCount === 1 && initiatorRevisionReturns.phoneText.includes("等对方看") && !initiatorRevisionReturns.phoneText.includes("新版"), "Initiator repeat edit should return as a linked shared capability");

  const partnerReviewsV3 = renderedAudit.find((state) => state.stateId === "s7g_partner_reviews_v3");
  assert(partnerReviewsV3?.viewerRole === "him" && partnerReviewsV3.overlay === "active" && partnerReviewsV3.phoneText.includes("对方改了") && partnerReviewsV3.phoneText.includes("阿川改动") && !partnerReviewsV3.phoneText.includes("新版"), "Partner should be able to review the returned repeat edit in the same petition thread");
  assert(sameList(partnerReviewsV3.overlayActions, ["准奏", "再改", "收起"]), "Repeat-edit review should keep the final review action set explicit");

  const initiatorRejectsRevision = renderedAudit.find((state) => state.stateId === "s7b_initiator_rejects_revision");
  assert(initiatorRejectsRevision?.participantStatus === "counter_rejected" && initiatorRejectsRevision.phoneText.includes("之前那版还在") && initiatorRejectsRevision.phoneText.includes("这次先不采用"), "Initiator rejection of a revision should keep the previous petition available");

  const initiatorClosesPetition = renderedAudit.find((state) => state.stateId === "s7h_initiator_closes_petition");
  assert(initiatorClosesPetition?.participantStatus === "closed" && initiatorClosesPetition.phoneText.includes("已收起") && initiatorClosesPetition.phoneText.includes("晚点再聊"), "Closing the whole petition should be a separate branch from rejecting one revision");

  const authGate = renderedAudit.find((state) => state.stateId === "p0_auth_required");
  assert(authGate?.phoneKind === "gate" && authGate.gateVariant === "phone" && authGate.phoneText.includes("+86") && authGate.phoneText.includes("手机号登录") && authGate.phoneText.includes("获取验证码") && !authGate.phoneText.includes("微信") && !authGate.hasComposer, "Auth gate should use a designed phone login input only and block chat before login");

  const codeGate = renderedAudit.find((state) => state.stateId === "p0a_auth_code_sent");
  assert(codeGate?.phoneKind === "gate" && codeGate.gateVariant === "code" && codeGate.gateCodeCellCount === 4 && codeGate.phoneText.includes("输入验证码") && codeGate.phoneText.includes("登录") && !codeGate.phoneText.includes("上传"), "Code gate should complete registration with the shared 4-cell code component and without upload distractions");

  const codeFailed = renderedAudit.find((state) => state.stateId === "p0b_auth_code_failed");
  assert(codeFailed?.phoneKind === "gate" && codeFailed.gateVariant === "code" && codeFailed.gateCodeCellCount === 4 && codeFailed.phoneText.includes("验证码错误") && !codeFailed.phoneText.includes("验证码不对") && codeFailed.phoneText.includes("重新发送"), "Code failure should reuse the same 4-cell code component and say 验证码错误");
  const codeCellSignature = (state) => state.gateCodeCellRects.map((rect) => `${rect.width}x${rect.height}`).join(",");
  assert(codeCellSignature(codeGate) === codeCellSignature(codeFailed), `Code cell dimensions should match between normal and error states: ${codeCellSignature(codeGate)} vs ${codeCellSignature(codeFailed)}`);

  assert(!renderedAudit.some((state) => state.stateId === "p2_taotao_default_ready" || state.phoneText.includes("桃桃已准备好")), "Default Taotao readiness should be a backend fact, not a visible onboarding step");

  const unboundChat = renderedAudit.find((state) => state.stateId === "p1_partner_not_bound");
  assert(unboundChat?.phoneKind === "chat" && unboundChat.hasComposer && unboundChat.hasDock && unboundChat.capsuleText.includes("邀请另一半") && !unboundChat.hasGate, "Unbound users should enter a usable chat with invite in the top capsule, not a blocking invite gate");

  const inviteSheet = renderedAudit.find((state) => state.stateId === "p1a_partner_invite_sheet");
  assert(inviteSheet?.overlay === "active" && inviteSheet.overlayOpenedBy === "top-capsule" && inviteSheet.phoneText.includes("微信分享") && inviteSheet.phoneText.includes("手机号搜索") && !inviteSheet.phoneText.includes("发送邀请"), "Invite sheet should expose share and phone-search paths from the top capsule");

  const shareCard = renderedAudit.find((state) => state.stateId === "p1b_partner_share_card_ready");
  assert(shareCard?.overlay === "active" && shareCard.phoneText.includes("邀请卡") && shareCard.phoneText.includes("微信发送") && shareCard.phoneText.includes("复制链接"), "Share invite path should preview a share card before sending");

  const shareWaiting = renderedAudit.find((state) => state.stateId === "p1c_partner_share_waiting");
  assert(shareWaiting?.overlay === "none" && shareWaiting.capsuleText.includes("等对方加入") && !shareWaiting.phoneText.includes("我发过去了"), "Share sent state should only change the top capsule, not add a fake chat message");

  const shareOpened = renderedAudit.find((state) => state.stateId === "p1d_partner_share_opened_by_partner");
  assert(shareOpened?.phoneKind === "gate" && shareOpened.gateVariant === "invite" && shareOpened.phoneText.includes("手机号登录并加入") && shareOpened.phoneText.includes("暂不加入"), "Partner opening a share card should confirm before binding");

  const phoneSearch = renderedAudit.find((state) => state.stateId === "p1f_partner_phone_search");
  assert(phoneSearch?.overlay === "active" && phoneSearch.phoneText.includes("搜索另一半") && phoneSearch.phoneText.includes("发送绑定提示"), "Phone invite path should search by phone and send a binding prompt");

  const phoneWaiting = renderedAudit.find((state) => state.stateId === "p1g_partner_phone_prompt_sent");
  assert(phoneWaiting?.overlay === "none" && phoneWaiting.capsuleText.includes("等对方加入") && !phoneWaiting.phoneText.includes("手机号也发了"), "Phone prompt sent state should only change the top capsule, not add a fake chat message");

  const phonePrompt = renderedAudit.find((state) => state.stateId === "p1h_partner_phone_prompt_received");
  assert(phonePrompt?.phoneKind === "gate" && phonePrompt.gateVariant === "invite-waiting" && phonePrompt.phoneText.includes("确认绑定") && phonePrompt.phoneText.includes("不是本人"), "Phone invite receiver should have explicit confirm/reject actions");

  const bindingFlow = chatProductionFlows.find((flow) => flow.id === "partner_binding");
  assert(bindingFlow?.steps.some((step) => step.id === "choose-share" && step.surface.includes("微信分享卡片")) && bindingFlow.steps.some((step) => step.id === "choose-phone" && step.surface.includes("手机号搜索卡片")), "Partner binding journey should make both invite branch triggers explicit");

  const preChatUploadLeaks = renderedAudit.filter((state) => state.flowId === "pre_chat" && /上传照片|上传后生成|换一张照片|识别照片/.test(state.phoneText));
  assert(preChatUploadLeaks.length === 0, `Pre-chat registration flow must not require photo upload: ${JSON.stringify(preChatUploadLeaks.slice(0, 5))}`);

  const multiContext = renderedAudit.find((state) => state.stateId === "s10_multiple_contexts");
  assert(
    multiContext?.overlay === "none" &&
      multiContext.drawerItemCount === 0 &&
      multiContext.capsuleText.includes("今天的小事 5 件") &&
      multiContext.phoneText.includes("1 件等你看"),
    "Multiple contexts should first collapse into the top capsule summary; tapping it goes to the single categorized today drawer"
  );

  const permissionSheet = renderedAudit.find((state) => state.stateId === "s12a_permission_sheet");
  assert(permissionSheet?.overlay === "active" && permissionSheet.phoneText.includes("打开通知"), "Reminder permission should have a capsule-opened sheet");

  const misfirePending = renderedAudit.find((state) => state.stateId === "s11e_misfire_pending_with_cancel");
  assert(misfirePending?.overlay === "none" && misfirePending.messageCapabilityCount === 1 && misfirePending.phoneText.includes("记成小事吗"), "Misfire should ask lightly in chat before creating an item");

  const misfireCancel = renderedAudit.find((state) => state.stateId === "s11a_misfire_cancel_structure");
  assert(misfireCancel?.capsule === "idle" && misfireCancel.phoneText.includes("收回"), "Misfired structure should collapse naturally back to chat");

  const duplicateMerged = renderedAudit.find((state) => state.stateId === "s11b_duplicate_send_merged");
  assert(duplicateMerged?.systemMessageCount === 1 && duplicateMerged.phoneText.includes("重复的一次已合并"), "Duplicate send should merge into a light system row");

  const longUnread = renderedAudit.find((state) => state.stateId === "s11c_partner_long_unread");
  assert(longUnread?.participantStatus === "visible_unread" && longUnread.capsuleText.includes("今晚吃饭还没被看") && longUnread.taotaoMessageCount === 0, "Long-unread partner state should stay in the capsule, not Taotao commentary");

  const wrongFeedback = renderedAudit.find((state) => state.stateId === "s11d_generation_wrong_feedback");
  assert(wrongFeedback?.overlay === "active" && wrongFeedback.overlayOpenedBy === "message-capability" && wrongFeedback.phoneText.includes("方向不对"), "Wrong AI result should be correctable from the original capability");

  const wrongFeedbackUpdating = renderedAudit.find((state) => state.stateId === "s11h_wrong_feedback_updating_inline");
  assert(wrongFeedbackUpdating?.overlay === "none" && wrongFeedbackUpdating.messageCapabilityStatuses.includes("updating") && wrongFeedbackUpdating.messageCapabilityActors.includes("小雨") && wrongFeedbackUpdating.phoneText.includes("一起拿主意"), "Wrong-result correction should return to the original message as an updating capsule");

  const visibilityProblems = renderedAudit.filter((state) => !["group", "private", "shared"].includes(state.visibility));
  assert(visibilityProblems.length === 0, `Every state needs explicit visibility: ${JSON.stringify(visibilityProblems.slice(0, 5))}`);

  const groupPrivacyLeaks = renderedAudit.filter((state) => state.visibility === "group" && state.phoneText.includes("看不到"));
  assert(groupPrivacyLeaks.length === 0, `Group-visible states must not imply hidden private draft: ${JSON.stringify(groupPrivacyLeaks.slice(0, 5))}`);

  const genericCreateCopyBanned = /三个选项|三个轻松选项|3 个轻松选项|三个省心选项|晚饭小纸条|小纸条|整理一下|先选个开头|推荐开头/;
  const genericCreateStateIds = new Set([
    "s3_private_compose_entry",
    "s3f_private_generating",
    "s3n_private_card_ready_to_send",
    "s3g_private_preview_before_send",
    "s3m_private_to_group_confirm",
    "s3o_private_to_group_sending",
    "s3p_private_to_group_send_failed",
    "s3q_petition_confirm",
    "s3r_petition_sending",
    "s3s_petition_send_failed",
    "s3d_private_exit_unsaved",
    "s4a_saved_item_detail",
    "s4_private_sent_to_group",
    "s4b_approval_card_for_partner",
    "s5a_receiver_first_open_from_chat",
  ]);
  const genericCreateCopyLeaks = renderedAudit.filter((state) => genericCreateStateIds.has(state.stateId) && genericCreateCopyBanned.test(state.phoneDomText));
  assert(genericCreateCopyLeaks.length === 0, `Generic small-item creation must render concrete item-card fields, not option-list helper copy: ${JSON.stringify(genericCreateCopyLeaks.slice(0, 5))}`);

  const passiveStatusStateIds = new Set([
    "s0d_message_sending_receipt",
    "s0e_message_failed_retry",
    "s0j_message_delivered_unread",
    "s0k_message_read_by_partner",
    "s0m_partner_typing",
    "s4e_sender_seen_no_decision",
    "s4f_receiver_later",
    "s11c_partner_long_unread",
  ]);
  const passiveStatusLeaks = renderedAudit.filter((state) => passiveStatusStateIds.has(state.stateId) && state.taotaoMessageCount !== 0);
  assert(passiveStatusLeaks.length === 0, `Passive receipts and partner-viewed states must not become Taotao status broadcasts: ${JSON.stringify(passiveStatusLeaks.slice(0, 5))}`);

  const taotaoStatusBroadcastPattern = /已看|看过了|未读|未打开|还没看到|对方晚点看|正在发送|发送失败|没发出去|没送出去|没发回去|今天有\s*\d+\s*件小事|在今天的小事里|等你看|等对方看|已保存|只在你这里|已发出|已上书|发到聊天里了/;
  const taotaoStatusLeaks = renderedAudit.filter((state) => state.taotaoTexts.some((text) => taotaoStatusBroadcastPattern.test(text)));
  assert(taotaoStatusLeaks.length === 0, `Taotao messages should speak as a participant, not broadcast UI status: ${JSON.stringify(taotaoStatusLeaks.slice(0, 5))}`);

  const phoneCopy = await page.locator("[data-testid='chatboard-phone-preview']").evaluateAll((nodes) => nodes.map((node) => node.innerText).join("\n"));
  for (const banned of [
    "intent=",
    "event.status",
    "structuredCard",
    "data-",
    "AI 意图分流",
    "结构化事件",
    "不生成卡片",
    "下一步",
    "用户视角",
    "开发要点",
    "工具机器人",
    "AI助手",
    "功能列表",
    "每句建卡",
    "今日行动",
    "房间",
    "工作流",
    "任务",
    "待同意",
    "待确认",
    "待处理",
    "待批阅",
    "权限失败",
    "异常胶囊",
    "AI 推荐",
    "处理中",
    "状态",
    "对方待回应",
    "点开看所有小事",
    "点开",
    "顶部",
    "轻入口",
    "收在上面",
    "桃桃在听",
    "桃桃在这儿",
    "小事我收着",
    "看不到这里",
    "和桃桃单独聊一下",
    "整理好之前",
    "阿川现在看不到这里",
    "还没发给阿川",
    "没点发送",
    "只你可见",
    "只和你整理",
    "满意了再发出去",
    "先看一眼",
    "不满意就直接说",
    "我继续揉一版",
    "发给阿川看看",
    "继续告诉桃桃",
    "直接告诉",
    "我会带回",
    "看一眼就行",
    "要不要现在",
    "不打开也会保留在这里",
    "留在这里吗",
    "要不要这样",
    "要不要给它",
    "你们可以继续聊",
    "提醒可能叫不到你",
    "我可能喊不到你",
    "点 + 私下找桃桃",
    "点上面的 +",
    "先给你看一眼",
    "不乱开东西",
    "好好说",
    "想到什么都可以先放下",
    "不用组织好",
    "换个说法",
    "先把想法放下",
    "想到什么说什么",
    "不急，先放一放也可以",
    "跟桃桃说一件想先放下",
    "再试一次",
    "这次没改成",
    "修改没成功",
    "没改成",
    "原版 · 小雨",
    "上一版",
    "当前",
    "版本",
    "发回去",
    "发回",
    "待发回",
    "回传",
    "原消息",
    "生成预览",
    "我放这儿",
    "这一版",
    "改一版",
    "小雨发来的版本",
    "还没改过",
    "对方改了一版",
    "对方又改了一版",
    "你改了一版",
    "你又改了一版",
    "修改版待批阅",
    "新版待批阅",
    "修改版不算",
    "原版还在",
    "上书给对方批阅？",
    "没上书成功",
    "apiContract",
    "analyticsKey",
    "lifecycleStatus",
    "visibilityScope",
    "participantStatus",
    "objectType",
    "chat_surface_",
    "taotao_v78_",
    "production chat surface",
    "PM / Design / Frontend",
  ]) {
    assert(!phoneCopy.includes(banned), `Phone previews must not expose internal or task copy: ${banned}`);
  }
  assert(!/\bP[0-2]\b/.test(phoneCopy), "Phone previews must not expose scheduling priority labels");

  const allBoardText = await page.getByTestId("v72-chatboard").innerText();
  for (const banned of ["AI 心灵信号", "今日行动", "房间"]) {
    assert(!allBoardText.includes(banned), `Chatboard must not contain banned product wording: ${banned}`);
  }

  await page.close();
  return "v7.8-chatboard-coverage-acceptance";
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const passed = [await runChatboardAcceptance(browser)];
  await browser.close();
  console.log(JSON.stringify({ baseURL, passed }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
