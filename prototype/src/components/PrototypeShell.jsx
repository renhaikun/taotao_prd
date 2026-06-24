import {
  CheckCircle2,
  MessageCircle,
  Shell,
} from "lucide-react";

const navItems = [
  ["chat", "聊天", MessageCircle],
  ["memories", "小窝", Shell],
];

function getBottomItems(prototypeState) {
  return [
    ["chat", "聊天", MessageCircle],
    ["memories", "小窝", Shell],
  ];
}

const flowStages = [
  {
    id: "entry",
    title: "A. 进入聊天",
    route: "chat",
    owner: "App 入口",
    state: "未登录也能先聊一句",
    action: "打开 App 或继续会话",
    implementation: "先让用户感到桃桃在场；真正保存、生成和邀请时再进入手机号确认。",
  },
  {
    id: "auth",
    title: "B. 登录回流",
    route: "auth",
    owner: "安全入口",
    state: "手机号、验证码、昵称",
    action: "触发正式唤醒、上传或邀请",
    implementation: "登录完成后必须回到刚才那张卡，不让用户重新找入口。",
  },
  {
    id: "awakening",
    title: "C. 聊天式唤醒",
    route: "chat",
    owner: "创建桃桃",
    state: "选择来源、生成、预览",
    action: "选择来源、确认对象、生成桃桃",
    implementation: "所有能力都从聊天里自然长出来，先回应，再递出上传、候选和确认卡。",
  },
  {
    id: "invite",
    title: "D. 邀请确认",
    route: "chat",
    owner: "微信邀请",
    state: "已生成、待确认、想改一下",
    action: "生成微信卡片，等待另一半确认",
    implementation: "App 侧看进度，小程序侧只处理确认、轻改和晚点再答。",
  },
  {
    id: "mini",
    title: "E. 微信轻端",
    route: "mini",
    owner: "小程序",
    state: "预览、授权、确认、轻用一次",
    action: "确认桃桃或完成一次轻回应",
    implementation: "不显示 App 底部导航，只完成微信场景里最轻的一步。",
  },
  {
    id: "memory",
    title: "F. 记忆沉淀",
    route: "memories",
    owner: "小窝",
    state: "待确认、等另一半、已留下",
    action: "从聊天生成草稿并确认",
    implementation: "任何沉淀都需要两个人点头，确认后才能变成共同记忆。",
  },
];

const v6StateMatrix = [
  ["等待回应", "发起方看胶囊和底部提醒/撤回；接收方看回复动作"],
  ["对方轻改", "发起方只处理差异，底部给就按这个来"],
  ["已约好", "聊天里不放大卡，底部只给我们回来了"],
  ["已完成", "收成胶囊，底部给留下到小窝或不留下"],
  ["记忆待确认", "进小窝草稿，等待双方点头"],
];

function getCurrentFlow(route, prototypeState, isAuthed) {
  if (route === "auth") {
    return {
      id: "auth",
      stage: "auth",
      title: "B1 手机号登录",
      screen: "手机号登录",
      state: isAuthed ? "已经确认手机号" : "等待确认手机号",
      action: "输入手机号、验证码、轻资料",
      handoff: "完成后回到触发前的聊天卡片。",
    };
  }

  if (route === "memories") {
    return {
      id: "memory",
      stage: "memory",
      title: "F3 记忆确认",
      screen: "小窝",
      state: prototypeState.todayScene.memoryDraftStatus === "confirmed" ? "小事已经留下" : "有一件小事待确认",
      action: "确认聊天里生成的小事",
      handoff: "确认后出现在小窝，并更新这段关系的最近变化。",
    };
  }

  if (route === "today") {
    return {
      id: "daily",
      stage: "memory",
      title: "F1 今天这件事",
      screen: "今天",
      state: prototypeState.todayScene.selectedOption ? `已经选了${prototypeState.todayScene.selectedOption}` : "还没有选择",
      action: "让桃桃把眼前这件事变简单",
      handoff: "今天不是任务页，处理后回到聊天继续。",
    };
  }

  const step = prototypeState.chatRoom.onboardingStep;
  const titleByStep = {
    idle: isAuthed ? "C0 等待唤醒" : "A0 先聊一句",
    source: "C1 来源确认",
    generating: "C3 生成桃桃",
    preview: "C4 桃桃预览",
    self_confirmed: "C5 发起方确认",
    invite_created: "D1 微信邀请卡",
    bound: "F0 聊天回流",
  };
  const stateByStep = {
    idle: isAuthed ? "准备叫醒桃桃" : "初次认识桃桃",
    source: "正在确认来源小物",
    generating: "桃桃正在形成中",
    preview: "等待你确认桃桃",
    self_confirmed: "准备邀请另一半",
    invite_created: "邀请已经生成",
    bound: "两个人已经确认",
  };

  return {
    id: step,
    stage: step === "idle" && !isAuthed
      ? "entry"
      : ["invite_created"].includes(step)
        ? "invite"
        : step === "bound"
          ? "memory"
          : "awakening",
    title: titleByStep[step] ?? "A0 先聊一句",
    screen: "桃桃聊天",
    state: stateByStep[step] ?? "初次认识桃桃",
    action: isAuthed ? "根据当前卡片推进下一步" : "先确认手机号后继续唤醒",
    handoff: "聊天是主入口，桃桃先回应，再用场景卡推进上传、邀请和记忆。",
  };
}

function PhoneShell({ route, setRoute, children, showBottomNav, prototypeState }) {
  const bottomItems = getBottomItems(prototypeState);
  const lifeName = prototypeState?.identity?.lifeDisplayName ?? "桃桃";

  return (
    <section
      className="device-shell"
      aria-label="桃桃"
      data-prototype-version="v6"
      data-brand-name="桃桃"
      data-default-life-name="桃桃"
      data-life-display-name={lifeName}
    >
      <div className="phone-frame">
        <div className="phone-screen" data-testid="phone-screen">
          {children}
          {showBottomNav ? (
            <nav className="bottom-nav" aria-label="底部导航" data-testid="bottom-nav">
              {bottomItems.map(([id, label, Icon]) => (
                <button
                  className={route === id ? "active" : ""}
                  key={id}
                  type="button"
                  data-testid={`bottom-nav-${id}`}
                  onClick={() => setRoute(id)}
                >
                  <Icon size={route === id ? 20 : 18} strokeWidth={2.1} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function PrototypeShell({
  route,
  setRoute,
  children,
  showBottomNav,
  prototypeState,
  isAuthed,
  reviewMode = false,
  onSetViewerRole,
  onSetInviteStatus,
  onUpdateNegotiation,
  onRenameLife,
  onUseDefaultSource,
  onMarkSourceUnusable,
  onFailGeneration,
}) {
  const currentFlow = getCurrentFlow(route, prototypeState, isAuthed);

  if (!reviewMode) {
    return (
      <main
        className="app-stage"
        data-testid="app-shell"
        data-prototype-version="v6"
        data-surface="app"
        data-route={route}
        data-auth-status={isAuthed ? "verified" : "guest"}
      >
        <PhoneShell route={route} setRoute={setRoute} showBottomNav={showBottomNav} prototypeState={prototypeState}>
          {children}
        </PhoneShell>
      </main>
    );
  }

  return (
    <main
      className="prototype-stage"
      data-testid="app-shell"
      data-prototype-version="v6"
      data-surface="review"
      data-route={route}
      data-auth-status={isAuthed ? "verified" : "guest"}
    >
      <aside className="prototype-rail" aria-label="原型导航">
        <div className="brand-lockup">
          <div className="brand-mark">桃</div>
          <div>
            <strong>桃桃</strong>
            <span>产品流程评审</span>
          </div>
        </div>

        <section
          className="flow-panel"
          data-testid="flow-panel"
          data-current-route={route}
          data-current-step={currentFlow.id}
        >
          <div className="flow-panel-eyebrow">当前画面</div>
          <h2>{currentFlow.title}</h2>
          <dl className="flow-current-meta">
            <div>
              <dt>画面</dt>
              <dd>{currentFlow.screen}</dd>
            </div>
            <div>
              <dt>此刻状态</dt>
              <dd>{currentFlow.state}</dd>
            </div>
            <div>
              <dt>用户可以做</dt>
              <dd>{currentFlow.action}</dd>
            </div>
            <div>
              <dt>交付提醒</dt>
              <dd>{currentFlow.handoff}</dd>
            </div>
          </dl>
        </section>

        <section className="review-controls" aria-label="V6 状态切换">
          <span>V6 评审切换</span>
          <div className="review-control-row">
            <button type="button" onClick={() => onSetViewerRole?.("initiator")}>发起方</button>
            <button type="button" onClick={() => onSetViewerRole?.("receiver")}>接收方</button>
            <button type="button" onClick={() => onRenameLife?.("小白")}>示例改名</button>
          </div>
          <div className="review-control-row">
            <button type="button" onClick={() => onUpdateNegotiation?.("waiting_partner")}>等待回应</button>
            <button type="button" onClick={() => onUpdateNegotiation?.("countered")}>对方轻改</button>
            <button type="button" onClick={() => onUpdateNegotiation?.("accepted")}>已约好</button>
            <button type="button" onClick={() => onUpdateNegotiation?.("memory_prompted")}>建议留下</button>
          </div>
          <div className="review-control-row">
            <button type="button" onClick={() => onSetInviteStatus?.("opened")}>邀请已打开</button>
            <button type="button" onClick={() => onSetInviteStatus?.("countered")}>邀请想改</button>
            <button type="button" onClick={() => onSetInviteStatus?.("later")}>邀请晚点</button>
            <button type="button" onClick={() => onSetInviteStatus?.("expired")}>邀请过期</button>
          </div>
          <div className="review-control-row">
            <button type="button" onClick={onUseDefaultSource}>默认来源</button>
            <button type="button" onClick={onMarkSourceUnusable}>来源看不清</button>
            <button type="button" onClick={onFailGeneration}>生成失败</button>
          </div>
        </section>

        <section className="v6-state-matrix" data-testid="v6-state-matrix" aria-label="V6 状态矩阵">
          <span>V6 展示规则</span>
          {v6StateMatrix.map(([state, rule]) => (
            <article key={state}>
              <strong>{state}</strong>
              <p>{rule}</p>
            </article>
          ))}
        </section>

        <section className="flow-timeline" aria-label="生产流程步骤">
          {flowStages.map((stage) => {
            const active = currentFlow.stage === stage.id;
            return (
              <article className={active ? "active" : ""} key={stage.id}>
                <CheckCircle2 size={15} />
                <div>
                  <strong>{stage.title}</strong>
                  <span>{stage.owner} · {stage.state}</span>
                  <p>{stage.implementation}</p>
                </div>
              </article>
            );
          })}
        </section>

        <nav className="rail-nav" data-testid="rail-nav" aria-label="评审跳转">
          {navItems.map(([id, label, Icon]) => (
            <button
              className={route === id ? "active" : ""}
              key={id}
              type="button"
              data-testid={`rail-nav-${id}`}
              onClick={() => setRoute(id)}
            >
              <Icon size={17} strokeWidth={2.1} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <PhoneShell route={route} setRoute={setRoute} showBottomNav={showBottomNav} prototypeState={prototypeState}>
        {children}
      </PhoneShell>
    </main>
  );
}
