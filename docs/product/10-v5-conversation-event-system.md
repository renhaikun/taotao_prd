# 桃桃 V5 对话事件系统规格

## 1. 结论

V5 的核心不是新增卡片，而是把“卡片”降级为 ConversationEvent 的展示形态。

用户在聊天里说一句话，桃桃识别出一件可以被推进的小事；这件事可以展开、收起、被找回、被再次唤醒，完成后才有资格进入小窝。

```text
一句话触发
-> 桃桃理解
-> 生成事件草稿
-> 双方动作
-> 轻量收起
-> 详情唤醒
-> 完成后沉淀小窝
```

## 2. V4 的 P0 问题

- 大卡片长期占据聊天主区域，聊天像任务页。
- 等待、已约好、已完成、建议留下都用同一张大卡表达，业务状态和展示状态混在一起。
- 完成后没有回收机制，用户不知道这件事该放哪里、从哪里再找回来。
- 小窝像页面跳转，不像从源事件自然沉淀出的共同资产。
- 手机画面不能出现评审态按钮，评审切换只能在 review rail。

## 3. V5 状态分层

每个对话事件拆四层：

```text
eventStatus：这件事本身进行到哪一步
participantStatus：双方各自是否看见、回应、点头
displayStatus：聊天里怎么显示，expanded / compact / sheet
memoryStatus：是否可沉淀，none / eligible / draft / pending_partner / confirmed
```

当前原型先落地 ProposalEvent，后续 ChoiceEvent、SayBetterEvent、ReminderEvent 和 MemoryEvent 复用同一协议。

## 4. 展示规则

- 聊天里同一时间最多只展开一个主事件。
- 需要本人立即做决定时，事件可以展开。
- 已发送等待、已约好、已完成、已过期、已拒绝，都应自动收起为事件胶囊。
- 事件胶囊展示一句摘要，不解释产品逻辑。
- 点击事件胶囊打开 EventDetailSheet。
- EventDetailSheet 承载源消息、当前状态、双方记录、提醒、撤回、留下到小窝。

## 5. 当前落地的 ProposalEvent

示例事件：

```text
小雨：今晚去公园走走？
桃桃：小雨想今晚 20:30 去滨江公园，你要不要接一下？
阿川：可以。
事件：今晚去公园 · 已约好
完成后：今晚去公园 · 已走完 · 可以留下
```

已落地状态：

- accepted：事件展开，用户可标记“我们回来了”。
- completed：事件自动收起为胶囊。
- detail sheet：点击胶囊查看双方记录。
- memory draft：在 sheet 中点“留下到小窝”生成小窝草稿。
- pending partner：用户点“我愿意留下”后，只显示“等阿川点头”。

## 6. 小窝回收规则

- 未完成事件不进小窝。
- 完成事件只获得 memory eligible，不自动保存。
- 一方点头后进入 pending partner。
- 双方点头后才成为 MemoryItem。
- 当前用户不能替另一半确认。

## 7. 后续排期建议

M1 继续扩展到五类事件：

- ChoiceEvent：吃什么、去哪、看什么。
- SayBetterEvent：好好说、改写一句话。
- ReminderEvent：轻提醒、只提醒一次。
- MemoryEvent：完成后沉淀。
- LifeCreationEvent：创建桃桃和邀请确认也改为事件协议。

M2 增加多事件共存：

- 顶部待处理数。
- 事件抽屉完整列表。
- 输入区 context chip。
- 桃桃页“现在要处理”。
- 小窝 tab 待确认角标。
