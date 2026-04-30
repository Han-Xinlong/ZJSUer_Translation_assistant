import { BookOpen } from "lucide-react";

import { formatDate } from "../utils/date.js";

function HistoryDetail({ item, onSaveError, onSaveExpression, onStartRewrite }) {
  if (!item) {
    return (
      <section className="collection-panel">
        <h2>历史详情</h2>
        <div className="empty-state">
          <BookOpen size={28} aria-hidden="true" />
          <p>从右侧最近记录中选择一条，查看完整写作复盘。</p>
        </div>
      </section>
    );
  }

  const result = item.result || {};
  const isPolish = item.type === "润色";
  const outputText = isPolish ? result.polished_text || item.text : result.translation || item.text;
  const suggestions = isPolish ? result.changes || [] : result.suggestions || [];

  return (
    <section className="history-detail">
      <div className="detail-header">
        <div>
          <h2>{item.type}</h2>
          <p>{formatDate(item.createdAt)}</p>
        </div>
        <button type="button" onClick={onStartRewrite}>回到写作台</button>
      </div>

      <div className="comparison-grid">
        <article>
          <span>初稿</span>
          <p>{item.sourceText || "未记录原文"}</p>
        </article>
        <article>
          <span>{isPolish ? "终稿" : "译文"}</span>
          <p>{outputText}</p>
          <button type="button" onClick={() => onSaveExpression(outputText, isPolish ? "历史润色" : "历史译文")}>
            收藏表达
          </button>
        </article>
      </div>

      {result.review && (
        <article className="detail-note">
          <span>审校说明</span>
          <p>{result.review}</p>
          <button type="button" onClick={() => onSaveError(result.review, "历史审校")}>加入错题</button>
        </article>
      )}

      {suggestions.length > 0 && (
        <article className="detail-note">
          <span>{isPolish ? "修改说明" : "学习建议"}</span>
          <ul className="learning-list">
            {suggestions.map((suggestion) => (
              <li key={suggestion}>
                <span>{suggestion}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (isPolish) {
                      onSaveError(suggestion, "历史修改");
                    } else {
                      onSaveExpression(suggestion, "历史建议");
                    }
                  }}
                >
                  {isPolish ? "加入错题" : "收藏"}
                </button>
              </li>
            ))}
          </ul>
        </article>
      )}
    </section>
  );
}

export default HistoryDetail;
