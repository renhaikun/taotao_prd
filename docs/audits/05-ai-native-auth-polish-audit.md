# 桃桃 V2 注册授权与细节打磨审计

审计日期：2026-06-12

## 1. 本轮目标

在桃桃 V2 AI-native 原型基础上，按生产标准继续完善 App 原型：

- 优化全局细节交互与用户端文案。
- 补齐完整 App 注册/登录流程。
- 补齐小程序微信授权和邀请确认流程。
- 保持“唤醒你们的小东西”为第一体验。
- 产出可运行原型、截图、文档和验证交接。

## 2. 已完成内容

| 要求 | 完成证据 |
| --- | --- |
| App 注册/登录不前置 | 默认 route 仍为 `wake`，登录只在确认对象后触发。 |
| App 轻登录流程 | `src/components/AuthFlow.jsx` 覆盖手机号、验证码、轻资料三步。 |
| 登录后回到唤醒 | 完成 AuthFlow 后回到 `wakeStep = generating`。 |
| 小程序微信授权 | `MiniLinkScreen` 覆盖授权页、授权失败、重新授权。 |
| 小程序邀请确认 | 覆盖邀请预览、来源对象确认、我也确认、双方确认完成。 |
| 小程序失败兜底 | 覆盖授权失败和打开 App 失败，均保留链接/上下文。 |
| 小程序轻行动回流 | 轻行动完成后回到 `我们和桃桃`。 |
| 文案打磨 | 去掉“心灵信号”“AI 助手”“智能助手”“不解释产品”等用户端不合适表达。 |
| 交接文档更新 | `05-ai-native-prototype/README.md`、`dev-handoff.md`、`screenshots/CURRENT.md` 已同步。 |

## 3. 当前截图证据

当前 canonical 截图共 19 张，见：

```text
05-ai-native-prototype/screenshots/CURRENT.md
```

新增关键截图：

- `current-04-auth-phone.png`
- `current-05-auth-code.png`
- `current-06-auth-profile.png`
- `current-10-mini-invite-preview.png`
- `current-11-mini-wechat-auth.png`
- `current-12-mini-auth-failed.png`
- `current-13-mini-invite-review.png`
- `current-14-mini-confirmed.png`
- `current-15-mini-open-failed.png`
- `current-16-mini-light-action.png`
- `current-17-chat-return-from-mini.png`

## 4. 验证命令

构建验证：

```bash
cd /Users/renhaikun/Documents/商业化探索/05-ai-native-prototype
npm run build
```

结果：

```text
✓ built in 1.14s
```

交互验证：

```text
选择照片 -> 看识别结果 -> 保存并继续 -> 手机号 -> 验证码 -> 轻资料
-> 回到正在长出桃桃 -> 醒来 -> 发给另一半
-> 小程序微信授权 -> 授权失败 -> 重新授权
-> 我也确认 -> 先用一次桃桃 -> 回到我们和桃桃
```

Playwright 断言结果：

```json
{"wakeGenerating":1,"failedTitle":"刚刚没有授权成功","finalTitle":"我们和桃桃"}
```

## 5. 仍属于正式开发的真实能力

这些已在原型中以状态和交互表达，但正式开发需要接真实服务：

- 手机号验证码服务。
- 微信授权和 unionId/openId 绑定。
- 邀请 token 和状态回写。
- App deep link / universal link / 小程序回跳。
- 用户头像和昵称真实编辑。
- 服务端持久化和跨端同步。

## 6. 下一步开发建议

优先把以下对象落成接口契约：

1. `UserProfile`
2. `MiniLinkSession`
3. `CoupleBond`
4. `AwakenSession`
5. `TaotaoLife`
6. `TriadMessage`

实现顺序建议：

1. App seed + AuthFlow + AwakenSession。
2. App 邀请 token + 小程序 MiniLinkSession。
3. 小程序确认写回 CoupleBond。
4. 今日现场和我们和桃桃回流卡。
