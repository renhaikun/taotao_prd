# 桃桃 V2 开发交接说明

更新时间：2026-06-13

## 1. 交接定位

`05-ai-native-prototype` 是桃桃 V2 的 AI-native 可运行原型。它不是 V1 的视觉换皮，也不是传统情侣 App 的功能补丁。

本原型用于把后续 App + 小程序开发对齐到这条主线：

```text
手机号注册/登录 -> 唤醒你们的小东西 -> App 端邀请已创建 -> 微信授权/确认 -> 微信内先用一次 -> 我们和桃桃 -> 记忆小窝 -> 今日现场
```

V1 已冻结在 `../04-dev-ready-prototype/V1_FREEZE.md`。后续开发不要在 V1 首页继续修补 AI-native 体验。

## 2. 运行方式

```bash
cd /Users/renhaikun/Documents/商业化探索/05-ai-native-prototype
npm install
npm run dev -- --port 5175
npm run build
npm run test:e2e
npm run screenshots
```

当前已验证命令：

```bash
npm run build
npm run test:e2e
npm run screenshots
```

验证结果：Vite build exit 0，端到端链路 exit 0，24 张 canonical 截图已重新生成。

## 3. 当前路由与页面

| route | 用户侧页面 | 组件 | 当前作用 |
| --- | --- | --- | --- |
| `auth` | 注册/登录 | `AuthFlow.jsx` | 手机号、验证码、轻资料三步，是上传、生成和邀请前的安全边界。 |
| `wake` | 首次唤醒 | `WakeFlow.jsx` | 登录后从照片/小物开始，模拟识别、确认、生成、醒来和邀请另一半。 |
| `today` | 今日 | `TodaySceneScreen` | 照片现场 + 桃桃在场 + 一张今日决定卡。 |
| `chat` | 我们和桃桃 | `ChatScreen` | 她、他、桃桃同屏，行动卡从聊天中生成；会话页隐藏底部 Tab，只保留输入区。 |
| `memories` | 记忆小窝 | `MemoryNestScreen` | 共同小事进入记忆流，小窝状态有可视反馈。 |
| `mini` | 邀请确认 | `MiniLinkScreen` | 微信内打开、授权、邀请确认、失败兜底、负向选择和轻行动回流。 |

入口状态在 `src/App.jsx` 中由本地 state 管理。后续开发应替换为真实路由、登录态、关系绑定态和服务端状态。

## 4. 关键体验规则

### 4.1 注册/登录

生产逻辑必须先完成手机号注册/登录，再允许上传照片、调用生成、创建邀请或进入共同体验。

当前原型覆盖：

1. 手机号：创建账号安全入口。
2. 验证码：确认身份，不创建匿名生成会话。
3. 轻资料：只补一个另一半能识别的名字。
4. 完成后进入 `wake/upload`，开始唤醒桃桃。

规则：

- 登录不是中途弹窗，而是 App 启动安全边界。
- 未登录点击唤醒、今日、我们、记忆、小窝等入口，都必须回到登录。
- 登录页不做复杂账号中心，只完成 M0 的安全身份确认。

### 4.2 首次唤醒

登录后必须从“唤醒你们的小东西”开始，不先展示传统首页、纪念日、回忆或功能宫格。

当前原型覆盖 6 个唤醒节点：

1. `upload`：选择照片或默认小物。
2. `recognizing`：桃桃正在看。
3. `confirm-object`：确认识别对象。
4. `generating`：正在长出桃桃。
5. `awakened`：它醒了。
6. `invite-partner`：给另一半轻链接。

### 4.3 今日

今日页不是功能首页。它只能表达一个生活现场和一个最合理动作。

当前结构：

- 大幅生活照片。
- 桃桃在现场中动态出现。
- 一张今日决定卡。
- 一个主按钮。
- 一个轻切换控件 `换一件事`。

不要恢复为她/他/桃桃三条信号列表，也不要恢复吃什么、好好说、记小事并列入口。

### 4.4 我们和桃桃

这是三方关系中枢，不是单人 AI 对话页。

规则：

- 用户消息保留她/他的在场感。
- 桃桃消息是关系理解卡，不是客服气泡。
- 行动卡从聊天上下文生成，默认一次只出现一张。
- 进入会话页后隐藏底部 Tab，底部只保留输入区，避免“底部导航 + 浮动输入框”双层控件。

### 4.5 微信邀请确认

微信内页面只承接轻入口，不复制完整 App。

当前表达：

```text
微信里点开 -> 微信授权 -> 看见同一只桃桃 -> 我也确认 -> 先用一次桃桃 -> 回到 App
```

当前原型覆盖 App 端邀请已创建、授权失败、请求修改、暂不确认、打开 App 失败、复制链接和轻行动回流。后续真实开发应接入微信授权、邀请 token、绑定状态和 App schema 回跳。

## 5. 代码结构

```text
src/
  App.jsx
  main.jsx
  styles.css
  components/
    AuthFlow.jsx
    PrototypeShell.jsx
    Screens.jsx
    Taotao.jsx
    WakeFlow.jsx
  data/
    prototypeData.js
public/
  assets/v2/
    awakening-object.png
    today-table.png
    memory-nest.png
    taotao/
      welcome.png
      listening.png
      waiting.png
      happy.png
      memory.png
screenshots/
  CURRENT.md
design-reference/
  today-screen-ai-native-reference.png
```

## 6. 数据对象映射

当前样例数据在 `src/data/prototypeData.js`，后续应映射到产品文档中的核心对象：

| 原型数据 | 生产对象 |
| --- | --- |
| `AuthFlow` 本地状态 | `UserProfile` + session bootstrap |
| `wakeStates` | `AwakenSession` + `TaotaoLife.lifeStatus` |
| `aiTags` / `objectCandidates` | 识别服务输出，不直接暴露置信度逻辑 |
| `todayMoments` | `TodayScene` |
| `chatMessages` | `TriadMessage` |
| `actionCard` | `TriadMessage.contentType = action_card` |
| `memories` | `NestMemory` |
| `MiniLinkScreen` 本地状态 | `MiniLinkSession` |

详细状态机见 `../05-ai-native-product-docs/02-core-flows-and-state-machine.md`。

App 登录和小程序微信授权入口见 `../05-ai-native-product-docs/04-app-mini-entry-auth-flow.md`。

## 7. 资产状态

当前已入库位图资产：

| 文件 | 用途 |
| --- | --- |
| `public/assets/v2/awakening-object.png` | 首次唤醒照片主体 |
| `public/assets/v2/today-table.png` | 今日现场大图 |
| `public/assets/v2/memory-nest.png` | 记忆小窝场景 |
| `public/assets/v2/taotao/*.png` | 桃桃运行时 PNG 姿态资产 |
| `design-reference/today-screen-ai-native-reference.png` | 今日页高保真视觉方向参考 |

当前 `Taotao.jsx` 已引用 production-v2 PNG 姿态资产，并用轻 transform 模拟 idle/thinking/generating 等状态。正式开发应继续替换为统一的 2.5D/3D 动态资产，包括待机、思考、生成、醒来、小窝站位和头像裁切。

## 8. M0 可直接进入开发的范围

- App 首次唤醒链路。
- App 手机号/验证码/轻资料注册登录原型。
- 伴侣邀请和双方确认的最小状态。
- 今日现场的一张主行动卡。
- 我们和桃桃的三方消息结构。
- 从聊天生成行动卡。
- 记忆小窝的保存和双方确认。
- 微信邀请确认：打开、微信授权、授权失败、邀请确认、请求修改、暂不确认、打开 App 失败、轻行动回流。

## 9. M0 不包含但必须预留

- 真实图片上传、对象检测、生成接口。
- 真实 App 登录接口、微信授权接口、手机号/验证码服务。
- 真实伴侣绑定、解除绑定、隐私边界。
- 跨端同步和持久化。
- 支付/投喂。
- 基金、渠道购买、金融推荐等远期能力。
- 完整 3D 引擎或实时动态编辑。

## 10. 开发验收线

进入正式开发时，至少要守住这些验收点：

- 登录后的第一业务屏必须是唤醒，不是情侣首页。
- 生产启动必须先完成注册/登录；未登录不能上传、生成、邀请或进入共同体验。
- 今日页必须是一件事，不是功能集合。
- 群聊必须同时体现她、他、桃桃。
- 聊天页不能同时出现底部导航和底部输入框。
- 微信内邀请必须是轻入口，不复制 App。
- 用户端文案不能出现内部设计说明、AI 参数、模型名、能力堆叠。
- 主按钮每屏最多一个，次动作不能抢主按钮。
- 图片和桃桃动态资产必须在真机常见尺寸下不压字、不遮挡底部导航。

## 11. 当前验证证据

- 构建：`npm run build`，exit 0。
- 端到端验收：`npm run test:e2e`，覆盖未登录门禁矩阵、已登录未绑定门禁矩阵、登录先行、完整唤醒/邀请/微信回流/记忆确认链路，以及 430、390、375 三种手机视口。
- 截图生成：`npm run screenshots`，生成 24 张 `current-*` canonical 截图。
- 截图索引：见 `screenshots/CURRENT.md`。
