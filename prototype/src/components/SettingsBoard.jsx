import {
  ArrowLeft,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Heart,
  Info,
  Layers3,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import {
  getV8SettingsBoardStats,
  settingsBoardFlows,
  settingsBoardPrinciples,
  settingsBoardStates,
  v8SettingsBoardVersion,
} from "../data/v8SettingsBoardData";
import { Taotao } from "./Taotao";

export function SettingsBoard() {
  const stats = getV8SettingsBoardStats();
  const stateById = new Map(settingsBoardStates.map((state, index) => [state.id, { state, index }]));
  const usedStateIds = new Set();

  const flows = settingsBoardFlows.map((flow, flowIndex) => {
    const states = flow.stateIds
      .map((stateId) => stateById.get(stateId))
      .filter(Boolean);

    states.forEach((entry) => usedStateIds.add(entry.state.id));
    return { ...flow, flowIndex, states };
  });

  const unmappedStates = settingsBoardStates
    .map((state, index) => ({ state, index }))
    .filter((entry) => !usedStateIds.has(entry.state.id));

  return (
    <main
      className="chatboard-stage settings-board"
      data-testid="app-shell"
      data-surface="settingsboard"
      data-prototype-version="v8.0"
    >
      <header className="chatboard-hero settings-board-hero" data-testid="v8-settings-board-overview">
        <div className="chatboard-title">
          <div className="chatboard-mark settings-board-mark">
            <span>我</span>
          </div>
          <div>
            <span>桃桃 {v8SettingsBoardVersion}</span>
            <h1>App 基础控制评审状态板</h1>
            <p>分册覆盖我的、账号、另一半、反馈和更多；不承载小窝、可见范围、记忆解释和装扮能力。</p>
          </div>
        </div>
        <div className="chatboard-metrics">
          <Metric icon={Layers3} value={stats.flowCount} label="生产链路" />
          <Metric icon={CheckCircle2} value={stats.stateCount} label="手机状态" />
          <Metric icon={MessageCircle} value={stats.homeCount} label="首页状态" />
          <Metric icon={CircleAlert} value={stats.dangerCount} label="确认状态" />
          <Metric icon={Check} value={stats.failureCount} label="异常状态" />
        </div>
      </header>

      <section className="chatboard-principles settings-board-principles" data-testid="v8-settings-board-rules">
        {settingsBoardPrinciples.map((principle) => (
          <span key={principle}>{principle}</span>
        ))}
      </section>

      <section className="chatboard-journeys" data-testid="v8-settings-board">
        <div className="chatboard-journeys-head">
          <span>V8.0 分册</span>
          <div>
            <strong>按真实 App 路径展开</strong>
            <p>每一排是一条功能链路，手机稿负责用户界面，下面的状态说明负责研发对齐。</p>
          </div>
        </div>

        {flows.map((flow) => (
          <section
            className="chat-flow-lane settings-flow-lane"
            data-testid="settings-flow-lane"
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

            <div className="chat-step-state-strip settings-state-strip" data-testid="settings-state-strip">
              {flow.states.map((entry) => (
                <div
                  className="chat-step-state-slot settings-state-slot"
                  data-testid="settings-state-slot"
                  data-slot-state-id={entry.state.id}
                  key={entry.state.id}
                >
                  <SettingsStateCard state={entry.state} index={entry.index} />
                </div>
              ))}
            </div>
          </section>
        ))}

        {unmappedStates.length ? (
          <section className="chat-flow-lane unmapped" data-testid="settings-unmapped-state">
            <header className="chat-flow-header">
              <span>!</span>
              <div>
                <strong>未归入链路</strong>
                <p>这些状态需要补进基础控制流程。</p>
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

function SettingsStateCard({ state, index }) {
  return (
    <article
      className={`settings-board-state state-${state.phone.kind}`}
      data-testid="settings-board-state"
      data-state-id={state.id}
      data-flow-id={state.flowId}
      data-viewer-role={state.viewerRole}
      data-visibility-scope={state.visibilityScope}
      data-lifecycle-status={state.lifecycleStatus}
      data-priority={state.priority}
      data-owner={state.owner}
      data-api-contract={state.apiContract}
      data-analytics-key={state.analyticsKey}
    >
      <SettingsPhone state={state} />

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

      <div className="settings-state-contract" data-testid="settings-state-contract">
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

function SettingsPhone({ state }) {
  const phone = state.phone;

  return (
    <div
      className={`settings-page-preview kind-${phone.kind}`}
      data-testid="settings-page-preview"
      data-phone-kind={phone.kind}
      data-phone-state-id={state.id}
    >
      <div className="settings-phone-screen">
        <div className="chat-statusbar" aria-hidden="true">
          <span>9:41</span>
          <span>5G  82%</span>
        </div>
        {phone.kind === "chatEntry" ? <ChatEntryPreview phone={phone} /> : null}
        {phone.kind === "home" ? <HomePreview phone={phone} /> : null}
        {phone.kind === "account" ? <AccountPreview phone={phone} /> : null}
        {phone.kind === "deleteAccount" ? <DeleteAccountPreview phone={phone} /> : null}
        {phone.kind === "relationship" ? <RelationshipPreview phone={phone} /> : null}
        {phone.kind === "relationshipConfirm" ? <RelationshipConfirmPreview phone={phone} /> : null}
        {phone.kind === "feedback" ? <FeedbackPreview phone={phone} /> : null}
        {phone.kind === "more" ? <MorePreview phone={phone} /> : null}
        {phone.kind === "notification" ? <NotificationPreview phone={phone} /> : null}
        {phone.kind === "security" ? <SecurityPreview phone={phone} /> : null}
        {phone.kind === "about" ? <AboutPreview phone={phone} /> : null}
        {phone.kind === "emergency" ? <EmergencyPreview phone={phone} /> : null}
      </div>
    </div>
  );
}

function ChatEntryPreview({ phone }) {
  return (
    <div className="settings-chat-preview">
      <div className="settings-chat-header">
        <RelationAvatars />
        <button className="settings-current-user" type="button" aria-label="打开我的">
          <span>雨</span>
        </button>
      </div>
      <button className="chat-context-capsule idle settings-chat-capsule" type="button">
        <span className="chat-capsule-orb" />
        <span className="chat-capsule-copy">
          <strong>今天的小事</strong>
          <em>2 件</em>
        </span>
        <span className="chat-capsule-add" aria-label="新建小事">
          <Plus size={13} />
        </span>
      </button>
      <div className="settings-chat-stream">
        {phone.messages.map(([speaker, text], index) => (
          <SettingsMessage speaker={speaker} text={text} key={`${speaker}-${index}`} />
        ))}
      </div>
    </div>
  );
}

function HomePreview({ phone }) {
  return (
    <div className="settings-surface">
      <SettingsTopbar backLabel="聊天" />
      <section className="settings-page-title">
        <strong>我的</strong>
      </section>
      <ProfileChip profile={phone.profile} />
      <div className="settings-list">
        {phone.rows.map((row) => (
          <SettingsRow row={row} key={row.key} />
        ))}
      </div>
    </div>
  );
}

function AccountPreview({ phone }) {
  return (
    <div className="settings-surface">
      <SettingsTopbar backLabel="我的" />
      <section className="settings-page-title">
        <strong>账号</strong>
      </section>
      <div className="settings-list quiet">
        {phone.rows.map((row) => (
          <DetailRow row={row} key={row.title} />
        ))}
      </div>
      {!phone.sheet ? (
        <div className="settings-bottom-actions">
          <button className="settings-secondary-action" type="button">退出登录</button>
          {phone.danger ? <button className="settings-danger-link" type="button">{phone.danger}</button> : null}
        </div>
      ) : null}
      {phone.toast ? <InlineToast text={phone.toast} retry={phone.retry} /> : null}
      {phone.sheet ? <ConfirmSheet sheet={phone.sheet} /> : null}
    </div>
  );
}

function DeleteAccountPreview({ phone }) {
  return (
    <div className="settings-surface danger-page">
      <SettingsTopbar backLabel="账号" />
      <section className="settings-page-title">
        <strong>{phone.title ?? "删除账号"}</strong>
      </section>
      {phone.step === "review" ? (
        <div className="settings-warning-card">
          {phone.items.map((item) => (
            <div className="settings-warning-row" key={item}>
              <span />
              <p>{item}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="settings-danger-body">{phone.body}</p>
      )}
      <div className="settings-bottom-actions">
        <button className="settings-danger-button" type="button">{phone.primary}</button>
        <button className="settings-ghost-button" type="button">{phone.secondary}</button>
      </div>
    </div>
  );
}

function RelationshipPreview({ phone }) {
  return (
    <div className="settings-surface">
      <SettingsTopbar backLabel="我的" />
      <section className="settings-page-title">
        <strong>另一半</strong>
      </section>
      {phone.bound ? (
        <>
          <div className="settings-partner-card">
            <span className="settings-avatar him">川</span>
            <div>
              <strong>{phone.partner.name}</strong>
              <p>{phone.partner.status}</p>
            </div>
          </div>
          <div className="settings-list quiet">
            <DetailRow row={{ title: "手机号", value: phone.partner.phone, chevron: false }} />
          </div>
          <div className="settings-bottom-actions">
            <button className="settings-danger-link" type="button">解除关系</button>
          </div>
        </>
      ) : (
        <div className="settings-empty-card">
          <RelationAvatars solo />
          <strong>还没有绑定另一半</strong>
          <button className="settings-primary-action" type="button">{phone.primary}</button>
        </div>
      )}
      {phone.toast ? <InlineToast text={phone.toast} retry={phone.retry} /> : null}
    </div>
  );
}

function RelationshipConfirmPreview({ phone }) {
  return (
    <div className="settings-surface danger-page">
      <SettingsTopbar backLabel="另一半" />
      <section className="settings-page-title">
        <strong>{phone.title}</strong>
      </section>
      {phone.step === "review" ? (
        <div className="settings-warning-card">
          {phone.items.map((item) => (
            <div className="settings-warning-row" key={item}>
              <span />
              <p>{item}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="settings-danger-body">{phone.body}</p>
      )}
      <div className="settings-bottom-actions">
        <button className="settings-danger-button" type="button">{phone.primary}</button>
        <button className="settings-ghost-button" type="button">{phone.secondary}</button>
      </div>
    </div>
  );
}

function FeedbackPreview({ phone }) {
  if (phone.submitted) {
    return (
      <div className="settings-surface feedback-done">
        <SettingsTopbar backLabel="我的" />
        <div className="settings-success-card">
          <CheckCircle2 size={28} />
          <strong>已收到</strong>
          <button className="settings-primary-action" type="button">返回我的</button>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-surface">
      <SettingsTopbar backLabel="我的" />
      <section className="settings-page-title">
        <strong>反馈</strong>
      </section>
      <label className="settings-field">
        <span>问题或建议</span>
        <textarea value={phone.draft} readOnly aria-label="问题或建议" />
      </label>
      <label className="settings-field compact">
        <span>联系方式</span>
        <input value={phone.contact} readOnly aria-label="联系方式" />
      </label>
      {phone.error ? <InlineToast text={phone.error} retry={phone.retry} /> : null}
      <div className="settings-bottom-actions">
        <button className="settings-primary-action" type="button">提交反馈</button>
      </div>
    </div>
  );
}

function MorePreview({ phone }) {
  return (
    <div className="settings-surface">
      <SettingsTopbar backLabel="我的" />
      <section className="settings-page-title">
        <strong>更多</strong>
      </section>
      <div className="settings-list">
        {phone.rows.map((row) => (
          <SettingsRow row={row} danger={row.key === "delete"} key={row.key} />
        ))}
      </div>
    </div>
  );
}

function NotificationPreview({ phone }) {
  return (
    <div className="settings-surface">
      <SettingsTopbar backLabel="更多" />
      <section className="settings-page-title">
        <strong>通知</strong>
      </section>
      <div className="settings-list quiet">
        {phone.toggles.map((toggle) => (
          <div className="settings-toggle-row" key={toggle.title}>
            <span>{toggle.title}</span>
            <i className={toggle.enabled ? "on" : ""} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SecurityPreview({ phone }) {
  return (
    <div className="settings-surface">
      <SettingsTopbar backLabel="更多" />
      <section className="settings-page-title">
        <strong>安全</strong>
      </section>
      <div className="settings-list quiet">
        {phone.rows.map((row) => (
          <DetailRow row={row} key={row.title} />
        ))}
      </div>
    </div>
  );
}

function AboutPreview({ phone }) {
  return (
    <div className="settings-surface about-page">
      <SettingsTopbar backLabel="更多" />
      <div className="settings-about-mark">
        <Taotao mood="awake" compact />
      </div>
      <section className="settings-page-title centered">
        <strong>桃桃</strong>
        <span>版本 {phone.version}</span>
      </section>
      <div className="settings-list quiet">
        {phone.rows.map((row) => (
          <DetailRow row={{ title: row, value: "" }} key={row} />
        ))}
      </div>
    </div>
  );
}

function EmergencyPreview({ phone }) {
  return (
    <div className="settings-surface danger-page">
      <SettingsTopbar backLabel="安全" />
      <section className="settings-page-title">
        <strong>{phone.title}</strong>
      </section>
      <p className="settings-danger-body">{phone.body}</p>
      <div className="settings-bottom-actions">
        <button className="settings-danger-button" type="button">{phone.primary}</button>
        <button className="settings-ghost-button" type="button">{phone.secondary}</button>
      </div>
    </div>
  );
}

function SettingsTopbar({ backLabel }) {
  return (
    <div className="settings-topbar">
      <button type="button" aria-label={`返回${backLabel}`}>
        <ArrowLeft size={16} />
        <span>{backLabel}</span>
      </button>
    </div>
  );
}

function ProfileChip({ profile }) {
  return (
    <section className="settings-profile-chip">
      <span className="settings-avatar her">雨</span>
      <div>
        <strong>{profile.name}</strong>
        <p>{profile.phone}</p>
      </div>
    </section>
  );
}

function SettingsRow({ row, danger = false }) {
  const RowIcon = getSettingsRowIcon(row.key);

  return (
    <button className={`settings-row ${danger ? "danger" : ""}`} type="button">
      <span className={`settings-row-icon ${row.key}`}>
        <RowIcon size={16} />
      </span>
      <div>
        <strong>{row.title}</strong>
        {row.meta ? <p>{row.meta}</p> : null}
      </div>
      <ChevronRight size={15} />
    </button>
  );
}

function getSettingsRowIcon(key) {
  const icons = {
    account: User,
    partner: Heart,
    feedback: MessageCircle,
    more: MoreHorizontal,
    notification: Bell,
    security: Shield,
    about: Info,
    delete: Trash2,
  };

  return icons[key] ?? MoreHorizontal;
}

function DetailRow({ row }) {
  const showChevron = row.chevron !== false;

  return (
    <button className={`settings-detail-row ${showChevron ? "" : "static"}`} type="button">
      <span>{row.title}</span>
      <strong>{row.value}</strong>
      {showChevron ? <ChevronRight size={14} /> : null}
    </button>
  );
}

function ConfirmSheet({ sheet }) {
  return (
    <div className="settings-sheet">
      <strong>{sheet.title}</strong>
      <p>{sheet.body}</p>
      <div>
        <button className="settings-ghost-button" type="button">{sheet.secondary}</button>
        <button className="settings-danger-button" type="button">{sheet.primary}</button>
      </div>
    </div>
  );
}

function InlineToast({ text, retry }) {
  return (
    <div className="settings-inline-toast" role="alert">
      <CircleAlert size={14} />
      <span>{text}</span>
      {retry ? <button type="button">{retry}</button> : null}
    </div>
  );
}

function RelationAvatars({ solo = false }) {
  return (
    <div className={`settings-relation-avatars ${solo ? "solo" : ""}`} aria-label={solo ? "小雨和桃桃" : "小雨、阿川和桃桃"}>
      <span className="her">雨</span>
      {!solo ? <span className="him">川</span> : null}
      <span className="taotao-avatar">
        <img src="/assets/v2/taotao/welcome.png" alt="" draggable="false" />
      </span>
    </div>
  );
}

function SettingsMessage({ speaker, text }) {
  return (
    <div className={`settings-message ${speaker}`}>
      {speaker === "taotao" ? (
        <span className="settings-message-taotao">
          <Taotao mood="awake" compact />
        </span>
      ) : (
        <span>{speaker === "her" ? "雨" : "川"}</span>
      )}
      <p>{text}</p>
    </div>
  );
}
