# Codex 全面开发指导手册

更新日期：2026-06-24

## 1. 文档目的

这份文档用于指导后续使用 Codex 开发桃桃 App、小程序、服务端和 AI agent 层。

它不是通用的 Codex 使用教程，而是桃桃项目的开发工作法：

- 先读当前状态板和分册，不从旧 PRD 或模糊想法开工。
- 先把产品对象、状态、异常和验收讲清楚，再写代码。
- 每次只推进一个可验证的功能域。
- 用 Codex 做开发时，必须让它对产出负责：代码、截图、验收、交接说明一起完成。

## 2. 当前事实来源

后续开发默认按以下优先级读取上下文。

| 领域 | 产品文档 | 原型数据源 | 原型组件 | 验收脚本 | 截图证据 |
| --- | --- | --- | --- | --- | --- |
| 聊天主界面 | `docs/product/14-v7.8-production-chatboard-current.md` | `prototype/src/data/v72ChatBoardData.js` | `prototype/src/components/ChatInterfaceBoard.jsx` | `prototype/scripts/e2e-v72-chatboard-acceptance.mjs` | `prototype/screenshots/v7/chatboard/current/` |
| 桃桃页 | `docs/backlog/01-taotao-life-page.md` | `prototype/src/data/v7TaotaoBoardData.js` | `prototype/src/components/TaotaoLifeBoard.jsx` | `prototype/scripts/e2e-v72-chatboard-acceptance.mjs` | `prototype/screenshots/v7/taotao/current/` |
| App 基础控制 | `docs/backlog/06-settings-boundary.md` | `prototype/src/data/v8SettingsBoardData.js` | `prototype/src/components/SettingsBoard.jsx` | `prototype/scripts/e2e-v8-settings-acceptance.mjs` | `prototype/screenshots/v8/settings/current/` |
| 设计系统 | `docs/design-system/00-visual-direction.md`、`01-button-and-interaction-system.md`、`02-motion-system.md`、`03-asset-direction.md` | 原型样式 | `prototype/src/styles.css` | 对应分册验收脚本 | 对应截图目录 |

历史文档只作为演进证据。除非用户明确要求回看历史，否则 Codex 不应从 `docs/legacy/` 中恢复旧逻辑。

## 3. 给 Codex 开任务的标准格式

不要直接说：

```text
帮我开发桃桃 App
```

推荐按下面格式开任务：

```text
目标：
基于 [当前分册/状态板] 开发/调整 [具体功能]。

当前事实来源：
- 产品文档：
- 状态板数据：
- 原型入口：
- 验收脚本：

本次只做：
- ...

明确不做：
- ...

交付标准：
- 更新文档
- 更新状态板或代码
- 运行验收
- 生成截图或测试证据
- 总结改动和风险
```

示例：

```text
基于 V8.0 settingsboard，开发 App 端“我的 > 反馈”页面。
只做反馈表单、提交成功、提交失败保留输入。
不做工单系统、不做问题分类、不做截图上传。
请先读取 docs/backlog/06-settings-boundary.md 和 v8SettingsBoardData.js，再拆实现计划。
```

## 4. Codex 开工前必须做的事

每次开发前，Codex 必须先完成四步：

1. `git status --short`，确认工作区是否已有别人的改动。
2. `rg --files` 或 `rg` 查当前模块相关文件，不凭记忆改代码。
3. 读取当前模块的产品文档、状态板数据、组件和验收脚本。
4. 说清楚本次只改哪些文件、不会碰哪些边界。

如果是 UI 或交互任务，还必须：

- 打开或生成相关截图。
- 对照设计系统检查按钮、卡片、输入区、状态表达。
- 不把内部说明、状态机词、API 词放进手机界面。

## 5. Codex 开发模式

### 5.1 小改动

适合：

- 修文案。
- 修一个状态。
- 调一个按钮或输入区。
- 增加一个明确的异常态。

工作方式：

1. 读取相关文件。
2. 直接实现。
3. 跑对应验收。
4. 生成必要截图。
5. 简短交付。

### 5.2 中等功能

适合：

- 新增一个页面状态。
- 调整一条功能链路。
- 扩一个分册状态板。
- 补一个验收脚本。

工作方式：

1. 先列 3-5 步计划。
2. 更新产品文档或分册。
3. 更新数据源和 UI。
4. 更新 E2E 和截图脚本。
5. 跑 `npm run build`、对应 E2E、截图。

### 5.3 大功能

适合：

- 新分册。
- App/小程序跨端链路。
- 服务端状态对象。
- AI agent 能力链路。

必须使用目标模式和多 agent。

多 agent 推荐拆法：

| Agent | 任务 |
| --- | --- |
| 产品/状态 agent | 审查状态机、双方视角、异常和回收机制。 |
| UI/UX agent | 审查视觉层级、按钮、输入区、移动端体验。 |
| 工程 agent | 审查代码结构、复用点、测试和潜在回归。 |
| 主 agent | 负责最终实现、整合、验收和交付。 |

注意：

- 多 agent 只做独立任务，不让多个 agent 同时改同一个文件。
- 子 agent 的结论必须由主 agent 合并和验证。
- 完成后关闭子 agent，避免占用并行额度。

## 6. 分册驱动开发法

桃桃后续不再维护一个巨大 PRD。每个功能必须按分册推进。

一个分册至少包含：

| 部分 | 要回答的问题 |
| --- | --- |
| 分册定位 | 这个功能解决什么，不解决什么。 |
| 入口 | 用户从哪里进入。 |
| 用户流程 | 正常路径是什么。 |
| 状态清单 | 每个页面/状态的 ID、用户动作、下一步。 |
| 双方视角 | 发起方、接收方分别看到什么。 |
| 异常状态 | 失败、取消、重复、未读、超时如何回收。 |
| 用户端文案 | 用户实际看到什么。 |
| 不进入本分册 | 防止范围膨胀。 |
| 验收标准 | Codex 开发完怎么证明可用。 |

分册进入原型时，必须同时新增或更新：

```text
prototype/src/data/<version><Module>Data.js
prototype/src/components/<Module>Board.jsx
prototype/scripts/e2e-<version>-<module>-acceptance.mjs
prototype/scripts/capture-<version>-<module>-screenshots.mjs
prototype/screenshots/<version>/<module>/current/
```

## 7. 从状态板拆真实开发任务

状态板不是展示稿，而是研发拆分依据。

每个状态对象都应该映射到真实开发里的四类内容：

| 状态板字段 | 开发含义 |
| --- | --- |
| `flowId` | 业务流程或页面族。 |
| `id` | 可追踪的 UI 状态或用例 ID。 |
| `lifecycleStatus` | 前端状态、服务端状态或任务状态。 |
| `visibilityScope` | 谁能看到，用于权限和数据过滤。 |
| `viewerRole` | 当前视角，用于双方 UI 差异。 |
| `apiContract` | 后续接口或服务动作的初步占位。 |
| `contract.next` | 点击或提交后的下一状态。 |
| `contract.recovery` | 失败、取消或返回时如何回收。 |

开发拆任务时推荐格式：

```text
任务：实现 st14_feedback_form / st15_feedback_submitted / st16_feedback_failed
来源：prototype/src/data/v8SettingsBoardData.js
客户端：反馈页面、输入、提交、成功、失败保留输入
服务端：POST /api/feedback
验收：npm run test:e2e:v80 中反馈相关断言必须通过
截图：state-14/state-15/state-16 必须更新
```

## 8. 建议开发顺序

当前建议不要一上来搭完整大工程。先按垂直切片开发，保证每一步都能跑通。

### M0：原型资产冻结

目标：

- 当前 V7.8 聊天、V7.9 桃桃页、V8.0 基础控制可评审。
- 每个分册有文档、状态板、截图、验收。

当前已基本完成。

### M1：工程骨架和共享业务内核

目标：

- 建立真实 App/小程序/服务端工程前，先冻结共享业务对象。
- 不先做复杂架构，不先抽象 UI 大框架。

建议先沉淀这些业务对象：

```text
User
AuthSession
CoupleBond
TaotaoLife
ChatThread
ChatMessage
TopCapsule
SmallThing
CardRevision
ApprovalFlow
MiniLinkSession
Feedback
SettingsProfile
CapabilityRun
```

原则：

- App 和小程序共用业务对象。
- App 和小程序不共用完整 UI。
- 服务端状态必须能解释状态板里的所有 `lifecycleStatus`。

### M2：账号和登录

优先实现：

- 手机号登录。
- 验证码。
- 验证码错误。
- 登录后进入聊天。
- 未绑定也可使用。

对应状态板：

- V7.8 登录相关状态。
- V8.0 账号详情和退出登录状态。

### M3：三人聊天主界面

优先实现：

- 三人头像。
- 普通消息。
- 桃桃消息。
- 消息发送中、失败、撤回、引用、图片、语音、表情。
- 顶部胶囊索引。

不要先做：

- 复杂 agent 自动化。
- 发现流。
- 会员。
- 装扮。

### M4：小事对象和聊天内卡片

优先实现：

- 桃桃消息下的能力胶囊。
- 做法/小事生成中、已完成、失败重试。
- 详情半窗。
- 修改、保存、发送、上书。
- 准奏、驳回、修改记录。
- 今天的小事抽屉。

核心原则：

- 能力从聊天自然长出来。
- 不直接弹窗打断聊天。
- 消息内胶囊保留现场，顶部胶囊负责找回。

### M5：桃桃页

优先实现：

- 从聊天进入。
- 桃桃名称展示。
- 轻量改名。
- 日历回看。
- 从日历回聊天源位置。

不做：

- 上传照片生成形象。
- 装扮。
- 会员。
- 小窝独立 Tab。

### M6：App 基础控制

优先实现：

- 我的首页。
- 账号。
- 另一半。
- 反馈。
- 更多。
- 解除关系。
- 删除账号。
- 通知和安全的轻版入口。

对应：

- V8.0 settingsboard。

### M7：小程序轻端

优先实现：

- 微信卡片进入。
- 微信授权。
- 手机号主账号绑定。
- 邀请确认。
- 轻处理。
- 回 App。

不做：

- 完整 App 镜像。
- 完整聊天。
- 完整桃桃页。
- 完整设置页。

### M8：提醒通知

优先实现：

- 小事提醒。
- 对方待处理。
- 上书待准奏。
- 失败和超时提醒。

后续再做完整通知中心。

## 9. App、小程序、服务端、Agent 的边界

### App

App 是完整体验入口。

负责：

- 三人聊天。
- 小事生成和处理。
- 桃桃页。
- 基础控制。
- 日历回看。
- 深度交互和长期沉淀。

### 小程序

小程序是微信内轻端，不是 App 镜像。

负责：

- 邀请打开。
- 授权。
- 确认绑定。
- 轻处理。
- 回 App。

不负责：

- 完整聊天。
- 完整桃桃页。
- 完整设置。
- 装扮、投喂、深度日历。

### 服务端

服务端是状态真相来源。

负责：

- 账号。
- 伴侣关系。
- 消息。
- 小事对象。
- 卡片版本和修改记录。
- 顶部胶囊索引。
- 反馈。
- 小程序 token 和回流。
- agent 调用记录。

### AI agent 层

Agent 层不要硬塞进 UI。

负责：

- 判断桃桃是否沉默、轻反应、接梗、陪聊、递话、生成草稿、创建共同事件、安全拦截。
- 把自然语言整理成结构化小事。
- 生成卡片内容。
- 根据用户修改刷新卡片。
- 保留可审计的输入、输出、状态和失败原因。

前端只接收：

- 桃桃消息。
- 能力胶囊状态。
- 结构化卡片。
- 错误和重试状态。

## 10. 技术实现原则

### 10.1 复用优先

Codex 开发前必须先查：

- 现有组件。
- 现有数据结构。
- 现有验收脚本。
- 已安装依赖。
- 设计系统文档。

能复用就复用。不要为了“更工程化”提前造新框架。

### 10.2 不提前抽象

只有出现第二个真实使用场景时，才抽出共享组件或共享包。

不要提前创建：

- 万能状态机框架。
- 万能弹窗系统。
- 万能 agent 编排层。
- 大而全设计系统包。

### 10.3 垂直切片优先

优先把一个真实链路跑通：

```text
状态板 -> 前端页面 -> API -> 数据持久化 -> E2E -> 截图/日志证据
```

不要先横向铺一堆空页面。

### 10.4 用户端不出现内部词

用户界面禁止出现：

- `状态机`
- `API`
- `模型`
- `agent`
- `权限模型`
- `数据对象`
- `工单`
- `日志上传`
- `当前模块`
- `开发说明`

这些只能出现在文档、状态板旁注或代码注释里。

## 11. Codex 常用命令

开发原型：

```bash
cd prototype
npm run dev -- --port 5175
```

通用检查：

```bash
npm run build
git diff --check
```

聊天主界面：

```bash
npm run test:e2e:v79
npm run screenshots:v78
```

桃桃页：

```bash
npm run test:e2e:v79
npm run screenshots:v79
```

App 基础控制：

```bash
npm run test:e2e:v80
npm run screenshots:v80
```

完整分册验收：

```bash
npm run qa:v79
npm run qa:v80
```

## 12. 每次交付必须说明

Codex 最终回复必须包含：

- 改了什么。
- 改了哪些关键文件。
- 跑了哪些命令。
- 有没有没跑的检查。
- 还能在哪里继续评审。
- 如果有风险，风险是什么。

不要只说“已完成”。

## 13. 什么时候提交代码

默认不自动提交，除非用户明确说提交。

提交前必须：

1. `git status --short`
2. 确认本次改动范围。
3. 跑对应验收。
4. 确认没有误删用户或其他 agent 的改动。
5. 提交信息写清楚分册和版本。

推荐提交信息：

```text
Add V8 settingsboard development assets
Polish V8 settingsboard interaction details
Document Codex development workflow
```

## 14. 推荐的 Codex 提示词模板

### 14.1 做新分册

```text
基于当前桃桃仓库，开启目标模式和多 agent，做 [功能名] 分册。
先读 docs/00-repository-operating-model.md、当前 MVP 文档和相关 backlog。
要求：
1. 先输出产品对象和状态清单。
2. 再做状态板数据、组件、验收脚本、截图脚本。
3. 手机稿只出现用户端文案。
4. 不进入本分册的功能必须明确列出。
5. 跑 build、对应 e2e、screenshots 和 git diff --check。
```

### 14.2 做 UI 细节打磨

```text
只打磨 [页面/状态 ID] 的 UI 细节，不改产品链路。
请先看截图和相关组件，再按一线 App 标准优化按钮、间距、层级、输入区和状态表达。
不要增加功能，不要写内部说明文案。
完成后重新截图并说明改动前后的差异。
```

### 14.3 做真实客户端开发

```text
基于 [状态板 ID 列表] 实现真实客户端功能。
先从状态板抽出 UI 状态、用户动作、API 契约、异常和回收规则。
只做这一条垂直链路，不搭无关页面。
实现后补测试，并说明每个 state id 对应到了哪个组件/接口/测试。
```

### 14.4 做服务端对象

```text
基于 [状态板/分册] 设计服务端对象和接口。
先列出领域对象、状态字段、可见性、权限、幂等和失败恢复。
不要先写大而全架构。
输出接口草案、数据库字段、状态转换和验收用例。
```

### 14.5 做 AI agent 能力

```text
基于聊天状态板，设计 [能力名] 的 agent 链路。
要求桃桃先作为第三个人说话，能力调用附着在桃桃消息下面。
输出触发条件、沉默条件、生成中、成功、失败、用户修改、回收和审计字段。
不要让 UI 变成工作流播报。
```

## 15. 质量红线

以下情况不能交付：

- 没读当前分册就开始改。
- 手机界面出现内部文案。
- 新功能没有异常态。
- 有状态板但没有 E2E。
- 有 UI 但没有截图证据。
- App 和小程序强行复用完整 UI。
- 保存、发送、上书、准奏、驳回等链路状态不闭环。
- 顶部胶囊和消息内胶囊职责混乱。
- 桃桃被做成工具箱或流程播报机器人。
- 为未来能力提前加会员、装扮、发现流、可见范围等入口。

## 16. 当前下一步建议

在进入真实开发前，建议 Codex 下一步按以下顺序推进：

1. 为真实开发新建一份技术架构分册，先冻结业务对象和接口边界。
2. 选择一个最小垂直切片开始开发：手机号登录 + 未绑定聊天入口。
3. 再接聊天主界面和顶部胶囊。
4. 再接小事对象和 agent 能力。
5. 最后补小程序轻端和提醒通知。

真实代码开发必须从一个能跑通的垂直链路开始，不从全量工程骨架开始。
