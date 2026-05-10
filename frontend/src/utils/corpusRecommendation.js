import { corpusExamples } from "../data/corpus.js";

function normalize(value) {
  return String(value || "").toLowerCase();
}

function includesKeyword(text, keyword) {
  return normalize(text).includes(normalize(keyword));
}

function collectLearningText(items) {
  return items
    .slice(0, 12)
    .map((item) => {
      const keywords = Array.isArray(item.corpusKeywords) ? item.corpusKeywords.join(" ") : "";
      const relatedExpressions = Array.isArray(item.relatedExpressions) ? item.relatedExpressions.join(" ") : "";
      return [
        item.text,
        item.source,
        item.sourceText,
        item.translationText,
        item.baseText,
        item.corpusTitle,
        keywords,
        relatedExpressions
      ].filter(Boolean).join(" ");
    })
    .join(" ");
}

function collectHistoryText(items) {
  return items
    .slice(0, 8)
    .map((item) => [
      item.sourceText,
      item.text,
      item.result?.translation,
      item.result?.polished_text,
      item.result?.review,
      ...(item.result?.suggestions || [])
    ].filter(Boolean).join(" "))
    .join(" ");
}

function scoreCorpusItem(item, buckets) {
  let score = 0;
  const reasons = [];

  const currentMatches = item.keywords.filter((keyword) => includesKeyword(buckets.current, keyword));
  if (currentMatches.length > 0) {
    score += currentMatches.length * 4;
    reasons.push(`当前语境：${currentMatches.slice(0, 2).join(" / ")}`);
  }

  const resultMatches = item.keywords.filter((keyword) => includesKeyword(buckets.result, keyword));
  if (resultMatches.length > 0) {
    score += resultMatches.length * 2;
    reasons.push("AI 结果相关");
  }

  const expressionMatches = item.keywords.filter((keyword) => includesKeyword(buckets.expressions, keyword));
  if (expressionMatches.length > 0) {
    score += expressionMatches.length * 3;
    reasons.push("关联已收藏表达");
  }

  const historyMatches = item.keywords.filter((keyword) => includesKeyword(buckets.history, keyword));
  if (historyMatches.length > 0) {
    score += historyMatches.length;
    reasons.push("贴近近期练习");
  }

  const relatedMatches = (item.relatedExpressions || []).filter((expression) =>
    includesKeyword(buckets.expressions, expression) || includesKeyword(buckets.current, expression)
  );
  if (relatedMatches.length > 0) {
    score += relatedMatches.length * 2;
    reasons.push("同类表达延伸");
  }

  return {
    ...item,
    reason: reasons.slice(0, 2).join("，") || "默认学习主题",
    score
  };
}

export function buildCorpusRecommendations({
  contextText = "",
  expressions = [],
  history = [],
  limit = 3,
  polishText = "",
  sourceText = "",
  translationText = ""
} = {}) {
  const buckets = {
    current: `${sourceText} ${contextText}`,
    result: `${translationText} ${polishText}`,
    expressions: collectLearningText(expressions),
    history: collectHistoryText(history)
  };

  const ranked = corpusExamples
    .map((item, index) => ({
      ...scoreCorpusItem(item, buckets),
      index
    }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return left.index - right.index;
    });

  return ranked.slice(0, limit);
}
