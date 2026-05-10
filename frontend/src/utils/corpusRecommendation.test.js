import { describe, expect, it } from "vitest";

import { buildCorpusRecommendations } from "./corpusRecommendation.js";

describe("corpus recommendation", () => {
  it("prioritizes the current input context", () => {
    const items = buildCorpusRecommendations({
      sourceText: "我想写一封给老师的邮件，语气要礼貌。",
      contextText: "正式邮件"
    });

    expect(items[0].id).toBe("email-communication");
    expect(items[0].reason).toContain("当前语境");
  });

  it("uses saved expressions to push related corpus", () => {
    const items = buildCorpusRecommendations({
      sourceText: "今天继续练习表达。",
      expressions: [
        {
          text: "I would appreciate it if you could review my application.",
          source: "推荐语料",
          corpusKeywords: ["邮件", "申请", "formal"]
        }
      ]
    });

    expect(items[0].id).toBe("email-communication");
    expect(items[0].reason).toContain("关联已收藏表达");
  });

  it("keeps default recommendations when no context is available", () => {
    const items = buildCorpusRecommendations();

    expect(items).toHaveLength(3);
    expect(items[0].reason).toBe("默认学习主题");
  });
});
