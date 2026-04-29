import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  BrainCircuit,
  Languages,
  Loader2,
  Mic,
  Send,
  Sparkles
} from "lucide-react";

import { polish, translate } from "./api/client.js";
import { sampleHistory } from "./data/mockHistory.js";
import {
  ERRORS_KEY,
  EXPRESSIONS_KEY,
  HISTORY_KEY,
  loadCollection,
  saveCollection,
  saveUniqueItem
} from "./utils/storage.js";

const features = [
  {
    icon: Mic,
    title: "智能输入",
    text: "文本与语音输入，支持沉浸式写作。"
  },
  {
    icon: Languages,
    title: "随写随翻",
    text: "快速模式秒查，深度模式执行初译与审校。"
  },
  {
    icon: Sparkles,
    title: "随写随修",
    text: "语法纠错、表达优化，并解释修改原因。"
  },
  {
    icon: BrainCircuit,
    title: "成长可视",
    text: "沉淀错题库、表达库和学习轨迹。"
  }
];

function App() {
  const [sourceText, setSourceText] = useState("今天我想练习一段关于校园学习生活的英文表达。");
  const [mode, setMode] = useState("quick");
  const [targetLanguage, setTargetLanguage] = useState("English");
  const [translationResult, setTranslationResult] = useState(null);
  const [polishResult, setPolishResult] = useState(null);
  const [history, setHistory] = useState(() => loadCollection(HISTORY_KEY, sampleHistory));
  const [expressions, setExpressions] = useState(() => loadCollection(EXPRESSIONS_KEY));
  const [errors, setErrors] = useState(() => loadCollection(ERRORS_KEY));
  const [activeView, setActiveView] = useState("workspace");
  const [activeAction, setActiveAction] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const trimmedText = sourceText.trim();
  const isBusy = activeAction !== null;
  const canSubmit = trimmedText.length > 0 && !isBusy;

  const expressionCount = useMemo(() => {
    const translationSuggestions = translationResult?.suggestions?.length ?? 0;
    const polishChanges = polishResult?.changes?.length ?? 0;
    return history.length + expressions.length + translationSuggestions + polishChanges;
  }, [expressions.length, history.length, polishResult, translationResult]);

  const reviewCount = useMemo(() => {
    return errors.length + (polishResult?.changes?.length ?? 0) + (translationResult?.review ? 1 : 0);
  }, [errors.length, polishResult, translationResult]);

  useEffect(() => {
    saveCollection(HISTORY_KEY, history);
  }, [history]);

  useEffect(() => {
    saveCollection(EXPRESSIONS_KEY, expressions);
  }, [expressions]);

  useEffect(() => {
    saveCollection(ERRORS_KEY, errors);
  }, [errors]);

  async function handleTranslate() {
    if (!canSubmit) {
      return;
    }

    setActiveAction("translate");
    setErrorMessage("");

    try {
      const result = await translate({
        text: trimmedText,
        target_language: targetLanguage,
        mode
      });
      setTranslationResult(result);
      setHistory((items) => [
        {
          id: crypto.randomUUID(),
          type: mode === "deep" ? "深度翻译" : "快速翻译",
          text: result.translation,
          sourceText: trimmedText,
          createdAt: new Date().toISOString()
        },
        ...items
      ].slice(0, 6));
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
        target_language: targetLanguage
      });
      setPolishResult(result);
      setHistory((items) => [
        {
          id: crypto.randomUUID(),
          type: "润色",
          text: result.polished_text,
          sourceText: trimmedText,
          createdAt: new Date().toISOString()
        },
        ...items
      ].slice(0, 6));
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
  }

  function handleClearHistory() {
    setHistory([]);
    window.localStorage.removeItem(HISTORY_KEY);
  }

  function handleSaveExpression(text, source = "AI 建议") {
    setExpressions((items) => saveUniqueItem(items, text, source));
  }

  function handleSaveError(text, source = "AI 修改") {
    setErrors((items) => saveUniqueItem(items, text, source));
  }

  function handleRemoveExpression(id) {
    setExpressions((items) => items.filter((item) => item.id !== id));
  }

  function handleRemoveError(id) {
    setErrors((items) => items.filter((item) => item.id !== id));
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <aside className="sidebar" aria-label="学习记录">
          <div className="brand">
            <BookOpen size={24} aria-hidden="true" />
            <div>
              <strong>ZJSUer</strong>
              <span>AI Translation</span>
            </div>
          </div>

          <nav className="nav-list">
            <button
              className={activeView === "workspace" ? "nav-item active" : "nav-item"}
              onClick={() => setActiveView("workspace")}
              type="button"
            >
              写作台
            </button>
            <button
              className={activeView === "expressions" ? "nav-item active" : "nav-item"}
              onClick={() => setActiveView("expressions")}
              type="button"
            >
              表达库
            </button>
            <button
              className={activeView === "errors" ? "nav-item active" : "nav-item"}
              onClick={() => setActiveView("errors")}
              type="button"
            >
              错题库
            </button>
            <button
              className={activeView === "profile" ? "nav-item active" : "nav-item"}
              onClick={() => setActiveView("profile")}
              type="button"
            >
              学习档案
            </button>
          </nav>
        </aside>

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
            <>
              <div className="toolbar" aria-label="工作台操作">
                <label>
                  <span>目标语言</span>
                  <select value={targetLanguage} onChange={(event) => setTargetLanguage(event.target.value)}>
                    <option value="English">English</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Korean">Korean</option>
                    <option value="Chinese">Chinese</option>
                  </select>
                </label>
                <button className="primary-action" disabled={!canSubmit} onClick={handleTranslate} type="button">
                  {activeAction === "translate" ? <Loader2 className="spin" size={18} /> : <Send size={18} />}
                  翻译
                </button>
                <button className="secondary-action" disabled={!canSubmit} onClick={handlePolish} type="button">
                  {activeAction === "polish" ? <Loader2 className="spin" size={18} /> : <Sparkles size={18} />}
                  润色
                </button>
              </div>

              {errorMessage && <p className="error-message">{errorMessage}</p>}

              <div className="writing-grid">
                <label className="writing-box">
                  <span>原文输入</span>
                  <textarea
                    onChange={(event) => setSourceText(event.target.value)}
                    placeholder="输入你想翻译或润色的外语学习文本..."
                    value={sourceText}
                  />
                </label>

                <section className="result-box" aria-label="AI 输出">
                  <span>AI 输出</span>
                  {translationResult || polishResult ? (
                    <div className="result-stack">
                      {translationResult && (
                        <article className="result-section">
                          <h2>{translationResult.mode === "deep" ? "深度翻译" : "快速翻译"}</h2>
                          <p className="provider-note">
                            {translationResult.provider}
                            {translationResult.model ? ` / ${translationResult.model}` : ""}
                          </p>
                          <p>{translationResult.translation}</p>
                          <button
                            className="inline-save"
                            type="button"
                            onClick={() => handleSaveExpression(translationResult.translation, "译文")}
                          >
                            收藏表达
                          </button>
                          {translationResult.review && (
                            <div className="review-note">
                              <p>{translationResult.review}</p>
                              <button type="button" onClick={() => handleSaveError(translationResult.review, "审校说明")}>
                                加入错题
                              </button>
                            </div>
                          )}
                          {translationResult.suggestions.length > 0 && (
                            <ul className="learning-list">
                              {translationResult.suggestions.map((item) => (
                                <li key={item}>
                                  <span>{item}</span>
                                  <button type="button" onClick={() => handleSaveExpression(item, "翻译建议")}>
                                    收藏
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </article>
                      )}

                      {polishResult && (
                        <article className="result-section">
                          <h2>润色版本</h2>
                          <p className="provider-note">
                            {polishResult.provider}
                            {polishResult.model ? ` / ${polishResult.model}` : ""}
                          </p>
                          <p>{polishResult.polished_text}</p>
                          <button
                            className="inline-save"
                            type="button"
                            onClick={() => handleSaveExpression(polishResult.polished_text, "润色版本")}
                          >
                            收藏表达
                          </button>
                          {polishResult.changes.length > 0 && (
                            <ul className="learning-list">
                              {polishResult.changes.map((item) => (
                                <li key={item}>
                                  <span>{item}</span>
                                  <button type="button" onClick={() => handleSaveError(item, "润色修改")}>
                                    加入错题
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </article>
                      )}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <Languages size={28} aria-hidden="true" />
                      <p>选择模式后点击翻译或润色，AI 结果会显示在这里。</p>
                    </div>
                  )}
                </section>
              </div>

              <div className="feature-grid">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <article className="feature-card" key={feature.title}>
                      <Icon size={22} aria-hidden="true" />
                      <h2>{feature.title}</h2>
                      <p>{feature.text}</p>
                    </article>
                  );
                })}
              </div>
            </>
          )}

          {activeView === "expressions" && (
            <CollectionView
              emptyText="还没有收藏表达。回到写作台，把译文或建议收入表达库。"
              items={expressions}
              onRemove={handleRemoveExpression}
              title="表达库"
            />
          )}

          {activeView === "errors" && (
            <CollectionView
              emptyText="还没有错题。把审校说明和润色修改加入错题库后，会在这里集中复习。"
              items={errors}
              onRemove={handleRemoveError}
              title="错题库"
            />
          )}

          {activeView === "profile" && (
            <section className="profile-panel">
              <h2>学习档案</h2>
              <div className="profile-grid">
                <div className="stat">
                  <strong>{history.length}</strong>
                  <span>历史记录</span>
                </div>
                <div className="stat">
                  <strong>{expressions.length}</strong>
                  <span>表达收藏</span>
                </div>
                <div className="stat">
                  <strong>{errors.length}</strong>
                  <span>错题沉淀</span>
                </div>
              </div>
            </section>
          )}
        </section>

        <aside className="insight-panel" aria-label="成长概览">
          <h2>今日复盘</h2>
          <div className="stat">
            <strong>{expressionCount}</strong>
            <span>累计表达</span>
          </div>
          <div className="stat">
            <strong>{reviewCount}</strong>
            <span>待复习错误</span>
          </div>
          <section>
            <div className="section-title-row">
              <h3>最近记录</h3>
              <button type="button" onClick={handleClearHistory}>清空</button>
            </div>
            <ul className="history-list">
              {history.map((item) => (
                <li key={item.id}>
                  <button type="button" onClick={() => handleLoadHistory(item)}>
                    <span>{item.type}</span>
                    <p>{item.text}</p>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </section>
    </main>
  );
}

function CollectionView({ emptyText, items, onRemove, title }) {
  return (
    <section className="collection-panel">
      <h2>{title}</h2>
      {items.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={28} aria-hidden="true" />
          <p>{emptyText}</p>
        </div>
      ) : (
        <ul className="collection-list">
          {items.map((item) => (
            <li key={item.id}>
              <span>{item.source}</span>
              <p>{item.text}</p>
              <button type="button" onClick={() => onRemove(item.id)}>移除</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default App;
