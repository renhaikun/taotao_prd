# 桃桃 V2 交付审计

审计日期：2026-06-13

## 1. 目标拆解

原目标：

```text
冻结当前桃桃 V1 原型，另起桃桃 V2 原型：以“唤醒你们的小东西”为第一体验，采用 INS 极简/一线科技 App 风格、动态优先交互、完整 App + 小程序链路，并产出可直接进入开发和上线准备的准生产产品文档、设计系统、可运行原型、截图与交接资产。
```

本轮追加目标：

```text
推进到生产级别原型：任何关键链路不能短缺，改为手机号注册/登录先行，补齐认证后唤醒、邀请确认、微信授权失败、负向选择、打开 App 失败、微信轻行动回流、记忆确认、多视口验收和可复跑截图证据。
```

本轮 UI 精修追加目标：

```text
使用 Product Design 方法把当前可用原型推进到更接近生产 App 的高保真状态：以今日照片现场为视觉母版，接入 production-v2 桃桃资产，减少卡片堆叠和玩具感；补 App 端邀请已创建状态；强化登录和未绑定门禁矩阵；确保聊天页作为三方房间而不是普通 AI 助手页。
```

## 2. 完成证据

| 要求 | 当前证据 | 状态 |
| --- | --- | --- |
| 冻结 V1 | `04-dev-ready-prototype/V1_FREEZE.md` | 已完成 |
| V2 单独目录 | `05-ai-native-*` 系列目录 | 已完成 |
| 登录先行 | `05-ai-native-prototype/src/App.jsx` 默认 route 为 `auth`；截图 `current-01-auth-phone.png` | 已完成 |
| 未登录门禁 | `App.jsx` 统一状态；`npm run test:e2e` 覆盖未登录点击 `唤醒桃桃 / 今天 / 我们 / 记忆小窝 / 邀请确认` 都停留在登录 | 已完成 |
| 已登录未绑定门禁 | `npm run test:e2e` 覆盖已登录但未绑定时 `今天 / 我们 / 邀请确认` 回到邀请链路 | 已完成 |
| 双方确认门禁 | `App.jsx` 统一状态；共同体验只在 `CoupleBond.status=bound` 后开放 | 已完成 |
| INS 极简/一线科技 App 风格 | `05-ai-native-design-system/`、当前截图；今日页作为视觉母版反向统一登录/唤醒/聊天/小窝 | 已完成 M0 |
| 动态优先交互 | `Taotao` 接入 production-v2 PNG 资产、识别线、生成点、行动卡进入、回流后自动定位行动卡 | 已完成 M0 |
| 完整 App 链路 | `WakeFlow` + `AuthFlow` + `App` 状态机 | 已完成 M0 |
| App 端邀请等待 | `current-10-app-invite-created.png`；A 端创建邀请后先显示邀请已创建，再进入 B 端预览 | 已完成 M0 |
| 完整微信邀请链路 | `MiniLinkScreen` 覆盖授权、失败、确认、请求修改、暂不确认、打开 App 失败、微信内轻行动 | 已完成 M0 |
| 今日到聊天到记忆闭环 | `TodaySceneScreen`、`ChatScreen`、`MemoryNestScreen`，截图 20-24 | 已完成 M0 |
| 聊天页生产交互 | `ChatScreen` 隐藏底部 Tab，只保留会话输入区和顶部返回今天；顶部改为三方房间结构 | 已完成 |
| 准生产产品文档 | `05-ai-native-product-docs/` 4 个文档 | 已完成 |
| 设计系统 | `05-ai-native-design-system/` 4 个文档 | 已完成 |
| 可运行原型 | `05-ai-native-prototype/` Vite React 原型 | 已完成 |
| 可复跑验收 | `scripts/e2e-production-check.mjs` + `npm run test:e2e` | 已完成 |
| 截图资产 | `screenshots/CURRENT.md` + 24 张 `current-*` 截图 | 已完成 |
| 开发交接资产 | `05-ai-native-prototype/dev-handoff.md` | 已完成 |
| 依赖复现 | `package-lock.json` | 已完成 |

## 3. 验证命令

已运行：

```bash
cd /Users/renhaikun/Documents/商业化探索/05-ai-native-prototype
npm run build
npm run test:e2e
npm run screenshots
```

结果：

```text
npm run build      exit 0
npm run test:e2e   exit 0
npm run screenshots 生成 24 张 current-* 截图
```

`npm run test:e2e` 覆盖：

- 未登录前不能从导航绕过注册/登录进入 `唤醒桃桃 / 今天 / 我们 / 记忆小窝 / 邀请确认`。
- 已登录但未绑定时不能进入共同体验，会回到邀请链路。
- 手机号登录 -> 轻资料 -> 首次唤醒 -> 生成 -> 邀请。
- App 端邀请创建后先显示邀请已创建，再进入微信邀请预览。
- 微信授权失败、复制反馈、重新授权。
- 另一半请求修改、暂不确认、最终确认。
- 打开 App 失败、复制反馈、微信内轻行动。
- 回流到我们和桃桃、生成记忆草稿、确认记忆。
- 430、390、375 三种手机视口无关键按钮文字溢出。

## 4. Canonical 截图

当前截图索引见：

```text
05-ai-native-prototype/screenshots/CURRENT.md
```

核心截图范围：

- 01-03：手机号登录、验证码、轻资料。
- 04-10：认证后首次唤醒、生成、邀请发起、App 邀请已创建。
- 11-19：微信邀请确认、授权失败、负向选择、打开 App 失败、轻行动。
- 20-22：我们和桃桃回流、记忆草稿、记忆确认。
- 23-24：今日主场景和第二行动场景。

## 5. 当前 M0 边界

这些是正式开发时必须接入的生产能力，不能被当前高保真原型截图替代：

- 真实图片上传和对象检测。
- 真实生成服务和 2.5D/3D 桃桃动态资产。
- 手机号登录、验证码风控、微信授权和跨端身份绑定。
- 服务端状态、数据库、文件存储和回流 token。
- App deep link、微信小程序回跳和失败兜底。
- 服务端错误态：验证码错误、上传失败、识别失败、生成失败、邀请过期、token 无效、网络失败。
- 支付、投喂、远期基金渠道能力。

## 6. 继续开发建议

下一阶段不要再做 V1 式功能堆叠。开发优先级建议：

1. 固化 `UserProfile`、`AwakenSession`、`TaotaoLife`、`CoupleBond`、`TodayScene`、`TriadMessage`、`NestMemory`、`MiniLinkSession` 数据契约。
2. 先做 App 注册/登录、会话恢复、唤醒链路和微信邀请确认闭环。
3. 再做今日现场和我们和桃桃的第一张行动卡。
4. 最后做记忆小窝的确认与可视变化。
