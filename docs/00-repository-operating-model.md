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
5. `prototype/README.md`

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
3. 对照 state id 拆客户端界面和状态流。
4. 对照 E2E 脚本确认不能退化的行为。
5. 需要接口时，从状态对象里抽取 `flowId`、`objectType`、`lifecycleStatus`、`visibilityScope`、`participantStatus`。

## 当前开发基线

- App 主线先做聊天主界面和邀请绑定。
- 小程序先做接收邀请和确认绑定轻端。
- 服务端先沉淀账号、伴侣绑定、消息、顶部胶囊索引和小事对象。
- AI agent 层暂时不硬编码在 UI，先通过状态板定义触发、展示和回收。

