import {
  ArrowRight,
  Check,
  Copy,
  ImagePlus,
  RefreshCcw,
  Send,
  Sparkles,
} from "lucide-react";
import {
  aiTags,
  objectCandidates,
  wakeStates,
} from "../data/prototypeData";
import { Taotao } from "./Taotao";

const nextState = {
  upload: "recognizing",
  recognizing: "confirm-object",
  "confirm-object": "generating",
  generating: "awakened",
  awakened: "invite-partner",
  "invite-partner": "invite-partner",
};

const moodByState = {
  upload: "idle",
  recognizing: "thinking",
  "confirm-object": "thinking",
  generating: "generating",
  awakened: "awake",
  "invite-partner": "awake",
};

export function WakeFlow({
  isAuthed,
  requestAuth,
  wakeStep,
  setWakeStep,
  setRoute,
  selectedObject,
  selectObject,
  inviteStatus,
  createInvite,
}) {
  const current = wakeStates.find((state) => state.id === wakeStep) ?? wakeStates[0];
  const isRecognizing = current.id === "recognizing";
  const isConfirming = current.id === "confirm-object";
  const isGenerating = current.id === "generating";
  const isAwake = current.id === "awakened";
  const isInvite = current.id === "invite-partner";
  const inviteCreated = inviteStatus === "created";

  const handlePrimary = () => {
    if (isInvite) {
      if (inviteCreated) {
        setRoute("mini");
        return;
      }
      createInvite();
      return;
    }

    if (isConfirming && !isAuthed) {
      requestAuth();
      return;
    }

    setWakeStep(nextState[current.id]);
  };

  const handleSecondary = () => {
    if (current.id === "upload") {
      selectObject("默认小物");
      setWakeStep("recognizing");
      return;
    }

    if (isAwake) {
      setWakeStep("invite-partner");
      return;
    }

    if (isInvite) {
      return;
    }

    setWakeStep("upload");
  };

  const primaryLabel = isInvite && inviteCreated
    ? "查看邀请预览"
    : isConfirming
      ? `确认它是${selectedObject}`
      : current.primary;

  return (
    <section className={`mobile-page wake-screen ${current.id}`}>
      <div className="wake-topline">
        <span>第一次见桃桃</span>
        <span>{wakeStates.findIndex((state) => state.id === current.id) + 1}/6</span>
      </div>

      <div className="wake-hero">
        <PhotoCard state={current.id} selectedObject={selectedObject} />
        <div className="taotao-stage">
          <Taotao mood={moodByState[current.id]} compact />
          {isGenerating ? (
            <div className="generating-dots" aria-label="生成中">
              <span />
              <span />
              <span />
            </div>
          ) : null}
        </div>
      </div>

      <div className="wake-copy">
        <h1>{current.title}</h1>
        <p>{current.text}</p>
      </div>

      {isRecognizing || isConfirming || isAwake || isInvite ? (
        <AiTagList />
      ) : null}

      {isConfirming ? <ObjectConfirmation selectedObject={selectedObject} onSelect={selectObject} /> : null}
      {isInvite ? <InvitePanel inviteStatus={inviteStatus} onSend={handlePrimary} /> : null}

      <div className="wake-actions">
        <button className="primary-action" type="button" onClick={handlePrimary}>
          {current.id === "upload" ? <ImagePlus size={18} /> : null}
          {current.id === "invite-partner" && !inviteCreated ? <Copy size={18} /> : null}
          {primaryLabel}
          {current.id !== "upload" && (current.id !== "invite-partner" || inviteCreated) ? (
            <ArrowRight size={18} />
          ) : null}
        </button>
        <button className="text-action" type="button" onClick={handleSecondary}>
          {current.id === "confirm-object" ? <RefreshCcw size={15} /> : null}
          {current.secondary}
        </button>
      </div>
    </section>
  );
}

function PhotoCard({ state, selectedObject }) {
  const hasScan = state === "recognizing";
  const hasTags = ["confirm-object", "generating", "awakened", "invite-partner"].includes(state);

  return (
    <div className={`photo-card ${hasScan ? "scanning" : ""}`}>
      <img src="/assets/v2/awakening-object.png" alt="放在自然光里的小东西" />
      <div className="photo-grain" />
      {(hasScan || hasTags) ? <span className="recognition-box" /> : null}
      {hasTags ? (
        <div className="photo-confidence">
          <Sparkles size={14} />
          <span>识别：{selectedObject}</span>
        </div>
      ) : (
        <div className="photo-placeholder">一张你们的小东西</div>
      )}
    </div>
  );
}

function AiTagList() {
  return (
    <div className="ai-tags" aria-label="桃桃看见的线索">
      {aiTags.map((tag, index) => (
        <span key={tag} style={{ "--tag-delay": `${index * 80}ms` }}>
          {tag}
        </span>
      ))}
    </div>
  );
}

function ObjectConfirmation({ selectedObject, onSelect }) {
  return (
    <div className="candidate-list">
      {objectCandidates.map(([name, signal, reason]) => {
        const isSelected = name === selectedObject;

        return (
        <button
          className={isSelected ? "selected" : ""}
          key={name}
          type="button"
          onClick={() => onSelect(name)}
        >
          <span>
            <strong>{name}</strong>
            <small>{reason}</small>
          </span>
          <em>{signal}</em>
          {isSelected ? <Check size={17} /> : null}
        </button>
        );
      })}
    </div>
  );
}

function InvitePanel({ inviteStatus, onSend }) {
  const isCreated = inviteStatus === "created";

  return (
    <div className="invite-panel">
      <div>
        <strong>{isCreated ? "邀请已经创建" : "taotao.link/xiaoyu"}</strong>
        <span>{isCreated ? "阿川打开后，会直接进入确认桃桃。你也可以先查看邀请预览。" : "对方打开后，会直接看到刚醒来的桃桃。"}</span>
      </div>
      <button type="button" aria-label="发送给另一半" onClick={onSend}>
        <Send size={18} />
      </button>
    </div>
  );
}
