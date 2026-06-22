# AI 能力与 Agent 架构

## 对外原则

用户只看到桃桃。不要把多个 Agent、模型、流程暴露给用户。

用户侧表达：

- 桃桃在想。
- 桃桃记住了。
- 桃桃帮你换个说法。
- 桃桃给你们三个选择。

实现层口径（不出现在用户端）：

- 多 Agent 编排。
- 上下文路由。
- 记忆管理。
- 安全拦截。
- 个性化生成。

## 总体架构

`用户输入 -> 上下文整理 -> 风险检查 -> Agent 路由 -> 生成候选 -> 桃桃口吻合成 -> 安全复检 -> 输出`

关键原则：

- 风险检查优先于生成。
- 所有输出都统一成桃桃口吻。
- 不暴露 Agent 名称。
- 不把技术术语写给用户。

## Agent 划分

### 1. Context Orchestrator

职责：

- 整理当前用户、关系、桃桃、场景、历史记忆。
- 判断输入属于吃什么、聊天、好好说、约会、回忆、投喂还是安全风险。
- 决定调用哪个 Agent。

输入：

- 当前对话。
- 双方昵称。
- 关系阶段。
- 桃桃性格。
- 近期记忆。
- 授权范围。

输出：

- 路由结果。
- 上下文摘要。
- 风险初筛。

### 2. Taotao Persona Agent

职责：

- 维护桃桃的人格、口吻、撒娇尺度和表达风格。
- 把所有功能输出改写成桃桃本人说的话。

约束：

- 不说教。
- 不装专家。
- 不制造内疚。
- 不强迫投喂。
- 不使用 AI 术语。

### 3. Daily Decision Agent

职责：

- 处理吃什么、去哪玩、今天做什么。
- 把选择变成轻松的共同决定。

输出：

- 2-3 个建议。
- 每个建议的理由。
- 适合谁。
- 下一步行动。
- 桃桃短评。

### 4. Tone Rewrite Agent

职责：

- 把用户输入的话改成更适合情侣沟通的表达。

模式：

- 温柔一点。
- 撒娇一点。
- 认真一点。
- 不委屈自己。
- 先降温。

安全边界：

- 不生成威胁。
- 不生成羞辱。
- 不生成冷暴力。
- 不帮助操控对方。

### 5. Date Inspiration Agent

职责：

- 生成约会、节日、纪念日、周末计划。

输入：

- 城市。
- 预算。
- 时间。
- 天气。
- 兴趣。
- 双方偏好。

输出：

- 轻计划。
- 备选方案。
- 准备事项。
- 可记录的回忆点。

### 6. Memory Curator Agent

职责：

- 把对话、行动和照片沉淀成共同回忆。
- 用桃桃口吻补一句温暖说明。

不做：

- 自动记录敏感争吵。
- 未授权抓取聊天记录。
- 翻旧账。
- 给关系打分。

### 7. Nest & Feeding Agent

职责：

- 管理投喂触发、小窝反馈、装扮反馈。

触发条件：

- 用户完成正向动作。
- 双方情绪较好。
- 用户没有近期拒绝投喂。
- 场景适合撒娇。

输出：

- 投喂文案。
- 档位建议。
- 桃桃反馈。
- 小窝变化。

关键规则：

- 明确允许“不投喂也没关系”。
- 不在负面情绪场景要钱。
- 不连续催促。
- 不把投喂和关系好坏绑定。

### 8. Safety Guardian Agent

职责：

- 识别控制、羞辱、威胁、跟踪、自伤、亲密关系暴力、明显操控等风险。

拦截场景：

- 要求定位追踪。
- 要求判断谁对谁错。
- 要求羞辱对方。
- 要求生成威胁文案。
- 要求诱导对方付费。
- 明显自伤或暴力风险。

降级方式：

- 桃桃先安抚。
- 建议暂停对话。
- 不继续生成攻击性内容。
- 提醒寻求现实帮助。

## 数据对象

### CoupleProfile

- couple_id
- partner_a
- partner_b
- bind_status
- anniversary_date
- region
- created_at

### TaotaoProfile

- taotao_id
- couple_id
- name
- avatar_source_type
- avatar_asset_url
- animation_asset_url
- personality
- speech_style
- current_mood
- current_energy
- current_wish

### RelationshipMemory

- memory_id
- couple_id
- title
- date
- source_scene
- image_urls
- taotao_note
- confirmed_by_a
- confirmed_by_b

### DailyAction

- action_id
- couple_id
- action_type
- input_summary
- output_summary
- completed
- created_at

### FeedingEvent

- feeding_id
- couple_id
- trigger_scene
- amount_tier
- item_name
- taotao_response
- nest_change
- created_at

### ConsentLog

- consent_id
- couple_id
- user_id
- action
- scope
- created_at

## 安全与隐私原则

- 用户上传照片必须明确授权。
- 生成桃桃前说明用途。
- 用户可以删除照片和生成形象。
- 共同回忆需要双方可见边界。
- 不默认抓取微信、短信、定位、通话等外部数据。
- 不提供监控对方的功能。
- 不做强制报备。

## AI 评测标准

每个核心能力都要有人工评测集：

- 是否像桃桃本人说话。
- 是否避免 AI 术语。
- 是否让用户更愿意行动。
- 是否没有站边裁决。
- 是否没有操控或羞辱。
- 是否在付费场景保持低压力。
