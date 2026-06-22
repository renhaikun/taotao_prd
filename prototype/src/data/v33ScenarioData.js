export const identityDefaults = {
  brandName: "桃桃",
  defaultLifeName: "桃桃",
  lifeDisplayName: "桃桃",
};

export const proposalScenario = {
  id: "park-walk-tonight",
  title: "今晚去公园走一圈？",
  sourceQuote: "今晚去公园走走？",
  initiatorName: "小雨",
  receiverName: "阿川",
  time: "20:30",
  counterTime: "21:00",
  place: "滨江公园东门",
  counterPlace: "楼下小公园",
  duration: "40 分钟",
  weather: "今晚有风，21:30 后会凉一点",
  distance: "步行 12 分钟",
  senderTrail: ["19:12 已送达", "19:14 已查看"],
  receiverQuickReplies: [
    { id: "accept", label: "可以，20:30" },
    { id: "counter-time", label: "晚点 21:00" },
    { id: "counter-place", label: "换楼下走一圈" },
    { id: "snooze", label: "晚点再答" },
  ],
};

export const sourceChoices = [
  {
    id: "upload",
    title: "上传一张照片",
    text: "让它从你们熟悉的小东西里醒来。",
  },
  {
    id: "default_embryo",
    title: "先用默认小物",
    text: "照片以后可以补，先让它学会陪你们说话。",
  },
  {
    id: "describe",
    title: "先用一句描述",
    text: "比如：那只总在餐桌边的杯子。",
  },
];

export const recognitionCandidates = [
  ["陶瓷杯", "最像", "你们最近三次晚餐都带着它"],
  ["钥匙扣", "备选", "更像出门前的小物"],
  ["香薰", "备选", "背景里出现过一次"],
];

export const v33ForbiddenUserCopy = [
  "当前步骤",
  "开发要点",
  "生产流程",
  "onboardingStep",
  "authStatus",
  "V3.1",
  "原型",
  "今日行动",
  "低压力",
  "回到聊天",
  "房间",
];
