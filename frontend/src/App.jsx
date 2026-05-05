import { useEffect, useMemo, useRef, useState } from "react";

import { getCurrentUser, getLearningState, getStatus, login, logout, polish, register, saveLearningState, transcribeSpeech, translate } from "./api/client.js";
import AuthView from "./components/AuthView.jsx";
import CollectionView from "./components/CollectionView.jsx";
import CommunityView from "./components/CommunityView.jsx";
import HistoryDetail from "./components/HistoryDetail.jsx";
import InsightPanel from "./components/InsightPanel.jsx";
import LearningDashboard from "./components/LearningDashboard.jsx";
import Sidebar from "./components/Sidebar.jsx";
import WorkspaceView from "./components/WorkspaceView.jsx";
import { corpusExamples } from "./data/corpus.js";
import {
  demoCommunityPosts,
  demoErrors,
  demoExpressions,
  demoGoals,
  demoHistory
} from "./data/demoLearning.js";
import { sampleHistory } from "./data/mockHistory.js";
import { countTodayItems, toDateKey } from "./utils/date.js";
import { buildLearningReport } from "./utils/report.js";
import {
  COMMUNITY_KEY,
  ERRORS_KEY,
  EXPRESSIONS_KEY,
  GOALS_KEY,
  HISTORY_KEY,
  AUTH_TOKEN_KEY,
  clearAppStorage,
  createRecordId,
  loadCollection,
  loadObject,
  loadText,
  saveCollection,
  saveObject,
  saveText,
  saveUniqueItem
} from "./utils/storage.js";

const DEFAULT_GOALS = {
  dailyTarget: 3
};
const VOICE_MAX_SECONDS = 10;
const VOICE_MAX_CHARS = 50;

function App() {
  const [authToken, setAuthToken] = useState(() => loadText(AUTH_TOKEN_KEY));
  const [currentUser, setCurrentUser] = useState(null);
  const [authStatus, setAuthStatus] = useState(authToken ? "checking" : "guest");
  const [authError, setAuthError] = useState("");
  const [authAction, setAuthAction] = useState(null);
  const [isRemoteLoaded, setIsRemoteLoaded] = useState(false);
  const [sourceText, setSourceText] = useState("今天我想练习一段关于校园学习生活的英文表达。");
  const [mode, setMode] = useState("quick");
  const [targetLanguage, setTargetLanguage] = useState("English");
  const [translationResult, setTranslationResult] = useState(null);
  const [polishResult, setPolishResult] = useState(null);
  const [history, setHistory] = useState(() => loadCollection(HISTORY_KEY, sampleHistory));
  const [expressions, setExpressions] = useState(() => loadCollection(EXPRESSIONS_KEY));
  const [errors, setErrors] = useState(() => loadCollection(ERRORS_KEY));
  const [communityPosts, setCommunityPosts] = useState(() => loadCollection(COMMUNITY_KEY));
  const [goals, setGoals] = useState(() => ({
    ...DEFAULT_GOALS,
    ...loadObject(GOALS_KEY, DEFAULT_GOALS)
  }));
  const [contextText, setContextText] = useState("");
  const [isImmersive, setIsImmersive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState("");
  const [activeView, setActiveView] = useState("workspace");
  const [selectedHistoryId, setSelectedHistoryId] = useState(() => history[0]?.id || null);
  const [activeAction, setActiveAction] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [serviceStatus, setServiceStatus] = useState({
    status: "checking",
    provider: "unknown",
    model: null,
    configured: false,
    message: "正在检查 AI 服务状态..."
  });
  const voiceTimerRef = useRef(null);
  const voiceSessionRef = useRef(null);

  const trimmedText = sourceText.trim();
  const isBusy = activeAction !== null;
  const canSubmit = trimmedText.length > 0 && !isBusy;
  const latestTranslationText =
    translationResult?.sourceText === trimmedText ? translationResult.translation?.trim() || "" : "";
  const isAuthenticated = Boolean(authToken && currentUser);

  const expressionCount = useMemo(() => {
    return history.length + expressions.length;
  }, [expressions.length, history.length]);

  const reviewCount = useMemo(() => {
    return errors.length + (polishResult?.changes?.length ?? 0) + (translationResult?.review ? 1 : 0);
  }, [errors.length, polishResult, translationResult]);

  const selectedHistory = useMemo(() => {
    return history.find((item) => item.id === selectedHistoryId) || null;
  }, [history, selectedHistoryId]);

  const todayProgress = useMemo(() => {
    return countTodayItems([...history, ...expressions, ...errors]);
  }, [errors, expressions, history]);

  const recentHistory = useMemo(() => {
    return history.slice(0, 6);
  }, [history]);

  const corpusRecommendations = useMemo(() => {
    const source = `${sourceText} ${translationResult?.translation || ""} ${polishResult?.polished_text || ""}`.toLowerCase();
    return corpusExamples
      .filter((item) => item.keywords.some((keyword) => source.includes(keyword.toLowerCase())))
      .slice(0, 3);
  }, [polishResult, sourceText, translationResult]);

  useEffect(() => {
    saveCollection(HISTORY_KEY, history);
  }, [history]);

  useEffect(() => {
    if (history.length === 0) {
      setSelectedHistoryId(null);
      return;
    }
    if (!selectedHistoryId || !history.some((item) => item.id === selectedHistoryId)) {
      setSelectedHistoryId(history[0].id);
    }
  }, [history, selectedHistoryId]);

  useEffect(() => {
    saveCollection(EXPRESSIONS_KEY, expressions);
  }, [expressions]);

  useEffect(() => {
    saveCollection(ERRORS_KEY, errors);
  }, [errors]);

  useEffect(() => {
    saveCollection(COMMUNITY_KEY, communityPosts);
  }, [communityPosts]);

  useEffect(() => {
    saveObject(GOALS_KEY, goals);
  }, [goals]);

  useEffect(() => {
    if (!authToken) {
      setAuthStatus("guest");
      setCurrentUser(null);
      setIsRemoteLoaded(false);
      return;
    }

    let isMounted = true;
    setAuthStatus("checking");
    setAuthError("");

    Promise.all([getCurrentUser(authToken), getLearningState(authToken)])
      .then(([user, remoteState]) => {
        if (!isMounted) {
          return;
        }
        setCurrentUser(user);
        applyLearningState(remoteState);
        setAuthStatus("ready");
        setIsRemoteLoaded(true);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }
        window.localStorage.removeItem(AUTH_TOKEN_KEY);
        setAuthToken("");
        setCurrentUser(null);
        setAuthStatus("guest");
        setIsRemoteLoaded(false);
        setAuthError(error.message || "登录状态失效，请重新登录。");
      });

    return () => {
      isMounted = false;
    };
  }, [authToken]);

  useEffect(() => {
    if (!authToken || !currentUser || !isRemoteLoaded) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      saveLearningState(authToken, buildLearningState())
        .catch((error) => {
          setErrorMessage(error.message || "学习数据同步失败，请稍后重试。");
        });
    }, 600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [authToken, currentUser, isRemoteLoaded, history, expressions, errors, communityPosts, goals]);

  useEffect(() => {
    let isMounted = true;

    getStatus()
      .then((status) => {
        if (isMounted) {
          setServiceStatus(status);
        }
      })
      .catch(() => {
        if (isMounted) {
          setServiceStatus({
            status: "offline",
            provider: "unknown",
            model: null,
            configured: false,
            message: "后端服务未连接，请确认 backend 已启动。"
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (voiceTimerRef.current) {
        window.clearTimeout(voiceTimerRef.current);
      }
      cleanupVoiceSession(voiceSessionRef.current);
    };
  }, []);

  async function handleTranslate() {
    if (!canSubmit) {
      return;
    }

    setActiveAction("translate");
    setErrorMessage("");

    try {
      const result = await translate({
        text: trimmedText,
        context: contextText.trim() || null,
        target_language: targetLanguage,
        mode
      });
      const resultWithContext = {
        ...result,
        sourceText: trimmedText
      };
      const historyItem = {
        id: createRecordId("history"),
        type: mode === "deep" ? "深度翻译" : "快速翻译",
        text: resultWithContext.translation,
        sourceText: trimmedText,
        targetLanguage,
        mode,
        result: resultWithContext,
        createdAt: new Date().toISOString()
      };
      setTranslationResult(resultWithContext);
      setSelectedHistoryId(historyItem.id);
      setHistory((items) => [historyItem, ...items]);
    } catch (error) {
      setErrorMessage(error.message || "翻译请求失败，请确认后端服务已启动。");
    } finally {
      setActiveAction(null);
    }
  }

  async function handlePolish() {
    if (!canSubmit) {
      return;
    }

    const polishInput = latestTranslationText || trimmedText;
    const polishSource = latestTranslationText ? "当前译文" : "原文输入";

    setActiveAction("polish");
    setErrorMessage("");

    try {
      const result = await polish({
        text: polishInput,
        context: contextText.trim() || null,
        target_language: targetLanguage
      });
      const historyItem = {
        id: createRecordId("history"),
        type: "润色",
        text: result.polished_text,
        sourceText: polishInput,
        originalSourceText: trimmedText,
        polishSource,
        targetLanguage,
        result,
        createdAt: new Date().toISOString()
      };
      setPolishResult(result);
      setSelectedHistoryId(historyItem.id);
      setHistory((items) => [historyItem, ...items]);
    } catch (error) {
      setErrorMessage(error.message || "润色请求失败，请确认后端服务已启动。");
    } finally {
      setActiveAction(null);
    }
  }

  function handleLoadHistory(item) {
    if (item.sourceText) {
      setSourceText(item.sourceText);
    }
    setSelectedHistoryId(item.id);
    setActiveView("history");
  }

  function handleClearHistory() {
    setHistory([]);
    setSelectedHistoryId(null);
    window.localStorage.removeItem(HISTORY_KEY);
  }

  function handleLoadDemoData() {
    setHistory(demoHistory);
    setExpressions(demoExpressions);
    setErrors(demoErrors);
    setCommunityPosts(demoCommunityPosts);
    setGoals(demoGoals);
    setSelectedHistoryId(demoHistory[0]?.id || null);
    setTranslationResult(
      demoHistory[0]?.result
        ? { ...demoHistory[0].result, sourceText: demoHistory[0].sourceText }
        : null
    );
    setPolishResult(demoHistory[1]?.result || null);
    setSourceText(demoHistory[0]?.sourceText || sourceText);
    setTargetLanguage(demoHistory[0]?.targetLanguage || targetLanguage);
    setMode(demoHistory[0]?.mode || mode);
    setActiveView("profile");
    setErrorMessage("");
  }

  function handleClearAllLearningData() {
    clearAppStorage();
    setHistory([]);
    setExpressions([]);
    setErrors([]);
    setCommunityPosts([]);
    setGoals(DEFAULT_GOALS);
    setSelectedHistoryId(null);
    setTranslationResult(null);
    setPolishResult(null);
    setActiveView("workspace");
    setErrorMessage("");
  }

  async function handleRegister(payload) {
    setAuthAction("register");
    setAuthError("");
    try {
      const result = await register(payload);
      saveText(AUTH_TOKEN_KEY, result.token);
      setAuthToken(result.token);
      setCurrentUser(result.user);
    } catch (error) {
      setAuthError(error.message || "注册失败，请稍后重试。");
    } finally {
      setAuthAction(null);
    }
  }

  async function handleLogin(payload) {
    setAuthAction("login");
    setAuthError("");
    try {
      const result = await login(payload);
      saveText(AUTH_TOKEN_KEY, result.token);
      setAuthToken(result.token);
      setCurrentUser(result.user);
    } catch (error) {
      setAuthError(error.message || "登录失败，请检查邮箱和密码。");
    } finally {
      setAuthAction(null);
    }
  }

  async function handleLogout() {
    const token = authToken;
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    setAuthToken("");
    setCurrentUser(null);
    setAuthStatus("guest");
    setIsRemoteLoaded(false);
    setAuthError("");
    if (token) {
      logout(token).catch(() => {});
    }
  }

  function handleExportReport() {
    const report = buildLearningReport({
      communityPosts,
      errors,
      expressions,
      goals,
      history,
      todayProgress
    });
    const blob = new Blob([report], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `zjsuer-learning-report-${toDateKey(new Date())}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function handleSaveExpression(text, source = "AI 建议", metadata = {}) {
    setExpressions((items) => saveUniqueItem(items, text, source, metadata));
  }

  function handleSaveError(text, source = "AI 修改", metadata = {}) {
    setErrors((items) => saveUniqueItem(items, text, source, metadata));
  }

  async function handleVoiceInput() {
    if (isListening) {
      stopVoiceRecording();
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMessage("当前浏览器不支持录音。建议使用最新版 Chrome/Edge，或继续使用文本输入。");
      setVoiceFeedback("");
      return;
    }

    try {
      const session = await createVoiceSession();
      voiceSessionRef.current = session;
      setIsListening(true);
      setErrorMessage("");
      setVoiceFeedback(`正在录制中文语音，最多 ${VOICE_MAX_SECONDS} 秒。再次点击可提前结束。`);
      voiceTimerRef.current = window.setTimeout(() => {
        setVoiceFeedback("已达到 10 秒上限，正在上传识别。");
        stopVoiceRecording();
      }, VOICE_MAX_SECONDS * 1000);
    } catch (error) {
      setIsListening(false);
      setVoiceFeedback("");
      setErrorMessage(error.message || "录音启动失败，请检查麦克风权限后重试。");
    }
  }

  async function createVoiceSession() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      throw new Error("当前浏览器不支持录音处理。建议使用最新版 Chrome/Edge。");
    }

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      throw new Error("录音需要麦克风权限，公网环境请先配置 HTTPS。");
    }

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    const gain = audioContext.createGain();
    const chunks = [];
    gain.gain.value = 0;
    processor.onaudioprocess = (event) => {
      chunks.push(new Float32Array(event.inputBuffer.getChannelData(0)));
    };
    source.connect(processor);
    processor.connect(gain);
    gain.connect(audioContext.destination);

    return {
      audioContext,
      chunks,
      gain,
      processor,
      sampleRate: audioContext.sampleRate,
      source,
      stream,
      stopped: false
    };
  }

  async function stopVoiceRecording() {
    const session = voiceSessionRef.current;
    if (!session || session.stopped) {
      return;
    }

    session.stopped = true;
    voiceSessionRef.current = null;
    if (voiceTimerRef.current) {
      window.clearTimeout(voiceTimerRef.current);
      voiceTimerRef.current = null;
    }
    setIsListening(false);
    cleanupVoiceSession(session);

    const samples = mergeAudioChunks(session.chunks);
    if (samples.length === 0) {
      setVoiceFeedback("没有录到清晰声音，可以靠近麦克风后再试。");
      return;
    }

    try {
      setVoiceFeedback("正在上传云端识别，请稍候。");
      const wavBlob = encodeWav(samples, session.sampleRate, 16000);
      const audioBase64 = await blobToBase64(wavBlob);
      const result = await transcribeSpeech(authToken, {
        audio_base64: audioBase64,
        format: "wav"
      });
      const acceptedText = result.text.trim().slice(0, VOICE_MAX_CHARS);
      if (!acceptedText) {
        setVoiceFeedback("没有识别到清晰中文语音，可以重新录制。");
        return;
      }
      setSourceText((value) => `${value}${value ? "\n" : ""}${acceptedText}`);
      setVoiceFeedback(`已识别并写入 ${acceptedText.length}/${VOICE_MAX_CHARS} 字。`);
    } catch (error) {
      setErrorMessage(error.message || "云端语音识别失败，请稍后重试。");
      setVoiceFeedback("");
    }
  }

  function handleShareToCommunity(text, source, metadata = {}) {
    const normalized = text?.trim();
    if (!normalized) {
      return;
    }
    setCommunityPosts((items) => [
      {
        id: createRecordId("community"),
        text: normalized,
        source,
        sourceText: metadata.sourceText || trimmedText,
        translationText: metadata.translationText || normalized,
        note: metadata.note || "",
        createdAt: new Date().toISOString()
      },
      ...items
    ]);
    setActiveView("community");
  }

  function buildLearningState() {
    return {
      history,
      expressions,
      improvements: errors,
      community_posts: communityPosts,
      goals
    };
  }

  function applyLearningState(state) {
    const nextHistory = state.history || [];
    setHistory(nextHistory);
    setExpressions(state.expressions || []);
    setErrors(state.improvements || []);
    setCommunityPosts(state.community_posts || []);
    setGoals({
      ...DEFAULT_GOALS,
      ...(state.goals || {})
    });
    setSelectedHistoryId(nextHistory[0]?.id || null);
    setTranslationResult(nextHistory[0]?.result || null);
    setPolishResult(nextHistory.find((item) => item.type === "润色")?.result || null);
  }

  if (!isAuthenticated) {
    return (
      <AuthView
        errorMessage={authError}
        isBusy={authAction !== null || authStatus === "checking"}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    );
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <Sidebar
          activeView={activeView}
          currentUser={currentUser}
          hasHistory={history.length > 0}
          onLogout={handleLogout}
          onViewChange={setActiveView}
        />

        <section className="editor-panel" aria-label="随写随翻工作区">
          <header className="panel-header">
            <div>
              <p className="eyebrow">轻量陪伴，深度成长</p>
              <h1>随写随翻 AI 学习工作台</h1>
            </div>
            <div className="mode-switch" aria-label="翻译模式">
              <button
                className={mode === "quick" ? "mode active" : "mode"}
                onClick={() => setMode("quick")}
                type="button"
              >
                快速
              </button>
              <button
                className={mode === "deep" ? "mode active" : "mode"}
                onClick={() => setMode("deep")}
                type="button"
              >
                深度
              </button>
            </div>
          </header>

          {activeView === "workspace" && (
            <WorkspaceView
              activeAction={activeAction}
              canSubmit={canSubmit}
              contextText={contextText}
              corpusRecommendations={corpusRecommendations}
              errorMessage={errorMessage}
              isImmersive={isImmersive}
              isListening={isListening}
              onContextChange={setContextText}
              onPolish={handlePolish}
              onSaveError={handleSaveError}
              onSaveExpression={handleSaveExpression}
              onShareToCommunity={handleShareToCommunity}
              onSourceTextChange={setSourceText}
              onTargetLanguageChange={setTargetLanguage}
              onToggleImmersive={() => setIsImmersive((value) => !value)}
              onTranslate={handleTranslate}
              onVoiceInput={handleVoiceInput}
              polishResult={polishResult}
              polishSource={latestTranslationText ? "当前译文" : "原文输入"}
              sourceText={sourceText}
              targetLanguage={targetLanguage}
              translationResult={translationResult}
              voiceFeedback={voiceFeedback}
            />
          )}

          {activeView === "expressions" && (
            <CollectionView
              emptyText="还没有收藏表达。回到写作台，把译文或建议收入表达库。"
              items={expressions}
              onRemove={(id) => setExpressions((items) => items.filter((item) => item.id !== id))}
              title="表达库"
            />
          )}

          {activeView === "errors" && (
            <CollectionView
              emptyText="还没有改进记录。把审校说明和润色修改加入表达改进库后，会在这里集中复习。"
              items={errors}
              onRemove={(id) => setErrors((items) => items.filter((item) => item.id !== id))}
              title="表达改进库"
            />
          )}

          {activeView === "history" && (
            <HistoryDetail
              item={selectedHistory}
              onSaveError={handleSaveError}
              onSaveExpression={handleSaveExpression}
              onStartRewrite={() => setActiveView("workspace")}
            />
          )}

          {activeView === "profile" && (
            <LearningDashboard
              errors={errors}
              expressions={expressions}
              goals={goals}
              history={history}
              onGoalsChange={setGoals}
            />
          )}

          {activeView === "community" && (
            <CommunityView
              items={communityPosts}
              onRemove={(id) => setCommunityPosts((items) => items.filter((item) => item.id !== id))}
            />
          )}
        </section>

        <InsightPanel
          expressionCount={expressionCount}
          goals={goals}
          onClearAllLearningData={handleClearAllLearningData}
          onClearHistory={handleClearHistory}
          onExportReport={handleExportReport}
          onLoadDemoData={handleLoadDemoData}
          onLoadHistory={handleLoadHistory}
          recentHistory={recentHistory}
          reviewCount={reviewCount}
          serviceStatus={serviceStatus}
          todayProgress={todayProgress}
        />
      </section>
    </main>
  );
}

export default App;

function cleanupVoiceSession(session) {
  if (!session) {
    return;
  }
  try {
    session.processor?.disconnect();
    session.source?.disconnect();
    session.gain?.disconnect();
  } catch {
    // Ignore cleanup races when the browser already closed the audio graph.
  }
  session.stream?.getTracks().forEach((track) => track.stop());
  if (session.audioContext?.state !== "closed") {
    session.audioContext?.close();
  }
}

function mergeAudioChunks(chunks) {
  const length = chunks.reduce((total, chunk) => total + chunk.length, 0);
  const result = new Float32Array(length);
  let offset = 0;
  chunks.forEach((chunk) => {
    result.set(chunk, offset);
    offset += chunk.length;
  });
  return result;
}

function encodeWav(samples, inputSampleRate, outputSampleRate) {
  const pcm = downsample(samples, inputSampleRate, outputSampleRate);
  const buffer = new ArrayBuffer(44 + pcm.length * 2);
  const view = new DataView(buffer);
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + pcm.length * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, outputSampleRate, true);
  view.setUint32(28, outputSampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, pcm.length * 2, true);

  let offset = 44;
  pcm.forEach((sample) => {
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += 2;
  });

  return new Blob([view], { type: "audio/wav" });
}

function downsample(samples, inputSampleRate, outputSampleRate) {
  if (outputSampleRate >= inputSampleRate) {
    return samples;
  }
  const ratio = inputSampleRate / outputSampleRate;
  const length = Math.floor(samples.length / ratio);
  const result = new Float32Array(length);
  for (let index = 0; index < length; index += 1) {
    const start = Math.floor(index * ratio);
    const end = Math.floor((index + 1) * ratio);
    let sum = 0;
    let count = 0;
    for (let sampleIndex = start; sampleIndex < end && sampleIndex < samples.length; sampleIndex += 1) {
      sum += samples[sampleIndex];
      count += 1;
    }
    result[index] = count > 0 ? sum / count : 0;
  }
  return result;
}

function writeString(view, offset, value) {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = () => reject(new Error("读取录音数据失败，请重新录音。"));
    reader.readAsDataURL(blob);
  });
}
