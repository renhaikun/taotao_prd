export const parkWalkEvent = {
  id: "park-walk-tonight",
  type: "proposal",
  title: "今晚去公园",
  owner: "小雨",
  partner: "阿川",
  time: "20:30",
  place: "滨江公园东门",
  duration: "40 分钟",
  reminder: "20:10",
};

export function getParkWalkEventView(status = "suggested", viewerRole = "initiator") {
  const receiver = viewerRole === "receiver";
  const copyByStatus = {
    suggested: {
      label: receiver ? "等你回应" : "还没发出",
      dock: receiver ? "等你回应" : "准备发给阿川",
      capsule: "还没发出",
      tone: "active",
      chatLine: receiver
        ? "小雨想把今晚变简单一点，问你要不要一起去公园走走。"
        : "我整理成一个容易点头的小提议，要不要发给阿川？",
      trayTitle: receiver ? "小雨想今晚去公园" : "今晚去公园",
      trayText: receiver ? "先答一句就好，想改也可以。" : "20:30 · 滨江公园东门 · 40 分钟",
      actions: receiver
        ? [
            { id: "proposal-accept", label: "可以，20:30", kind: "primary", nextStatus: "accepted" },
            { id: "proposal-counter-time", label: "晚点 21:00", nextStatus: "countered" },
            { id: "proposal-snooze", label: "晚点再答", nextStatus: "snoozed" },
          ]
        : [
            { id: "proposal-send", label: "发给阿川", kind: "primary", nextStatus: "waiting_partner" },
            { id: "event-open-detail", label: "改一下", action: "detail" },
          ],
    },
    waiting_partner: {
      label: receiver ? "等你回应" : "等阿川点头",
      dock: receiver ? "等你回应" : "等阿川点头",
      capsule: receiver ? "小雨在等你一句话" : "已发出，等回应",
      tone: "waiting",
      chatLine: receiver
        ? "小雨想少做一个决定。她问你今晚 20:30 去滨江公园走走，可以吗？"
        : "我会等阿川回你，不催。",
      trayTitle: receiver ? "小雨想今晚去公园" : "已发给阿川",
      trayText: receiver ? "20:30 · 滨江公园东门 · 40 分钟" : "19:14 已查看",
      actions: receiver
        ? [
            { id: "proposal-accept", label: "可以，20:30", kind: "primary", nextStatus: "accepted" },
            { id: "proposal-counter-time", label: "晚点 21:00", nextStatus: "countered" },
            { id: "proposal-snooze", label: "晚点再答", nextStatus: "snoozed" },
          ]
        : [
            { id: "proposal-reminder", label: "提醒一次" },
            { id: "proposal-withdraw", label: "撤回" },
            { id: "event-open-detail", label: "打开详情", action: "detail" },
          ],
    },
    snoozed: {
      label: receiver ? "你晚点再答" : "阿川晚点再答",
      dock: "晚点再答",
      capsule: receiver ? "你说晚点再答" : "阿川说晚点再答",
      tone: "waiting",
      chatLine: receiver ? "我先让小雨知道你收到了。" : "阿川收到了，只是晚点再回你。",
      trayTitle: receiver ? "晚点再答" : "阿川晚点再答",
      trayText: receiver ? "回到这里还能继续点头或改一下。" : "不用重复发，等他回来就好。",
      actions: [
        { id: "event-open-detail", label: "打开详情", kind: "primary", action: "detail" },
      ],
    },
    countered: {
      label: "阿川想晚一点、近一点",
      dock: "等你看看改动",
      capsule: "阿川改成 21:00 · 楼下小公园",
      tone: "active",
      chatLine: "阿川想晚一点、近一点：21:00，楼下小公园。要不要就按这个？",
      trayTitle: "阿川改了一下",
      trayText: "20:30 滨江公园东门 → 21:00 楼下小公园",
      actions: [
        { id: "proposal-accept-counter", label: "就按这个来", kind: "primary", nextStatus: "accepted" },
        { id: "proposal-counter-time", label: "再提一个", nextStatus: "waiting_partner" },
      ],
    },
    accepted: {
      label: "你们约好了",
      dock: "今晚 20:30 已约好",
      capsule: "20:30 · 滨江公园东门",
      tone: "accepted",
      chatLine: "今晚 20:30，滨江公园东门。我会在 20:10 轻轻提醒一次。",
      trayTitle: "今晚 20:30 已约好",
      trayText: "回来后可以留一句，也可以什么都不留。",
      actions: [
        { id: "agreement-complete", label: "我们回来了", kind: "primary", nextStatus: "completed" },
        { id: "proposal-reminder", label: "提醒一次" },
        { id: "event-open-detail", label: "打开详情", action: "detail" },
      ],
    },
    completed: {
      label: "已走完",
      dock: "刚刚走完",
      capsule: "刚刚走完，要不要留一小段",
      tone: "done",
      chatLine: "你们回来了。今晚好像是把选择变少的一次。",
      trayTitle: "要不要留一句？",
      trayText: "不用写长，就一句。",
      actions: [
        { id: "chat-save-memory", label: "留下到小窝", kind: "primary", action: "saveMemory" },
        { id: "event-open-detail", label: "打开详情", action: "detail" },
        { id: "event-dismiss-memory", label: "不留下" },
      ],
    },
    memory_prompted: {
      label: "等你点头留下",
      dock: "等你点头留下",
      capsule: "小记忆草稿待确认",
      tone: "memory",
      chatLine: "我先写了一句。你点头后，还会等阿川确认。",
      trayTitle: "小记忆草稿",
      trayText: "双方点头后才会进小窝。",
      actions: [
        { id: "chat-save-memory", label: "我愿意留下", kind: "primary", action: "saveMemory" },
        { id: "event-open-detail", label: "改一句", action: "detail" },
        { id: "event-dismiss-memory", label: "不留下" },
      ],
    },
    converted_to_memory: {
      label: "已放进小窝",
      dock: "已放进小窝",
      capsule: "已放进小窝",
      tone: "saved",
      chatLine: "好，我收进小窝了。",
      trayTitle: "已放进小窝",
      trayText: "现在可以继续聊天。",
      actions: [
        { id: "event-go-memory", label: "去小窝", kind: "primary", action: "memories" },
      ],
    },
  };

  return copyByStatus[status] ?? copyByStatus.suggested;
}
