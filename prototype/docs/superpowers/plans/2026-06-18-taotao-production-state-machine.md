# Taotao Production State Machine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the chatboard prototype into a production-reviewable prototype where chat, AI result capsules, small-thing cards, top capsule index, and petition approval states have clear object boundaries.

**Architecture:** Keep the current React/Vite prototype. Product contracts live outside the phone UI in docs and review panels; phone previews render only user-facing App screens. State data remains in `src/data/v72ChatBoardData.js`, rendering remains in `src/components/ChatInterfaceBoard.jsx`, and acceptance coverage remains in `scripts/e2e-v72-chatboard-acceptance.mjs`.

**Tech Stack:** Vite, React, Playwright, local static data model.

---

### Task 1: Lock The Product Object Contract

**Files:**
- Create: `docs/taotao-production-object-state-machine.md`

- [x] **Step 1: Define core objects**

Document `ConversationThread`, `Message`, `TaotaoUtterance`, `AIResultCapsule`, `ThingCard`, `ThingDraft`, `Petition`, `TodayIndexItem`, `MemoryItem`, and `ReminderItem`.

- [x] **Step 2: Define hard boundaries**

Document that creating a card creates a small thing with fields, while recipes, recommendations, and summaries are AI result capsules.

- [x] **Step 3: Define status display rules**

Document that read/unread/failed/viewed/approved/rejected states are UI states, not Taotao messages.

### Task 2: Repair Small-Thing Creation States

**Files:**
- Modify: `src/data/v72ChatBoardData.js`

- [ ] **Step 1: Update private creation copy**

Change `s3_private_compose_entry`, `s3l_private_visibility_banner`, and `s3f_private_generating` so phone UI says `新建小事`, `创建`, and small-thing fields instead of `整理一下` and three options.

- [ ] **Step 2: Update preview states**

Change `s3n_private_card_ready_to_send`, `s3g_private_preview_before_send`, `s3q_petition_confirm`, and `s3r_petition_sending` so previews show:

```text
标题：今晚吃饭
时间：今晚 19:30
地点：楼下小馆
参与：我们俩
备注：近一点，少排队
```

- [ ] **Step 3: Update draft and failure states**

Change `s3p_private_to_group_send_failed`, `s3s_petition_send_failed`, `s3j_private_generation_failed_saved`, `s3b_private_draft_saved`, `s3d_private_exit_unsaved`, `s3e_private_draft_list`, and `s3c_resume_private_draft` to preserve small-thing fields, not recommendation text.

### Task 3: Repair Status-As-Message Violations

**Files:**
- Modify: `src/data/v72ChatBoardData.js`

- [ ] **Step 1: Remove Taotao viewed-status broadcasts**

In `s4e_sender_seen_no_decision`, remove Taotao's active message saying the partner viewed the item. Keep the status in capsule metadata and review data.

- [ ] **Step 2: Make opened entry a state change**

In `s4c_card_read_collapsed`, keep the message capability status as `opened`, but do not make Taotao newly announce that the item was viewed.

- [ ] **Step 3: Review later/reject states**

In `s4f_receiver_later` and `s4g_receiver_decline_soft`, only use a user message or low-profile state UI. Do not use Taotao as a status announcer.

### Task 4: Harden Acceptance Tests

**Files:**
- Modify: `scripts/e2e-v72-chatboard-acceptance.mjs`

- [ ] **Step 1: Update expected private create copy**

Assert that private creation includes `新建小事`, `创建`, `标题：`, `时间：`, `地点：`, and does not include `三个选项`, `三个轻松选项`, or `三个省心选项`.

- [ ] **Step 2: Add status broadcast guard**

Assert that phone previews do not include Taotao-authored status broadcasts such as `对方看过了，晚点再定也行。` or `对方晚点看。`.

- [ ] **Step 3: Preserve destination actions**

Keep exact action assertions for `保存`, `发送`, `上书`, `准奏`, `修改`, and `驳回`.

### Task 5: Verify And Regenerate Screenshots

**Files:**
- No source edits unless QA fails.

- [ ] **Step 1: Run build**

Run: `npm run build`

Expected: Vite build exits 0.

- [ ] **Step 2: Run e2e**

Run: `npm run test:e2e:v8`

Expected: Playwright acceptance exits 0.

- [ ] **Step 3: Run full QA**

Run: `npm run qa:v8`

Expected: Build, e2e, and screenshot generation exit 0.

- [ ] **Step 4: Inspect key screenshots**

Open:

```text
screenshots/v7/chatboard/current/state-34-s3_private_compose_entry.png
screenshots/v7/chatboard/current/state-37-s3n_private_card_ready_to_send.png
screenshots/v7/chatboard/current/state-54-s4e_sender_seen_no_decision.png
screenshots/v7/chatboard/current/state-60-s4c_card_read_collapsed.png
```

Expected: phone UI is user-facing, no internal proposals, no Taotao status broadcasts, and small-thing card creation uses structured fields.

