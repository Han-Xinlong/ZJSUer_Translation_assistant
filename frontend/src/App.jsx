import { useEffect, useMemo, useState } from "react";

import { getStatus, polish, translate } from "./api/client.js";
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
  clearAppStorage,
  createRecordId,
  loadCollection,
  loadObject,
  saveCollection,
  saveObject,
  saveUniqueItem
} from "./utils/storage.js";

const DEFAULT_GOALS = {
  dailyTarget: 3
};

function App() {
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

  const trimmedText = sourceText.trim();
  const isBusy = activeAction !== null;
  const canSubmit = trimmedText.length > 0 && !isBusy;

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
      const historyItem = {
        id: createRecordId("history"),
        type: mode === "deep" ? "深度翻译" : "快速翻译",
        text: result.translation,
        sourceText: trimmedText,
        targetLanguage,
        mode,
        result,
        createdAt: new Date().toISOString()
      };
      setTranslationResult(result);
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

    setActiveAction("polish");
    setErrorMessage("");

    try {
      const result = await polish({
        text: trimmedText,
        context: contextText.trim() || null,
        target_language: targetLanguage
      });
      const historyItem = {
        id: createRecordId("history"),
        type: "润色",
        text: result.polished_text,
        sourceText: trimmedText,
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
    setTranslationResult(demoHistory[0]?.result || null);
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

  function handleSaveExpression(text, source = "AI 建议") {
    setExpressions((items) => saveUniqueItem(items, text, source));
  }

  function handleSaveError(text, source = "AI 修改") {
    setErrors((items) => saveUniqueItem(items, text, source));
  }

  function handleVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMessage("当前浏览器暂不支持语音识别。可以继续使用文本输入。");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = targetLanguage === "Chinese" ? "zh-CN" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      setIsListening(true);
      setErrorMessage("");
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSourceText((value) => `${value}${value ? "\n" : ""}${transcript}`);
    };
    recognition.onerror = () => {
      setErrorMessage("语音识别失败，请检查浏览器权限后重试。");
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    recognition.start();
  }

  function handleShareToCommunity(text, source) {
    const normalized = text?.trim();
    if (!normalized) {
      return;
    }
    setCommunityPosts((items) => [
      {
        id: createRecordId("community"),
        text: normalized,
        source,
        createdAt: new Date().toISOString()
      },
      ...items
    ]);
    setActiveView("community");
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <Sidebar activeView={activeView} hasHistory={history.length > 0} onViewChange={setActiveView} />

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
              sourceText={sourceText}
              targetLanguage={targetLanguage}
              translationResult={translationResult}
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
              emptyText="还没有错题。把审校说明和润色修改加入错题库后，会在这里集中复习。"
              items={errors}
              onRemove={(id) => setErrors((items) => items.filter((item) => item.id !== id))}
              title="错题库"
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
