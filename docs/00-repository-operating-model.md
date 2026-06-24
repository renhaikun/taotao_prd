# 桃桃资产仓库使用规则

本仓库不是单纯 PRD 文档仓库，而是桃桃后续产品迭代、原型评审、研发排期和交付验收的资产仓库。

## 资产边界

必须进入本仓库：

- 当前产品逻辑文档
- 可运行高保真原型源码
- 状态板数据源
- E2E 验收脚本
- 当前关键截图证据
- 设计系统方向
- 迭代日志和交付说明

不进入本仓库：

- `node_modules`
- `dist`
- `.npm-cache`
- 临时调试文件
- 大量重复历史截图
- 未经过评审的随手实验

## 当前事实来源

当前默认事实来源按优先级排序：

1. `docs/product/14-v7.8-production-chatboard-current.md`
2. `prototype/src/data/v72ChatBoardData.js`
3. `prototype/scripts/e2e-v72-chatboard-acceptance.mjs`
4. `screenshots/v7/chatboard/current/`
5. `docs/backlog/01-taotao-life-page.md`
6. `prototype/src/data/v7TaotaoBoardData.js`
7. `docs/backlog/06-settings-boundary.md`
8. `prototype/src/data/v8SettingsBoardData.js`
9. `docs/development/00-codex-full-development-guide.md`
10. `prototype/README.md`

历史文档只作为演进证据，不再覆盖当前决策。

## 迭代流程

每次重要迭代应完成：

1. 更新产品规则文档。
2. 更新原型状态板数据源。
3. 更新 UI 组件和样式。
4. 运行验收脚本。
5. 重新生成截图证据。
6. 在 `docs/iterations/` 写一份迭代日志。
7. 提交并推送到 GitHub。

## 研发使用方式

研发拆任务时，不应只看静态文档。推荐顺序：

1. 先读当前产品入口文档，理解核心口径。
2. 打开 `?mode=chatboard` 看完整状态板。
3. 开发桃桃页时，再打开 `?mode=taotao` 看 V7.9 桃桃页分册状态板。
4. 开发 App 基础控制时，再打开 `?mode=settingsboard` 看 V8.0 基础控制分册状态板。
5. 对照 state id 拆客户端界面和状态流。
6. 对照 E2E 脚本确认不能退化的行为。
7. 需要接口时，从状态对象里抽取 `flowId`、`objectType`、`lifecycleStatus`、`visibilityScope`、`participantStatus`。
8. 使用 Codex 开发时，先读 `docs/development/00-codex-full-development-guide.md`，按分册、状态 ID 和验收脚本开任务。

## 后续功能分册原则

V7.8 之后的功能不再合并进一个大 PRD。每个功能必须独立成册，方便后续开发时只加载当前模块上下文。

- 当前聊天、登录、邀请、小事卡规则仍以 `docs/product/14-v7.8-production-chatboard-current.md` 为底座。
- 桃桃页当前以 `docs/backlog/01-taotao-life-page.md` 和 `?mode=taotao` 的 V7.9 状态板为准。
- 新功能先放入 `docs/backlog/` 对应分册，再进入状态板、截图和验收脚本。
- 一个分册只覆盖一个功能域：入口、用户流程、界面状态、异常、验收。
- 不把未来规划、商业化设想和当前 MVP 状态混在同一个交付文档里。

## Agent 开发约束

Codex 已安装 `ponytail@ponytail` 插件。后续开发默认按 Ponytail 的 `full` 模式执行：先查现有代码、状态机、验收脚本和已安装依赖，再决定是否新增实现。

- 先复用本仓库已有组件、数据结构、脚本和设计约束。
- 能用标准库、浏览器/平台能力或已安装依赖解决的，不新增依赖。
- 不为“以后可能会用”提前抽象；只有第二个真实使用场景出现时再拆层。
- 复杂改动完成后，可用 `@ponytail-review` 检查是否有过度设计；需要全仓扫描时用 `@ponytail-audit`。

## 当前开发基线

- App 主线先做聊天主界面和邀请绑定。
- 小程序先做接收邀请和确认绑定轻端。
- 服务端先沉淀账号、伴侣绑定、消息、顶部胶囊索引和小事对象。
- AI agent 层暂时不硬编码在 UI，先通过状态板定义触发、展示和回收。
