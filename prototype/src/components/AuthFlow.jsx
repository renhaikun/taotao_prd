import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { Taotao } from "./Taotao";

const authSteps = [
  {
    id: "phone",
    count: "1/3",
    title: "确认手机号，继续刚才这一步",
    text: "只用于保存桃桃、邀请阿川和同步你们的聊天，不会展示给对方。",
    primary: "发送验证码",
    secondary: "返回",
  },
  {
    id: "code",
    count: "2/3",
    title: "确认是你",
    text: "验证码已发送。确认后，会回到刚才的桃桃聊天继续。",
    primary: "继续",
    secondary: "重新发送",
  },
  {
    id: "profile",
    count: "3/3",
    title: "留一个名字",
    text: "这是阿川在邀请里会看到的名字。",
    primary: "保存并继续",
    secondary: "稍后再补",
  },
];

export function AuthFlow({ authStep, setAuthStep, canGoBack = false, onBack, onComplete }) {
  const current = authSteps.find((step) => step.id === authStep) ?? authSteps[0];
  const [resent, setResent] = useState(false);
  const [phone, setPhone] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [authError, setAuthError] = useState("");
  const phoneReady = phone.replace(/\D/g, "").length === 11 && termsAccepted;

  const goNext = () => {
    if (current.id === "phone") {
      if (!phoneReady) {
        setAuthError(termsAccepted ? "请先填写 11 位手机号。" : "请先同意服务协议和隐私说明。");
        return;
      }
      setAuthError("");
      setResent(false);
      setAuthStep("code");
      return;
    }

    if (current.id === "code") {
      setResent(false);
      setAuthStep("profile");
      return;
    }

    onComplete();
  };

  const handleSecondary = () => {
    if (current.id === "phone") {
      if (canGoBack) {
        onBack();
      }
      return;
    }

    if (current.id === "code") {
      setResent(true);
      return;
    }

    onComplete();
  };

  return (
    <section className={`mobile-page auth-screen ${current.id}`} data-testid="screen-auth" data-auth-step={current.id}>
      <div className="auth-topline">
        {canGoBack ? (
          <button type="button" aria-label="返回" onClick={onBack}>
            <ArrowLeft size={18} />
          </button>
        ) : (
          <span>安全入口</span>
        )}
        <span>{current.count}</span>
      </div>

      <div className="auth-hero">
        <Taotao mood={current.id === "profile" ? "awake" : "thinking"} compact />
        <div>
          <h1>{current.title}</h1>
          <p>{current.text}</p>
        </div>
      </div>

      {current.id === "phone" ? (
        <PhoneStep
          phone={phone}
          setPhone={setPhone}
          termsAccepted={termsAccepted}
          setTermsAccepted={setTermsAccepted}
          authError={authError}
        />
      ) : null}
      {current.id === "code" ? <CodeStep resent={resent} /> : null}
      {current.id === "profile" ? <ProfileStep /> : null}

      <div className="auth-actions">
        <button className="primary-action" type="button" data-testid="auth-submit" disabled={current.id === "phone" && !phoneReady} onClick={goNext}>
          {current.primary}
          <ArrowRight size={18} />
        </button>
        {current.id !== "phone" || canGoBack ? (
          <button className="text-action" type="button" data-testid={current.id === "code" ? "auth-resend" : "auth-secondary"} onClick={handleSecondary}>
            {current.id === "code" ? <RotateCcw size={15} /> : null}
            {current.secondary}
          </button>
        ) : null}
      </div>
    </section>
  );
}

function PhoneStep({ phone, setPhone, termsAccepted, setTermsAccepted, authError }) {
  return (
    <div className="auth-panel">
      <label className="auth-field">
        <span>手机号</span>
        <input
          aria-label="手机号"
          data-testid="auth-phone-input"
          inputMode="tel"
          placeholder="请输入手机号"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
      </label>

      <div className="auth-proof">
        <ShieldCheck size={17} />
        <p>手机号只用来保存和找回这段桃桃，不会公开给另一半。</p>
      </div>
      <label className="auth-terms-check">
        <input
          aria-label="同意服务协议和隐私说明"
          data-testid="auth-terms-checkbox"
          type="checkbox"
          checked={termsAccepted}
          onChange={(event) => setTermsAccepted(event.target.checked)}
        />
        <span>同意服务协议和隐私说明</span>
      </label>
      {authError ? <p className="auth-error">{authError}</p> : null}
    </div>
  );
}

function CodeStep({ resent }) {
  return (
    <div className="auth-panel">
      <div className="code-boxes" aria-label="验证码已部分填入">
        {["5", "2", "0", "•", "•", "•"].map((digit, index) => (
          <span key={`${digit}-${index}`}>{digit}</span>
        ))}
      </div>

      <div className="auth-proof warning">
        <LockKeyhole size={17} />
        <p>{resent ? "验证码已重新发送，还没有完成登录。" : "如果验证码不对，不会保存这段聊天。"}</p>
      </div>
    </div>
  );
}

function ProfileStep() {
  return (
    <div className="auth-panel">
      <div className="profile-card">
        <div className="profile-avatar">
          <UserRound size={24} />
        </div>
        <label className="auth-field compact">
          <span>阿川会看到的名字</span>
          <input aria-label="你的名字" defaultValue="小雨" />
        </label>
      </div>

      <div className="auth-proof success">
        <CheckCircle2 size={17} />
        <p>保存后继续刚才这一步。之后的照片、邀请和小事都会跟着这个账号。</p>
      </div>
    </div>
  );
}
