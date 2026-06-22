export const wakeStates = [
  {
    id: "upload",
    title: "唤醒你们的小东西",
    text: "放进一张照片，桃桃会先认出它，再帮它长出一点点性格。",
    primary: "选择一张照片",
    secondary: "先用默认小物",
  },
  {
    id: "recognizing",
    title: "桃桃正在看",
    text: "它先看清这个小东西，再决定怎么从这里醒来。",
    primary: "看识别结果",
    secondary: "换一张",
  },
  {
    id: "confirm-object",
    title: "桃桃认出了这个杯子",
    text: "它经常出现在你们的晚饭旁边，可以成为桃桃醒来的地方。",
    primary: "保存并继续",
    secondary: "重新识别",
  },
  {
    id: "generating",
    title: "正在长出桃桃",
    text: "桃桃正在熟悉这个小物和你们说话的方式，先让它安静醒一会儿。",
    primary: "看看它醒来",
    secondary: "先等一下",
  },
  {
    id: "awakened",
    title: "它醒了",
    text: "桃桃会记得你们的小现场，也会在两个人之间轻轻递话。",
    primary: "带另一半进来",
    secondary: "稍后再说",
  },
  {
    id: "invite-partner",
    title: "给另一半一条轻链接",
    text: "对方点开就能见到桃桃，不需要先读一整套说明。",
    primary: "发给另一半",
    secondary: "稍后再邀请",
  },
];

export const aiTags = [
  "识别：陶瓷杯",
  "共同使用",
  "晚饭场景",
];

export const objectCandidates = [
  ["陶瓷杯", "最像", "你们最近三次晚餐都带着它"],
  ["钥匙扣", "备选", "更像出门前的小物"],
  ["香薰", "备选", "背景里出现过一次"],
];

export const todayMoments = [
  {
    id: "dinner",
    time: "今晚 19:42",
    title: "今晚先让选择变少",
    text: "小雨不想选，阿川想配合。桃桃先帮你们把选择变少。",
    ambient: "桃桃看见了餐桌边的小犹豫",
    taotaoLine: "我先把远、贵、要排队的都放一边。",
    filterIntro: "先排除",
    filters: ["远", "贵", "要排队"],
    primary: "让桃桃先筛一下",
    selectedOption: "小馆子",
  },
  {
    id: "soften",
    time: "今晚 21:08",
    title: "这句话先轻一点",
    text: "小雨在等被理解，阿川怕说错。桃桃先递一个不讲道理的说法。",
    ambient: "桃桃听见一句还没说出口的话",
    taotaoLine: "我不站边，只帮这句话轻一点。",
    filterIntro: "先放下",
    filters: ["反问", "催促", "讲道理"],
    primary: "让桃桃帮我说轻点",
    selectedOption: "轻一点说",
  },
];

export const chatMessages = [
  {
    from: "her",
    name: "小雨",
    text: "我今天真的不想再选餐厅了。",
  },
  {
    from: "him",
    name: "阿川",
    text: "那就你说一个，我都可以。",
  },
  {
    from: "taotao",
    name: "桃桃",
    text: "我听见了：小雨今天不想再做决定，阿川想配合。那我先把选择变少。",
  },
];

export const actionCard = {
  source: "桃桃从刚才的话里听到",
  title: "今晚这件小事",
  evidence: "“我今天真的不想再选餐厅了。”",
  text: "我先给三家不用排队、单人 80 内、步行 12 分钟内的选项。你们只需要选一个氛围。",
  options: ["热汤面", "小馆子", "打包回家"],
};

export const memories = [
  {
    title: "第一次把它放在餐桌中间",
    date: "今天 20:14",
    tone: "双方待确认",
    text: "桃桃觉得这是一件小但可以反复想起的事。",
  },
  {
    title: "下雨天一起买的陶瓷杯",
    date: "05.28",
    tone: "已确认",
    text: "它后来一直在餐桌边，像一个固定的小暗号。",
  },
  {
    title: "她说今天想早点回家",
    date: "05.24",
    tone: "桃桃记住了",
    text: "当选择太多时，先把事情变少会更好。",
  },
];
