# 会话记忆：ZJSUer Translation Assistant

记录日期：2026-04-29

本文件用于下次继续开发时快速读档，记录本次对话中用户目标、项目定位、已完成工作、关键决策、问题修复和后续方向。

## 1. 用户原始目标

用户在 `/Users/xiaoxin/Desktop/AI infra/project` 下提供了项目 PPT，要求先阅读并理解项目想做什么。PPT 主题为：

> 面向外语学习者的“随写随翻”AI 工具开发和实践应用

项目来自浙江工商大学东方语言与哲学学院 2026 年度大学生创新创业训练计划项目立项答辩。

项目核心定位：

- 面向外语学习者。
- 做一款轻量化、可复盘、会督促的 AI 写作与翻译学习伙伴。
- 解决“写不出、翻不地道、改完记不住”的问题。
- 不做复杂 CAT 平台，而是做个人日常学习场景里的随写随翻工具。

## 2. PPT 中提炼出的产品目标

核心理念：

- 轻量陪伴，深度成长。

主要痛点：

- 写不出来：词汇匮乏、句式单一。
- 翻不地道：机械翻译，缺少语境感知。
- 难以巩固：AI 改完就忘，无法内化。
- 现有 CAT 平台太复杂，简单词典/翻译工具又太单一。

规划功能：

- 智能输入：文本输入、语音录入、沉浸式写作。
- 随写随翻：快速模式、深度模式，深度模式包含初译与审校。
- 随写随修：语法纠错、风格优化、修改说明。
- 成长可视：学习热力图、历史记录、错题库、表达库。
- 社群互学：AI 答疑、语料共享、同伴激励。

技术路线：

- 前端：React/Vue 单页 Web 应用，富文本编辑，可视化。
- 后端：Python FastAPI，封装 AI API 和双模式逻辑。
- AI：支持 GPT/文心/通义等通用大模型，深度模式采用初译 + 审校。
- 数据：本地存储优先，云端仅做可选备份。

## 3. 仓库与文档工作

用户已创建个人 GitHub 仓库：

- `https://github.com/Han-Xinlong/ZJSUer_Translation_assistant`

本地路径：

- `/Users/xiaoxin/Desktop/AI infra/project/ZJSUer_Translation_assistant`

已完成：

- 完善 `README.md`，包含项目背景、定位、功能规划、创新点、技术路线、开发计划、预期成果和本地开发说明。
- 多次提交并推送到远端 `origin/main`。

## 4. 当前技术栈与目录

当前已搭建 monorepo 风格目录：

```text
ZJSUer_Translation_assistant/
├── README.md
├── backend/
├── frontend/
├── prompts/
├── docs/
├── datasets/
└── scripts/
```

前端：

- React 18
- Vite 4
- ECharts
- lucide-react
- localStorage 本地持久化

后端：

- FastAPI
- Pydantic
- httpx
- Uvicorn

本机环境注意：

- 系统 Python 是 3.8.2。
- 后端 venv 中 pip 已升级到 25.0.1。
- Node 是 16.5.0，npm 是 7.19.1；虽然偏旧，但当前项目可安装和构建。
- Homebrew 安装 Python 3.10 曾卡在 GitHub raw 请求，因此未完成。
- 后端脚本已支持：若存在 `python3.10` 则优先使用，否则回退到 `python3`。

## 5. 已实现的 MVP 功能

### 5.1 前端工作台

已实现：

- 输入文本。
- 目标语言选择。
- 快速/深度模式切换。
- 翻译按钮。
- 润色按钮。
- loading 状态。
- 错误提示。
- provider/model 展示。
- 语境说明输入框。
- 语音输入按钮。
- 沉浸模式。

### 5.2 后端 API

已实现接口：

- `GET /api/health`
- `POST /api/translate`
- `POST /api/polish`

默认使用 `mock` provider，无 Key 也可演示。

OpenAI 接入方式：

```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-5-mini
```

后端已抽象：

- `MockProvider`
- `OpenAIProvider`
- `AIOrchestrator`
- PromptLoader

深度翻译流程：

1. `deep_translate_initial`
2. `deep_translate_review`

### 5.3 Prompt 模板

已存在：

- `prompts/quick_translate.md`
- `prompts/deep_translate_initial.md`
- `prompts/deep_translate_review.md`
- `prompts/polish.md`

Prompt 要求模型返回 JSON，方便前端稳定解析。

### 5.4 本地学习记录

已实现：

- 历史记录保存到 localStorage。
- 最近记录右侧显示。
- 最近记录可点击进入历史详情。
- 历史详情展示初稿 vs 译文/终稿。
- 历史详情中可继续收藏表达或加入错题。

修复过的关键 bug：

- 历史详情按钮刷新后无法点击：改为加载时自动选中第一条历史记录。
- 翻译完成后今日目标不自动 +1：去掉历史记录保存时的 `slice(0, 6)`，改为完整保存历史，右侧仅展示最近 6 条。

### 5.5 表达库与错题库

已实现：

- 翻译结果可收藏表达。
- 翻译建议可收藏表达。
- 润色版本可收藏表达。
- 审校说明可加入错题。
- 润色修改可加入错题。
- 表达库/错题库 localStorage 持久化。
- 支持移除条目。

### 5.6 学习档案与成长可视

已实现：

- 历史记录数。
- 表达收藏数。
- 错题沉淀数。
- 近 7 天练习趋势柱状图。
- 14 天学习热力格。
- ECharts 动态加载，避免首屏主包过大。

### 5.7 目标与打卡

已实现：

- 每日目标配置，默认 3 条。
- 右侧今日目标进度条。
- 学习档案中可调整每日目标。
- 连续学习天数计算。
- 目标配置 localStorage 持久化。

### 5.8 语料推荐与社群互学

已实现：

- `frontend/src/data/corpus.js` 内置示例语料。
- 根据输入、翻译结果、润色结果匹配推荐语料。
- 推荐语料可收藏表达。
- 社群互学视图。
- 译文/润色结果可分享到社群。
- 社群内容 localStorage 持久化。
- 社群内容可移除。

## 6. 主要提交记录

重要提交：

- `aab887f docs: initialize project readme`
- `1626ef2 feat: scaffold translation assistant app`
- `379e453 feat: persist local learning history`
- `a05f2ba feat: add expression and error banks`
- `590489a feat: add history detail review view`
- `c22f50a fix: enable history detail navigation`
- `6013509 feat: add learning dashboard visualization`
- `3381772 feat: add daily goal tracking`
- `e300b6d fix: count completed practice records`
- `c4657ad feat: add remaining MVP learning features`

截至本记录创建时，本地与远端 `main` 同步。

## 7. 当前可运行方式

后端：

```bash
bash scripts/dev_backend.sh
```

前端：

```bash
bash scripts/dev_frontend.sh
```

访问：

```text
http://127.0.0.1:5173/
```

已多次验证：

```bash
npm --prefix frontend run build
python3 -m compileall backend/app
```

## 8. 当前阶段判断

截至本次会话，PPT 中提到的主要功能均已有初版：

- 智能输入：已有文本、语音、沉浸模式。
- 随写随翻：已有快速/深度模式。
- 随写随修：已有润色接口和修改说明展示。
- 成长可视：已有趋势图、热力格、学习档案。
- 错题库/表达库：已有本地沉淀。
- 游戏化激励：已有每日目标和连续天数。
- 社群互学：已有本地社群分享初版。
- AI 接入：已有 OpenAI Provider 抽象。

下一阶段应进入打磨：

- 接真实 OpenAI Key 后优化 Prompt 效果。
- 把 localStorage 升级为 IndexedDB。
- 增加自动化测试。
- 拆分前端组件，降低 App.jsx 复杂度。
- 完善用户手册与项目申报材料。
- 增加导出学习报告功能。

## 9. 用户偏好与协作方式

用户希望助手以“资深全栈工程师”的身份主动推进项目，责任是保证项目落地。用户多次要求：

- 先推送当前代码，再继续完善功能。
- 不只停在建议，要继续实现。
- 功能先做初版，再进入打磨。

协作倾向：

- 允许安装和升级必要环境，但本机 Homebrew 网络不稳定。
- 用户接受先用 mock 模式保证演示，再接真实模型。
- 用户重视“大创”申报与答辩材料。

