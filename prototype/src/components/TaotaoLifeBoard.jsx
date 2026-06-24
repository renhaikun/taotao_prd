import {
  ArrowLeft,
  ArrowUp,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Layers3,
  MessageCircle,
  PencilLine,
  Plus,
} from "lucide-react";
import {
  getV7TaotaoBoardStats,
  taotaoPageFlows,
  taotaoPagePrinciples,
  taotaoPageStates,
  v7TaotaoBoardVersion,
} from "../data/v7TaotaoBoardData";
import { Taotao } from "./Taotao";

export function TaotaoLifeBoard() {
  const stats = getV7TaotaoBoardStats();
  const stateById = new Map(taotaoPageStates.map((state, index) => [state.id, { state, index }]));
  const usedStateIds = new Set();

  const flows = taotaoPageFlows.map((flow, flowIndex) => {
    const states = flow.stateIds
      .map((stateId) => stateById.get(stateId))
      .filter(Boolean);

    states.forEach((entry) => usedStateIds.add(entry.state.id));
    return { ...flow, flowIndex, states };
  });

  const unmappedStates = taotaoPageStates
    .map((state, index) => ({ state, index }))
    .filter((entry) => !usedStateIds.has(entry.state.id));

  return (
    <main
      className="chatboard-stage taotao-life-board"
      data-testid="app-shell"
      data-surface="taotao"
      data-prototype-version="v7.9"
    >
      <header className="chatboard-hero taotao-board-hero" data-testid="v7-taotao-board-overview">
        <div className="chatboard-title">
          <div className="chatboard-mark">
            <Taotao mood="awake" compact />
          </div>
          <div>
            <span>桃桃 {v7TaotaoBoardVersion}</span>
            <h1>桃桃页评审状态板</h1>
            <p>从聊天进入的轻档案页，只承接身份、改名和日历回看；形象生成、装扮和小窝深功能后置。</p>
          </div>
        </div>
        <div className="chatboard-metrics">
          <Metric icon={Layers3} value={stats.flowCount} label="生产链路" />
          <Metric icon={CheckCircle2} value={stats.stateCount} label="手机状态" />
          <Metric icon={PencilLine} value={stats.renameCount} label="改名状态" />
          <Metric icon={CalendarDays} value={stats.calendarCount} label="日历状态" />
          <Metric icon={MessageCircle} value={1} label="聊天入口" />
        </div>
      </header>

      <section className="chatboard-principles" data-testid="v7-taotao-board-rules">
        {taotaoPagePrinciples.map((principle) => (
          <span key={principle}>{principle}</span>
        ))}
      </section>

      <section className="chatboard-journeys" data-testid="v7-taotao-board">
        <div className="chatboard-journeys-head">
          <span>V7.9 链路化手机稿</span>
          <div>
            <strong>按桃桃页的真实使用顺序评审</strong>
            <p>每一排是一条功能链路，手机屏幕里只放用户会看到的界面；研发说明在手机稿外侧。</p>
          </div>
        </div>

        {flows.map((flow) => (
          <section
            className="chat-flow-lane taotao-flow-lane"
            data-testid="taotao-flow-lane"
            data-flow-id={flow.id}
            data-state-count={flow.states.length}
            key={flow.id}
          >
            <header className="chat-flow-header">
              <span>{String(flow.flowIndex + 1).padStart(2, "0")}</span>
              <div>
                <strong>{flow.title}</strong>
                <p>{flow.summary}</p>
              </div>
              <em>{flow.stateIds.length} 个状态</em>
            </header>

            <div className="chat-flow-meta">
              <span>触发：{flow.trigger}</span>
              <span>回收：{flow.recovery}</span>
            </div>

            <div className="chat-step-state-strip taotao-state-strip" data-testid="taotao-state-strip">
              {flow.states.map((entry) => (
                <div
                  className="chat-step-state-slot taotao-state-slot"
                  data-testid="taotao-state-slot"
                  data-slot-state-id={entry.state.id}
                  key={entry.state.id}
                >
                  <TaotaoStateCard state={entry.state} index={entry.index} />
                </div>
              ))}
            </div>
          </section>
        ))}

        {unmappedStates.length ? (
          <section className="chat-flow-lane unmapped" data-testid="taotao-unmapped-state">
            <header className="chat-flow-header">
              <span>!</span>
              <div>
                <strong>未归入链路</strong>
                <p>这些状态需要补进桃桃页流程。</p>
              </div>
              <em>{unmappedStates.length} 个状态</em>
            </header>
          </section>
        ) : null}
      </section>
    </main>
  );
}

function Metric({ icon: Icon, value, label }) {
  return (
    <div className="chatboard-metric">
      <Icon size={17} />
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function TaotaoStateCard({ state, index }) {
  return (
    <article
      className={`taotao-board-state state-${state.phone.kind}`}
      data-testid="taotao-board-state"
      data-state-id={state.id}
      data-flow-id={state.flowId}
      data-life-status={state.lifeStatus}
      data-viewer-role={state.viewerRole}
      data-visibility-scope={state.visibilityScope}
      data-lifecycle-status={state.lifecycleStatus}
      data-priority={state.priority}
      data-owner={state.owner}
      data-api-contract={state.apiContract}
      data-analytics-key={state.analyticsKey}
    >
      <TaotaoPhone state={state} />

      <header className="chat-state-head">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <div>
          <h2>{state.title}</h2>
          <p>{state.contract.trigger}</p>
        </div>
      </header>

      <div className="chat-state-tags">
        <span>{state.flowId}</span>
        <span>{state.lifecycleStatus}</span>
        <span>{state.visibilityScope}</span>
        <span>{state.apiContract}</span>
      </div>

      <div className="taotao-state-contract" data-testid="taotao-state-contract">
        <ContractRow label="界面" text={state.contract.surface} />
        <ContractRow label="可见" text={state.contract.visibleTo} />
        <ContractRow label="下一步" text={state.contract.next} />
        <ContractRow label="回收" text={state.contract.recovery} />
      </div>
    </article>
  );
}

function ContractRow({ label, text }) {
  return (
    <div>
      <span>{label}</span>
      <p>{text}</p>
    </div>
  );
}

function TaotaoPhone({ state }) {
  const phone = state.phone;

  return (
    <div className={`taotao-page-preview kind-${phone.kind}`} data-testid="taotao-page-preview" data-phone-kind={phone.kind}>
      <div className="taotao-phone-screen">
        <div className="chat-statusbar" aria-hidden="true">
          <span>9:41</span>
          <span>5G  82%</span>
        </div>
        {phone.kind === "chat" ? <ChatPreview phone={phone} /> : null}
        {phone.kind === "life" ? <LifePreview phone={phone} /> : null}
        {phone.kind === "rename" ? <RenamePreview phone={phone} /> : null}
        {phone.kind === "calendar" ? <CalendarPreview phone={phone} /> : null}
        {phone.kind === "empty" ? <EmptyPreview phone={phone} /> : null}
      </div>
    </div>
  );
}

function ChatPreview({ phone }) {
  return (
    <>
      <div className="taotao-phone-header">
        <button className="taotao-entry-cluster" type="button" data-testid="taotao-chat-entry-cluster" aria-label="查看桃桃">
          <RelationAvatars focusTaotao />
        </button>
        <span className="taotao-chat-date">今天</span>
      </div>
      <button className="chat-context-capsule idle taotao-board-capsule" type="button">
        <span className="chat-capsule-orb" />
        <span className="chat-capsule-copy">
          <strong>{phone.capsule[0]}</strong>
          <em>{phone.capsule[1]}</em>
        </span>
        <span className="chat-capsule-add" aria-label="新建小事">
          <Plus size={13} />
        </span>
      </button>
      <div className="taotao-board-chat-stream">
        {phone.messages.map(([speaker, text], index) => (
          <MessageBubble speaker={speaker} text={text} key={`${speaker}-${index}`} />
        ))}
      </div>
      <div className="chat-composer taotao-board-composer" data-testid="taotao-chat-composer">
        <button className="chat-composer-action chat-composer-add" type="button" aria-label="新建小事">
          <Plus size={16} />
        </button>
        <span className="chat-composer-field" role="textbox" aria-label="输入消息" />
        <button className="chat-composer-action chat-composer-submit" type="button" aria-label="发送">
          <ArrowUp size={17} />
        </button>
      </div>
    </>
  );
}

function LifePreview({ phone }) {
  return <TaotaoProfileSurface phone={phone} />;
}

function RenamePreview({ phone }) {
  return <TaotaoProfileSurface phone={phone} />;
}

function TaotaoProfileSurface({ phone }) {
  const renameState = phone.renameState ?? "idle";
  const isEditing = renameState === "editing";
  const isSaved = renameState === "saved";
  const isFailed = renameState === "failed";
  const isRenaming = isEditing || isFailed;

  return (
    <div className="taotao-life-surface">
      <LifeTopbar />
      <section className={`taotao-profile-card ${renameState}`} data-testid="taotao-life-home">
        <div className="taotao-profile-orbit">
          <Taotao mood="awake" compact />
        </div>
        <div className="taotao-profile-copy">
          {isRenaming ? (
            <label className={`taotao-inline-name-input ${isFailed ? "error" : ""}`} data-testid="taotao-rename-inline">
              <input value={phone.draftName} readOnly aria-label="名字" />
              <button className="taotao-inline-name-check" type="button" aria-label={isFailed ? "重试保存名字" : "保存名字"}>
                <Check size={15} />
              </button>
            </label>
          ) : (
            <div className="taotao-inline-name-display" data-testid={isSaved ? "taotao-name-saved" : "taotao-name-display"}>
              <strong>{phone.lifeName}</strong>
              <button className="taotao-inline-name-edit" type="button" aria-label="改名">
                <PencilLine size={13} />
              </button>
            </div>
          )}
          {isFailed ? <p role="alert">{phone.error}</p> : null}
        </div>
      </section>
      <CalendarPanel calendar={phone.calendar} />
    </div>
  );
}

function CalendarPreview({ phone }) {
  return (
    <div className="taotao-life-surface">
      <LifeTopbar level="calendar" />
      <section className="taotao-life-title-row calendar-title">
        <strong>日历</strong>
      </section>
      <CalendarPanel calendar={phone.calendar} expanded />
    </div>
  );
}

function EmptyPreview({ phone }) {
  return (
    <div className="taotao-life-surface">
      <LifeTopbar level="calendar" />
      <section className="taotao-life-title-row calendar-title">
        <strong>日历</strong>
      </section>
      <CalendarPanel calendar={phone.calendar} empty />
    </div>
  );
}

function LifeTopbar({ level = "chat" }) {
  const isCalendarLevel = level === "calendar";

  return (
    <div className="taotao-life-topbar" data-testid="taotao-life-topbar">
      <button
        className={`taotao-life-backline ${isCalendarLevel ? "calendar-level" : ""}`}
        type="button"
        data-testid="taotao-life-back"
        data-nav-target={isCalendarLevel ? "taotao" : "chat"}
        aria-label={isCalendarLevel ? "返回桃桃页" : "回到聊天"}
      >
        <ArrowLeft size={16} />
        {isCalendarLevel ? <span>桃桃</span> : <RelationAvatars compact focusTaotao />}
      </button>
    </div>
  );
}

function RelationAvatars({ compact = false, focusTaotao = false, lifeName = "桃桃" }) {
  return (
    <div className={`taotao-relation-avatars ${compact ? "compact" : ""} ${focusTaotao ? "focus-taotao" : ""}`} aria-label={`小雨、阿川和${lifeName}`}>
      <span className="her">雨</span>
      <span className="him">川</span>
      <span className="taotao-avatar">
        <img src="/assets/v2/taotao/welcome.png" alt="" draggable="false" />
      </span>
    </div>
  );
}

function CalendarPanel({ calendar, expanded = false, empty = false }) {
  const weekDays = ["一", "二", "三", "四", "五", "六", "日"];
  const monthDays = Array.from({ length: 30 }, (_, index) => index + 1);
  const markerSet = new Set(calendar?.markers ?? []);
  const activeDay = calendar?.activeDay ?? 23;
  const items = calendar?.items ?? [];
  const selectedItems = items.filter((item) => item.date === activeDay);
  const visibleItems = empty ? [] : selectedItems.slice(0, expanded ? selectedItems.length : 3);

  return (
    <section className={`taotao-calendar-panel ${expanded ? "expanded" : ""} ${empty ? "empty" : ""}`} data-testid="taotao-calendar-panel">
      <header>
        <div>
          <span>{calendar?.month ?? "6月"}</span>
          <strong>{expanded || empty ? "这个月" : "日历"}</strong>
        </div>
        {!empty && !expanded ? (
          <button type="button">
            看全部
            <ChevronRight size={13} />
          </button>
        ) : null}
      </header>

      <div className={expanded || empty ? "taotao-month-grid" : "taotao-week-strip"} aria-label="日历">
        {(expanded || empty ? weekDays : weekDays).map((day) => (
          <span className="taotao-week-label" key={day}>{day}</span>
        ))}
        {(expanded || empty ? monthDays : monthDays.slice(16, 23)).map((day) => (
          <button className={`${day === activeDay ? "active" : ""} ${markerSet.has(day) ? "marked" : ""}`} type="button" key={day}>
            <strong>{day}</strong>
            {markerSet.has(day) ? <i /> : null}
          </button>
        ))}
      </div>

      <div className="taotao-day-thread">
        {empty ? (
          <div className="taotao-calendar-empty">
            <Taotao mood="awake" compact />
            <strong>还没有小事</strong>
          </div>
        ) : visibleItems.map((item) => (
          <button type="button" key={`${item.date}-${item.title}`}>
            <strong>{item.title}</strong>
            <em>{item.meta}</em>
          </button>
        ))}
      </div>
    </section>
  );
}

function MessageBubble({ speaker, text }) {
  return (
    <div className={`taotao-board-message ${speaker}`}>
      {speaker === "taotao" ? (
        <span className="taotao-board-message-avatar">
          <Taotao mood="awake" compact />
        </span>
      ) : (
        <span>{speaker === "her" ? "雨" : "川"}</span>
      )}
      <p>{text}</p>
    </div>
  );
}
