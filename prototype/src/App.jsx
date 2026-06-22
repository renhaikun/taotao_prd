import { useState } from "react";
import { AuthFlow } from "./components/AuthFlow.jsx";
import { ChatInterfaceBoard } from "./components/ChatInterfaceBoard.jsx";
import { PrototypeShell } from "./components/PrototypeShell.jsx";
import { V7Flowboard } from "./components/V7Flowboard.jsx";
import {
  ChatRoomScreen,
  MemoryNestScreen,
  MiniLinkScreen,
  TaotaoLifeScreen,
  TodaySceneScreen,
} from "./components/Screens.jsx";
import { identityDefaults } from "./data/v33ScenarioData.js";

export function App() {
  const initialParams = new URLSearchParams(window.location.search);
  const initialSurface = initialParams.get("surface") === "mini" ? "mini" : "app";
  const [chatboardMode] = useState(initialSurface !== "mini" && (initialParams.get("mode") === "chatboard" || initialParams.get("chatboard") === "1"));
  const [flowboardMode] = useState(initialSurface !== "mini" && (initialParams.get("mode") === "flowboard" || initialParams.get("flowboard") === "1"));
  const [reviewMode] = useState(!chatboardMode && !flowboardMode && (initialParams.get("mode") === "review" || initialParams.get("review") === "1"));
  const [surface, setSurface] = useState(initialSurface);
  const [route, setRoute] = useState("chat");
  const [authStep, setAuthStep] = useState("phone");
  const [isAuthed, setIsAuthed] = useState(false);
  const [authReturn, setAuthReturn] = useState({ route: "chat", pendingAction: null });
  const [prototypeState, setPrototypeState] = useState({
    identity: {
      ...identityDefaults,
    },
    viewer: {
      userId: "u_xiaoyu",
      viewerRole: "initiator",
    },
    userProfile: {
      name: "小雨",
      authStatus: "guest",
    },
    chatRoom: {
      mode: "guest",
      onboardingStep: "idle",
    },
    coupleBond: {
      partnerName: "阿川",
      status: "solo",
    },
    awakenSession: {
      selectedObject: "陶瓷杯",
      inviteStatus: "idle",
      selfConfirmed: false,
      status: "intro",
    },
    sourceMedia: {
      status: "empty",
      selectedObject: "陶瓷杯",
      selectedFileName: "",
    },
    recognitionJob: {
      status: "idle",
    },
    generationJob: {
      status: "idle",
    },
    taotaoLife: {
      name: "桃桃",
      displayName: "桃桃",
      lifeStatus: "seed",
      sourceObject: "陶瓷杯",
    },
    miniLinkSession: {
      status: "not_created",
    },
    todayScene: {
      selectedOption: "",
      memoryDraftStatus: "empty",
    },
    todayNegotiation: {
      status: "suggested",
      reminder: "20:10 提醒我",
      lastEvent: "",
    },
    conversationEvents: {
      activeEventId: "park-walk-tonight",
      detailEventId: null,
      displayMode: "expanded",
    },
    nestMemory: {
      status: "empty",
      visibility: "双方确认后可见",
      pendingSide: null,
    },
    miniReturn: null,
  });

  const isCoupleBound = prototypeState.coupleBond.status === "bound";
  const showBottomNav = surface === "app" && isAuthed && !["auth", "chat", "today"].includes(route);

  if (flowboardMode) {
    return <V7Flowboard />;
  }

  if (chatboardMode) {
    return <ChatInterfaceBoard />;
  }

  const updatePrototypeState = (updater) => {
    setPrototypeState((current) => updater(current));
  };

  const navigate = (nextRoute) => {
    if (!isAuthed && !["chat", "auth"].includes(nextRoute)) {
      requestAuth(nextRoute);
      return;
    }

    setRoute(nextRoute);
  };

  const requestAuth = (returnRoute = "chat", pendingAction = null) => {
    setAuthReturn({ route: returnRoute, pendingAction });
    setAuthStep("phone");
    setRoute("auth");
  };

  const completeAuth = () => {
    setIsAuthed(true);
    updatePrototypeState((current) => ({
      ...current,
      userProfile: {
        ...current.userProfile,
        authStatus: "verified",
      },
      chatRoom: {
        ...current.chatRoom,
        mode: current.coupleBond.status === "bound" ? "triad" : "solo_temp",
        onboardingStep: authReturn.pendingAction === "start_awaken"
          ? "source"
          : authReturn.pendingAction === "create_invite"
            ? "invite_created"
            : current.chatRoom.onboardingStep,
      },
      coupleBond: {
        ...current.coupleBond,
        status: authReturn.pendingAction === "create_invite" ? "invite_created" : current.coupleBond.status,
      },
      awakenSession: {
        ...current.awakenSession,
        inviteStatus: authReturn.pendingAction === "create_invite" ? "created" : current.awakenSession.inviteStatus,
        status: authReturn.pendingAction === "start_awaken" ? "source_select" : current.awakenSession.status,
      },
      sourceMedia: {
        ...current.sourceMedia,
        status: authReturn.pendingAction === "start_awaken" ? "selecting" : current.sourceMedia.status,
      },
      miniLinkSession: {
        ...current.miniLinkSession,
        status: authReturn.pendingAction === "create_invite" ? "created" : current.miniLinkSession.status,
      },
      taotaoLife: {
        ...current.taotaoLife,
        lifeStatus: authReturn.pendingAction === "start_awaken" ? "source_selected" : current.taotaoLife.lifeStatus,
      },
    }));
    setRoute(authReturn.route ?? "chat");
  };

  const startAwakening = () => {
    if (!isAuthed) {
      requestAuth("chat", "start_awaken");
      return;
    }

    updatePrototypeState((current) => ({
      ...current,
      chatRoom: {
        ...current.chatRoom,
        mode: current.coupleBond.status === "bound" ? "triad" : "solo_temp",
        onboardingStep: "source",
      },
      awakenSession: {
        ...current.awakenSession,
        status: "source_select",
      },
      sourceMedia: {
        ...current.sourceMedia,
        status: "selecting",
      },
      taotaoLife: {
        ...current.taotaoLife,
        lifeStatus: "source_selected",
      },
    }));
  };

  const confirmObject = (selectedObject) => {
    updatePrototypeState((current) => ({
      ...current,
      chatRoom: {
        ...current.chatRoom,
        onboardingStep: "generating",
      },
      awakenSession: {
        ...current.awakenSession,
        selectedObject,
        status: "generating",
      },
      sourceMedia: {
        ...current.sourceMedia,
        selectedObject,
        status: "uploaded",
      },
      recognitionJob: {
        ...current.recognitionJob,
        status: "single_candidate",
      },
      generationJob: {
        ...current.generationJob,
        status: "running",
      },
      taotaoLife: {
        ...current.taotaoLife,
        sourceObject: selectedObject,
        lifeStatus: "forming",
      },
    }));
  };

  const previewSourcePhoto = (fileName = "餐桌边的陶瓷杯.jpg") => {
    updatePrototypeState((current) => ({
      ...current,
      sourceMedia: {
        ...current.sourceMedia,
        status: "previewing",
        selectedFileName: fileName,
      },
      recognitionJob: {
        ...current.recognitionJob,
        status: "multi_candidate",
      },
      taotaoLife: {
        ...current.taotaoLife,
        lifeStatus: "source_selected",
      },
    }));
  };

  const useDefaultSource = () => {
    updatePrototypeState((current) => ({
      ...current,
      chatRoom: {
        ...current.chatRoom,
        onboardingStep: "generating",
      },
      awakenSession: {
        ...current.awakenSession,
        selectedObject: "默认小物",
        status: "generating",
      },
      sourceMedia: {
        ...current.sourceMedia,
        selectedObject: "默认小物",
        status: "default_embryo",
      },
      recognitionJob: {
        ...current.recognitionJob,
        status: "cancelled",
      },
      generationJob: {
        ...current.generationJob,
        status: "running",
      },
      taotaoLife: {
        ...current.taotaoLife,
        sourceObject: "默认小物",
        lifeStatus: "forming",
      },
    }));
  };

  const markSourceUnusable = () => {
    updatePrototypeState((current) => ({
      ...current,
      sourceMedia: {
        ...current.sourceMedia,
        status: "unusable",
      },
      recognitionJob: {
        ...current.recognitionJob,
        status: "low_confidence",
      },
    }));
  };

  const failGeneration = () => {
    updatePrototypeState((current) => ({
      ...current,
      generationJob: {
        ...current.generationJob,
        status: "failed",
      },
    }));
  };

  const showTaotaoPreview = () => {
    updatePrototypeState((current) => ({
      ...current,
      chatRoom: {
        ...current.chatRoom,
        onboardingStep: "preview",
      },
      awakenSession: {
        ...current.awakenSession,
        status: "life_preview",
      },
      generationJob: {
        ...current.generationJob,
        status: "succeeded",
      },
      taotaoLife: {
        ...current.taotaoLife,
        lifeStatus: "preview",
      },
    }));
  };

  const confirmTaotaoSelf = () => {
    updatePrototypeState((current) => ({
      ...current,
      chatRoom: {
        ...current.chatRoom,
        onboardingStep: "self_confirmed",
      },
      awakenSession: {
        ...current.awakenSession,
        selfConfirmed: true,
        status: "partner_pending",
      },
      taotaoLife: {
        ...current.taotaoLife,
        lifeStatus: "pending_partner_confirm",
      },
    }));
  };

  const createInvite = () => {
    if (!isAuthed) {
      requestAuth("chat", "create_invite");
      return;
    }

    updatePrototypeState((current) => ({
      ...current,
      chatRoom: {
        ...current.chatRoom,
        onboardingStep: "invite_created",
      },
      coupleBond: {
        ...current.coupleBond,
        status: "invite_created",
      },
      awakenSession: {
        ...current.awakenSession,
        inviteStatus: "created",
      },
      miniLinkSession: {
        ...current.miniLinkSession,
        status: "created",
      },
    }));
  };

  const renameLife = (nextName = "桃桃") => {
    const displayName = nextName.trim() || "桃桃";

    updatePrototypeState((current) => ({
      ...current,
      identity: {
        ...current.identity,
        lifeDisplayName: displayName,
      },
      taotaoLife: {
        ...current.taotaoLife,
        name: displayName,
        displayName,
      },
    }));
  };

  const setViewerRole = (viewerRole) => {
    updatePrototypeState((current) => ({
      ...current,
      viewer: {
        ...current.viewer,
        viewerRole,
        userId: viewerRole === "receiver" ? "u_achuan" : "u_xiaoyu",
      },
    }));
  };

  const openMiniSurface = () => {
    if (prototypeState.awakenSession.inviteStatus !== "created") {
      createInvite();
    }

    const reviewQuery = reviewMode ? "&mode=review" : "";
    window.history.pushState(null, "", `?surface=mini&invite=taotao-demo${reviewQuery}`);
    setSurface("mini");
  };

  const returnToApp = () => {
    window.history.pushState(null, "", reviewMode ? `${window.location.pathname}?mode=review` : window.location.pathname);
    setSurface("app");
    setRoute("chat");
  };

  const confirmPartner = () => {
    updatePrototypeState((current) => ({
      ...current,
      chatRoom: {
        ...current.chatRoom,
        mode: "triad",
        onboardingStep: "bound",
      },
      coupleBond: {
        ...current.coupleBond,
        status: "bound",
      },
      taotaoLife: {
        ...current.taotaoLife,
        lifeStatus: "awake",
      },
      miniLinkSession: {
        ...current.miniLinkSession,
        status: "confirmed",
      },
      todayNegotiation: {
        ...current.todayNegotiation,
        status: "waiting_partner",
      },
      conversationEvents: {
        ...current.conversationEvents,
        activeEventId: "park-walk-tonight",
        detailEventId: null,
        displayMode: "expanded",
      },
    }));
  };

  const updateMiniStatus = (status) => {
    updatePrototypeState((current) => ({
      ...current,
      coupleBond: {
        ...current.coupleBond,
        status: ["needs_edit", "countered", "later", "rejected"].includes(status) ? status : current.coupleBond.status,
      },
      miniLinkSession: {
        ...current.miniLinkSession,
        status,
      },
    }));
  };

  const setInviteStatus = (status) => {
    updatePrototypeState((current) => ({
      ...current,
      miniLinkSession: {
        ...current.miniLinkSession,
        status,
      },
      awakenSession: {
        ...current.awakenSession,
        inviteStatus: status,
      },
    }));
  };

  const completeMiniAction = (selectedOption) => {
    updatePrototypeState((current) => ({
      ...current,
      todayScene: {
        ...current.todayScene,
        selectedOption,
        memoryDraftStatus: "empty",
      },
      todayNegotiation: {
        ...current.todayNegotiation,
        status: "accepted",
        lastEvent: `${current.coupleBond.partnerName}选了「${selectedOption}」`,
      },
      conversationEvents: {
        ...current.conversationEvents,
        activeEventId: "park-walk-tonight",
        detailEventId: null,
        displayMode: "expanded",
      },
      miniReturn: {
        option: selectedOption,
        text: `${current.coupleBond.partnerName}选了「${selectedOption}」。我接住啦，今晚 20:30 我会轻轻提醒你们。`,
      },
    }));
    returnToApp();
    setRoute("chat");
  };

  const selectTodayOption = (selectedOption) => {
    updatePrototypeState((current) => ({
      ...current,
      todayScene: {
        ...current.todayScene,
        selectedOption,
      },
      todayNegotiation: {
        ...current.todayNegotiation,
        status: selectedOption ? "waiting_partner" : current.todayNegotiation.status,
        lastEvent: selectedOption ? `小雨发起了「${selectedOption}」` : current.todayNegotiation.lastEvent,
      },
      conversationEvents: {
        ...current.conversationEvents,
        activeEventId: selectedOption ? "park-walk-tonight" : current.conversationEvents.activeEventId,
        detailEventId: null,
        displayMode: selectedOption ? "expanded" : current.conversationEvents.displayMode,
      },
    }));
  };

  const updateNegotiation = (status) => {
    updatePrototypeState((current) => {
      const memoryStatus = status === "memory_prompted" ? "draft" : current.todayScene.memoryDraftStatus;
      const proposalStatuses = ["waiting_partner", "countered", "accepted", "completed", "memory_prompted", "converted_to_memory"];
      return {
        ...current,
        todayScene: {
          ...current.todayScene,
          selectedOption: proposalStatuses.includes(status) ? "今晚去公园走一圈" : current.todayScene.selectedOption,
          memoryDraftStatus: memoryStatus,
        },
        todayNegotiation: {
          ...current.todayNegotiation,
          status,
          lastEvent: status,
        },
        conversationEvents: {
          ...current.conversationEvents,
          activeEventId: "park-walk-tonight",
          detailEventId: null,
          displayMode: ["completed", "memory_prompted", "converted_to_memory"].includes(status) ? "collapsed" : "expanded",
        },
        nestMemory: {
          ...current.nestMemory,
          status: status === "memory_prompted" ? "draft" : current.nestMemory.status,
          pendingSide: status === "memory_prompted" ? "self" : current.nestMemory.pendingSide,
        },
      };
    });
  };

  const confirmMemoryDraft = () => {
    updatePrototypeState((current) => ({
      ...current,
      todayScene: {
        ...current.todayScene,
        memoryDraftStatus: current.nestMemory.pendingSide === "self" ? "pending_partner" : "confirmed",
      },
      todayNegotiation: {
        ...current.todayNegotiation,
        status: current.nestMemory.pendingSide === "self" ? "memory_prompted" : "converted_to_memory",
      },
      nestMemory: {
        ...current.nestMemory,
        status: current.nestMemory.pendingSide === "self" ? "pending_partner" : "confirmed",
        pendingSide: current.nestMemory.pendingSide === "self" ? "partner" : null,
      },
    }));
  };

  const openEventDetail = (eventId = "park-walk-tonight") => {
    updatePrototypeState((current) => ({
      ...current,
      conversationEvents: {
        ...current.conversationEvents,
        detailEventId: eventId,
      },
    }));
  };

  const closeEventDetail = () => {
    updatePrototypeState((current) => ({
      ...current,
      conversationEvents: {
        ...current.conversationEvents,
        detailEventId: null,
      },
    }));
  };

  const saveEventMemory = () => {
    updatePrototypeState((current) => ({
      ...current,
      todayScene: {
        ...current.todayScene,
        selectedOption: "今晚去公园走一圈",
        memoryDraftStatus: "draft",
      },
      todayNegotiation: {
        ...current.todayNegotiation,
        status: "memory_prompted",
        lastEvent: "memory_prompted",
      },
      conversationEvents: {
        ...current.conversationEvents,
        detailEventId: null,
        displayMode: "collapsed",
      },
      nestMemory: {
        ...current.nestMemory,
        status: "draft",
        pendingSide: "self",
      },
    }));
    setRoute("memories");
  };

  if (surface === "mini") {
    return (
      <main
        className="mini-stage"
        data-testid="app-shell"
        data-prototype-version="v6"
        data-surface="mini"
        data-route="mini"
        data-auth-status={isAuthed ? "verified" : "guest"}
      >
        <section className="device-shell" aria-label="桃桃微信小程序">
          <div className="phone-frame">
            <div className="phone-screen">
              <MiniLinkScreen
                prototypeState={prototypeState}
                onPartnerConfirm={confirmPartner}
                onMiniActionComplete={completeMiniAction}
                onMiniStatus={updateMiniStatus}
                onReturnToApp={returnToApp}
              />
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <PrototypeShell
      route={route}
      setRoute={navigate}
      showBottomNav={showBottomNav}
      prototypeState={prototypeState}
      isAuthed={isAuthed}
      reviewMode={reviewMode}
      onSetViewerRole={setViewerRole}
      onSetInviteStatus={setInviteStatus}
      onUpdateNegotiation={updateNegotiation}
      onRenameLife={renameLife}
      onUseDefaultSource={useDefaultSource}
      onMarkSourceUnusable={markSourceUnusable}
      onFailGeneration={failGeneration}
      onPreviewSourcePhoto={previewSourcePhoto}
    >
      {route === "auth" ? (
        <AuthFlow
          authStep={authStep}
          setAuthStep={setAuthStep}
          canGoBack={isAuthed}
          onBack={() => setRoute(authReturn.route ?? "chat")}
          onComplete={completeAuth}
        />
      ) : null}
      {route === "today" ? <TodaySceneScreen setRoute={navigate} prototypeState={prototypeState} onSelectOption={selectTodayOption} /> : null}
      {route === "chat" ? (
        <ChatRoomScreen
          prototypeState={prototypeState}
          isAuthed={isAuthed}
          isCoupleBound={isCoupleBound}
          onRequestAuth={() => requestAuth("chat", "start_awaken")}
          onStartAwakening={startAwakening}
          onPreviewSourcePhoto={previewSourcePhoto}
          onConfirmObject={confirmObject}
          onUseDefaultSource={useDefaultSource}
          onMarkSourceUnusable={markSourceUnusable}
          onFailGeneration={failGeneration}
          onShowTaotaoPreview={showTaotaoPreview}
          onConfirmTaotaoSelf={confirmTaotaoSelf}
          onCreateInvite={createInvite}
          onOpenMini={openMiniSurface}
          onSelectOption={selectTodayOption}
          onUpdateNegotiation={updateNegotiation}
          onSetViewerRole={setViewerRole}
          onRenameLife={renameLife}
          onSaveMemory={() => navigate("memories")}
          onNavigate={navigate}
          onOpenEventDetail={openEventDetail}
          onCloseEventDetail={closeEventDetail}
          onSaveEventMemory={saveEventMemory}
          reviewMode={reviewMode}
        />
      ) : null}
      {route === "memories" ? <MemoryNestScreen prototypeState={prototypeState} onConfirmMemory={confirmMemoryDraft} /> : null}
      {route === "taotao" ? <TaotaoLifeScreen prototypeState={prototypeState} onNavigate={navigate} /> : null}
    </PrototypeShell>
  );
}
