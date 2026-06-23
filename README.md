# 桃桃原型与产品迭代资产仓库

本仓库是桃桃项目的产品文档、原型源码、状态板截图、迭代记录和研发交接资产仓库。后续 App、小程序和服务端开发都应以这里冻结的产品逻辑、状态板和验收脚本为依据。

当前主线版本：V7.8 聊天主界面生产评审状态板。

## 当前基线

- 产品方向：AI Native Couple Life，不是传统情侣工具箱。
- 核心界面：情侣双方 + 桃桃的三人聊天。
- 当前状态板：10 条生产流程、7 层覆盖矩阵、100 个手机状态。
- 最新重点：手机号登录前置、登录后可先使用、邀请另一半从顶部胶囊进入、微信分享和手机号搜索两条绑定路径。
- 运行原型：`prototype/`
- 最新截图证据：`screenshots/v7/chatboard/current/`

## 使用原则

- `docs/product/14-v7.8-production-chatboard-current.md` 是当前产品逻辑入口。
- `prototype/src/data/v72ChatBoardData.js` 是当前状态机和状态板数据源。
- `prototype/scripts/e2e-v72-chatboard-acceptance.mjs` 是防退化验收脚本。
- `screenshots/v7/chatboard/current/` 是当前评审截图证据。
- 历史文档保留，但开发默认看当前基线，不从旧版本里捞逻辑。

## 仓库结构

```text
docs/
  00-repository-operating-model.md  仓库使用规则和资产边界
  product/        AI Native 产品文档与状态板 PRD
  design-system/ 视觉、动效、资产方向
  audits/         阶段审计与交付检查
  iterations/     关键迭代日志
  legacy/         早期 PRD 和历史方案
prototype/        Vite React 高保真原型源码
screenshots/      当前可评审截图证据
```

## 快速运行

```bash
cd prototype
npm install
npm run dev -- --port 5175
```

访问：

- 用户态：`http://127.0.0.1:5175/`
- 生产评审状态板：`http://127.0.0.1:5175/?mode=chatboard`
- 历史 flowboard：`http://127.0.0.1:5175/?mode=flowboard`

## 验收命令

```bash
cd prototype
npm run build
npm run test:e2e:v8
npm run screenshots:v8
```

最新一次本地验收：

- `npm run test:e2e:v8` 通过
- `npm run build` 通过
- `npm run screenshots:v8` 已生成 106 张截图

## 最新 PRD 入口

- `docs/00-repository-operating-model.md`
- `docs/product/14-v7.8-production-chatboard-current.md`
- `docs/iterations/2026-06-22-v7.8-chatboard-asset-baseline.md`
- `docs/product/13-v7.2-chat-main-stateboard.md`
- `prototype/README.md`
- `prototype/src/data/v72ChatBoardData.js`
- `prototype/scripts/e2e-v72-chatboard-acceptance.mjs`

## 关键产品口径

- 登录必须在聊天前完成，未登录不能先聊一句。
- 上传照片和桃桃自定义不阻断注册。
- 伴侣绑定不阻断用户先使用桃桃。
- 未绑定时顶部胶囊提示邀请另一半。
- 点击邀请胶囊后出现半屏，用户明确选择微信分享或手机号搜索。
- 微信发送或手机号提示发送成功后，不在聊天流里新增“已发送”气泡，只改变顶部胶囊状态。
- 对方确认绑定后，关系栏正式变成三人头像，顶部胶囊切换为今天的小事。
- V7.8 已收敛重复状态：不再保留新建小事草稿箱、单项胶囊抽屉、对方端无新建痕迹等会误导研发的画板。

## 后续开发怎么用

1. 产品新增或修改逻辑，先改 `docs/product/` 和 `prototype/src/data/v72ChatBoardData.js`。
2. UI/交互变更必须同步生成截图到 `screenshots/v7/chatboard/current/`。
3. 每次推进到可评审状态，都要跑 `npm run test:e2e:v8` 和 `npm run build`。
4. 研发排期前，以状态板里的 flow、state id、visibility、lifecycle 和验收脚本作为需求拆分依据。
