# 桃桃 V3.2 开发交接说明

## 1. 当前定位

`05-ai-native-prototype` 当前默认版本是 V3.2。产品本体是 `桃桃聊天`，所有正式能力都围绕聊天状态流转；默认 URL 必须像真实 App 一样面向用户，不出现任何技术、评审或开发文案。

开发评审信息只在 `?mode=review` 显式打开，用于解释当前画面、用户动作和实现提醒。这个边界很重要：用户态负责体验，评审态负责交接。

产品心智参考千问、豆包、小美、蚂蚁阿福等一线 AI App 的引导方式，但不复制工具箱。桃桃必须先作为一个有身份、有语气、有边界的共同陪伴对象出现，再用场景卡承接上传、邀请、记忆和今天场景。

```text
App 默认进聊天
-> 未登录触发正式能力
-> 手机号登录后回聊天
-> 聊天式唤醒桃桃
-> 生成微信邀请卡
-> 小程序独立确认
-> 回流共同聊天
-> 生成记忆草稿
-> 小窝沉淀
```

## 2. 路由与端边界

| Surface | 入口 | 说明 |
| --- | --- | --- |
| App 用户态 | `/` | 默认进入桃桃聊天，只展示真实手机 App 界面。 |
| App 评审态 | `?mode=review` 或 `?review=1` | 展示左侧流程说明和跳转，用于设计/产品/开发评审。 |
| Mini | `?surface=mini&invite=taotao-demo` | 微信卡片后的独立轻端，不显示 App rail 或 bottom nav。 |

小程序不能作为 App 内部 tab 出现。App 中的邀请卡只提供“发给阿川 / 预览微信轻端”的模拟入口，生产实现时应接入真实微信分享。

App 一级导航当前为 `聊天 / 小窝 / 桃桃`。聊天页本身不显示底部导航，避免输入区和 Tab 并存；“今天”不再是一级导航，而是从聊天中生长出来的生活场景。

## 3. 主要状态

当前状态集中在 `src/App.jsx`：

- `isAuthed`：手机号登录状态。
- `route`：App 内部当前屏幕，默认 `chat`。
- `surface`：`app` 或 `mini`。
- `authReturn`：登录中断后的回流位置和 pending intent。
- `prototypeState.chatRoom`：`mode` 和 `onboardingStep`。
- `prototypeState.coupleBond`：`solo / invite_created / bound / needs_edit / rejected`。
- `prototypeState.awakenSession`：来源小物、邀请状态、发起方确认。
- `prototypeState.taotaoLife`：`seed / forming / awake`。
- `prototypeState.miniLinkSession`：微信轻端状态。
- `prototypeState.todayScene`：轻行动和记忆草稿状态。

真实开发时应把这些状态拆成服务端实体和客户端状态机，避免多处双写。

## 4. 关键组件

| 文件 | 责任 |
| --- | --- |
| `src/App.jsx` | V3 surface、route、auth 回流、App/Mini 状态机。 |
| `src/components/Screens.jsx` | 聊天、今日、小窝、桃桃生命面板、小程序轻端。 |
| `src/components/AuthFlow.jsx` | 手机号登录三步，完成后回到原聊天 intent。 |
| `src/components/PrototypeShell.jsx` | App 原型外壳和评审导航。 |
| `src/components/Taotao.jsx` | 桃桃运行时 PNG 资产渲染。 |
| `src/styles.css` | V3 视觉系统、聊天、生命面板、小程序和响应式样式。 |

`WakeFlow.jsx` 仍保留为 V2/历史组件，不在 V3 默认链路使用。

## 5. 测试与截图

默认验收：

```bash
npm run build
npm run test:e2e
npm run screenshots
```

V3 专用命令：

```bash
npm run test:e2e:v3
npm run screenshots:v3
```

V3.2 截图包含两类：

- 手机 UI 截图：验证 App、小程序和关键状态。
- 评审态截图：验证 `?mode=review` 可以解释每一步画面和实现提醒。

V3 截图目录：

```text
screenshots/v3/current/
```

V2 冻结命令：

```bash
npm run test:e2e:v2
npm run screenshots:v2
```

## 6. 当前未接入的生产能力

- 真实手机号验证码和账号服务。
- 真实图片上传、对象识别、生命形象生成。
- 真实微信授权、openid/unionid、邀请 token、分享卡片和 deep link。
- App/小程序跨端实时同步。
- 服务端持久化、失败重试、风控、埋点和灰度发布。

## 7. 下一步开发建议

1. 先实现状态机实体：`ChatRoom`、`AwakenSession`、`TaotaoLife`、`CoupleBond`、`MiniLinkSession`、`NestMemory`。
2. 再做真实登录和邀请 token，确保手机号登录后能恢复 pending intent。
3. 小程序先只做邀请确认和一个轻行动，不复制 App 完整聊天。
4. 生成服务先接入静态/半静态资产工作流，再替换为动态 3D/视频资产。
5. 所有主链路继续保留 `data-testid` 和 `data-*` 状态属性，避免 UI 文案迭代破坏 e2e。

## 8. 用户态文案红线

默认用户态不能出现：

- 版本号、原型、评审、开发、流程、状态字段、组件名、路由名。
- `route`、`surface`、`pendingAction`、`onboardingStep`、`authStatus` 等实现字段。
- “房间”“任务”等会破坏聊天心智的词，以及任何带任务感的今天入口命名。
- 模型参数、生成指令、内部参考、竞品名。

这些信息可以出现在本交接文档、测试脚本和 `?mode=review`，但不能出现在真实 App 界面里。
