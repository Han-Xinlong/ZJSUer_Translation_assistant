import { BrainCircuit, Languages, Loader2, Maximize2, Mic, Send, Sparkles } from "lucide-react";

import CorpusPanel from "./CorpusPanel.jsx";

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

function WorkspaceView({
  activeAction,
  canSubmit,
  contextText,
  corpusRecommendations,
  errorMessage,
  isImmersive,
  isListening,
  onContextChange,
  onPolish,
  onSaveError,
  onSaveExpression,
  onShareToCommunity,
  onSourceTextChange,
  onTargetLanguageChange,
  onToggleImmersive,
  onTranslate,
  onVoiceInput,
  polishResult,
  sourceText,
  targetLanguage,
  translationResult
}) {
  return (
    <>
      <div className="toolbar" aria-label="工作台操作">
        <label>
          <span>目标语言</span>
          <select value={targetLanguage} onChange={(event) => onTargetLanguageChange(event.target.value)}>
            <option value="English">English</option>
            <option value="Japanese">Japanese</option>
            <option value="Korean">Korean</option>
            <option value="Chinese">Chinese</option>
          </select>
        </label>
        <button className="primary-action" disabled={!canSubmit} onClick={onTranslate} type="button">
          {activeAction === "translate" ? <Loader2 className="spin" size={18} /> : <Send size={18} />}
          翻译
        </button>
        <button className="secondary-action" disabled={!canSubmit} onClick={onPolish} type="button">
          {activeAction === "polish" ? <Loader2 className="spin" size={18} /> : <Sparkles size={18} />}
          润色
        </button>
        <button className="secondary-action" disabled={isListening} onClick={onVoiceInput} type="button">
          {isListening ? <Loader2 className="spin" size={18} /> : <Mic size={18} />}
          语音
        </button>
        <button className="secondary-action" onClick={onToggleImmersive} type="button">
          <Maximize2 size={18} />
          {isImmersive ? "退出沉浸" : "沉浸"}
        </button>
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <label className="context-box">
        <span>语境说明</span>
        <input
          onChange={(event) => onContextChange(event.target.value)}
          placeholder="例如：课程作业、正式邮件、校园生活分享..."
          value={contextText}
        />
      </label>

      <div className={isImmersive ? "writing-grid immersive" : "writing-grid"}>
        <label className="writing-box">
          <span>原文输入</span>
          <textarea
            onChange={(event) => onSourceTextChange(event.target.value)}
            placeholder="输入你想翻译或润色的外语学习文本..."
            value={sourceText}
          />
        </label>

        <section className="result-box" aria-label="AI 输出">
          <span>AI 输出</span>
          {translationResult || polishResult ? (
            <div className="result-stack">
              {translationResult && (
                <TranslationResult
                  onSaveError={onSaveError}
                  onSaveExpression={onSaveExpression}
                  onShareToCommunity={onShareToCommunity}
                  result={translationResult}
                />
              )}

              {polishResult && (
                <PolishResult
                  onSaveError={onSaveError}
                  onSaveExpression={onSaveExpression}
                  onShareToCommunity={onShareToCommunity}
                  result={polishResult}
                />
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

      <CorpusPanel items={corpusRecommendations} onSaveExpression={onSaveExpression} />
    </>
  );
}

function TranslationResult({ onSaveError, onSaveExpression, onShareToCommunity, result }) {
  const suggestions = result.suggestions || [];

  return (
    <article className="result-section">
      <h2>{result.mode === "deep" ? "深度翻译" : "快速翻译"}</h2>
      <p className="provider-note">
        {result.provider}
        {result.model ? ` / ${result.model}` : ""}
      </p>
      <p>{result.translation}</p>
      <button className="inline-save" type="button" onClick={() => onSaveExpression(result.translation, "译文")}>
        收藏表达
      </button>
      <button className="inline-save" type="button" onClick={() => onShareToCommunity(result.translation, "译文分享")}>
        分享社群
      </button>
      {result.review && (
        <div className="review-note">
          <p>{result.review}</p>
          <button type="button" onClick={() => onSaveError(result.review, "审校说明")}>
            加入错题
          </button>
        </div>
      )}
      {suggestions.length > 0 && (
        <ul className="learning-list">
          {suggestions.map((item) => (
            <li key={item}>
              <span>{item}</span>
              <button type="button" onClick={() => onSaveExpression(item, "翻译建议")}>
                收藏
              </button>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function PolishResult({ onSaveError, onSaveExpression, onShareToCommunity, result }) {
  const changes = result.changes || [];

  return (
    <article className="result-section">
      <h2>润色版本</h2>
      <p className="provider-note">
        {result.provider}
        {result.model ? ` / ${result.model}` : ""}
      </p>
      <p>{result.polished_text}</p>
      <button className="inline-save" type="button" onClick={() => onSaveExpression(result.polished_text, "润色版本")}>
        收藏表达
      </button>
      <button className="inline-save" type="button" onClick={() => onShareToCommunity(result.polished_text, "润色分享")}>
        分享社群
      </button>
      {changes.length > 0 && (
        <ul className="learning-list">
          {changes.map((item) => (
            <li key={item}>
              <span>{item}</span>
              <button type="button" onClick={() => onSaveError(item, "润色修改")}>
                加入错题
              </button>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export default WorkspaceView;
