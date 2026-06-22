# 桃桃 V2 资产方向

## 0. 资产策略

V2 资产不再以卡通角色和 3D 图标为主。资产分三层：

1. ImageGen 源图：生成照片级场景、桃桃姿态、识别演示图和小窝变化源素材。
2. 运行时裁切图：App/小程序实际引用的照片裁切、透明角色、缩略图、识别占位。
3. 动态占位策略：当真实照片、生成图、桃桃动效或小窝物件未就绪时，保持体验完整。

总原则：

- 真实关系证据优先于装饰。
- 照片级资产优先于插画。
- 动态状态优先于静态大图。
- 所有运行时图必须可追溯到来源、裁切参数、授权状态和用途。

## 1. 目录建议

设计源目录：

```text
05-ai-native-design-system/assets/
  source/
    imagegen/
    user-photo-samples/
    references/
  runtime/
    photos/
    taotao/
    nest/
    chat/
    memory/
    invite/
    placeholders/
  motion/
    rive/
    lottie/
    poster/
  manifests/
    asset-manifest.v2.json
```

说明：

- `source/imagegen/` 保存原始生成图，不直接进 UI。
- `runtime/` 只保存 App/小程序可引用的处理后资产。
- `motion/` 保存动效源和 poster 帧。
- `manifests/` 记录文件名、尺寸、用途、来源、裁切参数、授权和状态。

## 2. ImageGen 源图

ImageGen 的目标不是生成花哨概念图，而是补齐真实产品需要的照片级语境和稳定角色姿态。

### 2.1 照片级生活场景

用于首页、回忆、小窝和唤醒示例。

清单：

| 源图 | 用途 | 画面要求 |
| --- | --- | --- |
| `home-table-evening-source.png` | 首页今日现场 | 两人晚饭前的桌面，暖光、真实餐具、无人物正脸 |
| `home-weekend-object-source.png` | 首页共同物件 | 纪念物、票根、钥匙扣或小礼物，单焦点 |
| `memory-food-source.png` | 晚饭回忆 | 餐桌局部，低饱和，不像广告图 |
| `memory-date-source.png` | 约会回忆 | 街角、展览票、咖啡杯等关系证据 |
| `awakening-object-source.png` | 唤醒示例 | 宠物玩具、植物、纪念物之一，主体清楚 |
| `invite-waiting-source.png` | 邀请等待 | 一张安静的桌面或小窝角落，适合等待状态 |

生成约束：

- 无 UI、无文字、无按钮、无 logo。
- 不出现可识别真实人脸。
- 不要库存摄影感笑脸情侣。
- 不要强滤镜、暗角、胶片边框。
- 主体位置要为裁切预留 15%-20% 安全边距。

### 2.2 桃桃 V2 姿态源图

桃桃 V2 不能像儿童宠物。它应该更小、更克制、更像关系现场旁边的生命提示。

风格要求：

- 尺寸感小：在页面里通常占画面高度 8%-18%，小窝可到 22%。
- 材质不强调毛绒玩具，不做幼态大头。
- 表情温和、少夸张。
- 可融入真实照片边缘或小窝空间。
- 保留可识别桃桃特征，但降低玩具感。

清单：

| 源图 | 运行时用途 | 动态需求 |
| --- | --- | --- |
| `taotao-v2-idle-source.png` | 首页、小窝、等待 | 呼吸、眨眼 |
| `taotao-v2-attention-source.png` | 看见对象、对方进入 | 轻转向 |
| `taotao-v2-thinking-source.png` | 生成、改写、识别 | 低头、微点 |
| `taotao-v2-positive-source.png` | 保存、确认、投喂成功 | 轻上浮 |
| `taotao-v2-calm-source.png` | 降温、错误、安全拦截 | 静止陪伴 |
| `taotao-v2-note-source.png` | 记小事、回忆生成 | 看向小纸条 |

禁止：

- 机械身体、屏幕脸、机器人眼。
- 幼儿玩具比例。
- 大红脸、夸张撒娇。
- 占满主视觉。
- 与照片主体争夺焦点。

### 2.3 小窝变化源图

小窝要像真实生活角落，不是虚拟商城房间。

清单：

| 源图 | 用途 |
| --- | --- |
| `nest-base-source.png` | 基础小窝空间 |
| `nest-warm-light-source.png` | 正向行动后灯光变化 |
| `nest-pudding-object-source.png` | 小布丁落位 |
| `nest-memory-frame-source.png` | 回忆照片摆件 |
| `nest-gift-corner-source.png` | 节日小礼物 |
| `nest-note-source.png` | 感谢小纸条 |

规则：

- 每个新增物件要能独立切出透明图。
- 小窝基础图与物件图要同光源、同透视。
- 物件不能像商品货架。
- 投喂物件不做价格视觉，不出现金币。

### 2.4 AI 识别演示源图

用于设计稿和空状态，不代表真实识别结果。

清单：

| 源图 | 用途 |
| --- | --- |
| `detect-pet-toy-source.png` | 宠物/玩具对象确认 |
| `detect-plant-source.png` | 植物对象确认 |
| `detect-ticket-source.png` | 票根/纪念物确认 |
| `detect-food-source.png` | 晚饭行动卡证据 |

规则：

- 源图不带识别框；识别框由 UI 层绘制。
- 主体边界清晰，便于展示框选。
- 不使用医疗、证件、私密照片。

## 3. 运行时裁切图

运行时图必须稳定、轻量、可追溯。

### 3.1 照片裁切

命名：

```text
photo-{scene}-{ratio}-{hash}.jpg
photo-home-4x5-a1b2.jpg
photo-memory-1x1-c3d4.jpg
```

规格：

| 用途 | 比例 | 建议尺寸 | 格式 |
| --- | --- | --- | --- |
| 首页主图 | 4:5 | 1200x1500 | JPG/WebP |
| 唤醒确认图 | 3:4 | 1200x1600 | JPG/WebP |
| 回忆卡 | 4:5 | 800x1000 | JPG/WebP |
| 聊天缩略图 | 1:1 | 512x512 | JPG/WebP |
| 小窝背景 | 9:16 或 4:5 | 1290x2796 / 1200x1500 | JPG/WebP |

必须记录：

- 原图 id。
- 裁切框 x/y/w/h。
- 焦点坐标。
- 授权状态。
- 是否双方可见。
- 生成/上传来源。

### 3.2 桃桃透明图与 poster

命名：

```text
taotao-v2-{state}@3x.png
taotao-v2-idle@3x.png
taotao-v2-thinking-poster@3x.png
```

规格：

- PNG/WebP 透明图。
- 角色主体居中，但保留 12%-18% 安全边距。
- 动效文件必须有 poster 静帧。
- 低端设备可退回 poster + transform 动效。

状态：

- idle
- attention
- thinking
- positive
- calm
- note
- fed
- waiting

### 3.3 聊天行动卡图

V2 聊天行动卡不需要大图标系统，只需要来源证据和少量语义图。

清单：

| 资产 | 用途 |
| --- | --- |
| `chat-evidence-photo-thumb` | 聊天引用照片缩略图 |
| `chat-action-dinner-mark` | 晚饭卡小标记 |
| `chat-action-rewrite-mark` | 好好说小标记 |
| `chat-action-memory-mark` | 记忆小标记 |
| `chat-action-date-mark` | 约会小标记 |

规则：

- 标记只做 16-20px 线性或实心小符号。
- 不做 3D 大图标。
- 卡片视觉由排版和生长动效完成。

### 3.4 小窝运行时物件

命名：

```text
nest-object-{type}-{variant}@3x.png
nest-object-pudding-default@3x.png
nest-object-memory-frame-01@3x.png
```

规格：

- 透明 PNG/WebP。
- 同一小窝透视。
- 需要落位参数：x/y/scale/zIndex。
- 需要新增前后状态，用于重放小窝变化。

## 4. 动态占位策略

占位不是空白，也不是装饰。占位要保持任务可继续。

### 4.1 真实照片缺失

场景：

- 用户未上传照片。
- 相册权限拒绝。
- 图片加载失败。
- 共同回忆暂无图片。

占位：

- 使用暖灰底 `#F2EEE9`。
- 中心不放大插画，只放轻文本和小桃桃 poster。
- 提供可恢复动作：`选择照片`、`换一张`、`继续用文字记录`。

禁止：

- 随机库存图。
- 彩色插画占满卡片。
- 以空状态阻断主流程。

### 4.2 桃桃动效缺失

场景：

- Rive/Lottie 加载失败。
- 低端设备。
- reduced motion。

占位：

- 使用对应状态 poster。
- 用 opacity 或文字状态表达变化。
- 保留核心文案和按钮。

降级表：

| 动效 | 降级 |
| --- | --- |
| idle 呼吸 | 静态 poster |
| thinking 微点 | 文案 `桃桃想一想` |
| positive 上浮 | check + toast |
| 小窝物件落位 | 前后静态图 + toast |
| 行动卡生长 | 卡片淡入 |

### 4.3 AI 识别失败

占位：

- 不显示错误代码。
- 照片保持可见。
- 文案：`桃桃没看清，可以自己点一下。`
- 动作：`手动选择`、`换一张`、`使用默认桃桃`。

### 4.4 小窝资产缺失

占位：

- 小窝基础图必须存在。
- 新物件加载失败时显示小纸条或 toast：`桃桃先记下了，晚点放进小窝。`
- 不回滚支付或保存状态的视觉反馈。

## 5. 资产与页面映射

### 5.1 首页

必需：

- 今日真实照片或小窝现场图。
- `taotao-v2-idle` 动效或 poster。
- 1 个主动作按钮。
- 轻 AI 识别标记可选。

可选：

- 最近回忆缩略图 1 张。
- 对方待确认状态图。

禁止：

- 5 个行动图标。
- 大 3D 场景图替代真实照片。

### 5.2 唤醒桃桃

必需：

- 用户上传照片或默认示例图。
- 识别框 UI 层。
- `taotao-v2-thinking`。
- 生成预览 poster/动效。

可选：

- 对象类型示例缩略图。
- 手动框选引导图。

### 5.3 三方群聊

必需：

- 桃桃小头像或状态点。
- typing 动效。
- 行动卡语义小标记。
- 照片引用缩略图。

禁止：

- 机器人头像。
- 大功能图标横排。
- AI 能力 banner。

### 5.4 小窝

必需：

- 小窝基础照片级图。
- 桃桃 idle/positive/calm。
- 小窝变化物件。
- 小纸条。

可选：

- 回忆照片摆件。
- 节日轻装饰。

禁止：

- 商品货架。
- 价格标签图。
- 金币、宝箱、等级徽章。

### 5.5 邀请等待

必需：

- 安静等待照片或小窝角落。
- 桃桃 waiting/idle poster。
- 双方头像占位。

禁止：

- 倒计时海报。
- 催促动效。
- 强分享裂变图。

## 6. Manifest 字段

每个运行时资产必须进入 manifest。

示例：

```json
{
  "id": "photo-home-4x5-a1b2",
  "path": "runtime/photos/photo-home-4x5-a1b2.webp",
  "type": "runtime_photo",
  "scene": "home",
  "ratio": "4:5",
  "width": 1200,
  "height": 1500,
  "sourceId": "home-table-evening-source",
  "sourceType": "imagegen",
  "crop": { "x": 120, "y": 80, "w": 960, "h": 1200 },
  "focalPoint": { "x": 0.52, "y": 0.44 },
  "visibility": "couple_shared",
  "permission": "generated_safe",
  "status": "ready"
}
```

必填字段：

- `id`
- `path`
- `type`
- `scene`
- `ratio`
- `width`
- `height`
- `sourceId`
- `sourceType`
- `status`

照片类额外必填：

- `crop`
- `focalPoint`
- `visibility`
- `permission`

动效类额外必填：

- `posterPath`
- `reducedMotionFallback`
- `durationMs`
- `loop`

## 7. 生产验收

### 7.1 源图验收

- 无 UI、无文字、无 logo。
- 主体清晰，主体安全边距足够。
- 不出现可识别真实人脸。
- 不像库存情侣广告。
- 不含儿童玩具感、宠物游戏感、金币商城感。

### 7.2 运行时图验收

- 文件名稳定。
- 尺寸符合页面比例。
- 移动端 390/430 宽度主体不被遮挡。
- 低端网络下有占位。
- manifest 可追溯到源图和裁切参数。
- 双方可见和授权状态明确。

### 7.3 动效资产验收

- 有 poster。
- 有 reduced motion fallback。
- 循环动效不超过注意力阈值。
- 不遮挡照片主体。
- 正向、降温、等待、错误状态动效区分清楚。

### 7.4 页面验收

- 首页主视觉是真实照片或照片级生活现场。
- 聊天行动卡使用上下文证据，不用功能图标宫格。
- 小窝变化能由非付费行动触发。
- 投喂资产不呈现充值、货架、金币、等级。
- 唤醒流程里 AI 证据微弱可见，但不暴露模型和技术术语。
