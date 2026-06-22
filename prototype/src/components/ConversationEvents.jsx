import { ChevronDown, Clock3, Shell, X } from "lucide-react";
import { getParkWalkEventView, parkWalkEvent } from "../data/v5ConversationEvents";
import { Taotao } from "./Taotao";

export function ConversationEventDock({ status, viewerRole, onOpenDetail }) {
  const view = getParkWalkEventView(status, viewerRole);

  return (
    <section className="conversation-event-dock" data-testid="conversation-event-dock" aria-label="正在进行的小事">
      <button
        type="button"
        className={`event-dock-pill ${view.tone}`}
        data-testid="event-dock-pill-park-walk"
        data-event-id={parkWalkEvent.id}
        data-event-state={status}
        onClick={() => onOpenDetail?.(parkWalkEvent.id)}
      >
        <span className="event-dock-dot" />
        <strong>{parkWalkEvent.title}</strong>
        <em>{view.dock}</em>
      </button>
    </section>
  );
}

export function EventCapsule({ status, viewerRole, lifeName, onOpenDetail }) {
  const view = getParkWalkEventView(status, viewerRole);

  return (
    <button
      type="button"
      className={`event-capsule ${view.tone}`}
      data-testid="event-capsule-park-walk"
      data-event-id={parkWalkEvent.id}
      data-event-state={status}
      onClick={() => onOpenDetail?.(parkWalkEvent.id)}
    >
      <div className="event-capsule-icon">
        <Clock3 size={15} />
      </div>
      <div>
        <strong>{parkWalkEvent.title} · {view.label}</strong>
        <span>{view.capsule}</span>
      </div>
      <ChevronDown size={16} />
      <small>{lifeName}</small>
    </button>
  );
}

export function EventContextTray({
  status,
  viewerRole,
  onUpdateNegotiation,
  onOpenDetail,
  onSaveMemory,
  onNavigate,
}) {
  const view = getParkWalkEventView(status, viewerRole);

  const handleAction = (action) => {
    if (action.action === "detail") {
      onOpenDetail?.(parkWalkEvent.id);
      return;
    }

    if (action.action === "saveMemory") {
      onSaveMemory?.();
      return;
    }

    if (action.action === "memories") {
      onNavigate?.("memories");
      return;
    }

    if (action.nextStatus) {
      onUpdateNegotiation?.(action.nextStatus);
    }
  };

  return (
    <section
      className={`event-context-tray ${view.tone}`}
      data-testid="event-context-tray"
      data-event-id={parkWalkEvent.id}
      data-event-state={status}
      aria-label={`${view.trayTitle}。${view.trayText}`}
    >
      <div className="event-context-actions">
        {view.actions.map((action) => (
          <button
            className={action.kind === "primary" ? "primary-action" : ""}
            key={action.id}
            type="button"
            data-testid={action.id}
            onClick={() => handleAction(action)}
          >
            {action.label}
          </button>
        ))}
      </div>
    </section>
  );
}

export function EventCandidateStrip({ eventType, lifeName, onOpenDetail }) {
  const copyByType = {
    choice: "我先把晚饭选择变少一点，要不要我列三个轻选项？",
    say_better: "这句话我先放轻一点，你想发的时候再发。",
    reminder: "我先记下时间，等你们点头后再提醒。",
    memory: "这件事可以留下，但要你们两个人都点头。",
    proposal: "我整理成一个容易点头的小提议，要不要看看？",
  };
  const text = copyByType[eventType] ?? copyByType.choice;

  return (
    <article
      className="message taotao event-candidate-strip"
      data-testid="event-candidate-strip"
      data-event-type={eventType}
    >
      <span className="taotao-message-avatar" data-testid="taotao-message-avatar">
        <Taotao mood="awake" compact />
      </span>
      <div>
        <span>{lifeName}</span>
        <p>{text}</p>
        <button type="button" className="candidate-inline-action" onClick={() => onOpenDetail?.(parkWalkEvent.id)}>
          看看
        </button>
      </div>
    </article>
  );
}

export function EventDetailSheet({ status, viewerRole, lifeName, onClose, onSaveMemory }) {
  const view = getParkWalkEventView(status, viewerRole);
  const canSave = ["completed", "memory_prompted"].includes(status);

  return (
    <div className="event-sheet-layer" data-testid="event-detail-layer">
      <button className="event-sheet-scrim" type="button" aria-label="关闭事件详情" onClick={onClose} />
      <section
        className="event-detail-sheet"
        data-testid="event-detail-sheet"
        data-event-id={parkWalkEvent.id}
        data-event-state={status}
        aria-label={`${parkWalkEvent.title}详情`}
      >
        <div className="event-sheet-grabber" />
        <header>
          <div>
            <span>今晚这件事</span>
            <h2>{parkWalkEvent.title}</h2>
          </div>
          <button type="button" aria-label="关闭" onClick={onClose}>
            <X size={18} />
          </button>
        </header>

        <div className="event-sheet-summary">
          <strong>{view.label}</strong>
          <p>{parkWalkEvent.time} · {parkWalkEvent.place} · {parkWalkEvent.duration}</p>
        </div>

        <div className="event-sheet-timeline" aria-label="今晚这件事">
          <span>小雨发起：今晚去公园走走？</span>
          <span>{viewerRole === "receiver" ? "你看到了，也点头了。" : "阿川看到了，也点头了。"}</span>
          <span>{lifeName}会在 {parkWalkEvent.reminder} 轻轻提醒一次。</span>
          {status === "completed" ? <span>你们刚刚走完，可以决定要不要留下。</span> : null}
        </div>

        <div className="event-sheet-actions">
          {canSave ? (
            <button className="primary-action" type="button" data-testid="event-sheet-save-memory" onClick={onSaveMemory}>
              <Shell size={17} />
              留下到小窝
            </button>
          ) : (
            <button className="primary-action" type="button" onClick={onClose}>回到聊天</button>
          )}
          {status === "completed" || status === "memory_prompted" ? null : <button type="button">提醒一次</button>}
          <button type="button">{status === "completed" || status === "memory_prompted" ? "不留下" : "先不处理"}</button>
        </div>
      </section>
    </div>
  );
}
