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

## 10. 2026-04-29 晚间补充记录

本轮继续围绕“项目从可运行原型走向可展示、可交付、可给同学体验”的目标推进。

### 10.1 新增架构与使用文档

用户要求以“顶尖架构师”身份，按照 PPT 要求和当天项目完成情况，分别撰写技术文档和使用手册，并放入项目文件中，尽可能围绕前端页面技术细节展开。

已新增：

- `docs/technical_documentation.md`
- `docs/user_manual.md`

其中技术文档覆盖：

- 项目定位与设计目标。
- 前端 React + Vite 架构。
- FastAPI 后端服务架构。
- 翻译、润色、审校等 AI 工作流。
- 前端页面分区、导航结构、写作台、右侧洞察栏、历史详情、表达库、错题库、学习档案、社群互学等模块。
- 本地存储结构和关键 localStorage 数据。
- API 接口、Prompt 模板和 OpenAI Provider 设计。
- Mermaid 架构图和流程图。
- 当前技术债与后续演进建议。

使用手册覆盖：

- 项目启动方式。
- 写作台使用流程。
- 快速翻译与深度翻译。
- 润色、收藏表达、保存错题、查看历史详情。
- 学习档案和社群互学的操作方式。
- 本地数据说明、常见问题和推荐学习路径。

对应提交：

```text
95212de docs: add technical documentation and user manual
```

该提交已推送到远端 `origin/main`。

### 10.2 新增非开发同学体验指南

用户提出：如果朋友想去 GitHub 上看看前端交互，该如何操作。随后要求将说明整理到项目中，方便没有接触过开发的同学试用。

已新增：

- `docs/classmate_quick_start.md`

并在 `README.md` 的“本地开发”部分增加入口：

```text
给非开发同学的快速体验方式
```

该指南面向零开发基础同学，说明：

- 如何从 GitHub 下载项目。
- 如何确认 Node.js 和 Python 环境。
- 如何启动后端服务。
- 如何启动前端页面。
- 如何访问 `http://localhost:5173`。
- 为什么推荐前后端一起启动。
- 后端默认 mock 模式，不需要真实 AI Key。
- 常见问题：`npm install` 慢、浏览器打不开、翻译按钮报错、是否需要 OpenAI Key。
- 推荐体验路线：写作台输入、快速翻译、深度模式、润色、收藏表达、错题库、历史详情、学习档案。

对应提交：

```text
6d4f9d3 docs: add classmate quick start guide
```

该提交已推送到远端 `origin/main`。

### 10.3 当前项目状态

截至本次补充记录：

- 本地 `main` 与远端 `origin/main` 同步。
- 已完成从功能初版到项目展示材料的第一轮沉淀。
- 仓库中已有 README、架构文档、技术文档、使用手册、同学体验指南、会话记忆和大创申报 Word 文档。
- 项目已经具备给同学本地试用、给老师展示、继续进入打磨阶段的基础。

当前最新提交：

```text
6d4f9d3 docs: add classmate quick start guide
```

### 10.4 后续建议

下一阶段更适合从“能跑、能讲、能展示”进入“更像一个真实产品”的打磨阶段：

- 将 README 中的体验入口继续前移，让 GitHub 首页更适合外部同学阅读。
- 增加截图或 GIF，展示写作台、翻译结果、学习档案等关键页面。
- 为前端增加一键 demo 数据重置按钮，方便答辩或朋友试用时恢复干净状态。
- 接入真实 OpenAI Key 后，集中优化 Prompt 效果。
- 拆分 `frontend/src/App.jsx`，把页面、状态、业务动作逐步模块化。
- 增加基础自动化测试，确保历史、表达库、错题库、目标统计不会回归。

## 11. 2026-04-30 打磨阶段记录

用户选中上一阶段总结中“主要功能已有初版，接下来进入打磨阶段”的判断，并要求继续以业内资深前后端全栈工程师身份推进项目。

本轮判断：

- 当前功能空白已基本补齐。
- 第一优先级不再是继续堆功能，而是提升项目演示、同学试用和答辩展示的稳定性。
- 因此优先实现“演示控制台”和“学习报告导出”，让项目更适合外部体验。

### 11.1 新增演示数据

新增文件：

- `frontend/src/data/demoLearning.js`

内容包括：

- 多条深度翻译、快速翻译、润色历史。
- 表达库演示数据。
- 错题库演示数据。
- 社群互学演示数据。
- 每日目标演示配置。

数据围绕校园生活、课程学习、语言与文化等场景设计，便于大创答辩和同学试用时快速看到完整学习闭环。

### 11.2 新增右侧“演示工具”

在前端右侧成长概览区域新增：

- 导出报告。
- 载入演示数据。
- 清空全部数据。

作用：

- “导出报告”会将当前学习数据生成 Markdown 学习报告，包含历史记录、表达收藏、错题沉淀、社群分享、今日目标和复盘建议。
- “载入演示数据”会将演示历史、表达、错题、社群内容和目标配置写入本地状态，并自动进入学习档案页面。
- “清空全部数据”会清理当前浏览器内的本地学习数据，并回到写作台。

涉及文件：

- `frontend/src/App.jsx`
- `frontend/src/styles.css`
- `frontend/src/utils/storage.js`
- `frontend/src/data/demoLearning.js`

### 11.3 存储工具增强

在 `frontend/src/utils/storage.js` 中新增：

- `APP_STORAGE_KEYS`
- `clearAppStorage()`

后续如果继续从 localStorage 升级到 IndexedDB，可以以这里为边界继续抽象数据层。

### 11.4 使用手册同步更新

更新：

- `docs/user_manual.md`

新增“演示工具”说明，详细解释导出报告、载入演示数据、清空全部数据的使用场景和影响范围。

### 11.5 验证与提交

已验证：

```bash
npm --prefix frontend run build
python3 -m compileall backend/app
```

对应提交：

```text
4445743 feat: add demo controls and report export
```

该提交已推送到远端 `origin/main`。

### 11.6 下一步建议

继续打磨时，优先级建议如下：

1. 拆分 `frontend/src/App.jsx`，把右侧面板、写作台、历史详情、集合视图、社群视图拆成组件。
2. 为 `storage.js` 和学习统计逻辑增加单元测试，防止后续改动破坏历史记录、今日目标、连续天数。
3. 增加真实模型调试面板或后端健康状态提示，让用户知道当前是 mock 还是真实 AI。
4. 设计更正式的 GitHub README 首屏，包括产品截图、快速体验、功能清单和答辩材料入口。

## 12. 2026-04-30 组件化重构记录

用户继续要求以资深全栈工程师和 AI 工程师身份推进项目。根据上一轮建议，本轮优先处理前端可维护性问题：拆分 `frontend/src/App.jsx`。

### 12.1 重构目标

本轮目标不是改变用户可见功能，而是降低后续开发风险：

- 让 `App.jsx` 从大而全的页面文件回到“状态编排层”。
- 把侧边栏、写作台、历史详情、右侧复盘、集合列表、社群视图拆成独立组件。
- 把日期格式化和学习报告生成从页面组件中抽离到工具函数。
- 保持现有功能行为不变。

### 12.2 新增前端组件

新增：

- `frontend/src/components/Sidebar.jsx`
- `frontend/src/components/WorkspaceView.jsx`
- `frontend/src/components/CorpusPanel.jsx`
- `frontend/src/components/CollectionView.jsx`
- `frontend/src/components/HistoryDetail.jsx`
- `frontend/src/components/CommunityView.jsx`
- `frontend/src/components/InsightPanel.jsx`

组件职责：

- `Sidebar`：左侧导航和品牌区。
- `WorkspaceView`：写作台、目标语言、翻译/润色/语音/沉浸按钮、AI 输出和推荐语料。
- `CorpusPanel`：推荐语料卡片。
- `CollectionView`：表达库和错题库的通用展示。
- `HistoryDetail`：历史复盘和初稿/译文对比。
- `CommunityView`：社群互学内容。
- `InsightPanel`：右侧今日复盘、最近记录和演示工具。

### 12.3 新增工具模块

新增：

- `frontend/src/utils/date.js`
- `frontend/src/utils/report.js`

职责：

- `date.js`：`formatDate`、`countTodayItems`、`toDateKey`。
- `report.js`：`buildLearningReport`，负责 Markdown 学习报告生成。

### 12.4 文档同步

更新：

- `docs/technical_documentation.md`

同步记录新的前端目录结构、组件职责和工具层职责，并将“拆分 App.jsx”从后续计划调整为已完成的第一轮组件化。

### 12.5 验证与提交

已验证：

```bash
npm --prefix frontend run build
python3 -m compileall backend/app
```

对应提交：

```text
7eb75f0 refactor: split frontend workspace components
```

### 12.6 下一步建议

下一轮可以继续做两件更工程化的事：

1. 增加 Vitest，优先测试 `utils/date.js`、`utils/report.js`、`utils/storage.js`。
2. 增加后端 `/api/status` 或前端健康状态条，让用户清楚当前使用的是 mock provider 还是真实 AI provider。

## 13. 2026-04-30 前端单元测试记录

用户继续要求以资深全栈工程师和 AI 工程师身份推进项目。本轮根据上一轮建议，补上前端工具函数单元测试。

### 13.1 测试依赖

新增前端测试框架：

- `vitest@0.34.6`

选择该版本的原因：

- 当前本机 Node.js 为 `16.5.0`。
- Vitest 1.x 对 Node 版本要求更高，会产生明显引擎警告。
- `0.34.6` 能复用项目已有 `vite@4.5.3`，更适合当前环境。

新增脚本：

```bash
npm --prefix frontend test
```

### 13.2 测试覆盖

新增测试文件：

- `frontend/src/utils/date.test.js`
- `frontend/src/utils/report.test.js`
- `frontend/src/utils/storage.test.js`

覆盖内容：

- `date.js`
  - `toDateKey`
  - `formatDate` 缺省值
  - `countTodayItems`

- `report.js`
  - Markdown 学习报告标题。
  - 历史记录、表达收藏、错题沉淀、社群分享、今日目标统计。
  - 最近练习、最近表达、最近错题。
  - 空状态下的“暂无记录”。

- `storage.js`
  - localStorage 集合读写。
  - localStorage 对象读写。
  - 非法 JSON fallback。
  - 非预期数据结构 fallback。
  - 只清理项目自身 storage keys。
  - `saveUniqueItem` 的 trim、去重和空值保护。

### 13.3 文档同步

更新：

- `frontend/README.md`
- `docs/technical_documentation.md`

技术文档中新增测试命令，并将“缺少自动化测试”调整为“浏览器交互测试不足”。

### 13.4 验证结果

已验证：

```bash
npm --prefix frontend test
npm --prefix frontend run build
python3 -m compileall backend/app
npm --prefix frontend audit --omit=dev
```

结果：

- Vitest：3 个测试文件，11 个测试用例全部通过。
- 前端生产构建通过。
- 后端 Python 语法检查通过。
- 生产依赖审计：0 vulnerabilities。

对应提交：

```text
534ba48 test: add frontend utility coverage
```

### 13.5 下一步建议

继续打磨时，优先级建议：

1. 增加后端 `/api/status`，暴露 provider、model、mock/openai 状态。
2. 前端右侧或顶部展示当前 AI 服务状态，降低同学试用时的困惑。
3. 再往后增加 Playwright，覆盖“载入演示数据 -> 学习档案 -> 导出报告”等关键交互链路。
