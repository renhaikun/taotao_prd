# 桃桃生产级产品对象与状态机总表

> 这份文档是开发和评审依据，不进入用户端手机界面。手机稿只展示用户真实会看到的 App 状态。

## 0. 核心原则

1. 聊天是主产品。小雨、阿川、桃桃是三人聊天，默认不是任务流。
2. 桃桃是第三个人，不是系统通知播报器。
3. 状态不是消息。已读、未读、失败、已看、已准奏、已驳回等，只能通过 UI 状态呈现。
4. 小事卡是通用事务对象。创建卡片就是创建一件事，不是默认推荐三个选项。
5. AI 能力是创建和处理对象的交互层，不替代对象本体。
6. AI 推荐、菜谱、总结属于消息内能力结果；小事卡属于结构化事务对象。
7. 顶部胶囊只做今天小事的索引和找回，点击后先进入今天的小事抽屉。
8. 保存、发送、上书是同一张小事卡的去向；上书/准奏是小事卡的一种确认模式。

## 1. 产品对象总表

| 对象 | 用户理解 | 核心字段 | 生成方式 | 可见性 | 展示位置 |
| --- | --- | --- | --- | --- | --- |
| ConversationThread | 三人聊天 | threadId, coupleId, participants, taotaoProfile | 登录绑定后创建 | 双方可见 | 聊天页 |
| Message | 一条聊天消息 | messageId, senderId, text, status, readState, quoteId, attachments | 用户或桃桃发送 | 按聊天可见性 | 消息流 |
| TaotaoUtterance | 桃桃作为第三个人说的话 | messageId, reason, tone, sourceIntent | 自然聊天或用户唤起 | 群聊或私聊 | 桃桃气泡 |
| AIResultCapsule | 消息内能力结果 | capsuleId, kind, sourceMessageId, status, progress, resultPayload | 明确请求 AI 能力 | 默认跟随来源消息 | 桃桃气泡下方 |
| ThingCard | 一件小事 | thingId, title, time, place, note, participants, reminder, requiresApproval, status, sourceMessageId, currentVersionId | 新建小事或 AI 结果转存 | 私有/共享 | 预览、详情、抽屉 |
| ThingDraft | 未发出草稿 | draftId, ownerId, fields, aiThread, updatedAt | 新建小事未完成 | 仅本人 | 私下半窗、个人胶囊 |
| Petition | 需要对方明确处理的小事 | thingId, initiatorId, reviewerId, reviewStatus, versionIds | ThingCard 选择上书 | 双方可见，修改草稿私有 | 群聊轻入口、详情 |
| TodayIndexItem | 顶部胶囊条目 | itemId, objectId, objectType, priority, status, sourceAnchor | 由小事/能力/异常派生 | 按对象可见性 | 顶部胶囊抽屉 |
| MemoryItem | 小窝记忆 | memoryId, text, sourceThingId, approvalStatus | 完成后轻沉淀 | 双方确认后共享 | 小窝/消息入口 |
| ReminderItem | 提醒 | reminderId, targetUserIds, time, permissionStatus | 小事卡字段或单独提醒 | 本人或双方 | 系统提醒、抽屉 |

## 2. 对象边界

| 场景 | 正确对象 | 不能做成 |
| --- | --- | --- |
| “今晚吃什么？” | 普通聊天，桃桃可以接话或生成 AIResultCapsule | 默认创建小事卡 |
| “那你给个做法” | AIResultCapsule: recipe | 自动弹半窗或创建事务卡 |
| “帮我建个今晚吃饭的小事” | ThingCard 创建流程 | 三个推荐选项 |
| “把这个保存一下” | AIResultCapsule 转 ThingCard 或保存结果 | 新开无来源卡片 |
| “发给他看看” | ThingCard 发送到群聊轻入口 | 具体按钮写成“发给阿川” |
| “需要他确认” | ThingCard 上书模式 | 另一套独立卡片类型 |
| 对方看过 | ThingCard/Petition 状态 | 桃桃主动发消息 |
| 发送失败 | Message/ThingCard 状态 | 桃桃主动解释一大段 |

## 3. 新建小事卡状态机

| 状态 | 用户看到 | 桃桃是否说话 | 可操作 | 下一步 |
| --- | --- | --- | --- | --- |
| private_entry | 新建小事半窗，常用类型，AI 输入 | 可自然问一句，帮助创建 | 创建、收起 | private_ai_composing |
| private_ai_composing | 用户和桃桃私聊补字段 | 是，围绕字段补齐 | 继续输入、创建、取消 | preview_ready |
| preview_ready | 小事卡预览：标题、时间、地点、备注、参与人 | 可短回执，不解释流程 | 保存、发送、上书、修改内容 | saved_private / send_confirm / petition_sending |
| saved_private | 只保存到本人今天的小事 | 不主动群聊发言 | 打开、修改、发送、上书、删除 | preview_ready 或 removed |
| send_confirm | 从私有变共享前确认 | 不需要额外解释 | 发送、取消 | send_sending |
| send_sending | 发送中，仍私有 | 不发群聊消息 | 无，或取消视实现 | shared_sent / send_failed |
| shared_sent | 群聊出现轻入口 | 桃桃可作为发送入口的承载消息 | 查看、回源 | shared_read |
| send_failed | 仍私有，显示失败和重试 | 不在群聊播报 | 重试、修改、保存 | send_sending / preview_ready |

## 4. AI 能力结果状态机

| 状态 | 用户看到 | 对象 | 下一步 |
| --- | --- | --- | --- |
| user_request | 用户在群聊里明确请求 | Message | taotao_reply |
| taotao_reply | 桃桃像第三个人回复一句 | TaotaoUtterance | capability_generating |
| capability_generating | 桃桃气泡下小胶囊显示进度 | AIResultCapsule | capability_ready / capability_failed |
| capability_ready | 小胶囊可点开结果 | AIResultCapsule | detail_open |
| detail_open | 结果详情，可输入修改方向 | AIResultCapsule | capability_updating |
| capability_updating | 回到原消息胶囊更新中 | AIResultCapsule | capability_updated / update_failed |
| capability_updated | 原消息胶囊变成已更新 | AIResultCapsule | 可保存为小事或继续改 |
| update_failed | 原消息胶囊变重试，旧结果不变 | AIResultCapsule | 重试或保留旧版 |

## 5. 上书 / 准奏状态机

| 状态 | 发起方视角 | 接收方视角 | 展示位置 | 下一步 |
| --- | --- | --- | --- | --- |
| petition_sending | 仍私有，发送中 | 不可见 | 私下半窗 | pending_partner / failed |
| pending_partner | 等对方看 | 等你看 | 群聊入口、顶部抽屉 | opened / withdraw |
| opened_no_decision | 对方看过，还没定 | 已打开详情 | 顶部胶囊/抽屉/入口状态 | approve / revise / reject / later |
| partner_revising_private | 发起方暂不变 | 接收方私下和桃桃改 | 私下半窗 | revision_preview |
| revision_returned | 对方改了，等你看 | 已发回 | 群聊入口、顶部抽屉 | approve / revise_again / reject_revision |
| approved | 已定 | 已定 | 胶囊低存在感、详情可回看 | settled |
| rejected | 已收起 | 已驳回 | 轻状态 | closed |
| closed | 整件小事结束 | 整件小事结束 | 抽屉归档 | archived |

## 6. 状态展示规则

| 状态类型 | 是否允许桃桃主动发言 | 正确展示 |
| --- | --- | --- |
| 消息发送中 | 否 | 消息气泡下状态 |
| 消息失败 | 否 | 原气泡失败态和重试 |
| 对方未读 | 否 | 发起方顶部胶囊/抽屉条目 |
| 对方已看 | 否 | 胶囊、抽屉、消息入口变轻 |
| 对方晚点 | 否，除非用户主动问 | 胶囊/抽屉状态 |
| 准奏 | 可以短回执，但不解释流程 | 详情和胶囊状态 |
| 驳回 | 可以由对方消息表达，桃桃不追问 | 详情和胶囊状态 |
| AI 结果生成 | 是，先自然回应再挂能力胶囊 | 桃桃气泡 + 小胶囊 |
| 安全边界 | 是，但只做安全回复 | 安全半窗 |

## 7. 顶部胶囊优先级

| 优先级 | 显示内容 | 点击后 |
| --- | --- | --- |
| 1 | 等我看 | 今天的小事抽屉，第一项为待我处理 |
| 2 | 发送失败 | 今天的小事抽屉，第一项为可重试 |
| 3 | 小草稿 | 今天的小事抽屉，显示个人草稿 |
| 4 | 对方看过 | 今天的小事抽屉，显示已看未定 |
| 5 | 已定 | 今天的小事抽屉，显示已定和可回看 |
| 6 | 今天的小事 0 件 | 空抽屉，可新建 |

## 8. 原型生产禁用项

手机稿中禁止出现：

- 开发字段：apiContract、analyticsKey、objectType、lifecycleStatus、visibilityScope、participantStatus。
- 内部说明：开发要点、展示逻辑、状态机、流程合同、用户视角、提案。
- 错误产品词：任务、工作流、房间、今日行动、AI 心灵信号。
- 创建小事通用流程中的三选项文案：三个选项、三个轻松选项、三个省心选项。
- 状态播报型桃桃文案：对方看过了、对方晚点看、未读、已送达、发送失败等由桃桃主动说出。

## 9. 当前原型修正清单

1. 私下创建链路 s3*：从“整理/三选项/晚饭推荐”改成“AI 辅助创建小事卡”。
2. 发送/上书链路 s3m-s4b：预览内容统一为小事卡字段，不再用三个推荐选项。
3. 草稿链路 s3b/s3c/s3d/s3e/s3j：草稿保存字段化，恢复后仍是小事卡，不是推荐结果。
4. 已看状态 s4c/s4e：移除桃桃主动播报，改为状态 UI。
5. 晚点/驳回 s4f/s4g：避免桃桃作为状态播报器，必要时使用系统轻状态或对方真实消息。
6. QA：增加禁用文案和状态/消息边界断言。

