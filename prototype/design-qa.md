# 桃桃 V3.2 Design QA

## QA Thesis

V3.2 的界面应像一个安静、可信、漂亮的共同聊天：桃桃有来源、有动作、有记忆、有回流，不是普通情侣 App 的功能宫格，也不是 AI demo 的识别面板。默认用户态必须像真实 App，评审信息只在 `?mode=review` 出现。

## Checked Screens

- `screenshots/v3/current/app-01-chat-default-430x900.png`
- `screenshots/v3/current/app-shell-01-chat-flow-guidance.png`
- `screenshots/v3/current/app-shell-03-source-flow-guidance.png`
- `screenshots/v3/current/app-shell-05-bound-chat-flow-guidance.png`
- `screenshots/v3/current/app-03-chat-onboarding-source-430x900.png`
- `screenshots/v3/current/app-06-invite-card-created-430x900.png`
- `screenshots/v3/current/app-07-taotao-life-panel-430x900.png`
- `screenshots/v3/current/mini-01-card-open-430x900.png`
- `screenshots/v3/current/mini-04-review-430x900.png`
- `screenshots/v3/current/app-08-chat-return-from-mini-430x900.png`
- `screenshots/v3/current/app-11-today-action-430x900.png`

## Findings

- App 首屏已从登录/唤醒 wizard 改为桃桃聊天；底部只有 composer，没有 bottom nav 和输入框并存。
- 未登录首屏加入来源照片预览，能在 5 秒内建立“桃桃从生活物件里醒来”的视觉锚点。
- 聊天式唤醒、邀请卡、共同聊天回流都在同一聊天语境中完成，没有小程序内嵌到 App 的错觉。
- 桃桃生命面板不再展示邀请主线，改为来源小物、生命状态、关系状态和最近记忆。
- 小程序首屏露出来源照片和桃桃预览，像微信邀请轻端，而不是完整 App 镜像。
- 生命面板不再放底部重复 CTA，避免和底部导航互相挤压。
- 默认用户态已隐藏左侧评审信息，`?mode=review` 单独承担开发说明。
- 聊天输入区新增动态快捷 chips，借鉴一线 AI App 的渐进式功能引导，但只保留关系场景动作。
- “今天”不作为任务页或一级 Tab，只作为聊天里自然长出来的生活场景。
- 默认用户态禁用“房间”“任务”“当前步骤”“开发要点”等破坏 C 端体验的词。

## Verification

```bash
npm run build
npm run test:e2e:v3
npm run screenshots:v3
```

Verified viewport coverage in `test:e2e:v3`:

- 1360 x 960 review mode
- 430 x 900
- 390 x 844
- 375 x 667

Browser smoke:

- App default route renders `screen-chat`.
- Chat composer visible.
- App default route does not render `.prototype-rail` or `[data-testid="flow-panel"]`.
- Review route `?mode=review` renders the guidance panel.
- Mini route `?surface=mini&invite=taotao-demo` renders `screen-mini`.
- Mini route does not render `.prototype-rail`.
- No page errors or console errors were observed.
