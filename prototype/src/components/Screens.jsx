import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Copy,
  ExternalLink,
  Heart,
  MessageCircle,
  Mic2,
  Plus,
  RefreshCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Upload,
  UserCheck,
} from "lucide-react";
import {
  chatMessages,
  memories,
  todayMoments,
} from "../data/prototypeData";
import {
  proposalScenario,
  recognitionCandidates,
  sourceChoices,
} from "../data/v33ScenarioData";
import {
  ConversationEventDock,
  EventCandidateStrip,
  EventCapsule,
  EventContextTray,
  EventDetailSheet,
} from "./ConversationEvents";
import { getParkWalkEventView } from "../data/v5ConversationEvents";
import { Taotao } from "./Taotao";

export function TodaySceneScreen({ setRoute, onSelectOption }) {
  const [momentIndex, setMomentIndex] = useState(0);
  const moment = todayMoments[momentIndex];

  const rotateMoment = () => {
    setMomentIndex((current) => (current + 1) % todayMoments.length);
  };

  const handlePrimary = () => {
    onSelectOption?.(moment.selectedOption);
    setRoute("chat");
  };

  return (
    <section className="mobile-page product-screen today-screen" data-testid="screen-today">
      <div className="today-hero">
        <div className="today-topbar">
          <div>
            <h1>今天</h1>
            <span>桃桃看见了一件小事</span>
          </div>
          <div className="couple-orbit" aria-label="两个人">
            <Avatar label="雨" tone="her" />
            <span>
              <Heart size={12} fill="currentColor" />
            </span>
            <Avatar label="川" tone="him" />
          </div>
        </div>

        <div className="today-hero-taotao">
          <Taotao mood="awake" compact />
        </div>

        <div className="today-ambient-line">
          <span />
          {moment.ambient}
        </div>
      </div>

      <article className="today-decision-card" key={moment.id}>
        <div className="decision-meta">
          <span>{moment.time}</span>
          <button type="button" data-testid="today-rotate" onClick={rotateMoment}>换一件事</button>
        </div>
        <div className="decision-ai-line">
          <Taotao mood="thinking" compact />
          <span>{moment.taotaoLine}</span>
        </div>
        <h2>{moment.title}</h2>
        <p>{moment.text}</p>

        <div className="decision-filter" aria-label={`${moment.filterIntro}${moment.filters.join("、")}`}>
          <span>{moment.filterIntro}</span>
          {moment.filters.map((filter) => (
            <em key={filter}>{filter}</em>
          ))}
        </div>

        <button className="primary-action decision-primary" type="button" data-testid="today-primary" onClick={handlePrimary}>
          {moment.primary}
          <ArrowRight size={18} />
        </button>
      </article>
    </section>
  );
}

export function ChatRoomScreen({
  prototypeState,
  isAuthed,
  isCoupleBound,
  onRequestAuth,
  onStartAwakening,
  onPreviewSourcePhoto,
  onUseDefaultSource,
  onMarkSourceUnusable,
  onFailGeneration,
  onConfirmObject,
  onShowTaotaoPreview,
  onConfirmTaotaoSelf,
  onCreateInvite,
  onOpenMini,
  onSelectOption,
  onSaveMemory,
  onNavigate,
  onUpdateNegotiation,
  onSetViewerRole,
  onRenameLife,
  onOpenEventDetail,
  onCloseEventDetail,
  onSaveEventMemory,
  reviewMode = false,
}) {
  const selectedOption = prototypeState.todayScene.selectedOption;
  const hasMemoryDraft = prototypeState.todayScene.memoryDraftStatus !== "empty";
  const onboardingStep = prototypeState.chatRoom.onboardingStep;
  const actionCardRef = useRef(null);
  const sourceObject = prototypeState.awakenSession.selectedObject;
  const brandName = prototypeState.identity?.brandName ?? "桃桃";
  const lifeName = prototypeState.identity?.lifeDisplayName ?? prototypeState.taotaoLife.displayName ?? brandName;
  const viewerRole = prototypeState.viewer?.viewerRole ?? "initiator";
  const eventStatus = prototypeState.todayNegotiation?.status ?? "suggested";
  const eventDisplayMode = prototypeState.conversationEvents?.displayMode
    ?? (["completed", "memory_prompted", "converted_to_memory"].includes(eventStatus) ? "collapsed" : "expanded");
  const detailEventId = prototypeState.conversationEvents?.detailEventId;
  const eventView = getParkWalkEventView(eventStatus, viewerRole);
  const [draft, setDraft] = useState("");
  const [localMessages, setLocalMessages] = useState([]);
  const [activeEventType, setActiveEventType] = useState("proposal");
  const [candidateEventType, setCandidateEventType] = useState(null);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (prototypeState.miniReturn || onboardingStep !== "idle") {
      window.setTimeout(() => {
        actionCardRef.current?.scrollIntoView({ block: "center", behavior: "auto" });
      }, 80);
    }
  }, [prototypeState.miniReturn, onboardingStep]);

  useEffect(() => {
    if (localMessages.length || candidateEventType) {
      window.setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ block: "end", behavior: "auto" });
      }, 80);
    }
  }, [localMessages.length, candidateEventType]);

  const title = isCoupleBound ? `小雨、阿川和${lifeName}` : isAuthed ? `我和${lifeName}` : brandName;
  const caption = isCoupleBound
    ? prototypeState.todayNegotiation.status === "memory_prompted" || hasMemoryDraft
      ? "有一件小事等两个人点头留下"
      : "3 人聊天"
    : isAuthed
      ? `先把${lifeName}叫醒，另一半稍后加入`
      : "先聊一句，需要保存时再登录";

  const sendDraft = () => {
    const text = draft.trim();
    if (!text) return;

    const nextEventType = classifyChatIntent(text);
    if (isCoupleBound) {
      setActiveEventType(nextEventType);
      setCandidateEventType(nextEventType);
    }

    setLocalMessages((current) => [
      ...current,
      { from: viewerRole === "receiver" ? "him" : "her", name: viewerRole === "receiver" ? "阿川" : "小雨", text },
      {
        from: "taotao",
        name: lifeName,
        text: getTaotaoReply(nextEventType, isCoupleBound),
      },
    ]);
    setDraft("");
  };

  return (
    <section
      className="mobile-page product-screen chat-screen room-screen"
      data-testid="screen-chat"
      data-couple-status={prototypeState.coupleBond.status}
      data-life-status={prototypeState.taotaoLife.lifeStatus}
      data-onboarding-step={onboardingStep}
      data-viewer-role={viewerRole}
      data-life-display-name={lifeName}
      data-source-media-status={prototypeState.sourceMedia?.status}
      data-generation-status={prototypeState.generationJob?.status}
      data-negotiation-status={prototypeState.todayNegotiation?.status}
      data-memory-status={prototypeState.nestMemory?.status}
    >
      <header className="chat-room-bar room-topbar">
        <div className="room-mark">
          <Taotao mood={prototypeState.taotaoLife.lifeStatus === "awake" ? "awake" : "thinking"} compact />
        </div>
        <div className="chat-room-title">
          <h1>{title}</h1>
          <p>{caption}</p>
        </div>
        <button className="room-life-button" type="button" aria-label="查看桃桃" data-testid="open-taotao-life" onClick={() => onNavigate("taotao")}>
          <Sparkles size={18} />
        </button>
      </header>

      {isCoupleBound ? (
        <ConversationEventDock
          status={eventStatus}
          viewerRole={viewerRole}
          onOpenDetail={onOpenEventDetail}
        />
      ) : null}

      <div className="chat-scroll">
        <div className="chat-day-note">{isCoupleBound ? "今天 19:42" : `先和${lifeName}说一句`}</div>

        <div className="message-list" data-testid="chat-messages">
          {prototypeState.miniReturn ? (
            <article className="message taotao mini-return-message">
              <TaotaoAvatar />
              <div>
                <span>{lifeName}</span>
                <p>{prototypeState.miniReturn.text}</p>
              </div>
            </article>
          ) : null}

          {!isAuthed ? (
            <article className="message taotao">
              <TaotaoAvatar />
              <div>
                <span>{brandName}</span>
                <p>先说一句也可以。等你想把我留下来，再确认手机号。</p>
              </div>
            </article>
          ) : null}

          {isAuthed && !isCoupleBound ? (
            <>
              <article className="message her">
                <Avatar label="雨" tone="her" />
                <div>
                  <span>小雨</span>
                  <p>先在这里把{lifeName}叫醒吧。</p>
                </div>
              </article>
              <article className="message taotao">
                <TaotaoAvatar />
                <div>
                  <span>{lifeName}</span>
                  <p>我会从一个你们熟悉的小东西里醒来。等你先确认好，再把邀请发给阿川。</p>
                </div>
              </article>
            </>
          ) : null}

          {isCoupleBound ? (
            chatMessages.map((message, index) => (
              <article className={`message ${message.from}`} key={`${message.from}-${index}`}>
                {message.from === "taotao" ? <TaotaoAvatar /> : <Avatar label={message.name.slice(0, 1)} tone={message.from} />}
                <div>
                  <span>{message.from === "taotao" ? lifeName : message.name}</span>
                  <p>{message.text}</p>
                </div>
              </article>
            ))
          ) : null}

          {localMessages.map((message, index) => (
            <article className={`message ${message.from}`} key={`local-${message.from}-${index}`}>
              {message.from === "taotao" ? <TaotaoAvatar /> : <Avatar label={message.name.slice(0, 1)} tone={message.from} />}
              <div>
                <span>{message.name}</span>
                <p>{message.text}</p>
              </div>
            </article>
          ))}
        </div>

        {isCoupleBound ? (
          <article className="message taotao event-status-message" data-testid="event-status-message">
            <TaotaoAvatar />
            <div>
              <span>{lifeName}</span>
              <p>{eventView.chatLine}</p>
            </div>
          </article>
        ) : null}

        {isCoupleBound && activeEventType === "proposal" && eventDisplayMode === "collapsed" ? (
          <EventCapsule
            status={eventStatus}
            viewerRole={viewerRole}
            lifeName={lifeName}
            onOpenDetail={onOpenEventDetail}
          />
        ) : null}

        {isCoupleBound && candidateEventType && activeEventType !== "proposal" ? (
          <EventCandidateStrip eventType={candidateEventType} lifeName={lifeName} onOpenDetail={onOpenEventDetail} />
        ) : null}

        <div className="chat-bottom-spacer" ref={chatBottomRef} aria-hidden="true" />

        {!isCoupleBound ? (
          <AwakenInChatCard
            refNode={actionCardRef}
            isAuthed={isAuthed}
            onboardingStep={onboardingStep}
            lifeName={lifeName}
            brandName={brandName}
            sourceObject={sourceObject}
            sourceMediaStatus={prototypeState.sourceMedia?.status}
            recognitionStatus={prototypeState.recognitionJob?.status}
            generationStatus={prototypeState.generationJob?.status}
            inviteStatus={prototypeState.awakenSession.inviteStatus}
            miniStatus={prototypeState.miniLinkSession.status}
            onRequestAuth={onRequestAuth}
            onStartAwakening={onStartAwakening}
            onPreviewSourcePhoto={onPreviewSourcePhoto}
            onUseDefaultSource={onUseDefaultSource}
            onMarkSourceUnusable={onMarkSourceUnusable}
            onFailGeneration={onFailGeneration}
            onConfirmObject={onConfirmObject}
            onShowTaotaoPreview={onShowTaotaoPreview}
            onConfirmTaotaoSelf={onConfirmTaotaoSelf}
            onCreateInvite={onCreateInvite}
            onOpenMini={onOpenMini}
            onRenameLife={onRenameLife}
          />
        ) : null}
      </div>

      {detailEventId ? (
        <EventDetailSheet
          status={eventStatus}
          viewerRole={viewerRole}
          lifeName={lifeName}
          onClose={onCloseEventDetail}
          onSaveMemory={onSaveEventMemory}
        />
      ) : null}

      <div className="composer-wrap">
        {isCoupleBound ? (
          <EventContextTray
            status={eventStatus}
            viewerRole={viewerRole}
            onUpdateNegotiation={onUpdateNegotiation}
            onOpenDetail={onOpenEventDetail}
            onSaveMemory={onSaveEventMemory}
            onNavigate={onNavigate}
          />
        ) : (
          <ComposerShortcuts
            isAuthed={isAuthed}
            isCoupleBound={isCoupleBound}
            onboardingStep={onboardingStep}
            onRequestAuth={onRequestAuth}
            onStartAwakening={onStartAwakening}
            onUseDefaultSource={onUseDefaultSource}
            onCreateInvite={onCreateInvite}
            onNavigate={onNavigate}
            lifeName={lifeName}
          />
        )}
        <div className="composer" data-testid="chat-composer">
          <button type="button" aria-label="更多">
            <Plus size={18} />
          </button>
          <textarea
            aria-label={`给${lifeName}发消息`}
            data-testid="chat-input"
            placeholder={isCoupleBound ? "说说今天卡住的小事..." : `先和${lifeName}说一句...`}
            rows={1}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendDraft();
              }
            }}
          />
          <button type="button" aria-label="语音输入">
            <Mic2 size={18} />
          </button>
          <button type="button" aria-label="发送" data-testid="chat-send" disabled={!draft.trim()} onClick={sendDraft}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}

function classifyChatIntent(text) {
  if (/好好说|怎么说|说轻|表达|不开心/.test(text)) return "say_better";
  if (/提醒|闹钟|记得|20[:：]?\d{0,2}|明天/.test(text)) return "reminder";
  if (/留下|记住|小窝|回忆/.test(text)) return "memory";
  if (/吃|喝|什么|去哪|看什么|选/.test(text)) return "choice";
  if (/公园|走|约|一起|今晚|周末/.test(text)) return "proposal";
  return "choice";
}

function TaotaoAvatar() {
  return (
    <div className="taotao-message-avatar" data-testid="taotao-message-avatar" aria-hidden="true">
      <Taotao mood="awake" compact />
    </div>
  );
}

function getTaotaoReply(eventType, isCoupleBound) {
  if (!isCoupleBound) return "我先陪你放在这里。等你想让我留下来，再选一个熟悉的小东西。";

  const replies = {
    proposal: "我把这件事整理成一个容易点头的小提议。",
    choice: "我先把选择变少一点，不用现在想太多。",
    say_better: "我换成一句更好发出去的话，你可以再改。",
    reminder: "我先记下时间，等你们点头后再提醒。",
    memory: "这件事可以留下，但要等你们两个都确认。",
  };
  return replies[eventType] ?? replies.choice;
}

function GeneratedChatEventCard({ refNode, eventType, lifeName, onUpdateNegotiation, onSaveMemory }) {
  const eventMap = {
    choice: {
      type: "choice",
      status: "ready",
      eyebrow: `${lifeName}把选择变少了`,
      title: "今晚先选一个轻松的",
      text: "我先排除了远、贵、要排队的，把今晚变成三个小选择。",
      meta: ["热汤面", "楼下小馆", "回家煮粥"],
      primary: "发给阿川",
      secondary: ["换一批", "晚点再说"],
    },
    say_better: {
      type: "say_better",
      status: "draft",
      eyebrow: `${lifeName}换了一种说法`,
      title: "我想你陪我一下，可以吗？",
      text: "不讲道理，也不指责。先把想被陪伴这件事说清楚。",
      meta: ["温和一点", "短一点", "直接一点"],
      primary: "发给阿川",
      secondary: ["再软一点", "复制"],
    },
    reminder: {
      type: "reminder",
      status: "pending",
      eyebrow: `${lifeName}准备轻轻提醒`,
      title: "今晚 20:10 提醒你们出门",
      text: "只有这件事被你们确认后，提醒才会生效。",
      meta: ["20:10", "只提醒一次", "可取消"],
      primary: "设提醒",
      secondary: ["改时间", "取消"],
    },
    memory: {
      type: "memory_prompt",
      status: "draft",
      eyebrow: `${lifeName}觉得可以留下`,
      title: "要放进小窝吗？",
      text: "我先写一个很短的草稿。你点头后，还会等阿川确认。",
      meta: ["双方确认后可见", "可改一句", "可不留下"],
      primary: "去确认",
      secondary: ["改一句", "不留下"],
    },
  };
  const event = eventMap[eventType] ?? eventMap.choice;

  return (
    <article
      className="chat-action-card generated-event-card"
      ref={refNode}
      data-testid="chat-action-card"
      data-card-type={event.type}
      data-card-status={event.status}
    >
      <div className="action-card-top">
        <span className="action-card-dot" />
        <span>{event.eyebrow}</span>
      </div>
      <h2>{event.title}</h2>
      <p>{event.text}</p>
      <div className="proposal-meta">
        {event.meta.map((item) => <span key={item}>{item}</span>)}
      </div>
      <div className="proposal-actions">
        <button
          className="primary-action"
          type="button"
          data-testid={eventType === "memory" ? "chat-save-memory" : `event-${event.type}-primary`}
          onClick={eventType === "memory" ? onSaveMemory : () => onUpdateNegotiation?.("waiting_partner")}
        >
          {event.primary}
        </button>
        {event.secondary.map((item) => (
          <button type="button" key={item}>{item}</button>
        ))}
      </div>
    </article>
  );
}

function ComposerShortcuts({
  isAuthed,
  isCoupleBound,
  onboardingStep,
  onRequestAuth,
  onStartAwakening,
  onUseDefaultSource,
  onCreateInvite,
  onNavigate,
  lifeName,
}) {
  let shortcuts = [];

  if (!isAuthed) {
    shortcuts = [
      [`叫醒${lifeName}`, onRequestAuth, UserCheck],
    ];
  } else if (!isCoupleBound && onboardingStep === "idle") {
    shortcuts = [
      ["上传照片", onStartAwakening, Upload],
      ["默认小物", onUseDefaultSource, Sparkles],
    ];
  } else if (!isCoupleBound && ["preview", "self_confirmed", "invite_created"].includes(onboardingStep)) {
    shortcuts = [];
  } else {
    shortcuts = [];
  }

  if (!shortcuts.length) return null;

  return (
    <div className="composer-shortcuts" data-testid="composer-shortcuts">
      {shortcuts.map(([label, action, Icon]) => (
        <button key={label} type="button" onClick={action}>
          <Icon size={14} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

function AwakenInChatCard({
  refNode,
  isAuthed,
  onboardingStep,
  lifeName,
  brandName,
  sourceObject,
  sourceMediaStatus,
  recognitionStatus,
  generationStatus,
  inviteStatus,
  miniStatus,
  onRequestAuth,
  onStartAwakening,
  onPreviewSourcePhoto,
  onUseDefaultSource,
  onMarkSourceUnusable,
  onFailGeneration,
  onConfirmObject,
  onShowTaotaoPreview,
  onConfirmTaotaoSelf,
  onCreateInvite,
  onOpenMini,
  onRenameLife,
}) {
  const [nameDraft, setNameDraft] = useState(lifeName);

  useEffect(() => {
    setNameDraft(lifeName);
  }, [lifeName]);

  const saveLifeName = () => {
    const nextName = nameDraft.trim() || "桃桃";
    setNameDraft(nextName);
    onRenameLife?.(nextName);
  };

  if (!isAuthed) {
    return (
      <article
        className="chat-action-card awaken-card"
        ref={refNode}
        data-testid="chat-action-card"
        data-card-type="awakening_auth"
        data-card-status="guest"
      >
        <div className="action-card-top">
          <span className="action-card-dot" />
          <span>可以先聊，不急着上传</span>
        </div>
        <h2>给{brandName}找个小东西</h2>
        <p>也可以先聊一句。想保存的时候，我再问手机号。</p>
        <div className="awaken-source-preview">
          <img src="/assets/v2/awakening-object.png" alt="餐桌边的陶瓷杯" />
          <div>
            <strong>以后可以从生活照片里醒来</strong>
            <span>也可以先用默认小物，不上传也能继续体验</span>
          </div>
        </div>
        <button className="primary-action card-primary" type="button" data-testid="auth-submit-intent" onClick={onRequestAuth}>
          创建{brandName}
          <ArrowRight size={18} />
        </button>
      </article>
    );
  }

  if (onboardingStep === "idle") {
    return (
      <article
        className="chat-action-card awaken-card"
        ref={refNode}
        data-testid="chat-action-card"
        data-card-type="awakening_source_choice"
        data-card-status={sourceMediaStatus}
      >
        <div className="action-card-top">
          <span className="action-card-dot" />
          <span>选一个它醒来的方式</span>
        </div>
        <h2>让{lifeName}从一个小东西里醒来</h2>
        <p>照片不是门槛。你可以上传，也可以先用默认小物，等以后再把它换成你们真正熟悉的东西。</p>
        <div className="source-choice-grid">
          {sourceChoices.map((choice) => {
            const action = choice.id === "upload" ? onStartAwakening : onUseDefaultSource;
            const testId = choice.id === "upload" ? "start-awakening" : `source-choice-${choice.id}`;
            return (
              <button className="source-choice-card" key={choice.id} type="button" data-testid={testId} onClick={action}>
                <strong>{choice.title}</strong>
                <span>{choice.text}</span>
              </button>
            );
          })}
        </div>
      </article>
    );
  }

  if (onboardingStep === "source") {
    if (sourceMediaStatus === "selecting") {
      return (
        <article
          className="chat-action-card awaken-card source-upload-card"
          ref={refNode}
          data-testid="chat-action-card"
          data-card-type="source_upload"
          data-card-status={sourceMediaStatus}
        >
          <div className="action-card-top">
            <span className="action-card-dot" />
            <span>选择一个熟悉的小东西</span>
          </div>
          <h2>让{lifeName}从照片里醒来</h2>
          <p>可以拍宠物、纪念物、玩偶、杯子，或者先用默认小物。照片只用于生成你们的{lifeName}。</p>
          <label className="source-upload-box" data-testid="source-upload-box">
            <input
              aria-label="上传桃桃来源照片"
              data-testid="source-upload-input"
              type="file"
              accept="image/*"
              onChange={(event) => onPreviewSourcePhoto?.(event.target.files?.[0]?.name || "餐桌边的陶瓷杯.jpg")}
            />
            <Upload size={20} />
            <strong>从相册选一张</strong>
            <span>上传后先预览，再确认桃桃从哪里醒来</span>
          </label>
          <div className="secondary-action-row">
            <button type="button" data-testid="source-demo-photo" onClick={() => onPreviewSourcePhoto?.("餐桌边的陶瓷杯.jpg")}>用这张杯子照片</button>
            <button type="button" data-testid="source-choice-default-embryo" onClick={onUseDefaultSource}>先用默认小物</button>
          </div>
        </article>
      );
    }

    if (sourceMediaStatus === "unusable" || recognitionStatus === "low_confidence") {
      return (
        <article
          className="chat-action-card awaken-card recovery-card"
          ref={refNode}
          data-testid="chat-action-card"
          data-card-type="source_recovery"
          data-card-status={sourceMediaStatus}
        >
          <div className="action-card-top">
            <span className="action-card-dot warning" />
            <span>这张图有点看不清</span>
          </div>
          <h2>先别卡在照片上</h2>
          <p>可以换一张、手动圈出小物，或者先用默认小物继续。之后你们随时能改来源。</p>
          <div className="recovery-actions">
            <button type="button" data-testid="source-retry-upload" onClick={onStartAwakening}>换一张</button>
            <button type="button" data-testid="source-manual-pick" onClick={() => onConfirmObject(sourceObject)}>手动圈出</button>
            <button type="button" data-testid="source-choice-default-embryo" onClick={onUseDefaultSource}>先用默认小物</button>
          </div>
        </article>
      );
    }

    return (
      <article
        className="chat-action-card awaken-card"
        ref={refNode}
        data-testid="chat-action-card"
        data-card-type="source_recognition"
        data-card-status={recognitionStatus}
      >
        <div className="action-card-top">
          <span className="action-card-dot" />
          <span>{sourceMediaStatus === "previewing" ? "照片已选好" : `${lifeName}正在看这张照片`}</span>
        </div>
        <h2>{sourceMediaStatus === "previewing" ? "先确认桃桃从哪里醒来" : "它好像看见了杯子"}</h2>
        <p>确认来源后，{lifeName}会先把这个小物当作第一段共同生活的锚点。</p>
        {sourceMediaStatus === "previewing" ? (
          <div className="source-photo-review" data-testid="source-photo-preview">
            <img src="/assets/v2/awakening-object.png" alt="餐桌边的陶瓷杯" />
            <div>
              <span>已选择</span>
              <strong>餐桌边的陶瓷杯</strong>
              <p>如果不是它，也可以直接点下面的候选。</p>
            </div>
          </div>
        ) : null}
        <div className="candidate-list in-chat">
          {recognitionCandidates.map(([name, badge, note]) => (
            <button
              className={name === sourceObject ? "selected" : ""}
              key={name}
              type="button"
              data-testid="wake-object-candidate"
              onClick={() => onConfirmObject(name)}
            >
              <strong>{name}</strong>
              <small>{note}</small>
              <em>{badge}</em>
            </button>
          ))}
        </div>
        <div className="secondary-action-row">
          <button type="button" data-testid="source-photo-unusable" onClick={onMarkSourceUnusable}>看不清，换个方式</button>
          <button type="button" data-testid="source-choice-default-embryo" onClick={onUseDefaultSource}>先用默认小物</button>
        </div>
      </article>
    );
  }

  if (onboardingStep === "generating") {
    if (generationStatus === "failed") {
      return (
        <article
          className="chat-action-card awaken-card recovery-card"
          ref={refNode}
          data-testid="chat-action-card"
          data-card-type="generation_recovery"
          data-card-status="failed"
        >
          <div className="action-card-top">
            <span className="action-card-dot warning" />
            <span>它刚刚没有醒好</span>
          </div>
          <h2>再轻轻叫一次</h2>
          <p>生成失败不会丢掉来源。可以重试，也可以先用默认小物继续，不让流程断在这里。</p>
          <div className="recovery-actions">
            <button type="button" data-testid="generation-retry" onClick={() => onConfirmObject(sourceObject)}>再试一次</button>
            <button type="button" data-testid="generation-use-default" onClick={onUseDefaultSource}>用默认小物</button>
            <button type="button" data-testid="generation-later" onClick={onShowTaotaoPreview}>先看一个预览</button>
          </div>
        </article>
      );
    }

    return (
      <article
        className="chat-action-card awaken-card"
        ref={refNode}
        data-testid="chat-action-card"
        data-card-type="generation_running"
        data-card-status={generationStatus}
      >
        <div className="action-card-top">
          <span className="action-card-dot" />
          <span>{lifeName}正在长出来</span>
        </div>
        <div className="generating-inline">
          <Taotao mood="generating" compact />
          <div>
            <h2>它在学会靠近你们</h2>
            <p>{lifeName}正在熟悉这只{sourceObject}和你们说话的方式。先让它安静醒一会儿。</p>
          </div>
        </div>
        <button className="primary-action card-primary" type="button" data-testid="show-taotao-preview" onClick={onShowTaotaoPreview}>
          看看它醒来
          <ArrowRight size={18} />
        </button>
      </article>
    );
  }

  if (onboardingStep === "preview") {
    return (
      <article
        className="chat-action-card awaken-card taotao-preview-card"
        ref={refNode}
        data-testid="chat-action-card"
        data-card-type="life_preview"
        data-card-status="preview"
      >
        <div className="mini-taotao-preview">
          <Taotao mood="awake" compact />
        </div>
        <h2>它醒了</h2>
        <p>{lifeName}会先记住这个{sourceObject}，也会在两个人之间轻轻递话。</p>
        <div className="preview-name-row">
          <span>名字</span>
          <input
            aria-label="桃桃的名字"
            data-testid="life-name-input"
            value={nameDraft}
            onChange={(event) => setNameDraft(event.target.value)}
          />
          <button type="button" data-testid="life-name-save" onClick={saveLifeName}>保存</button>
        </div>
        <button className="primary-action card-primary" type="button" data-testid="self-confirm-taotao" onClick={onConfirmTaotaoSelf}>
          我先确认
          <ArrowRight size={18} />
        </button>
      </article>
    );
  }

  if (onboardingStep === "self_confirmed") {
    return (
      <article
        className="chat-action-card awaken-card"
        ref={refNode}
        data-testid="chat-action-card"
        data-card-type="invite_prepare"
        data-card-status="self_confirmed"
      >
        <div className="action-card-top">
          <span className="action-card-dot" />
          <span>你已经确认</span>
        </div>
        <h2>现在邀请阿川确认{lifeName}</h2>
        <p>阿川只会看到这个小生命和来源小物，不会看到你刚才和{lifeName}聊过什么。</p>
        <div className="wechat-invite-card soft">
          <img src="/assets/v2/awakening-object.png" alt={sourceObject} />
          <div>
            <span>来自{brandName}</span>
            <strong>小雨邀请你见见{lifeName}</strong>
          </div>
        </div>
        <button className="primary-action card-primary" type="button" data-testid="create-invite" onClick={onCreateInvite}>
          用微信邀请阿川
          <ArrowRight size={18} />
        </button>
      </article>
    );
  }

  const inviteCopy = {
    created: ["微信邀请已准备好", "阿川点开微信卡片后，只需要确认这是不是你们的小东西。"],
    opened: ["阿川已经打开邀请", "他正在看来源小物。这里先安静等一下，不用重复发送。"],
    countered: ["阿川想改一下", "他觉得来源可以再换一张。你可以重新选择，也可以晚点一起看。"],
    needs_edit: ["阿川想改一下", "他觉得来源可以再换一张。你可以重新选择，也可以晚点一起看。"],
    rejected: ["阿川暂时没有确认", `${lifeName}会先等一等。你们可以晚点再一起看。`],
    expired: ["这条邀请过期了", "为了安全，过期后需要重新发一次。刚才的选择还在。"],
    confirmed: ["阿川也确认了", `${lifeName}已经可以一起回应你们。`],
  }[miniStatus] ?? ["微信邀请已准备好", "对方点开微信卡片后，只需要确认这是不是你们的小东西。"];

  return (
    <article
      className="chat-action-card awaken-card invite-created-card"
      ref={refNode}
      data-testid="chat-action-card"
      data-card-type="invite_created"
      data-card-status={miniStatus}
    >
      <div className="action-card-top">
        <span className="action-card-dot" />
        <span data-testid="wake-invite-status">{inviteStatus === "created" ? inviteCopy[0] : "邀请待生成"}</span>
      </div>
      <h2>阿川会从微信里进来</h2>
      <p>{inviteCopy[1]}</p>
      <div className="wechat-invite-card">
        <img src="/assets/v2/awakening-object.png" alt={sourceObject} />
        <div>
          <span>来自{brandName}</span>
          <strong>小雨邀请你见见{lifeName}</strong>
        </div>
      </div>
      <button className="primary-action card-primary" type="button" data-testid="open-mini-surface" onClick={onOpenMini}>
        {miniStatus === "expired" ? "重新发送" : "发给阿川"}
        <ArrowRight size={18} />
      </button>
    </article>
  );
}

function ProposalNegotiationCard({
  refNode,
  prototypeState,
  lifeName,
  onUpdateNegotiation,
  onSetViewerRole,
  onSaveMemory,
  reviewMode = false,
}) {
  const status = prototypeState.todayNegotiation?.status ?? "suggested";
  const viewerRole = prototypeState.viewer?.viewerRole ?? "initiator";
  const isReceiver = viewerRole === "receiver";
  const hasPartnerCounter = status === "countered";
  const isAccepted = status === "accepted";
  const isCompleted = status === "completed";
  const isMemoryPrompted = status === "memory_prompted";
  const isMemorySaved = status === "converted_to_memory";

  const title = isReceiver
    ? `${proposalScenario.initiatorName}想今晚去公园`
    : hasPartnerCounter
      ? `${proposalScenario.receiverName}想晚一点、近一点`
      : isAccepted
        ? "这件小事已经约好"
        : isCompleted || isMemoryPrompted || isMemorySaved
          ? "这件事可以留下来"
          : "今晚去公园走一圈？";

  const statusLine = isReceiver
    ? "小雨发来一件小事"
    : hasPartnerCounter
      ? "阿川看过了，也给了一个更轻的版本"
      : isAccepted
        ? "双方已经点头"
        : isCompleted
          ? "你们已经完成了这件小事"
          : isMemoryPrompted
            ? `${lifeName}觉得这件事值得留下`
            : "已发给阿川，等他点头";

  const primaryText = isReceiver
    ? "先答一句就好，想改也可以。"
    : hasPartnerCounter
      ? "他把时间往后挪了一点，也把地点换得更近。你可以直接按这个来。"
      : isAccepted
        ? `${lifeName}会在 20:10 轻轻提醒一次。完成后再决定要不要放进小窝。`
        : isCompleted || isMemoryPrompted
          ? "不用写长日记，只留下这件事和一个很轻的理由。"
          : "阿川看到后，可以同意、轻改或晚点答。你关心的是他有没有收到、有没有点头。";

  return (
    <article
      className="chat-action-card proposal-card"
      ref={refNode}
      data-testid="chat-action-card"
      data-card-id={proposalScenario.id}
      data-card-type={isReceiver ? "proposal_receiver" : "proposal_sender"}
      data-card-status={status}
      data-owner={isReceiver ? proposalScenario.initiatorName : "me"}
      data-viewer-role={viewerRole}
      data-negotiation-status={status}
      data-memory-status={prototypeState.nestMemory?.status}
    >
      <div className="action-card-top">
        <span className="action-card-dot" />
        <span>{statusLine}</span>
      </div>
      <h2>{title}</h2>
      <p>{primaryText}</p>

      <div className="proposal-meta">
        <span>{isReceiver || !hasPartnerCounter ? proposalScenario.time : proposalScenario.counterTime}</span>
        <span>{isReceiver || !hasPartnerCounter ? proposalScenario.place : proposalScenario.counterPlace}</span>
        <span>{proposalScenario.duration}</span>
      </div>

      {!isReceiver ? (
        <div className="status-trail" data-testid="proposal-status-trail">
          {proposalScenario.senderTrail.map((item) => <span key={item}>{item}</span>)}
          {status === "waiting_partner" || status === "suggested" ? <em>等阿川回应</em> : null}
          {status === "accepted" ? <em>已约好</em> : null}
        </div>
      ) : null}

      {hasPartnerCounter ? (
        <div className="proposal-diff" data-testid="proposal-counter-diff">
          <div>
            <span>原来</span>
            <strong>{proposalScenario.time} · {proposalScenario.place}</strong>
          </div>
          <div>
            <span>阿川想改成</span>
            <strong>{proposalScenario.counterTime} · {proposalScenario.counterPlace}</strong>
          </div>
        </div>
      ) : null}

      {isMemoryPrompted || isMemorySaved ? (
        <div className="action-card-result" data-testid="memory-draft">
          <span>{isMemorySaved ? "这件小事已经放进小窝。" : "建议留下：晚饭后，你们一起去了公园，选择终于变少了一点。"}</span>
          {!isMemorySaved ? (
            <button type="button" data-testid="chat-save-memory" onClick={onSaveMemory}>去确认</button>
          ) : null}
        </div>
      ) : null}

      <div className="proposal-actions">
        {isReceiver ? (
          <>
            <button className="primary-action" type="button" data-testid="proposal-accept" onClick={() => onUpdateNegotiation?.("accepted")}>
              可以，20:30
            </button>
            <button type="button" data-testid="proposal-counter-time" onClick={() => onUpdateNegotiation?.("countered")}>晚点 21:00</button>
            <button type="button" data-testid="proposal-snooze" onClick={() => onUpdateNegotiation?.("snoozed")}>晚点再答</button>
          </>
        ) : hasPartnerCounter ? (
          <>
            <button className="primary-action" type="button" data-testid="proposal-accept-counter" onClick={() => onUpdateNegotiation?.("accepted")}>
              就按这个来
            </button>
            <button type="button" data-testid="proposal-counter-time" onClick={() => onUpdateNegotiation?.("waiting_partner")}>再提一个</button>
          </>
        ) : isAccepted ? (
          <>
            <button className="primary-action" type="button" data-testid="agreement-complete" onClick={() => onUpdateNegotiation?.("completed")}>
              我们回来了
            </button>
            <button type="button" data-testid="proposal-reminder">提醒一次</button>
          </>
        ) : isCompleted ? (
          <button className="primary-action" type="button" data-testid="chat-save-memory" onClick={() => onUpdateNegotiation?.("memory_prompted")}>
            把今晚写成一条小记忆
          </button>
        ) : !isMemoryPrompted && !isMemorySaved ? (
          <>
            {status === "suggested" ? (
              <button className="primary-action" type="button" data-testid="proposal-send" onClick={() => onUpdateNegotiation?.("waiting_partner")}>
                发给阿川
              </button>
            ) : (
              <>
                <button className="primary-action" type="button" data-testid="proposal-reminder">提醒一次</button>
                <button type="button" data-testid="proposal-withdraw">撤回</button>
              </>
            )}
          </>
        ) : null}
      </div>
    </article>
  );
}

export function TaotaoLifeScreen({ prototypeState, onNavigate }) {
  const lifeStatus = prototypeState.taotaoLife.lifeStatus;
  const lifeName = prototypeState.identity?.lifeDisplayName ?? prototypeState.taotaoLife.displayName ?? "桃桃";
  const sourceStatus = prototypeState.sourceMedia?.status ?? "empty";
  const negotiationStatus = prototypeState.todayNegotiation?.status ?? "suggested";
  const memoryStatus = prototypeState.nestMemory?.status ?? "empty";
  const statusCopy = {
    seed: ["还在种子里", "它已经有名字，还需要一个来源方式正式醒来。"],
    source_selected: ["已经选好来源", "它会先从一个熟悉的小东西里认识你们。"],
    forming: ["正在长出来", "它正在从你们的小物里学习动作、语气和边界。"],
    preview: ["等你点头", "你可以先看看它的样子，也可以改名字。"],
    pending_partner_confirm: ["等阿川点头", "只有两个人都确认后，它才会一起回应你们。"],
    awake: ["已经醒来", "难选、难说、想留下的小事，可以先交给它。"],
  }[lifeStatus] ?? ["正在靠近", "它会随着你们的共同确认慢慢稳定下来。"];

  const sourceCopy = {
    empty: "还没有选择",
    selecting: "正在选择",
    uploaded: `来自${prototypeState.taotaoLife.sourceObject}`,
    default_embryo: "先用默认小物",
    unusable: "上一张图看不清",
  }[sourceStatus] ?? `来自${prototypeState.taotaoLife.sourceObject}`;

  const todoCopy = {
    waiting_partner: "等阿川回应今晚这件事",
    countered: "看看阿川改过的版本",
    accepted: "20:10 轻轻提醒一次",
    completed: "问问要不要留下",
    memory_prompted: "小窝里有一件事待确认",
    converted_to_memory: "最近没有待处理",
  }[negotiationStatus] ?? (lifeStatus === "awake" ? "最近没有待处理" : "先完成双方确认");

  return (
    <section
      className="mobile-page product-screen taotao-life-screen"
      data-testid="taotao-life-panel"
      data-life-status={lifeStatus}
      data-life-display-name={lifeName}
      data-source-media-status={sourceStatus}
      data-negotiation-status={negotiationStatus}
    >
      <ScreenHeader title={lifeName} caption={`来自桃桃 · ${sourceCopy}`} />

      <div className="life-hero">
        <div className="life-orbit">
          <Taotao mood={lifeStatus === "awake" ? "awake" : "thinking"} compact />
        </div>
        <div className="life-status-copy">
          <span>{statusCopy[0]}</span>
          <h2>{lifeName}</h2>
          <p>{statusCopy[1]}</p>
        </div>
      </div>

      <div className="life-panel-list">
        <article className="life-panel-item life-todo">
          <span>现在要处理</span>
          <strong>{todoCopy}</strong>
          <p>{negotiationStatus === "memory_prompted" ? "等两个人点头后，这件事才会进小窝。" : "最近没有急事，可以先从聊天里开始。"}</p>
        </article>
        <article className="life-panel-item">
          <span>名字与称呼</span>
          <strong>{lifeName}</strong>
          <p>想换一个更像你们的小名，可以在预览页或后续设置里改。</p>
        </article>
        <article className="life-panel-item">
          <span>来源照片</span>
          <strong>{sourceCopy}</strong>
          <p>来源可以以后再换；不上传照片时，也会先保留一个温和的默认形象。</p>
        </article>
        <article className="life-panel-item">
          <span>双方确认</span>
          <strong>{prototypeState.coupleBond.status === "bound" ? "两个人已经点头" : prototypeState.awakenSession.inviteStatus === "created" ? "等阿川确认" : "先由你确认"}</strong>
          <p>只有两个人都点头后，桃桃才会一起回应你们。</p>
        </article>
        <article className="life-panel-item">
          <span>少打扰</span>
          <strong>{memoryStatus === "draft" ? "有一件事等确认" : "默认只轻提醒"}</strong>
          <p>它不会替你们下决定，也不会把没确认的聊天自动变成记忆。</p>
        </article>
        <article className="life-panel-item life-actions">
          <span>可以调整</span>
          <div className="life-action-row">
            <button type="button">改名字</button>
            <button type="button">换来源</button>
            <button type="button">少打扰</button>
          </div>
        </article>
      </div>

    </section>
  );
}

export function MemoryNestScreen({ prototypeState, onConfirmMemory }) {
  const memoryDraftStatus = prototypeState.todayScene.memoryDraftStatus;
  const nestStatus = prototypeState.nestMemory?.status;
  const lifeName = prototypeState.identity?.lifeDisplayName ?? prototypeState.taotaoLife.displayName ?? "桃桃";
  const selectedOption = memoryDraftStatus === "empty"
    ? prototypeState.todayScene.selectedOption
    : "今晚去公园走一圈";
  const firstMemory = {
    ...memories[0],
    title: memoryDraftStatus === "empty" ? memories[0].title : selectedOption,
    tone: memoryDraftStatus === "confirmed" ? "已确认" : nestStatus === "pending_partner" ? "等阿川" : memories[0].tone,
    text: memoryDraftStatus !== "empty"
      ? nestStatus === "pending_partner"
        ? "小雨已经点头，等阿川确认后再放进小窝。"
        : `${lifeName}建议留下：那天你们没有把选择变成争执，而是一起走了一圈。`
      : memories[0].text,
  };
  const visibleMemories = [firstMemory, ...memories.slice(1)];

  return (
    <section
      className="mobile-page product-screen memory-screen"
      data-testid="screen-memory"
      data-memory-status={prototypeState.nestMemory?.status}
    >
      <ScreenHeader title="小窝" caption="你们点头留下的小事都在这里" />

      <div className="nest-scene">
        <div className="nest-scene-note">
          <span>今天</span>
          <strong>{memoryDraftStatus === "confirmed" ? "已收好" : nestStatus === "pending_partner" ? "等阿川" : "等你们点头"}</strong>
        </div>
        <Taotao mood="awake" compact />
        <div className="nest-light">
          <small>今天</small>
          亮了
        </div>
      </div>

      <div className="memory-feed">
        {visibleMemories.map((memory, index) => (
          <article className="memory-item" key={memory.title}>
            <div className="memory-dot">{index === 0 ? <Plus size={14} /> : <Heart size={13} />}</div>
            <div>
              <div className="memory-meta">
                <span>{memory.date}</span>
                <em>{memory.tone}</em>
              </div>
              <h2>{memory.title}</h2>
              <p>{memory.text}</p>
              {index === 0 && memoryDraftStatus === "draft" ? (
                <button className="memory-confirm" type="button" data-testid="memory-confirm" onClick={onConfirmMemory}>
                  我愿意留下
                </button>
              ) : null}
              {index === 0 && nestStatus === "pending_partner" ? (
                <span className="memory-waiting-badge" data-testid="memory-waiting-partner">等阿川点头</span>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function MiniLinkScreen({ prototypeState, onPartnerConfirm, onMiniActionComplete, onMiniStatus, onReturnToApp }) {
  const lifeName = prototypeState?.identity?.lifeDisplayName ?? prototypeState?.taotaoLife?.displayName ?? "桃桃";
  const brandName = prototypeState?.identity?.brandName ?? "桃桃";
  const initialMiniStatus = prototypeState?.miniLinkSession?.status;
  const [miniStep, setMiniStep] = useState(initialMiniStatus === "expired" ? "expired" : "preview");

  const stepMeta = {
    preview: [`小雨想和你一起养${lifeName}`, "它从你们的陶瓷杯里醒来"],
    auth: ["确认是阿川", "只用于这次邀请"],
    "auth-failed": ["授权没有完成", "邀请还在，可以重新授权"],
    review: [`确认${lifeName}`, "看见同一个来源，再决定要不要点头"],
    "needs-edit": ["想改一下", "这次邀请会回到小雨那里"],
    rejected: ["暂时不确认", `${lifeName}会等你们重新选择`],
    later: ["晚点再答", "小雨会看到你已经收到"],
    confirmed: ["双方确认完成", `${lifeName}已经属于你们两个`],
    light: [`先用一次${lifeName}`, "微信里先选一件小事"],
    "open-failed": ["还没打开 App", "链接已经保留，可以稍后继续"],
    expired: ["这条邀请过期了", "为了安全，需要小雨重新发一次"],
  }[miniStep];

  const goAuth = () => {
    onMiniStatus("opened");
    setMiniStep("auth");
  };

  const failAuth = () => {
    onMiniStatus("auth_failed");
    setMiniStep("auth-failed");
  };

  const goReview = () => {
    onMiniStatus("reviewing");
    setMiniStep("review");
  };

  const confirmReview = () => {
    onPartnerConfirm();
    setMiniStep("confirmed");
  };

  const requestEdit = () => {
    onMiniStatus("countered");
    setMiniStep("needs-edit");
  };

  const rejectObject = () => {
    onMiniStatus("rejected");
    setMiniStep("rejected");
  };

  const answerLater = () => {
    onMiniStatus("later");
    setMiniStep("later");
  };

  return (
    <section
      className="mobile-page product-screen mini-screen"
      data-testid="screen-mini"
      data-mini-step={miniStep}
      data-life-display-name={lifeName}
      data-mini-link-status={initialMiniStatus}
    >
      <ScreenHeader title={stepMeta[0]} caption={stepMeta[1]} />

      {miniStep === "preview" ? <MiniInvitePreview lifeName={lifeName} brandName={brandName} onNext={goAuth} /> : null}
      {miniStep === "auth" ? <MiniAuthCard lifeName={lifeName} onFail={failAuth} onNext={goReview} /> : null}
      {miniStep === "auth-failed" ? <MiniAuthFailed onNext={() => setMiniStep("auth")} /> : null}
      {miniStep === "review" ? <MiniReview lifeName={lifeName} onConfirm={confirmReview} onEdit={requestEdit} onReject={rejectObject} onLater={answerLater} /> : null}
      {miniStep === "needs-edit" ? <MiniNeedsEdit lifeName={lifeName} onBack={() => setMiniStep("preview")} /> : null}
      {miniStep === "rejected" ? <MiniRejected lifeName={lifeName} onBack={() => setMiniStep("preview")} /> : null}
      {miniStep === "later" ? <MiniLater lifeName={lifeName} onBack={() => setMiniStep("review")} /> : null}
      {miniStep === "confirmed" ? (
        <MiniConfirmed lifeName={lifeName} onLight={() => setMiniStep("light")} onOpenApp={onReturnToApp} onOpenFailed={() => setMiniStep("open-failed")} />
      ) : null}
      {miniStep === "light" ? <MiniLightAction lifeName={lifeName} onReturn={onMiniActionComplete} /> : null}
      {miniStep === "open-failed" ? <MiniOpenFailed lifeName={lifeName} onStay={() => setMiniStep("light")} /> : null}
      {miniStep === "expired" ? <MiniExpired /> : null}
    </section>
  );
}

function MiniInvitePreview({ lifeName, brandName, onNext }) {
  return (
    <>
      <div className="mini-card invite-art-card">
        <div className="mini-card-head">
          <span>来自{brandName}</span>
          <CheckCircle2 size={18} />
        </div>
        <div className="mini-invite-art">
          <img src="/assets/v2/awakening-object.png" alt="陶瓷杯" />
          <Taotao mood="awake" compact />
        </div>
        <h1>见见从杯子里醒来的{lifeName}</h1>
        <p>它刚从你们的陶瓷杯里醒来，正在等你确认：这是不是你们的小东西。</p>
        <button className="primary-action mini-primary" type="button" data-testid="mini-auth-continue" onClick={onNext}>
          <UserCheck size={18} />
          我是阿川，继续
        </button>
      </div>

      <div className="mini-safe-line">
        <ShieldCheck size={16} />
        只用于这次邀请，不会看到小雨刚才那段对话。
      </div>
    </>
  );
}

function MiniAuthCard({ onFail, onNext }) {
  return (
    <div className="mini-card mini-auth-card">
      <div className="mini-card-head">
        <span>来自小雨的邀请</span>
        <ShieldCheck size={18} />
      </div>
      <h1>用微信确认是你</h1>
      <p>确认后，它才知道是阿川也点头了。</p>
      <div className="mini-permission-list">
          <span>不会看到小雨刚才那段对话</span>
      </div>
      <button className="primary-action mini-primary" type="button" data-testid="mini-auth-allow" onClick={onNext}>
        允许并继续
        <ArrowRight size={18} />
      </button>
      <button className="text-action" type="button" data-testid="mini-auth-deny" onClick={onFail}>
        暂时不授权
      </button>
    </div>
  );
}

function MiniAuthFailed({ onNext }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="mini-card mini-auth-card">
      <div className="mini-card-head">
        <span>邀请还在</span>
        <AlertCircle size={18} />
      </div>
      <h1>刚刚没有授权成功</h1>
      <p>没关系，桃桃和邀请都会保留。重新授权后，可以继续确认。</p>
      <button className="primary-action mini-primary" type="button" onClick={onNext}>
        <RefreshCcw size={17} />
        重新授权
      </button>
      <div className="link-bar compact">
        <span>taotao.link/invite/xiaoyu</span>
        <button
          className={copied ? "copied" : ""}
          type="button"
          aria-label="复制邀请链接"
          data-testid="mini-copy-invite"
          onClick={() => setCopied(true)}
        >
          <Copy size={18} />
        </button>
      </div>
      {copied ? <p className="mini-inline-status">邀请链接已复制，可以稍后继续。</p> : null}
    </div>
  );
}

function MiniReview({ lifeName, onConfirm, onEdit, onReject, onLater }) {
  return (
    <>
      <div className="mini-object-card">
        <img src="/assets/v2/awakening-object.png" alt="陶瓷杯" />
        <div>
          <span>来源小物</span>
          <strong>餐桌边的陶瓷杯</strong>
          <p>小雨说，它最近总在你们晚饭旁边。</p>
        </div>
      </div>

      <div className="mini-card">
        <div className="mini-taotao-preview">
          <Taotao mood="awake" compact />
        </div>
        <h1>{lifeName}，等你点头</h1>
        <p>确认后，它会开始一起回应你们。你也可以轻轻改一下，不用现在做大决定。</p>
        <button className="primary-action mini-primary" type="button" data-testid="mini-confirm" onClick={onConfirm}>
          我也确认
          <ArrowRight size={18} />
        </button>
        <div className="mini-choice-row">
          <button type="button" data-testid="mini-edit" onClick={onEdit}>想改一下</button>
          <button type="button" data-testid="mini-later" onClick={onLater}>晚点再答</button>
          <button type="button" data-testid="mini-reject" onClick={onReject}>不是这个</button>
        </div>
      </div>
    </>
  );
}

function MiniNeedsEdit({ lifeName, onBack }) {
  return (
    <div className="mini-card mini-auth-card">
      <div className="mini-card-head">
        <span>已告诉小雨</span>
        <RefreshCcw size={18} />
      </div>
      <h1>先让小雨换一张</h1>
      <p>{lifeName}会保留这次邀请。小雨重新选择小物后，你会收到新的确认。</p>
      <button className="primary-action mini-primary" type="button" onClick={onBack}>
        回到邀请
      </button>
    </div>
  );
}

function MiniRejected({ lifeName, onBack }) {
  return (
    <div className="mini-card mini-auth-card">
      <div className="mini-card-head">
        <span>这次先不确认</span>
        <AlertCircle size={18} />
      </div>
      <h1>{lifeName}会先等一等</h1>
      <p>你没有确认这个小物。{lifeName}会先安静放在这里，小雨可以重新发起。</p>
      <button className="primary-action mini-primary" type="button" onClick={onBack}>
        重新看看
      </button>
    </div>
  );
}

function MiniLater({ lifeName, onBack }) {
  return (
    <div className="mini-card mini-auth-card">
      <div className="mini-card-head">
        <span>已告诉小雨</span>
        <MessageCircle size={18} />
      </div>
      <h1>可以晚点再答</h1>
      <p>小雨会看到你已经收到。{lifeName}不会继续催你，只会把这次邀请留着。</p>
      <button className="primary-action mini-primary" type="button" onClick={onBack}>
        回去再看看
      </button>
    </div>
  );
}

function MiniConfirmed({ lifeName, onLight, onOpenApp, onOpenFailed }) {
  return (
    <div className="mini-card mini-confirmed-card">
      <div className="mini-taotao-preview">
        <Taotao mood="awake" compact />
      </div>
      <h1>{lifeName}醒了</h1>
      <p>小雨会在 App 里看到你也确认了。你们可以先让它帮一个小忙。</p>
      <button className="primary-action mini-primary" type="button" data-testid="mini-light-start" onClick={onLight}>
        <MessageCircle size={18} />
        先用一次{lifeName}
      </button>
      <button className="text-action" type="button" data-testid="mini-open-app" onClick={onOpenApp}>
        打开 App 看它醒来
        <ExternalLink size={15} />
      </button>
      <button className="text-action subtle" type="button" onClick={onOpenFailed}>
        App 没打开，复制链接
      </button>
    </div>
  );
}

function MiniLightAction({ lifeName, onReturn }) {
  const [selectedOption, setSelectedOption] = useState("去公园");

  return (
    <div className="mini-card mini-light-card">
      <div className="mini-card-head">
        <span>今晚的一件小事</span>
        <Sparkles size={18} />
      </div>
      <h1>先把今晚变简单</h1>
      <p>{lifeName}给你们留了三个轻松选项，先挑一个就好。</p>
      <div className="option-row mini-options">
        {["去公园", "楼下走走", "明天再说"].map((option) => (
          <button
            className={selectedOption === option ? "selected" : ""}
            key={option}
            type="button"
            data-testid="mini-light-option"
            onClick={() => setSelectedOption(option)}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="mini-inline-status strong">已选「{selectedOption}」</div>
      <button className="primary-action mini-primary" type="button" data-testid="mini-return-app" onClick={() => onReturn(selectedOption)}>
        选好了，回到 App
      </button>
    </div>
  );
}

function MiniOpenFailed({ lifeName, onStay }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="mini-card mini-auth-card">
      <div className="mini-card-head">
        <span>App 暂时没打开</span>
        <AlertCircle size={18} />
      </div>
      <h1>可以稍后继续</h1>
      <p>{lifeName}和刚才的确认已经保存。复制链接后，回到 App 也能接上。</p>
      <div className="link-bar">
        <span>taotao.link/open/8k2</span>
        <button
          className={copied ? "copied" : ""}
          type="button"
          aria-label="复制回 App 链接"
          data-testid="mini-copy-open-link"
          onClick={() => setCopied(true)}
        >
          <Copy size={18} />
        </button>
      </div>
      {copied ? <p className="mini-inline-status">回 App 链接已复制。</p> : null}
      <button className="text-action" type="button" onClick={onStay}>
        先在微信里用一次
      </button>
    </div>
  );
}

function MiniExpired() {
  return (
    <div className="mini-card mini-auth-card">
      <div className="mini-card-head">
        <span>邀请已过期</span>
        <AlertCircle size={18} />
      </div>
      <h1>请让小雨重新发一次</h1>
      <p>为了避免旧链接被别人打开，过期后需要重新邀请。刚才的小物选择还会保留。</p>
      <button className="primary-action mini-primary" type="button" data-testid="mini-expired-close">
        我知道了
      </button>
    </div>
  );
}

function ScreenHeader({ title, caption, onAction, actionLabel = "下一步" }) {
  return (
    <header className="screen-header">
      <div>
        <h1>{title}</h1>
        <p>{caption}</p>
      </div>
      {onAction ? (
        <button type="button" aria-label={actionLabel} onClick={onAction}>
          <ArrowRight size={18} />
        </button>
      ) : null}
    </header>
  );
}

function Avatar({ label, tone }) {
  return <div className={`avatar ${tone}`}>{label}</div>;
}
