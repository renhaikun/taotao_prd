export const v7TaotaoBoardVersion = "V7.9";

export const taotaoPagePrinciples = [
  "从聊天进入，不做一级 Tab",
  "MVP 只做身份、改名、日历回看",
  "形象、装扮、照片生成后置",
  "手机稿只放用户能看到的内容",
];

const baseContract = {
  owner: "product-design",
  priority: "P1",
  visibilityScope: "current_user",
  apiContract: "GET /api/taotao/life",
};

function makeDefaultCalendar() {
  return {
    month: "6月",
    activeDay: 23,
    markers: [18, 20, 22, 23],
    items: [
      { date: 23, title: "今晚吃饭", meta: "已定" },
      { date: 23, title: "番茄炒蛋", meta: "做法" },
      { date: 23, title: "热汤面", meta: "已定" },
      { date: 22, title: "热汤面", meta: "已定" },
      { date: 20, title: "周六看展", meta: "等对方看" },
    ],
  };
}

function makeTaotaoState(config) {
  return {
    ...baseContract,
    ...config,
    analyticsKey: config.analyticsKey ?? `taotao_v79_${config.id}`,
    contract: {
      trigger: config.contract.trigger,
      surface: config.contract.surface,
      visibleTo: config.contract.visibleTo,
      next: config.contract.next,
      recovery: config.contract.recovery,
    },
  };
}

export const taotaoPageFlows = [
  {
    id: "chat_entry",
    title: "从聊天进入",
    summary: "桃桃页不是底部导航，它从聊天关系栏或桃桃头像自然进入。",
    trigger: "用户在聊天里点桃桃头像",
    recovery: "返回聊天后保持原聊天上下文",
    stateIds: ["tp0_chat_entry", "tp1_life_default"],
  },
  {
    id: "rename",
    title: "修改名字",
    summary: "用户可以直接在桃桃页改名；不弹半窗，不打断页面上下文。",
    trigger: "用户点名字旁的改名",
    recovery: "保存后名字行回到展示态，失败时停留在当前行",
    stateIds: ["tp2_name_editing", "tp3_name_saved", "tp4_name_failed"],
  },
  {
    id: "calendar_review",
    title: "日历回看",
    summary: "用日历承接聊天里自然形成的小事，不做随机列表，也不提前塞小窝和装扮能力。",
    trigger: "用户点桃桃页日历",
    recovery: "左上返回桃桃页，点日期里的小事回聊天源位置",
    stateIds: ["tp5_calendar_open", "tp6_calendar_empty", "tp7_calendar_return_chat"],
  },
];

export const taotaoPageStates = [
  makeTaotaoState({
    id: "tp0_chat_entry",
    flowId: "chat_entry",
    title: "聊天里的入口",
    lifecycleStatus: "entry",
    lifeStatus: "awake",
    viewerRole: "initiator",
    phone: {
      kind: "chat",
      lifeName: "桃桃",
      capsule: ["今天的小事", "2 件"],
      messages: [
        ["her", "晚上想吃点热的。"],
        ["him", "那我下班绕一下。"],
        ["taotao", "我押一个：今天适合热汤面。"],
      ],
    },
    contract: {
      trigger: "聊天顶部桃桃头像或桃桃消息头像",
      surface: "聊天主界面",
      visibleTo: "当前用户",
      next: "进入桃桃页默认态",
      recovery: "不改变聊天状态",
    },
  }),
  makeTaotaoState({
    id: "tp1_life_default",
    flowId: "chat_entry",
    title: "桃桃页默认态",
    lifecycleStatus: "ready",
    lifeStatus: "awake",
    viewerRole: "initiator",
    phone: {
      kind: "life",
      lifeName: "桃桃",
      calendar: makeDefaultCalendar(),
    },
    contract: {
      trigger: "进入桃桃页",
      surface: "桃桃页",
      visibleTo: "当前用户",
      next: "可改名、看日历、回到聊天",
      recovery: "聊天入口保留在顶部",
    },
  }),
  makeTaotaoState({
    id: "tp2_name_editing",
    flowId: "rename",
    title: "改名编辑",
    lifecycleStatus: "editing",
    lifeStatus: "awake",
    viewerRole: "initiator",
    apiContract: "PATCH /api/taotao/life/name",
    phone: {
      kind: "rename",
      lifeName: "桃桃",
      draftName: "糯米",
      renameState: "editing",
      calendar: makeDefaultCalendar(),
    },
    contract: {
      trigger: "点改名",
      surface: "桃桃页内联改名",
      visibleTo: "当前用户",
      next: "保存或返回",
      recovery: "保持在桃桃页",
    },
  }),
  makeTaotaoState({
    id: "tp3_name_saved",
    flowId: "rename",
    title: "改名完成",
    lifecycleStatus: "saved",
    lifeStatus: "awake",
    viewerRole: "initiator",
    apiContract: "PATCH /api/taotao/life/name",
    phone: {
      kind: "rename",
      lifeName: "糯米",
      draftName: "糯米",
      renameState: "saved",
      calendar: makeDefaultCalendar(),
    },
    contract: {
      trigger: "名字保存成功",
      surface: "桃桃页内联改名",
      visibleTo: "当前用户",
      next: "名字行回到展示态，聊天关系栏同步新名字",
      recovery: "回到桃桃页默认态",
    },
  }),
  makeTaotaoState({
    id: "tp4_name_failed",
    flowId: "rename",
    title: "保存失败",
    lifecycleStatus: "failed",
    lifeStatus: "awake",
    viewerRole: "initiator",
    apiContract: "PATCH /api/taotao/life/name",
    phone: {
      kind: "rename",
      lifeName: "桃桃",
      draftName: "糯米",
      error: "保存失败",
      renameState: "failed",
      calendar: makeDefaultCalendar(),
    },
    contract: {
      trigger: "网络或服务失败",
      surface: "桃桃页内联改名",
      visibleTo: "当前用户",
      next: "重试或返回",
      recovery: "保留原名桃桃",
    },
  }),
  makeTaotaoState({
    id: "tp5_calendar_open",
    flowId: "calendar_review",
    title: "日历展开",
    lifecycleStatus: "index_open",
    lifeStatus: "awake",
    viewerRole: "initiator",
    phone: {
      kind: "calendar",
      lifeName: "桃桃",
      calendar: {
        month: "6月",
        activeDay: 23,
        markers: [5, 12, 18, 20, 22, 23],
        items: [
          { date: 23, title: "今晚吃饭", meta: "已定" },
          { date: 23, title: "番茄炒蛋", meta: "做法" },
          { date: 23, title: "热汤面", meta: "已定" },
          { date: 22, title: "热汤面", meta: "已定" },
          { date: 20, title: "周六看展", meta: "等对方看" },
          { date: 5, title: "一起看日落", meta: "已定" },
        ],
      },
    },
    contract: {
      trigger: "用户点开日历",
      surface: "桃桃页日历",
      visibleTo: "当前用户",
      next: "点一条回聊天源位置",
      recovery: "左上返回桃桃页，点小事回聊天源位置",
    },
  }),
  makeTaotaoState({
    id: "tp6_calendar_empty",
    flowId: "calendar_review",
    title: "空日历",
    lifecycleStatus: "empty",
    lifeStatus: "awake",
    viewerRole: "initiator",
    phone: {
      kind: "empty",
      lifeName: "桃桃",
      calendar: {
        month: "6月",
        activeDay: 23,
        markers: [],
        items: [],
      },
    },
    contract: {
      trigger: "新用户还没有形成小事",
      surface: "桃桃页日历",
      visibleTo: "当前用户",
      next: "返回桃桃页",
      recovery: "聊天里产生小事后，日历自动出现内容",
    },
  }),
  makeTaotaoState({
    id: "tp7_calendar_return_chat",
    flowId: "calendar_review",
    title: "回到聊天",
    lifecycleStatus: "returned",
    lifeStatus: "awake",
    viewerRole: "initiator",
    phone: {
      kind: "chat",
      lifeName: "桃桃",
      capsule: ["今晚吃饭", "已定"],
      messages: [
        ["her", "晚上想吃点热的。"],
        ["him", "那我下班绕一下。"],
        ["taotao", "我押一个：今天适合热汤面。"],
        ["her", "那就这个。"],
      ],
    },
    contract: {
      trigger: "点聊天入口或日历小事",
      surface: "聊天主界面",
      visibleTo: "当前用户",
      next: "继续三人聊天",
      recovery: "保持源消息和顶部胶囊可找回",
    },
  }),
];

export function getV7TaotaoBoardStats() {
  return {
    flowCount: taotaoPageFlows.length,
    stateCount: taotaoPageStates.length,
    renameCount: taotaoPageStates.filter((state) => state.flowId === "rename").length,
    calendarCount: taotaoPageStates.filter((state) => state.flowId === "calendar_review").length,
  };
}
