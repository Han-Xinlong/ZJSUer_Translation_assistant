import { describe, expect, it } from "vitest";

import { buildLearningReport } from "./report.js";

describe("buildLearningReport", () => {
  it("exports a markdown learning summary with counts and recent records", () => {
    const report = buildLearningReport({
      communityPosts: [{ id: "community-1", text: "shared", source: "社群", createdAt: "2026-04-30T10:00:00.000Z" }],
      errors: [{ id: "error-1", text: "avoid literal translation", source: "错题", createdAt: "2026-04-30T10:00:00.000Z" }],
      expressions: [{ id: "expression-1", text: "find my rhythm", source: "表达", createdAt: "2026-04-30T10:00:00.000Z" }],
      goals: { dailyTarget: 3 },
      history: [
        {
          id: "history-1",
          type: "深度翻译",
          text: "I found my rhythm in campus life.",
          sourceText: "我适应了校园生活。",
          createdAt: "2026-04-30T10:00:00.000Z"
        }
      ],
      todayProgress: 2
    });

    expect(report).toContain("# ZJSUer Translation Assistant 学习报告");
    expect(report).toContain("- 历史记录：1 条");
    expect(report).toContain("- 表达收藏：1 条");
    expect(report).toContain("- 错题沉淀：1 条");
    expect(report).toContain("- 社群分享：1 条");
    expect(report).toContain("- 今日目标：2 / 3");
    expect(report).toContain("深度翻译");
    expect(report).toContain("I found my rhythm in campus life.");
    expect(report).toContain("find my rhythm");
    expect(report).toContain("avoid literal translation");
  });

  it("marks empty report sections clearly", () => {
    const report = buildLearningReport({
      communityPosts: [],
      errors: [],
      expressions: [],
      goals: { dailyTarget: 2 },
      history: [],
      todayProgress: 0
    });

    expect(report.match(/暂无记录。/g)).toHaveLength(3);
  });
});
