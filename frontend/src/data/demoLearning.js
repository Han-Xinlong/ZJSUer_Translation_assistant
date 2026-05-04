function daysAgo(offset, hour = 20, minute = 10) {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  date.setDate(date.getDate() - offset);
  return date.toISOString();
}

export const demoHistory = [
  {
    id: "demo-history-1",
    type: "深度翻译",
    text: "I have gradually found my rhythm in campus life and learned to balance coursework with club activities.",
    sourceText: "我逐渐适应了校园生活的节奏，也学会了在课程学习和社团活动之间保持平衡。",
    targetLanguage: "English",
    mode: "deep",
    createdAt: daysAgo(0, 19, 25),
    result: {
      mode: "deep",
      provider: "mock",
      model: "demo",
      translation: "I have gradually found my rhythm in campus life and learned to balance coursework with club activities.",
      review: "译文保留了“逐渐适应”和“保持平衡”的语义，并用 found my rhythm 提升自然度。",
      suggestions: [
        "found my rhythm in campus life",
        "balance coursework with club activities",
        "gradually adapted to the pace of university life"
      ]
    }
  },
  {
    id: "demo-history-2",
    type: "润色",
    text: "This course encouraged me to think more critically about the relationship between language and culture.",
    sourceText: "This course let me think more about language and culture.",
    targetLanguage: "English",
    createdAt: daysAgo(1, 21, 5),
    result: {
      provider: "mock",
      model: "demo",
      polished_text: "This course encouraged me to think more critically about the relationship between language and culture.",
      changes: [
        "将 let me think more 改为 encouraged me to think more critically，语气更正式。",
        "补充 the relationship between language and culture，使表达更完整。"
      ]
    }
  },
  {
    id: "demo-history-3",
    type: "快速翻译",
    text: "授業後、図書館で発表資料を整理しました。",
    sourceText: "下课后，我在图书馆整理了展示资料。",
    targetLanguage: "Japanese",
    mode: "quick",
    createdAt: daysAgo(2, 18, 40),
    result: {
      mode: "quick",
      provider: "mock",
      model: "demo",
      translation: "授業後、図書館で発表資料を整理しました。",
      review: "",
      suggestions: ["発表資料を整理する", "授業後", "図書館で"]
    }
  },
  {
    id: "demo-history-4",
    type: "深度翻译",
    text: "Learning a foreign language is not only about memorizing words, but also about understanding how people express ideas in context.",
    sourceText: "学习外语不只是背单词，更是理解人们如何在语境中表达观点。",
    targetLanguage: "English",
    mode: "deep",
    createdAt: daysAgo(4, 20, 15),
    result: {
      mode: "deep",
      provider: "mock",
      model: "demo",
      translation: "Learning a foreign language is not only about memorizing words, but also about understanding how people express ideas in context.",
      review: "not only about...but also about... 适合表达“不只是……更是……”，语义完整且适合学习场景。",
      suggestions: ["express ideas in context", "not only about memorizing words", "understanding language use"]
    }
  }
];

export const demoExpressions = [
  {
    id: "demo-expression-1",
    text: "find my rhythm in campus life",
    source: "演示表达",
    sourceText: "我逐渐适应了校园生活的节奏，也学会了在课程学习和社团活动之间保持平衡。",
    createdAt: daysAgo(0, 19, 30)
  },
  {
    id: "demo-expression-2",
    text: "balance coursework with club activities",
    source: "演示表达",
    sourceText: "我逐渐适应了校园生活的节奏，也学会了在课程学习和社团活动之间保持平衡。",
    createdAt: daysAgo(1, 21, 8)
  },
  {
    id: "demo-expression-3",
    text: "think critically about the relationship between language and culture",
    source: "演示表达",
    sourceText: "This course let me think more about language and culture.",
    createdAt: daysAgo(2, 18, 45)
  }
];

export const demoErrors = [
  {
    id: "demo-error-1",
    text: "let me think more -> encouraged me to think more critically：正式写作中应避免过于口语化。",
    source: "演示改进记录",
    sourceText: "This course let me think more about language and culture.",
    createdAt: daysAgo(1, 21, 12)
  },
  {
    id: "demo-error-2",
    text: "整理资料可译为 organize materials，也可根据日语场景表达为 発表資料を整理する。",
    source: "演示改进记录",
    sourceText: "下课后，我在图书馆整理了展示资料。",
    createdAt: daysAgo(2, 18, 50)
  }
];

export const demoCommunityPosts = [
  {
    id: "demo-community-1",
    text: "I have gradually found my rhythm in campus life and learned to balance coursework with club activities.",
    sourceText: "我逐渐适应了校园生活的节奏，也学会了在课程学习和社团活动之间保持平衡。",
    translationText: "I have gradually found my rhythm in campus life and learned to balance coursework with club activities.",
    source: "演示社群分享",
    createdAt: daysAgo(0, 20, 5)
  },
  {
    id: "demo-community-2",
    text: "授業後、図書館で発表資料を整理しました。",
    sourceText: "下课后，我在图书馆整理了展示资料。",
    translationText: "授業後、図書館で発表資料を整理しました。",
    source: "演示社群分享",
    createdAt: daysAgo(2, 19, 5)
  }
];

export const demoGoals = {
  dailyTarget: 4
};
