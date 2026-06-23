# 桃桃 V7.8 聊天主界面生产评审状态板

这是桃桃的独立 Vite React 高保真原型。当前用户态和交互手机仍保持 V6；V7.1 保留完整生产评审 flowboard；V7.8 在 V7.6 聊天主界面状态板基础上继续生产化，把“手机号登录前置、邀请绑定后置、情侣双方 + 桃桃”的三人聊天、普通消息状态、气泡尾注式能力胶囊、今天的小事顶部抽屉、可继续输入修改的详情半窗、私下整理半窗、共同小事回收和异常分支拆成可评审、可开发、可验收的传统状态画板。

V3.3、V4、V5、V6 保留为历史探索证据；V7.1 flowboard 是全流程生产评审基线；V7.8 chatboard 是聊天主界面进入高保真开发前的最新重点。

## 运行方式

```bash
cd /Users/renhaikun/Documents/商业化探索/05-ai-native-prototype
npm install
npm run dev -- --port 5175
```

建议使用本目录的 `package-lock.json` 安装依赖，保证交付环境一致。

## 验证命令

```bash
npm run build
npm run test:e2e
npm run screenshots
```

- `npm run test:e2e` 默认执行 V6 验收，访问 `http://127.0.0.1:5175`；请先启动 dev/preview 服务，或设置 `TAOTAO_BASE_URL`。
- `npm run qa:v78` 执行 V7.8 build、聊天主界面生产评审状态板 E2E 和截图生成。
- `npm run screenshots:v78` 生成 V7.8 聊天主界面状态板截图到 `screenshots/v7/chatboard/current/`。
- `npm run qa:v72`、`npm run qa:v73`、`npm run qa:v74`、`npm run qa:v75`、`npm run qa:v76` 保留为兼容别名，执行同一套 chatboard 验收脚本。
- `npm run qa:v7` 执行 V7.1 build、flowboard E2E 和 flowboard 截图生成。
- `npm run screenshots:v7` 生成 V7.1 生产评审状态板截图到 `screenshots/v7/flowboard/current/`。
- `npm run qa:v6` 执行 V6 build、E2E 和截图生成。
- `npm run screenshots:v6` 生成 20 张 V6 canonical 截图到 `screenshots/v6/current/`，覆盖传统状态矩阵、用户真实手机界面、小程序轻端、绑定聊天、接收方/发起方视角、完成回收、详情 Sheet、小窝沉淀和输入触发轻量事件条。
- `npm run qa:v5`、`npm run screenshots:v5` 保留 V5 历史验收。
- `npm run qa:v4`、`npm run screenshots:v4` 保留 V4 历史验收。
- `npm run test:e2e:v33` 覆盖默认用户态、显式评审态、手机号登录回流、不上传照片/照片看不清恢复、默认来源、示例改名小白、生命状态待双方确认、小程序独立入口、晚点再答、轻改、确认、轻行动回流、聊天内协商、完成后记忆确认，以及 430、390、375 三种手机视口。
- `npm run screenshots:v33` 保留历史 V3.3 截图命令。
- `npm run test:e2e:v3`、`npm run screenshots:v3`、`npm run qa:v3` 保留为 V3.3 当前命令别名。
- `npm run test:e2e:v2` 和 `npm run screenshots:v2` 保留 V2 冻结证据，不作为当前默认交付命令。

## 当前覆盖范围

- V6 默认入口：用户态不显示评审栏、内部状态和技术说明；根节点暴露 `data-prototype-version="v6"` 供验收脚本使用。
- V6 App 默认入口：历史用户态仍保留未登录聊天实验；V7.1 生产目标已改为登录前置，见 `?mode=flowboard` 的 A 泳道。
- 注册/登录：手机号、验证码、轻资料三步，完成后回到原聊天 intent，不跳到独立唤醒页。
- 聊天式唤醒：来源方式选择、真实上传控件、照片预览、照片看不清恢复、默认小物、生成中、生命预览、改名、发起方确认和微信邀请卡都在聊天内推进。
- 品牌/生命名分离：产品名和默认生命名都是“桃桃”；用户可把共同小生命改成“小白”等自定义名称，聊天发送者、底部 Tab、生命面板、小程序邀请同步。
- 生命面板：展示待处理、名字与称呼、来源照片、双方确认、少打扰边界，不再承担邀请页职责。
- 微信小程序轻端：通过 `?surface=mini&invite=taotao-demo` 独立打开，不显示 App rail/bottom nav；覆盖微信授权、晚点再答、轻改、拒绝、确认、轻行动和回 App。
- 共同聊天：情侣双方 + 自定义生命同屏；日常输入可触发提议、选择和小事卡；表达优化由桃桃对话能力承接，不再单列功能入口。
- V6 对话事件系统：顶部胶囊是当前事件唯一持续上下文；桃桃作为第三位参与者用头像 + 气泡说话；聊天流不再堆重复大卡；底部输入区只显示当前状态下一步动作；点击胶囊唤醒事件详情 Sheet。
- 传统状态矩阵：`?mode=review` 左侧展示等待回应、对方轻改、已约好、已完成等状态下的用户视角和交付规则。
- V7.1 生产评审状态板：`?mode=flowboard` 展示 14 条泳道、110 个状态画板和 AI 意图分流规则；强制登录前置，展开创建桃桃、邀请绑定、三人聊天、日常陪聊、表达优化、轻选择、共同约定、提醒、小窝、设置、异常、安全和研发交付。
- V7.8 聊天主界面状态板：`?mode=chatboard` 展示 9 条生产流程、7 层覆盖矩阵和 91 个手机状态，覆盖手机号登录、验证码错误、未绑定可使用、邀请半屏、微信分享卡、手机号搜索、对方确认绑定、首次三人聊天、叫桃桃、输入聚焦、普通消息发送中/失败/撤回/引用/送达/已读/输入中、长按自己消息、长按桃桃消息、附件面板、图片/语音/表情、默认纯聊天、桃桃轻建议、@桃桃公开接话、群聊内能力启动、群聊中请桃桃整理、消息内结果就绪、做法详情、做法修改生成中/完成/失败旧版保留、私下找桃桃、私下生成中、私下卡片已生成、保存/发送/上书、发送失败、准奏、驳回、今天的小事抽屉、误触发、重复发送、长期未读、桃桃理解错、纠偏回到原消息、异常回收和安全边界等状态。
- V7.8 交互口径：消息流只放三人气泡、普通消息状态、桃桃消息下的气泡尾注式能力胶囊和必要的一次性入口；桃桃先作为第三个人接话，能力调用附着在桃桃自己的消息下面；邀请另一半来自顶部胶囊半屏，微信发送或手机号绑定提示发送成功后只改变顶部胶囊，不新增聊天气泡；消息内胶囊保留原始现场，顶部胶囊统一作为索引和找回入口；半屏层只来自用户点击消息内胶囊、点击今天的小事条目、显式私下整理、长按消息、邀请胶囊或安全边界；可修改半窗必须有结果预览、快捷修改和继续输入框；用户输入修改后，原消息胶囊进入修改中/已更新/失败旧版保留状态。
- 记忆小窝与提醒：已移出 V7.8 当前评审状态板，后续单独重新规划。
- 视觉方向：克制生活摄影感、宋体系标题、暖黑主按钮、低密度卡片、真实来源物证和动态桃桃 PNG 资产。
- AI 产品方向：参考千问、豆包、小美、蚂蚁阿福等一线 AI App 的渐进式引导，但桃桃不做工具箱；能力先由人格回应承接，再用场景卡推进。

## 入口说明

- 用户态：`http://127.0.0.1:5175/`
- 评审态：`http://127.0.0.1:5175/?mode=review`
- V7.1 生产评审状态板：`http://127.0.0.1:5175/?mode=flowboard`
- V7.8 聊天主界面状态板：`http://127.0.0.1:5175/?mode=chatboard`
- 小程序轻端：`http://127.0.0.1:5175/?surface=mini&invite=taotao-demo`

## 交接资产

- `../docs/product/14-v7.8-production-chatboard-current.md`：V7.8 聊天主界面生产评审状态板当前产品口径。
- `../docs/product/13-v7.2-chat-main-stateboard.md`：V7.8 聊天主界面生产评审状态板规格，历史演进基础。
- `../docs/product/12-v7-companion-flowboard.md`：V7.1 共同伴侣生产评审状态板规格，历史 flowboard 基线。
- `../docs/product/11-v6-traditional-state-prototype.md`：V6 传统高保真状态原型规格，历史基础。
- `../docs/product/10-v5-conversation-event-system.md`：V5 对话事件系统规格，历史基础。
- `../docs/product/08-v4-ai-native-couple-life-prd.md`：V4 AI Native Couple Life 产品定义。
- `../docs/product/09-v4-hifi-prototype-build-plan.md`：V4 高保真原型构建计划。
- `../docs/product/05-v3-chat-first-flow.md`：V3.2 产品流程与生产验收口径。
- `../docs/product/06-v3.3-production-journey-and-interaction-spec.md`：V3.3 生产级用户旅程、双方视角、异常状态和聊天卡片规格。
- `../docs/product/07-v3.3-hifi-prototype-build-plan.md`：V3.3 高保真原型开发计划与当前落地记录。
- `screenshots/v7/flowboard/current/`：V7.1 flowboard 截图证据，随泳道自动生成，当前应为 16 张。
- `screenshots/v7/chatboard/current/`：V7.8 聊天主界面状态板截图证据，随状态和 7 层覆盖矩阵自动生成，当前应为 97 张。
- `screenshots/v6/current/`：V6 当前截图证据，共 20 张。
- `screenshots/v5/current/`：V5 历史截图证据。
- `screenshots/v4/current/`：V4 历史截图证据。
- `screenshots/v33/current/`：V3.3 历史截图证据。
- `dev-handoff-v3.md`：V3 开发交接说明，V3.3 以前者为历史基础。
- `dev-handoff.md`：V2 历史交接说明，保留为冻结参考。
- `public/assets/v2/taotao/`：当前原型引用的桃桃运行时 PNG 资产；目录名代表资产批次，不代表产品版本。

## 工程结构

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
    ConversationEvents.jsx
    V7Flowboard.jsx
    ChatInterfaceBoard.jsx
  data/
    prototypeData.js
    v33ScenarioData.js
    v5ConversationEvents.js
    v7FlowboardData.js
    v72ChatBoardData.js
  scripts/
  capture-v72-chatboard-screenshots.mjs
  e2e-v72-chatboard-acceptance.mjs
  capture-v7-flowboard-screenshots.mjs
  e2e-v7-flowboard-acceptance.mjs
  capture-v6-screenshots.mjs
  e2e-v6-conversation-system.mjs
  capture-v5-screenshots.mjs
  e2e-v5-conversation-events.mjs
  capture-v4-screenshots.mjs
  e2e-v4-production-journey.mjs
  capture-v3-screenshots.mjs
  e2e-v3-acceptance.mjs
  capture-screenshots.mjs
  e2e-production-check.mjs
```

## 暂未覆盖

- 真实图片上传、识别接口、生成接口和真实微信分享能力。
- 真实账号服务、验证码风控、伴侣绑定、微信授权接口和 App/小程序跨端同步。
- 生产级路由、持久化、服务端错误态、埋点、接口契约和灰度风控。
