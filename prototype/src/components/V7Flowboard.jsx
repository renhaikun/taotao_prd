import {
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  ClipboardList,
  Layers3,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  getV7FlowboardStats,
  v7FlowboardLanes,
  v7FlowboardVersion,
  v7IntentRules,
} from "../data/v7FlowboardData";
import { Taotao } from "./Taotao";

const structureMeta = {
  none: ["不生成卡片", "quiet"],
  soft: ["轻动作", "soft"],
  event: ["结构化事件", "event"],
  memory: ["小窝记忆", "memory"],
  setting: ["设置/边界", "setting"],
  blocking: ["阻断流程", "blocking"],
  error: ["异常恢复", "error"],
  safety: ["安全边界", "safety"],
  spec: ["开发契约", "spec"],
};

const intentMeta = {
  companion_chat: "陪聊",
  joke_play: "玩梗",
  emotion_support: "情绪",
  soften_message: "好好说",
  decision_help: "选择",
  reminder: "提醒",
  proposal_event: "事件",
  memory_capture: "记忆",
  settings_boundary: "设置",
  safety_handoff: "安全",
  auth: "登录",
  invite: "邀请",
  system: "系统",
  handoff: "交付",
};

export function V7Flowboard() {
  const stats = getV7FlowboardStats();

  return (
    <main
      className="v7-flowboard-stage"
      data-testid="app-shell"
      data-surface="flowboard"
      data-prototype-version="v7.1"
    >
      <FlowboardHero stats={stats} />
      <IntentRules />
      <section className="flowboard-lanes" data-testid="v7-flowboard">
        {v7FlowboardLanes.map((lane, index) => (
          <FlowLane lane={lane} index={index} key={lane.id} />
        ))}
      </section>
    </main>
  );
}

function FlowboardHero({ stats }) {
  return (
    <header className="v7-flowboard-hero" data-testid="v7-flowboard-overview">
      <div className="flowboard-brand">
        <div className="flowboard-mark">
          <Taotao mood="awake" compact />
        </div>
        <div>
          <span>桃桃 {v7FlowboardVersion}</span>
          <h1>生产评审画布</h1>
          <p>先把评审状态板做完整：登录前置、双方视角、异常回收、桃桃人格和结构化门槛都必须能指导开发。</p>
        </div>
      </div>

      <div className="flowboard-stats" aria-label="V7 覆盖概览">
        <Metric icon={Layers3} label="泳道" value={stats.laneCount} />
        <Metric icon={ClipboardList} label="状态画板" value={stats.stateCount} />
        <Metric icon={MessageCircle} label="不生成卡片" value={stats.unstructuredCount} />
        <Metric icon={CheckCircle2} label="结构化对象" value={stats.structuredCount} />
      </div>
    </header>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="flowboard-metric">
      <Icon size={18} />
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function IntentRules() {
  return (
    <section className="intent-rules-panel" data-testid="v7-intent-rules" aria-label="AI 意图分流规则">
      <div className="section-kicker">
        <CircleDot size={16} />
        <span>AI 意图分流</span>
      </div>
      <div className="intent-rules-grid">
        {v7IntentRules.map((rule) => {
          const [, tone] = structureMeta[rule.structure] ?? structureMeta.none;
          return (
            <article className={`intent-rule ${tone}`} key={rule.id} data-testid={`intent-rule-${rule.id}`}>
              <strong>{rule.title}</strong>
              <p>{rule.trigger}</p>
              <span>{rule.response}</span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function FlowLane({ lane, index }) {
  return (
    <section className="flow-lane" data-testid={`flow-lane-${lane.id}`}>
      <header
        className="flow-lane-header"
        data-lane-index={index + 1}
        data-state-count={lane.states.length}
        data-critical-lane={lane.id !== "dev_handoff" ? "true" : "false"}
      >
        <div>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <h2>{lane.title}</h2>
        </div>
        <p>{lane.purpose}</p>
        <em>{lane.development}</em>
      </header>
      <div className="flow-state-grid">
        {lane.states.map((state) => (
          <FlowState state={state} laneId={lane.id} key={state.id} />
        ))}
      </div>
    </section>
  );
}

function FlowState({ state, laneId }) {
  const [structureLabel, structureTone] = structureMeta[state.structure] ?? structureMeta.none;
  return (
    <article
      className={`flow-state-card ${structureTone}`}
      data-testid="flow-state-card"
      data-lane-id={laneId}
      data-state-id={state.id}
      data-actor={state.actor}
      data-intent={state.intent}
      data-structured={state.structure}
      data-release-phase={state.phase}
      data-priority={state.priority}
      data-owner={state.owner}
      data-api-contract={state.apiContract}
      data-analytics-key={state.analyticsKey}
    >
      <div className="flow-state-meta">
        <span>{state.actor}</span>
        <em>{intentMeta[state.intent] ?? state.intent}</em>
        <strong>{structureLabel}</strong>
      </div>
      <h3>{state.title}</h3>
      <p>{state.trigger}</p>
      {state.phone ? <FlowPhone phone={state.phone} state={state} /> : <FlowHandoffPanel items={state.handoff} />}
      <div className="flow-state-next">
        <span>下一步</span>
        <p>{state.next}</p>
      </div>
      <FlowReview review={state.review} />
      <ul className="flow-dev-notes" aria-label="开发要点">
        {state.dev.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

function FlowReview({ review }) {
  const items = [
    ["review-user", "用户视角", review?.user],
    ["review-partner", "另一方视角", review?.partner],
    ["review-recovery", "异常回收", review?.recovery],
    ["review-acceptance", "验收口径", review?.acceptance],
  ].filter(([, , value]) => value);

  return (
    <div className="flow-state-review" data-testid="flow-state-review">
      {items.map(([testId, label, value]) => (
        <div key={label} data-testid={testId}>
          <span>{label}</span>
          <p>{value}</p>
        </div>
      ))}
    </div>
  );
}

function FlowHandoffPanel({ items = [] }) {
  return (
    <div className="flow-handoff-panel" data-testid="flow-handoff-panel">
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
}

function FlowPhone({ phone, state }) {
  return (
    <div className="flow-phone" data-testid="flow-phone-preview">
      <div className="flow-phone-top">
        <div>
          <strong>{phone.title}</strong>
          <span>{phone.subtitle}</span>
        </div>
        <Taotao mood={state.structure === "safety" ? "thinking" : "awake"} compact />
      </div>
      {phone.status ? <div className="flow-phone-status">{phone.status}</div> : null}
      {phone.messages?.length ? (
        <div className="flow-phone-messages">
          {phone.messages.map(([from, name, text], index) => (
            <div className={`flow-message ${from}`} key={`${from}-${index}`} data-testid="flow-phone-message" data-speaker={from}>
              {from === "taotao" ? <Taotao mood="awake" compact /> : <span>{name.slice(0, 1)}</span>}
              <p>
                <em>{name}</em>
                {text}
              </p>
            </div>
          ))}
        </div>
      ) : null}
      {phone.form?.length ? (
        <div className="flow-phone-form">
          {phone.form.map((field) => <span key={field} data-testid="flow-phone-form-field">{field}</span>)}
        </div>
      ) : null}
      {phone.panel?.length ? (
        <div className="flow-phone-panel">
          {phone.panel.map((item) => <span key={item} data-testid="flow-phone-panel-item">{item}</span>)}
        </div>
      ) : null}
      {phone.actions?.length ? (
        <div className="flow-phone-actions">
          {phone.actions.map((action, index) => (
            <button className={index === 0 ? "primary" : ""} type="button" key={action} data-testid="flow-phone-action">{action}</button>
          ))}
        </div>
      ) : null}
      {phone.composer ? <div className="flow-phone-composer">{phone.composer}</div> : null}
    </div>
  );
}
