import { formatDate } from "./date.js";

export function buildLearningReport({ communityPosts, errors, expressions, goals, history, todayProgress }) {
  const latestItems = history.slice(0, 5);
  const latestExpressions = expressions.slice(0, 5);
  const latestErrors = errors.slice(0, 5);

  return [
    "# ZJSUer Translation Assistant 学习报告",
    "",
    `导出时间：${new Intl.DateTimeFormat("zh-CN", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date())}`,
    "",
    "## 学习概览",
    "",
    `- 历史记录：${history.length} 条`,
    `- 表达收藏：${expressions.length} 条`,
    `- 错题沉淀：${errors.length} 条`,
    `- 社群分享：${communityPosts.length} 条`,
    `- 今日目标：${Math.min(todayProgress, goals.dailyTarget)} / ${goals.dailyTarget}`,
    "",
    "## 最近练习",
    "",
    ...formatReportList(latestItems, (item) => {
      const source = item.sourceText ? `原文：${item.sourceText}` : "原文：未记录";
      return `- ${formatDate(item.createdAt)}｜${item.type}｜${source}｜结果：${item.text}`;
    }),
    "",
    "## 最近收藏表达",
    "",
    ...formatReportList(latestExpressions, (item) => `- ${formatDate(item.createdAt)}｜${item.source}｜${item.text}`),
    "",
    "## 最近错题",
    "",
    ...formatReportList(latestErrors, (item) => `- ${formatDate(item.createdAt)}｜${item.source}｜${item.text}`),
    "",
    "## 复盘建议",
    "",
    "- 从最近错题中挑选 2 条，尝试重新造句。",
    "- 从表达库中挑选 3 条，写一段新的校园学习主题短文。",
    "- 对比快速翻译和深度翻译结果，标记更自然的表达。"
  ].join("\n");
}

function formatReportList(items, formatter) {
  if (items.length === 0) {
    return ["暂无记录。"];
  }
  return items.map(formatter);
}
