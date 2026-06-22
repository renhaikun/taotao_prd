# 桃桃 V4 高保真原型构建计划

## 1. 目标

V4 原型目标不是在 V3.3 上补几个缺口，而是重做一套可进入互联网公司需求评审的 AI-native C 端 App 原型。

V4 必须证明：

- 用户能自然理解产品，而不是靠解释文案。
- 桃桃创建链路是真实可操作的，不是状态跳转。
- AI 能力体现在上传、生成、聊天理解、协商和记忆沉淀中。
- 情侣双方视角真实存在，但用户态不出现内部视角切换。
- 桃桃和小窝能形成长期留存资产。
- 原型能直接指导开发拆页面、状态和接口。

## 2. 构建原则

### 2.1 先做真实流程，再做视觉 polish

必须先把核心流程做完整：

```text
首次打开
-> 登录
-> 创建桃桃
-> 上传/生成
-> 邀请另一半
-> 共同聊天
-> 事件完成
-> 小窝沉淀
```

不要先追求漂亮的卡片，而让关键流程继续跳状态。

### 2.2 用户态和评审态彻底分离

用户态只展示真实用户会看到的内容。

评审态可以展示：

- 当前页面。
- 当前状态。
- 开发要点。
- 角色切换。
- 异常切换。
- 状态矩阵。

但这些绝不进入手机屏。

### 2.3 文案先做减法

V4 用户端文案要短、直接、动作导向。

删除：

- 产品理念解释。
- “不会打扰你们”式安抚长句。
- 内部逻辑说明。
- 站在产品经理视角写给用户的解释。

保留：

- 动作。
- 状态。
- 结果。
- 必要边界。

## 3. 推荐工程策略

建议新建：

```text
05-ai-native-v4-prototype/
```

或在当前原型中创建 V4 route，但建议新目录更稳：

- V3.3 保留为历史证据。
- V4 可以重构 IA 和组件，不被旧 demo 状态绑住。
- 后续高保真开发更干净。

如果继续使用当前目录，至少需要：

```text
src/data/v4ScenarioData.js
src/components/v4/
src/components/v4/cards/
src/components/v4/screens/
scripts/e2e-v4-production-journey.mjs
scripts/capture-v4-screenshots.mjs
```

## 4. V4 页面结构

### 4.1 App 一级结构

```text
ChatScreen
LifeScreen
NestScreen
```

底部 Tab：

```text
聊天
桃桃
小窝
```

不再有“今天”一级入口。

### 4.2 Onboarding / 创建桃桃

页面：

```text
WelcomeScreen
AuthPhoneScreen
CreateLifeStartScreen
SourceMethodScreen
PhotoPermissionScreen
PhotoUploadScreen
PhotoPreviewScreen
ObjectSelectionScreen
GenerationProgressScreen
GenerationFailedScreen
LifePreviewScreen
LifeNameScreen
SelfConfirmScreen
InvitePartnerScreen
InviteStatusScreen
```

### 4.3 小程序

页面：

```text
MiniInvitePreviewScreen
MiniAuthScreen
MiniReviewLifeScreen
MiniCounterScreen
MiniLaterScreen
MiniRejectScreen
MiniConfirmedScreen
MiniLightUseScreen
MiniExpiredScreen
MiniExistingBondScreen
```

### 4.4 共同聊天

组件：

```text
MessageList
Composer
AIEventCard
ChoiceCard
ProposalCard
SayBetterCard
ReminderCard
MemoryPromptCard
AgreementCard
EventDetailSheet
```

### 4.5 桃桃主页

模块：

```text
LifeHero
PendingActions
SourceMediaPanel
NamePanel
AppearancePanel
ReminderPanel
BoundaryPanel
GrowthPanel
```

### 4.6 小窝

模块：

```text
NestHero
MemoryFeed
MemoryDraftCard
MemoryDetail
GrowthTimeline
GiftFeed
```

## 5. P0 用户旅程

### 5.1 首次创建桃桃

```text
打开 App
-> 创建桃桃
-> 手机号登录
-> 选择来源
-> 从相册选
-> 预览照片
-> 圈选陶瓷杯
-> 确认来源
-> 生成桃桃
-> 预览桃桃
-> 可改名，例如改成小白
-> 我确认
-> 邀请阿川
```

必须展示真实上传和生成界面。

### 5.2 不上传照片

```text
选择来源
-> 先用默认形象
-> 生成默认桃桃
-> 后续可以补照片
```

用户端不要出现“默认胚胎”这类内部词。

### 5.3 上传失败

```text
上传照片
-> 网络失败
-> 重新上传 / 换一张 / 先用默认形象
```

### 5.4 生成失败

```text
生成中
-> 生成失败
-> 重试 / 换照片 / 用默认形象
```

### 5.5 小程序确认

```text
阿川打开邀请
-> 微信授权
-> 看桃桃来源和形象
-> 确认 / 想改 / 晚点 / 不是这个
-> 写回 App
```

### 5.6 共同聊天事件

```text
小雨输入：今晚去公园走走？
-> 桃桃生成提议卡
-> 发给阿川
-> 阿川看到
-> 阿川改到 21:00
-> 小雨接受
-> 已约好
-> 已完成
-> 桃桃问要不要留下
-> 双方确认
-> 小窝更新
```

## 6. 聊天输入触发规则

V4 原型必须至少支持 5 条模拟输入：

| 输入 | 输出 |
| --- | --- |
| 今晚去公园走走 | ProposalCard |
| 不知道吃什么 | ChoiceCard |
| 帮我好好说 | SayBetterCard |
| 20:10 提醒我 | ReminderCard |
| 这个想留下 | MemoryPromptCard |

实现方式可以是前端 mock parser，但用户体验必须像真实 AI 产品。

## 7. 状态模型

### 7.1 SourceMedia

```text
empty
permission_request
permission_denied
selecting
previewing
cropping
manual_selecting
uploading
uploaded
upload_failed
default_selected
```

### 7.2 RecognitionJob

```text
idle
queued
running
multi_candidate
single_candidate
low_confidence
failed
manual_confirmed
```

### 7.3 GenerationJob

```text
idle
queued
analyzing_source
creating_shape
creating_motion
preparing_preview
succeeded
failed
timed_out
retrying
```

### 7.4 LifeStatus

```text
not_created
creating
source_ready
generating
preview
self_confirmed
partner_pending
awake
resting
needs_attention
archived
```

### 7.5 InviteStatus

```text
not_created
created
shared
opened
reviewing
confirmed
countered
later
rejected
expired
withdrawn
existing_bond_conflict
```

### 7.6 ChatEventStatus

```text
draft
sent
delivered
seen
waiting
countered
accepted
reminded
completed
memory_prompted
memory_draft
memory_confirmed
cancelled
expired
```

## 8. V4 组件规范

### 8.1 卡片结构

每张 AI 事件卡必须有：

```text
状态行
主内容
关键证据/参数
主动作
次动作
状态回执
```

不要用一堆解释性段落填满卡片。

### 8.2 按钮规则

每张卡最多一个主按钮。

次动作不超过三个。

禁止用户态按钮：

```text
看阿川这边
切换角色
生成失败演示
默认来源
评审切换
```

这些只能在评审态。

### 8.3 动效规则

生成桃桃必须有明显过程，但不要炫技：

- 来源照片轻微缩放。
- 识别框/圈选过渡。
- 桃桃形象逐步出现。
- 生成阶段文本短而明确。

## 9. 文案替换清单

必须替换：

| 当前口径 | V4 口径 |
| --- | --- |
| 先和桃桃说一句，它会慢慢认识你们 | 说一句 |
| 桃桃在听，不会每句话都打断你们 | 删除 |
| 等你要保存、叫醒它或邀请另一半时，再确认手机号 | 保存时登录 |
| 照片不是门槛 | 上传照片 / 先用默认形象 |
| 这不是承诺 | 你可以改一下 |
| 它只在确实能帮你们变轻时出现 | 删除 |
| 聊天里、底部入口和邀请里都会这样叫它 | 删除 |
| 桃桃正在熟悉这只陶瓷杯和你们说话的方式 | 正在生成桃桃 |

## 10. 截图验收

V4 必须生成截图：

```text
01 welcome
02 auth-phone
03 source-method
04 photo-permission
05 photo-upload
06 photo-preview-crop
07 object-selection
08 generation-progress
09 generation-failed
10 life-preview
11 rename-life
12 invite-created
13 invite-opened
14 mini-review
15 mini-counter
16 mini-later
17 mini-confirmed
18 shared-chat-empty
19 proposal-card-sender
20 proposal-card-receiver
21 counter-proposal
22 agreement-accepted
23 memory-prompt
24 memory-draft
25 nest-confirmed
26 life-home
27 life-settings
28 review-state-matrix
```

## 11. E2E 验收

新增脚本：

```text
scripts/e2e-v4-production-journey.mjs
scripts/capture-v4-screenshots.mjs
```

必须断言：

- 默认用户态没有内部评审文案。
- 首屏主动作明确。
- 上传照片链路存在 `input[type=file]` 或等价 mock 上传控件。
- 用户能从上传进入预览、圈选、识别、生成、预览。
- 生成失败有恢复路径。
- 示例改名为“小白”后全局同步。
- 用户态没有“看阿川这边”。
- 聊天输入能触发至少 5 类事件卡。
- 小程序不显示 App 底部导航。
- 事件完成后才进入记忆草稿。
- 记忆确认后小窝变化。
- 375/390/430 宽度无按钮文字溢出。

## 12. 交付物

V4 第一阶段交付：

```text
V4 PRD
V4 高保真原型
V4 截图集
V4 E2E 验收脚本
V4 开发交接文档
```

## 13. 推荐下一步

下一步不要直接改旧组件。先做：

```text
1. 冻结 V3.3 当前目录。
2. 新建 V4 原型目录或 V4 组件命名空间。
3. 搭建 V4 状态模型。
4. 先完成创建桃桃链路。
5. 再完成聊天事件引擎。
```

V4 第一版只要证明“创建桃桃 + 共同聊天事件 + 小窝沉淀”成立，就比 V3.3 更接近真实生产。
