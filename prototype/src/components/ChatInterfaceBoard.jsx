import {
  ArrowUp,
  BookmarkPlus,
  CheckCircle2,
  CircleAlert,
  Copy,
  Layers3,
  MessageCircle,
  PanelTop,
  Plus,
  Quote,
  SendHorizonal,
  X,
} from "lucide-react";
import {
  chatCoverageLayers,
  chatDisplayStates,
  chatProductionFlows,
  chatSurfacePrinciples,
  getV72ChatBoardStats,
  topCapsulePriorityRules,
  v72ChatBoardVersion,
} from "../data/v72ChatBoardData";
import { Taotao } from "./Taotao";

const capsuleLabels = {
  none: "前置门槛",
  idle: "常驻胶囊",
  rotating: "轮询胶囊",
  active: "上下文胶囊",
  quiet: "低存在感",
  summary: "汇总胶囊",
  error: "异常胶囊",
};

const overlayLabels = {
  none: "无半屏",
  active: "半屏层",
};

const visibilityLabels = {
  group: "群聊可见",
  private: "私下整理",
  shared: "共享事项",
};

const speakerNames = {
  her: "小雨",
  him: "阿川",
  taotao: "桃桃",
  system: "",
};

export function ChatInterfaceBoard() {
  const stats = getV72ChatBoardStats();

  return (
    <main
      className="chatboard-stage"
      data-testid="app-shell"
      data-surface="chatboard"
      data-prototype-version="v7.8"
    >
      <header className="chatboard-hero" data-testid="v72-chatboard-overview">
        <div className="chatboard-title">
          <div className="chatboard-mark">
            <Taotao mood="awake" compact />
          </div>
          <div>
            <span>桃桃 {v72ChatBoardVersion}</span>
            <h1>聊天主界面展示状态板</h1>
            <p>定义进入聊天前的门槛、三人聊天、常驻胶囊、私下整理半窗和共同小事回收，让原型能直接进入研发评审。</p>
          </div>
        </div>
        <div className="chatboard-metrics">
          <Metric icon={Layers3} value={stats.stateCount} label="展示状态" />
          <Metric icon={CheckCircle2} value={stats.preconditionCount} label="前置门槛" />
          <Metric icon={PanelTop} value={stats.capsuleCount} label="胶囊状态" />
          <Metric icon={MessageCircle} value={stats.capabilityCount} label="消息内能力" />
          <Metric icon={CheckCircle2} value={stats.overlayCount} label="主动半屏" />
          <Metric icon={Layers3} value={chatCoverageLayers.length} label="覆盖层" />
        </div>
      </header>

      <section className="chatboard-principles" data-testid="v72-chatboard-layout-rules">
        {chatSurfacePrinciples.map((principle) => (
          <span key={principle}>{principle}</span>
        ))}
      </section>

      <ProductionContractBoard />

      <section className="chatboard-coverage" data-testid="v78-coverage-matrix">
        {chatCoverageLayers.map((layer, index) => (
          <article className={`coverage-card status-${layer.status}`} data-testid="coverage-layer" data-layer-id={layer.id} key={layer.id}>
            <div>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{layer.title}</strong>
            </div>
            <p>{layer.summary}</p>
            <em>{layer.priority} · {layer.stateIds.length} 个状态</em>
          </article>
        ))}
      </section>

      <ChatFlowBoard />
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

function ChatFlowBoard() {
  const stateById = new Map(chatDisplayStates.map((state, index) => [state.id, { state, index }]));
  const usedStateIds = new Set();
  const lanes = chatProductionFlows.map((flow, flowIndex) => {
    const steps = flow.steps
      .map((step, stepIndex) => {
        const states = step.stateIds
          .map((stateId) => stateById.get(stateId))
          .filter((entry) => entry && !usedStateIds.has(entry.state.id));

        states.forEach((entry) => usedStateIds.add(entry.state.id));
        return { ...step, stepIndex, states };
      })
      .filter((step) => step.states.length > 0);
    const fallbackStates = flow.stateIds
      .map((stateId) => stateById.get(stateId))
      .filter((entry) => entry && !usedStateIds.has(entry.state.id));

    fallbackStates.forEach((entry) => usedStateIds.add(entry.state.id));
    return { ...flow, flowIndex, steps, fallbackStates };
  });
  const unmappedStates = chatDisplayStates
    .map((state, index) => ({ state, index }))
    .filter((entry) => !usedStateIds.has(entry.state.id));

  return (
    <section className="chatboard-journeys" data-testid="v72-chatboard">
      <div className="chatboard-journeys-head" data-testid="v8-chatboard-journeys">
        <span>V8 链路化手机稿</span>
        <div>
          <strong>按功能读完整流程</strong>
          <p>每条泳道是一项功能，每一排手机稿对应一个步骤；补充分支会暴露当前还没收进正式 step 的状态。</p>
        </div>
      </div>

      {lanes.map((flow) => (
        <section
          className="chat-flow-lane"
          data-testid="chatboard-flow-lane"
          data-flow-id={flow.id}
          data-flow-index={flow.flowIndex + 1}
          data-state-count={flow.stateIds.length}
          key={flow.id}
        >
          <header className="chat-flow-header" data-testid="chatboard-flow-header">
            <span>{String(flow.flowIndex + 1).padStart(2, "0")}</span>
            <div>
              <strong>{flow.title}</strong>
              <p>{flow.summary}</p>
            </div>
            <em>{flow.priority} · {flow.stateIds.length} 个状态</em>
          </header>

          <div className="chat-flow-meta">
            <span>触发：{flow.trigger}</span>
            <span>回收：{flow.recovery}</span>
          </div>

          {flow.steps.map((step) => (
            <ChatFlowStep flow={flow} step={step} key={`${flow.id}-${step.id}`} />
          ))}

          {flow.fallbackStates.length ? (
            <ChatFlowStep
              flow={flow}
              step={{
                id: "fallback",
                title: "补充分支",
                surface: "尚未收进正式 step 的状态",
                stepIndex: flow.steps.length,
                states: flow.fallbackStates,
              }}
              fallback
            />
          ) : null}
        </section>
      ))}

      {unmappedStates.length ? (
        <section className="chat-flow-lane unmapped" data-testid="chatboard-unmapped-state" data-state-count={unmappedStates.length}>
          <header className="chat-flow-header">
            <span>!</span>
            <div>
              <strong>未归入链路</strong>
              <p>这些状态没有被任何生产 flow 收纳，需要补充 flow 或修正 state 归属。</p>
            </div>
            <em>{unmappedStates.length} 个状态</em>
          </header>
          <div className="chat-step-state-strip">
            {unmappedStates.map((entry, index) => (
              <div className="chat-step-state-slot" data-testid="chatboard-step-state-slot" data-slot-state-id={entry.state.id} data-state-position={index + 1} key={entry.state.id}>
                <ChatStateCard state={entry.state} index={entry.index} />
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}

function ChatFlowStep({ flow, step, fallback = false }) {
  return (
    <section
      className={`chat-flow-step ${fallback ? "fallback" : ""}`}
      data-testid={fallback ? "chatboard-flow-fallback-step" : "chatboard-flow-step"}
      data-flow-id={flow.id}
      data-step-id={step.id}
      data-step-index={step.stepIndex + 1}
      data-state-count={step.states.length}
    >
      <header className="chat-flow-step-head">
        <span>{fallback ? "分支" : String(step.stepIndex + 1).padStart(2, "0")}</span>
        <div>
          <strong>{step.title}</strong>
          <p>{step.surface}</p>
        </div>
      </header>
      <div className="chat-step-state-strip" data-testid="chatboard-step-state-strip">
        {step.states.map((entry, index) => (
          <div
            className="chat-step-state-slot"
            data-testid="chatboard-step-state-slot"
            data-slot-flow-id={flow.id}
            data-slot-step-id={step.id}
            data-slot-state-id={entry.state.id}
            data-state-position={index + 1}
            key={entry.state.id}
          >
            <ChatStateCard state={entry.state} index={entry.index} />
          </div>
        ))}
      </div>
    </section>
  );
}

function ChatStateCard({ state, index }) {
  const cardCount = state.phone.inlineCard ? 1 : 0;
  const capabilityCount = getMessageCapabilities(state.phone.messages).length;
  const dockCount = state.phone.hideCapsule ? 0 : 1;
  const contextActionCount = (state.phone.overlay?.actions?.length ?? 0) + (state.phone.overlay?.suggestions?.length ?? 0) + (state.phone.overlay?.drawerItems?.length ?? 0);
  const cardActionCount = state.phone.inlineCard?.actions?.length ?? 0;
  const hasCapabilitySurface = capabilityCount > 0;
  const phoneKind = state.phone.kind ?? "chat";

  return (
    <article
      className={`chat-state-card capsule-${state.capsule} overlay-${state.overlay}`}
      data-testid="chatboard-state"
      data-state-id={state.id}
      data-chat-mode={phoneKind === "gate" ? "pre-chat" : state.visibility === "private" ? "private-compose" : state.capsule === "idle" || state.capsule === "rotating" ? "pure-chat" : "shared-context"}
      data-phone-kind={phoneKind}
      data-viewer-role={state.phone.viewer ?? (state.id.includes("receiver") ? "receiver" : state.id.includes("initiator") ? "initiator" : "shared")}
      data-visibility={state.visibility}
      data-capsule={state.capsule}
      data-overlay={state.overlay}
      data-intent={state.intent}
      data-structured={(state.capsule === "idle" || state.capsule === "rotating") && state.overlay === "none" && !state.phone.inlineCard && !hasCapabilitySurface ? "none" : "surface-only"}
      data-card-count={cardCount}
      data-capability-count={capabilityCount}
      data-card-action-count={cardActionCount}
      data-dock-count={dockCount}
      data-context-action-count={contextActionCount}
      data-priority={state.priority}
      data-owner={state.owner}
      data-flow-id={state.flowId}
      data-contract-surface={state.productionContract.surface}
      data-source-anchor={state.productionContract.sourceAnchor}
      data-object-type={state.objectType}
      data-lifecycle-status={state.lifecycleStatus}
      data-visibility-scope={state.visibilityScope}
      data-participant-status={state.participantStatus}
      data-api-contract={state.apiContract}
      data-analytics-key={state.analyticsKey}
    >
      <ChatPhone state={state} />

      <header className="chat-state-head">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <div>
          <h2>{state.title}</h2>
          <p>{state.trigger}</p>
        </div>
      </header>

      <div className="chat-state-tags">
        <span>{visibilityLabels[state.visibility]}</span>
        <span>{capsuleLabels[state.capsule]}</span>
        <span>{overlayLabels[state.overlay]}</span>
        <span>{state.objectType}</span>
        <span>{state.lifecycleStatus}</span>
      </div>

      <div className="chat-logic">
        <strong>展示逻辑</strong>
        <p>{state.rationale}</p>
        <em>{state.next}</em>
      </div>

      <div className="chat-zone-rules" data-testid="chat-zone-rules">
        <Rule label="关系栏" text={state.review.header} />
        <Rule label="胶囊" text={state.review.capsule ?? "常驻显示，可从右侧加号新建事务。"} />
        <Rule label="消息流" text={state.review.stream} />
        <Rule label="输入区" text={state.review.composer} />
        <Rule label="半屏层" text={state.review.overlay ?? "不显示半屏层。"} />
        <Rule label="回收" text={state.review.recovery} />
      </div>

      <ChatStateContractReview state={state} />
    </article>
  );
}

function ProductionContractBoard() {
  return (
    <section className="chatboard-v8-review" data-testid="v8-production-contracts">
      <header className="chatboard-v8-review-head">
        <span>V8 生产流程合同</span>
        <div>
          <strong>先读链路，再看手机稿</strong>
          <p>每条链路都定义触发、承载界面、可见性、回收方式和禁止项；手机稿只展示用户真实会看到的界面。</p>
        </div>
      </header>

      <div className="chatboard-v8-review-grid">
        {chatProductionFlows.map((flow) => (
          <article className="chat-production-flow" data-testid="production-flow-contract" data-flow-id={flow.id} key={flow.id}>
            <div className="chat-production-flow-head">
              <span>{flow.priority}</span>
              <strong>{flow.title}</strong>
              <em>{flow.stateIds.length} 个状态</em>
            </div>
            <p>{flow.summary}</p>
            <div className="chat-journey-strip">
              {flow.steps.map((step) => (
                <span className="chat-journey-step" key={step.id}>
                  {step.title}
                </span>
              ))}
            </div>
            <dl className="chat-contract-list">
              <div>
                <dt>触发</dt>
                <dd>{flow.trigger}</dd>
              </div>
              <div>
                <dt>界面</dt>
                <dd>{flow.surface}</dd>
              </div>
              <div>
                <dt>回收</dt>
                <dd>{flow.recovery}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <div className="chatboard-capsule-priority" data-testid="top-capsule-priority">
        <span>顶部胶囊优先级</span>
        <div>
          {topCapsulePriorityRules.map((rule) => (
            <em data-priority-rank={rule.rank} key={rule.id}>
              {rule.rank}. {rule.title}
            </em>
          ))}
        </div>
      </div>
    </section>
  );
}

function ChatStateContractReview({ state }) {
  const contract = state.productionContract;
  const visibleActions = contract.actions.slice(0, 4);

  return (
    <div className="chat-production-review" data-testid="state-production-contract">
      <div className="chat-production-review-head">
        <span>{state.flowId}</span>
        <strong>{contract.surface}</strong>
      </div>
      <div className="chat-contract-row">
        <span>可见性</span>
        <p>{contract.visibility} · {contract.participantStatus}</p>
      </div>
      <div className="chat-contract-row">
        <span>来源</span>
        <p>{contract.sourceAnchor}</p>
      </div>
      <div className="chat-contract-row">
        <span>下一步</span>
        <p>{contract.next}</p>
      </div>
      {visibleActions.length ? (
        <div className="chat-contract-actions">
          {visibleActions.map((action) => (
            <span data-action-id={action.actionId} key={`${action.label}-${action.actionId}`}>
              {action.label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Rule({ label, text }) {
  return (
    <div data-testid={`review-${label}`}>
      <span>{label}</span>
      <p>{text}</p>
    </div>
  );
}

function ChatPhone({ state }) {
  const { phone } = state;
  const viewer = phone.viewer ?? "her";
  const capsule = phone.capsule ?? {
    text: "今天的小事",
    meta: "0 件",
    tone: "idle",
  };

  return (
    <div className="chat-phone" data-testid="chatboard-phone-preview" data-relation={phone.relation}>
      <div className="chat-phone-screen">
        <div className="chat-statusbar" aria-hidden="true">
          <span>9:41</span>
          <span>5G  82%</span>
        </div>

        <div className="chat-phone-top" data-testid="chat-main-header">
          <div>
            <PhoneRelation relation={phone.relation} />
            <span>桃桃 · {phone.taotaoStatus}</span>
          </div>
          <Taotao mood="awake" compact />
        </div>

        {!phone.hideCapsule ? (
          <button className={`chat-context-capsule ${capsule.tone}`} type="button" data-testid="chat-event-dock" data-capsule-tone={capsule.tone}>
            <span className="chat-capsule-orb" />
            <span className="chat-capsule-copy">
              <strong>{capsule.text}</strong>
              {capsule.meta ? <em>{capsule.meta}</em> : null}
            </span>
            <span className="chat-capsule-add" data-testid="chat-capsule-add" aria-label="新建小事">
              <Plus size={14} />
            </span>
          </button>
        ) : null}

        {phone.gate ? <PhoneGate gate={phone.gate} /> : null}

        {phone.messages?.length ? (
          <div className="chat-message-stream" data-testid="chat-message-list">
            {phone.messages.map((message, index) => {
              const { speaker, text, capability, quote, status, failed, attachment, reaction, menu, receipt, typing } = normalizeMessage(message);
              const isSelf = speaker === viewer;
              return (
                <div className={`chat-bubble-row ${speaker} ${isSelf ? "self" : ""} ${failed ? "failed-message" : ""}`} data-testid="chat-message" data-speaker={speaker} data-message-status={status ?? ""} key={`${speaker}-${index}`}>
                  {speaker === "system" ? null : speaker === "taotao" ? (
                    <TaotaoMessageAvatar />
                  ) : <span>{speakerNames[speaker].slice(0, 1)}</span>}
                  {failed ? (
                    <button className="chat-message-retry" type="button" aria-label="重试发送" data-testid="chat-message-retry">
                      <CircleAlert size={17} strokeWidth={2.35} />
                    </button>
                  ) : null}
                  <div className="chat-bubble-stack">
                    {quote ? <div className="chat-message-quote">{quote}</div> : null}
                    {typing ? (
                      <div className="chat-typing" data-testid="chat-typing">
                        <i />
                        <i />
                        <i />
                      </div>
                    ) : (
                      <p className={failed ? "failed" : ""}>
                        {text}
                      </p>
                    )}
                    {attachment ? <MessageAttachment attachment={attachment} /> : null}
                    {capability ? <MessageCapability capability={capability} /> : null}
                    {status && !failed ? <span className="chat-message-status">{status}</span> : null}
                    {receipt ? <span className="chat-message-receipt" data-testid="chat-message-receipt">{receipt}</span> : null}
                    {reaction ? <span className="chat-message-reaction">{reaction}</span> : null}
                    {menu ? <MessageActionMenu items={menu} /> : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : !phone.gate ? <div className="chat-message-stream empty" data-testid="chat-message-list" /> : null}

        {phone.inlineCard ? <InlineApprovalCard card={phone.inlineCard} /> : null}

        {!phone.hideComposer ? (
          <div className="chat-composer" data-testid="chat-composer">
            <button className="chat-composer-action chat-composer-add" type="button" aria-label="新建小事">
              <Plus size={17} strokeWidth={2.05} />
            </button>
            <span className="chat-composer-field" role="textbox" aria-label="输入消息" />
            <button className="chat-composer-action chat-composer-submit" type="button" aria-label="发送">
              <ArrowUp size={18} strokeWidth={2.35} />
            </button>
          </div>
        ) : null}

        {phone.inputPanel ? <InputPanel panel={phone.inputPanel} /> : null}

        {phone.overlay ? <ChatOverlay overlay={phone.overlay} /> : null}
      </div>
    </div>
  );
}

function PhoneRelation({ relation }) {
  const isTriad = relation?.includes("小雨") && relation?.includes("阿川") && relation?.includes("桃桃");
  const isHerAndTaotao = !isTriad && relation?.includes("小雨") && relation?.includes("桃桃");
  const isHimAndTaotao = !isTriad && relation?.includes("阿川") && relation?.includes("桃桃");

  if (!isTriad && !isHerAndTaotao && !isHimAndTaotao) {
    return <strong>{relation}</strong>;
  }

  return (
    <div className="chat-relation-avatars" data-testid="chat-relation-avatars" aria-label={relation}>
      {relation?.includes("小雨") ? <span className="her" aria-label="小雨头像">雨</span> : null}
      {relation?.includes("阿川") ? <span className="him" aria-label="阿川头像">川</span> : null}
      <span className="taotao" aria-label="桃桃头像">
        <img src="/assets/v2/taotao/welcome.png" alt="" draggable="false" />
      </span>
    </div>
  );
}

function normalizeMessage(message) {
  if (Array.isArray(message)) {
    const [speaker, , text, capability] = message;
    return { speaker, text, capability };
  }
  return message;
}

function getMessageCapabilities(messages = []) {
  return messages.map((message) => normalizeMessage(message).capability).filter(Boolean);
}

function MessageCapability({ capability }) {
  const visibleLabel = capability.shortLabel ?? capability.label;
  const visibleMeta = capability.meta;
  const actor = capability.actor;

  return (
    <button
      className={`chat-message-capability ${capability.tone ?? capability.status ?? "ready"} ${actor ? "has-actor" : ""}`}
      type="button"
      data-testid="chat-message-capability"
      data-capability-id={capability.id ?? ""}
      data-capability-kind={capability.kind}
      data-capability-status={capability.status}
      data-capability-actor={actor?.name ?? ""}
      data-capability-action={capability.action ?? ""}
      data-source-message-id={capability.sourceMessageId ?? ""}
    >
      {actor ? (
        <span className={`chat-message-capability-avatar ${actor.tone ?? ""}`} aria-label={`${actor.name}修改`}>
          {actor.label}
        </span>
      ) : (
        <span className="chat-message-capability-dot" />
      )}
      <span className="chat-message-capability-copy">
        <strong>{visibleLabel}</strong>
        <em>{capability.title}</em>
      </span>
      {visibleMeta ? <span className="chat-message-capability-meta">{visibleMeta}</span> : null}
      {typeof capability.progress === "number" ? (
        <span className="chat-message-capability-progress" style={{ "--progress": `${capability.progress}%` }}>
          <i />
        </span>
      ) : null}
    </button>
  );
}

function MessageAttachment({ attachment }) {
  return (
    <div className={`chat-message-attachment ${attachment.type}`} data-testid="chat-message-attachment" data-attachment-type={attachment.type}>
      <strong>{attachment.title}</strong>
      <span>{attachment.meta}</span>
    </div>
  );
}

function MessageActionMenu({ items }) {
  const iconMap = {
    quote: Quote,
    copy: Copy,
    collect: BookmarkPlus,
  };

  return (
    <div className="chat-message-menu" data-testid="chat-message-menu">
      {items.map((item) => {
        const action = typeof item === "string" ? { id: item, label: item } : item;
        const Icon = iconMap[action.icon ?? action.id] ?? BookmarkPlus;
        return (
          <button type="button" key={action.id ?? action.label} aria-label={action.label}>
            <Icon size={13} />
            <span>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function InputPanel({ panel }) {
  return (
    <div className="chat-input-panel" data-testid="chat-input-panel">
      <span>{panel.title}</span>
      <div>
        {panel.actions.map((action) => (
          <button type="button" key={action}>{action}</button>
        ))}
      </div>
    </div>
  );
}

function PhoneGate({ gate }) {
  return (
    <div className={`chat-gate-card ${gate.tone ?? "default"} ${gate.variant ?? ""}`} data-testid="chat-precondition-gate" data-gate-variant={gate.variant ?? ""}>
      <span>{gate.eyebrow}</span>
      <strong>{gate.title}</strong>
      {gate.description ? <p>{gate.description}</p> : null}
      {gate.fields ? (
        <div className="chat-gate-form" data-testid="chat-gate-form">
          {gate.fields.map((field) => (
            <label key={field.label}>
              <span>{field.label}</span>
              <em>
                {field.prefix ? <b>{field.prefix}</b> : null}
                {field.value}
              </em>
            </label>
          ))}
        </div>
      ) : null}
      {gate.code ? (
        <div className="chat-gate-code-block" data-testid="chat-gate-code-block">
          <div className="chat-gate-code" data-testid="chat-gate-code" aria-label="验证码">
            {gate.code.map((digit, index) => (
              <i className={digit ? "filled" : ""} key={`${digit}-${index}`}>{digit}</i>
            ))}
          </div>
          <div className={`chat-gate-notice ${gate.notice ? "" : "placeholder"}`} data-testid="chat-gate-notice">
            {gate.notice ?? "验证码错误"}
          </div>
        </div>
      ) : null}
      {gate.status ? (
        <div className="chat-gate-status" data-testid="chat-gate-status">
          <span />
          <strong>{gate.status.title}</strong>
          <em>{gate.status.meta}</em>
        </div>
      ) : null}
      {gate.preview ? (
        <div className="chat-gate-preview">
          {gate.preview.map((item) => (
            <em key={item}>{item}</em>
          ))}
        </div>
      ) : null}
      <div className="chat-gate-actions">
        {gate.actions.map((action, index) => (
          <button className={index === 0 ? "primary" : ""} type="button" key={action}>
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}

function InlineApprovalCard({ card }) {
  return (
    <div className={`chat-inline-card ${card.tone ?? "approval"}`} data-testid="chat-approval-card" data-card-kind={card.kind ?? "approval"}>
      <div className="chat-inline-card-head">
        <span>{card.label ?? "需要确认"}</span>
        <strong>{card.title}</strong>
      </div>
      <p>{card.description}</p>
      {card.options ? (
        <div className="chat-inline-card-options">
          {card.options.map((option) => (
            <span key={option}>{option}</span>
          ))}
        </div>
      ) : null}
      <div className="chat-inline-card-actions">
        {card.actions.map((action, index) => (
          <button className={index === 0 ? "primary" : ""} type="button" key={action}>
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}

function TaotaoMessageAvatar() {
  return (
    <div className="chat-taotao-avatar" data-testid="taotao-message-avatar" aria-label="桃桃头像">
      <img src="/assets/v2/taotao/welcome.png" alt="" draggable="false" />
    </div>
  );
}

function ChatOverlay({ overlay }) {
  const actions = overlay.actions ?? [];
  const bodyItems = overlay.body ?? [];
  const quickEdits = overlay.quickEdits ?? [];
  const versions = overlay.versions ?? [];
  const closeAction = overlay.closeAction ?? (overlay.closeAction === false ? null : "close_sheet");
  const secondaryOnlyActions = new Set(["收起", "取消"]);
  const busyActions = new Set(["生成中", "发送中"]);
  const usesDestinationActions = overlay.actionStyle === "destination";
  const showInlineOverlaySubmit = Boolean(overlay.inputPlaceholder && actions.length === 0);
  const renderSuggestions = () =>
    overlay.suggestions ? (
      <div className="chat-overlay-suggestion-block">
        {overlay.suggestionsTitle ? <span className="chat-overlay-suggestion-title">{overlay.suggestionsTitle}</span> : null}
        <div className="chat-overlay-suggestions" data-testid="chat-sheet-suggestions">
          {overlay.suggestions.map((item) => (
            <button type="button" key={item.title}>
              <span>{item.title}</span>
              {item.meta ? <em>{item.meta}</em> : null}
            </button>
          ))}
        </div>
      </div>
    ) : null;
  const suggestionsAfterChat = overlay.mode === "private-create";

  return (
    <div
      className={`chat-overlay ${overlay.mode ?? "default"}`}
      data-testid="chat-detail-sheet"
      data-sheet-mode={overlay.mode ?? "default"}
      data-editing-state={overlay.editingState ?? "viewing"}
      data-opened-by={overlay.openedBy ?? "unspecified"}
      data-source-message-id={overlay.sourceMessageId ?? ""}
      data-source-capability-id={overlay.sourceCapabilityId ?? ""}
    >
      <div className="chat-overlay-handle" />
      {closeAction ? (
        <button
          className="chat-overlay-close"
          type="button"
          aria-label={overlay.closeLabel ?? "关闭"}
          data-testid="chat-sheet-close"
          data-close-action={closeAction}
        >
          <X size={15} />
        </button>
      ) : null}
      {overlay.badge ? <span className="chat-overlay-badge">{overlay.badge}</span> : null}
      <strong>{overlay.title}</strong>
      {overlay.subtitle ? <p>{overlay.subtitle}</p> : null}
      {!suggestionsAfterChat ? renderSuggestions() : null}
      {overlay.chat ? (
        <div className="chat-overlay-thread" data-testid="chat-sheet-private-thread">
          {overlay.chat.map(([speaker, text]) => {
            const speakerClass = speaker === "taotao" ? "taotao-speaker" : speaker;

            return (
              <div className={`chat-overlay-line ${speakerClass}`} data-overlay-speaker={speaker} style={{ width: "100%" }} key={`${speaker}-${text}`}>
                <span className={`chat-overlay-avatar ${speakerClass}`} data-testid="chat-sheet-private-avatar" aria-label={speaker === "taotao" ? "桃桃" : "你"}>
                  {speaker === "taotao" ? <img src="/assets/v2/taotao/welcome.png" alt="" draggable="false" /> : "你"}
                </span>
                <div className="chat-overlay-line-stack">
                  <span>{speaker === "taotao" ? "桃桃" : "你"}</span>
                  <p>{text}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
      {suggestionsAfterChat ? renderSuggestions() : null}
      {overlay.resultPreview ? (
        <div className="chat-overlay-result" data-testid="chat-sheet-result-preview">
          {overlay.resultPreview.map((item, index) => (
            <span key={item}>
              <em>{index + 1}</em>
              {item}
            </span>
          ))}
        </div>
      ) : null}
      {overlay.inviteCard ? (
        <div className="chat-overlay-invite-card" data-testid="chat-sheet-invite-card">
          <div>
            <Taotao mood="awake" compact />
            <span>{overlay.inviteCard.meta}</span>
          </div>
          <strong>{overlay.inviteCard.title}</strong>
          <em>{overlay.inviteCard.action}</em>
        </div>
      ) : null}
      {overlay.searchResult ? (
        <div className="chat-overlay-search-result" data-testid="chat-sheet-search-result">
          <span>{overlay.searchResult.label}</span>
          <strong>{overlay.searchResult.value}</strong>
          <div>
            <em>{overlay.searchResult.name}</em>
            <small>{overlay.searchResult.meta}</small>
          </div>
        </div>
      ) : null}
      {versions.length ? <OverlayVersionBoard versions={versions} /> : null}
      {overlay.drawerItems ? <TodayDrawerItems items={overlay.drawerItems} filters={overlay.filters ?? []} /> : null}
      {bodyItems.length ? (
        <div className="chat-overlay-body">
          {bodyItems.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      ) : null}
      {quickEdits.length ? (
        <div className="chat-overlay-quick-edits" data-testid="chat-sheet-quick-edits">
          {quickEdits.map((item) => (
            <button type="button" key={item}>{item}</button>
          ))}
        </div>
      ) : null}
      {overlay.inputPlaceholder ? (
        <div
          className={`chat-overlay-edit-composer ${showInlineOverlaySubmit ? "has-inline-submit" : "plain"}`}
          data-testid="chat-sheet-edit-composer"
        >
          <input
            aria-label="告诉桃桃想怎么改"
            data-testid="chat-sheet-edit-input"
            placeholder={overlay.inputPlaceholder}
            readOnly
            value={overlay.draftInput ?? ""}
          />
          {showInlineOverlaySubmit ? <SendHorizonal size={14} /> : null}
        </div>
      ) : null}
      {actions.length ? (
        <div className="chat-overlay-actions" data-action-style={overlay.actionStyle ?? "default"}>
          {actions.map((action, index) => (
            <button
              aria-disabled={busyActions.has(action) ? "true" : undefined}
              className={`${index === 0 && !secondaryOnlyActions.has(action) && !usesDestinationActions ? "primary" : ""} ${busyActions.has(action) ? "busy" : ""}`}
              type="button"
              key={action}
            >
              {action}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function OverlayVersionBoard({ versions }) {
  return (
    <div className="chat-overlay-versions" data-testid="chat-sheet-version-board">
      {versions.map((version) => (
        <div className={`chat-overlay-version ${version.tone ?? "calm"}`} key={version.id ?? version.label}>
          <span>{version.label}</span>
          <strong>{version.title}</strong>
          {version.meta ? <em>{version.meta}</em> : null}
        </div>
      ))}
    </div>
  );
}

function TodayDrawerItems({ items, filters = [] }) {
  return (
    <div className="chat-today-drawer-shell">
      {filters.length ? (
        <div className="chat-drawer-filters" data-testid="chat-drawer-filters">
          {filters.map((filter) => (
            <span className={filter.active ? "active" : ""} data-drawer-filter={filter.id} key={filter.id}>
              {filter.label}
              {typeof filter.count === "number" ? <em>{filter.count}</em> : null}
            </span>
          ))}
        </div>
      ) : null}
      <div className="chat-today-drawer" data-testid="chat-today-drawer">
      {items.map((item) => (
        <button
          className={`chat-drawer-item ${item.tone ?? "calm"}`}
          type="button"
          data-testid="chat-drawer-item"
          data-drawer-kind={item.kind}
          data-drawer-status={item.status}
          key={item.id}
        >
          <span className="chat-drawer-item-dot" />
          <span className="chat-drawer-item-copy">
            <em>{item.group}</em>
            <strong>{item.title}</strong>
            <small>{item.meta}</small>
          </span>
          <span className="chat-drawer-item-actions">
            <span className="chat-drawer-item-action">{item.action}</span>
            {item.secondaryAction ? <span className="chat-drawer-item-secondary">{item.secondaryAction}</span> : null}
          </span>
        </button>
      ))}
      </div>
    </div>
  );
}
