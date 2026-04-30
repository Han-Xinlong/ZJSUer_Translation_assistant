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

## 14. 2026-04-30 AI 服务状态可视化记录

用户继续要求以资深全栈工程师、AI 工程师和参赛导师身份推进项目。本轮按上一轮建议，完成 AI 服务状态可视化，解决同学试用和答辩演示时“不知道当前是 mock 还是真实模型”的问题。

### 14.1 后端新增 `/api/status`

新增接口：

```text
GET /api/status
```

返回内容：

- `status`：`ok` 或 `degraded`。
- `provider`：当前 AI Provider，例如 `mock` / `openai`。
- `model`：当前模型名，mock 模式下为 `mock`。
- `configured`：当前 Provider 配置是否完整。
- `message`：给前端展示的安全说明。

安全设计：

- 不返回任何 API Key。
- OpenAI 模式下只返回模型名和是否配置了 Key。
- 如果选择了 OpenAI 但缺少 `OPENAI_API_KEY`，接口返回 `degraded`，前端显示“配置待完善”。

涉及文件：

- `backend/app/api/routes.py`
- `backend/app/schemas/ai.py`

### 14.2 前端新增状态卡

前端启动后调用：

```text
GET /api/status
```

并在右侧“今日复盘”上方展示 AI 服务状态。

展示状态：

- `检查中`
- `后端离线`
- `配置待完善`
- `演示模式`
- `真实模型`

涉及文件：

- `frontend/src/App.jsx`
- `frontend/src/api/client.js`
- `frontend/src/components/InsightPanel.jsx`
- `frontend/src/styles.css`

### 14.3 测试与文档

新增：

- `frontend/src/api/client.test.js`

覆盖：

- `getStatus()` 正常请求 `/api/status`。
- 后端错误时抛出可读错误。

更新：

- `README.md`
- `backend/README.md`
- `docs/technical_documentation.md`

文档中记录了 `/api/status` 的用途、响应示例和前端状态卡语义。

### 14.4 验证结果

已验证：

```bash
npm --prefix frontend test
npm --prefix frontend run build
python3 -m compileall backend/app
backend/.venv/bin/python FastAPI TestClient 检查 /api/status
```

结果：

- 前端：4 个测试文件，13 个测试用例全部通过。
- 前端生产构建通过。
- 后端 Python 语法检查通过。
- `/api/status` 在默认 mock 模式下返回：

```json
{
  "status": "ok",
  "provider": "mock",
  "model": "mock",
  "configured": true,
  "message": "Mock provider is active. No API key is required."
}
```

对应提交：

```text
0b6458c feat: show ai service status
```

### 14.5 下一步建议

继续打磨时，建议进入“演示闭环自动化”：

1. 增加 Playwright，覆盖打开页面、载入演示数据、进入学习档案、导出报告等关键链路。
2. 或者先加后端 pytest，把 `/api/health`、`/api/status`、mock 翻译、mock 润色都纳入自动化测试。

## 15. 2026-04-30 后端 pytest 覆盖记录

用户继续要求以资深全栈工程师、AI 工程师和参赛导师身份推进项目。本轮根据上一轮建议，补上后端 pytest 测试，为答辩演示和后续接真实模型增加第二道保险。

### 15.1 新增测试依赖

新增：

- `backend/requirements-dev.txt`

内容：

```text
-r requirements.txt
pytest==8.3.5
```

设计思路：

- `requirements.txt` 保持运行依赖。
- `requirements-dev.txt` 放测试依赖，避免部署或演示环境无谓安装开发工具。

### 15.2 新增后端测试

新增：

- `backend/tests/test_api.py`

覆盖：

- `GET /api/health`
- `GET /api/status`
- `POST /api/translate` mock 快速翻译
- `POST /api/translate` mock 深度翻译
- `POST /api/polish` mock 润色
- 空文本请求校验，确认返回 422

测试方式：

- 使用 FastAPI `TestClient`。
- 不需要启动 uvicorn。
- 默认环境使用 `mock` provider，不需要真实 API Key。

### 15.3 文档同步

更新：

- `README.md`
- `backend/README.md`
- `docs/technical_documentation.md`

同步加入后端 pytest 命令与当前覆盖范围。

### 15.4 验证结果

已验证：

```bash
npm --prefix frontend test
npm --prefix frontend run build
cd backend && .venv/bin/python -m pytest
python3 -m compileall backend/app
```

结果：

- 前端 Vitest：4 个测试文件，13 个测试用例全部通过。
- 后端 pytest：6 个测试用例全部通过。
- 前端生产构建通过。
- 后端 Python 语法检查通过。

对应提交：

```text
b993222 test: add backend api coverage
```

### 15.5 下一步建议

下一轮可以进入 CI 或端到端测试：

1. 增加 GitHub Actions，自动运行前端 test/build 与后端 pytest。
2. 增加 Playwright，覆盖“打开页面 -> 后端状态可见 -> 载入演示数据 -> 学习档案有数据”的核心演示链路。

## 16. 2026-04-30 GitHub Actions CI 记录

用户继续要求以资深全栈工程师、AI 工程师和参赛导师身份推进项目。本轮根据上一轮建议，为仓库增加 GitHub Actions，让测试和构建在远端自动执行。

### 16.1 新增 CI 工作流

新增：

- `.github/workflows/ci.yml`

触发时机：

- push 到 `main`
- Pull Request

权限：

- `contents: read`

### 16.2 前端 Job

配置：

- Runner：`ubuntu-latest`
- Node：`18`
- npm cache：使用 `frontend/package-lock.json`

步骤：

```bash
npm ci
npm test
npm run build
```

### 16.3 后端 Job

配置：

- Runner：`ubuntu-latest`
- Python：`3.10`
- pip cache：使用 `backend/requirements-dev.txt`

步骤：

```bash
python -m pip install --upgrade pip
pip install -r requirements-dev.txt
pytest
python -m compileall app
```

### 16.4 文档同步

更新：

- `README.md`
- `docs/technical_documentation.md`

文档中说明了 GitHub Actions 的触发时机和前后端检查内容。

### 16.5 本地验证

提交前已在本地验证：

```bash
npm --prefix frontend test
npm --prefix frontend run build
cd backend && .venv/bin/python -m pytest
python3 -m compileall backend/app
```

结果：

- 前端 Vitest：4 个测试文件，13 个测试用例全部通过。
- 后端 pytest：6 个测试用例全部通过。
- 前端生产构建通过。
- 后端 Python 语法检查通过。

对应提交：

```text
9300e02 ci: add github actions checks
```

### 16.6 下一步建议

下一轮建议继续补端到端测试：

1. 增加 Playwright。
2. 覆盖页面打开、AI 状态可见、载入演示数据、学习档案展示、历史详情跳转等关键链路。
3. 将 Playwright 接入 GitHub Actions，形成“单元测试 + API 测试 + 端到端测试”的完整护栏。

## 17. 2026-04-30 托管平台部署准备记录

用户提出：项目已经进入小范围内部测试前，是否应该考虑部署上线；用户愿意购买服务器。参赛导师判断：当前阶段不建议立刻买服务器，先采用托管平台完成最小可用上线，满足内部测试和答辩展示。

决策：

- 前端部署到 Vercel。
- 后端部署到 Render。
- 初期继续使用 `mock` 模式。
- 测试流程稳定后再切换 `AI_PROVIDER=openai`。
- 等内部测试证明有真实访问需求，再考虑购买云服务器。

### 17.1 新增部署配置

新增：

- `render.yaml`
- `frontend/vercel.json`
- `frontend/.env.example`
- `docs/deployment.md`

`render.yaml` 配置：

- 服务类型：Web Service。
- Runtime：Python。
- Root Directory：`backend`。
- Plan：`free`。
- Build Command：`pip install -r requirements.txt`。
- Start Command：`uvicorn app.main:app --host 0.0.0.0 --port $PORT`。
- Health Check：`/api/health`。
- 默认 `AI_PROVIDER=mock`。
- `ALLOWED_ORIGINS` 和 `OPENAI_API_KEY` 使用 `sync: false`，不写入仓库。

`frontend/vercel.json` 配置：

- Framework：Vite。
- Install Command：`npm ci`。
- Build Command：`npm run build`。
- Output Directory：`dist`。

`frontend/.env.example`：

```env
VITE_API_BASE_URL=http://localhost:8000
```

### 17.2 新增线上部署指南

新增：

- `docs/deployment.md`

内容包括：

- 为什么先用 Vercel + Render。
- 后端 Render 部署步骤。
- 前端 Vercel 部署步骤。
- `VITE_API_BASE_URL` 配置方式。
- `ALLOWED_ORIGINS` 配置方式。
- mock 模式检查方法。
- 切换真实 OpenAI 的时机和环境变量。
- 小范围内部测试建议。
- 何时再考虑购买服务器。

### 17.3 文档同步

更新：

- `README.md`
- `docs/technical_documentation.md`

README 新增“线上部署”入口，指向 `docs/deployment.md`。

技术文档新增“托管平台部署”章节，记录：

- Vercel 前端。
- Render 后端。
- 关键环境变量。
- 部署配置文件位置。

### 17.4 验证结果

提交前已验证：

```bash
npm --prefix frontend test
npm --prefix frontend run build
cd backend && .venv/bin/python -m pytest
python3 -m compileall backend/app
```

结果：

- 前端 Vitest：4 个测试文件，13 个测试用例全部通过。
- 后端 pytest：6 个测试用例全部通过。
- 前端生产构建通过。
- 后端 Python 语法检查通过。

对应提交：

```text
cc07acb chore: add managed deployment setup
```

### 17.5 下一步建议

下一轮建议进入真实托管平台操作：

1. 用户登录 Render，按 `docs/deployment.md` 创建 Blueprint。
2. 拿到 Render 后端 URL。
3. 用户登录 Vercel，导入 GitHub 仓库并设置 Root Directory 为 `frontend`。
4. 设置 `VITE_API_BASE_URL` 为 Render 后端 URL。
5. 拿到 Vercel 前端 URL 后，回 Render 设置 `ALLOWED_ORIGINS`。
6. 打开线上前端，完成一轮内部测试演示链路。

## 18. 2026-04-30 部署平台切换记录

用户在尝试 Render Blueprint 时发现没有 Visa 卡，Render 创建服务受阻。参赛导师判断：当前阶段不应因为 Render 卡片要求而购买服务器，改为使用 Vercel 同时部署前端和后端。

新决策：

- 前端：Vercel。
- 后端：Vercel FastAPI。
- Render：保留为后续备选方案。
- 服务器：暂不购买。

### 18.1 新增 Vercel 后端入口

新增：

- `backend/server.py`

内容：

```python
from app.main import app
```

用途：

- 暴露 FastAPI `app` 给 Vercel Python Runtime。
- 让后端可以作为独立 Vercel 项目部署。

### 18.2 更新部署文档

更新：

- `docs/deployment.md`
- `README.md`
- `docs/technical_documentation.md`

部署顺序调整为：

1. 先在 Vercel 创建后端项目，Root Directory 选择 `backend`。
2. 拿到后端地址，例如 `https://your-backend-project.vercel.app`。
3. 再在 Vercel 创建前端项目，Root Directory 选择 `frontend`。
4. 前端设置 `VITE_API_BASE_URL=https://your-backend-project.vercel.app`。
5. 前端部署完成后，回到后端项目设置 `ALLOWED_ORIGINS=["https://your-frontend-project.vercel.app"]`。

### 18.3 保留 Render 备选

`render.yaml` 仍保留在仓库中，后续如果有 Visa 卡或需要传统长驻 Web Service，可以继续用 Render。

### 18.4 验证结果

已验证：

```bash
npm --prefix frontend test
npm --prefix frontend run build
cd backend && .venv/bin/python -m pytest
python3 -m compileall backend/app backend/server.py
```

结果：

- 前端 Vitest：4 个测试文件，13 个测试用例全部通过。
- 后端 pytest：6 个测试用例全部通过。
- 前端生产构建通过。
- `backend/server.py` 可编译。

对应提交：

```text
74317cc chore: switch deployment guide to vercel backend
```

### 18.5 下一步建议

下一步需要用户在 Vercel 上实际创建两个项目：

- 后端项目：Root Directory = `backend`。
- 前端项目：Root Directory = `frontend`。

用户拿到两个线上 URL 后，继续检查：

- `/api/health`
- `/api/status`
- 前端右侧 AI 状态卡
- 翻译 mock 流程
- 载入演示数据
- 导出报告

## 19. 2026-04-30 Vercel 前后端线上打通记录

用户完成 Vercel 前后端部署后，提供了两个线上服务：

- 后端：`https://zjsutranslationassistant.vercel.app/`
- 前端：`https://zjsutranslationassistantfront.vercel.app/`

### 19.1 后端验证结果

用户先在浏览器验证后端接口返回正常。随后本轮继续通过脚本模拟浏览器跨域请求，确认：

```text
GET https://zjsutranslationassistant.vercel.app/api/status
POST https://zjsutranslationassistant.vercel.app/api/translate
```

均可返回 `200`。

后端 CORS 响应中包含：

```text
access-control-allow-origin: https://zjsutranslationassistantfront.vercel.app
```

说明后端部署和跨域配置均已生效。

当前后端环境变量：

```env
AI_PROVIDER=mock
ALLOWED_ORIGINS=["http://localhost:5173","https://zjsutranslationassistantfront.vercel.app"]
```

当前前端环境变量：

```env
VITE_API_BASE_URL=https://zjsutranslationassistant.vercel.app
```

### 19.2 `Failed to fetch` 问题定位

用户反馈：

- 前端页面可以打开。
- 右侧没有看到“演示模式”。
- 点击快速翻译报错 `Failed to fetch`。

定位过程：

- 检查前端线上 HTML 和 JS 构建产物。
- 确认前端确实已经写入后端地址。
- 发现线上构建中的后端地址为 `https://zjsutranslationassistant.vercel.app/`，末尾带 `/`。
- 旧版代码直接拼接 `/api/status`、`/api/translate`，导致请求变成 `//api/status` 和 `//api/translate`。
- Vercel 对双斜杠路径返回 `308 Permanent Redirect`，浏览器跨域 POST 因此表现为 `Failed to fetch`。

### 19.3 修复内容

修改：

- `frontend/src/api/client.js`
- `frontend/src/api/client.test.js`

新增：

- `buildApiUrl(path, apiBase = API_BASE)`

作用：

- 自动去掉 `VITE_API_BASE_URL` 末尾多余 `/`。
- 避免拼出 `//api/...`。
- 增加单元测试覆盖无 base、有单个尾斜杠、有多个尾斜杠三种情况。

对应提交：

```text
c87bec9 fix: normalize frontend api base url
```

该提交已推送到远端 `origin/main`，Vercel 前端随后自动重新部署。线上前端 JS 已切换到新构建。

### 19.4 验证结果

本地验证：

```bash
npm --prefix frontend test
npm --prefix frontend run build
```

结果：

- 前端 Vitest：4 个测试文件，14 个测试用例全部通过。
- 前端生产构建通过。

线上验证：

```text
GET /api/status -> 200
POST /api/translate -> 200
```

mock 翻译返回示例：

```json
{
  "mode": "quick",
  "translation": "[Quick translation placeholder] 你好，我想练习英语写作。",
  "provider": "mock"
}
```

用户随后重新访问线上前端并确认功能成功。

### 19.5 文档维护

本轮同步更新：

- `docs/deployment.md`
- `docs/technical_documentation.md`
- `docs/conversation_memory_2026-04-29.md`

记录线上服务地址、已验证环境变量、CORS 排障结果、`Failed to fetch` 原因和后续接入真实模型的注意事项。

### 19.6 下一步建议

下一步可以真正接入 AI，而不是继续使用 mock：

1. 在后端 Vercel 项目设置 `AI_PROVIDER=openai`。
2. 在后端 Vercel 项目设置 `OPENAI_API_KEY`。
3. 保持 `OPENAI_MODEL=gpt-5-mini` 或根据模型可用性调整。
4. 重新部署后端。
5. 打开前端，确认右侧 AI 服务状态从“演示模式”变成“真实模型”。
6. 用少量样例测试快速翻译、深度翻译和润色，评估输出质量、速度和费用。

## 20. 2026-04-30 腾讯云国内部署记录

本轮继续推进腾讯云轻量应用服务器部署，服务器公网 IP：

```text
62.234.13.61
```

### 20.1 Docker 环境

用户在服务器上确认：

```text
Docker version 29.1.3
Docker Compose version 2.40.3
```

初始 `docker ps` 为空，说明服务器上没有旧容器干扰。

### 20.2 国内镜像与构建问题

首次执行：

```bash
docker compose -f docker-compose.tencent.yml up --build -d
```

遇到 Docker Hub 超时，无法拉取 `nginx:1.27-alpine`：

```text
failed to resolve reference "docker.io/library/nginx:1.27-alpine"
dial tcp ...:443: i/o timeout
```

已指导用户配置腾讯云 Docker 镜像加速：

```json
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com"
  ]
}
```

用户执行 `docker info | grep -A 5 "Registry Mirrors"` 后确认镜像源生效。

随后后端镜像构建卡在 `pip install -r requirements.txt`。本地已修改并推送：

- `backend/Dockerfile`

新增默认腾讯云 PyPI 镜像：

```dockerfile
ARG PIP_INDEX_URL=https://mirrors.cloud.tencent.com/pypi/simple
ENV PIP_INDEX_URL=$PIP_INDEX_URL
```

对应提交：

```text
0682a95 chore: use domestic pip mirror in docker build
```

由于服务器访问 GitHub 偶发失败：

```text
GnuTLS recv error (-110): The TLS connection was non-properly terminated
```

曾指导用户先在服务器用 `sed` 临时补入 `PIP_INDEX_URL`，绕过 `git pull` 网络问题。

### 20.3 腾讯云容器已启动

用户最终启动成功，Compose 状态显示：

```text
backend   Built / Up / healthy
frontend  Built / Up
gateway   Started / 0.0.0.0:80->80/tcp
```

公网接口验证通过：

```bash
curl -i http://62.234.13.61/api/health
curl -i http://62.234.13.61/api/status
```

返回：

```json
{"status":"ok"}
{"status":"ok","provider":"mock","model":"mock","configured":true,"message":"Mock provider is active. No API key is required."}
```

用户确认浏览器可打开：

```text
http://62.234.13.61/
```

### 20.4 翻译按钮报错定位

用户反馈页面可打开，但点击“翻译”按钮报错。

从本地直接请求公网后端：

```bash
curl -i http://62.234.13.61/api/translate \
  -H 'Content-Type: application/json' \
  --data '{"text":"你好，世界","target_language":"English","mode":"quick"}'
```

返回 `200 OK`，mock 翻译正常：

```json
{
  "mode": "quick",
  "translation": "[Quick translation placeholder] 你好，世界",
  "provider": "mock"
}
```

因此判断后端和 Nginx 网关无问题，前端按钮错误很可能发生在响应返回之后。

定位到前端有多处直接使用：

```js
crypto.randomUUID()
```

该 API 在普通 `http://公网IP` 页面中可能不可用，因为它受浏览器安全上下文限制。已修复为统一 ID 工具：

- `frontend/src/utils/storage.js` 新增 `createRecordId(prefix)`。
- 支持 `crypto.randomUUID()` 时继续使用原生 UUID。
- 不支持时使用时间戳 + 随机数生成兼容 ID。
- `frontend/src/App.jsx` 和 `saveUniqueItem` 改用 `createRecordId`。
- `frontend/src/utils/storage.test.js` 增加 fallback 单元测试。

验证通过：

```bash
npm --prefix frontend test -- --run
npm --prefix frontend run build
python3 -m compileall backend/app
```

结果：

- 前端 Vitest：4 个测试文件，15 个测试用例全部通过。
- 前端生产构建通过。
- 后端 Python 编译通过。

### 20.5 下一步

需要把本轮前端兼容性修复推送到远端，然后让服务器更新并重建前端：

```bash
git pull --ff-only
# 如果 GitHub 暂时不可访问，可稍后重试，或采用本地打包/手动同步方式。
docker compose -f docker-compose.tencent.yml up --build -d frontend gateway
```

修复部署后，再在浏览器访问 `http://62.234.13.61/`，点击“翻译”确认结果是否能显示并写入历史记录。

## 21. 2026-04-30 腾讯云前端缓存修正

用户在服务器本地临时 patch 前端后，访问：

```text
http://62.234.13.61/?v=local-fix-1
```

确认“翻译”按钮恢复正常。

用户随后希望长期使用干净地址：

```text
http://62.234.13.61/
```

判断：`?v=local-fix-1` 只是绕过浏览器缓存的临时参数，不应作为正式访问地址。正式方案是在前端 Nginx 配置中让 `index.html` 不缓存，同时继续让带 hash 的 JS/CSS 静态资源长期缓存。

已修改：

- `deploy/nginx/frontend.conf`

新增：

```nginx
location = /index.html {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    try_files /index.html =404;
}

location / {
    try_files $uri $uri/ /index.html;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

目的：以后访问根路径 `/` 时，浏览器会重新获取最新入口 HTML，从而加载最新 hash 文件名的前端 JS；无需再使用 `?v=...` 参数。

## 22. 2026-04-30 腾讯云部署最终验证成功

用户反馈：在浏览器中直接访问正式地址：

```text
http://62.234.13.61/
```

已经可以正常打开前端页面，并且点击“翻译”按钮可以正常返回结果。

这意味着腾讯云国内部署第一阶段已跑通：

- gateway：Nginx 对外暴露 `80` 端口。
- frontend：Nginx 静态前端容器正常服务。
- backend：FastAPI 容器健康检查为 healthy。
- `/api/health` 和 `/api/status` 可通过公网访问。
- 前端同源请求 `/api/translate` 正常。
- 普通 `http://公网IP` 场景下的 `crypto.randomUUID()` 兼容问题已通过 `createRecordId()` 解决。
- `?v=local-fix-1` 仅作为临时缓存绕过参数使用，现在不再需要。

当前正式国内体验地址：

```text
http://62.234.13.61/
```

当前 AI 模式仍为：

```env
AI_PROVIDER=mock
```

适合用于大创答辩、同学试用和国内访问稳定性展示。后续如接入真实模型，需要在服务器 `deploy/tencent.env` 中配置真实 provider 和 API Key，然后重建后端容器。

本轮同步更新：

- `docs/domestic_deployment.md`：增加“当前腾讯云验证结果”。
- `docs/conversation_memory_2026-04-29.md`：记录最终验证成功状态。

## 23. 2026-04-30 大创申报书二版更新

用户提出：项目已有一轮迭代和腾讯云部署，原来的《面向外语学习者的“随写随翻”AI工具开发和实践应用-大创申报书》仍停留在初版设想阶段，需要更新，并希望参考浙江省近几年优秀大学生创新创业赛事项目的写法。

本轮已完成申报书二版更新：

- 更新 Word 文件：`面向外语学习者的“随写随翻”AI工具开发和实践应用-大创申报书.docx`
- 新增可维护源稿：`docs/innovation_project_application_2026.html`

主要变化：

1. 从“拟开发”调整为“已有MVP、已部署、可演示”。
2. 写入当前国内演示地址：`http://62.234.13.61/`。
3. 写入代码仓库地址：`https://github.com/Han-Xinlong/ZJSUer_Translation_assistant`。
4. 更新项目摘要，突出“智能输入—随写随翻—随写随修—学习沉淀—成长可视—社群互学”的学习闭环。
5. 增加“竞赛与优秀项目启示”，参考浙江省大学生创新创业大赛和浙江高校获奖项目的常见表达方式，突出真实痛点、AI+场景、可运行原型、验证数据和推广路径。
6. 更新技术路线：React + Vite、FastAPI、AIOrchestrator、MockProvider/OpenAIProvider、localStorage、Docker Compose、Nginx、腾讯云双线部署。
7. 增加“已完成基础与阶段成果”，记录功能原型、演示工具、报告导出、测试、组件化重构、Vercel和腾讯云部署。
8. 更新实施进度：前四阶段标记为已完成，后续阶段聚焦真实模型、用户测试、数据层升级、软著和竞赛材料。
9. 增加用户测试与评价方案，包括前测、过程测试、后测和访谈。
10. 更新经费预算为 6000 元，并增加云服务、模型API、用户测试、语料建设、软著和竞赛展示等用途。

参考资料写入申报书：

- 杭州师范大学等公开新闻中关于浙江省国际大学生创新大赛（2024）的参赛规模与获奖项目报道。
- 杭州师范大学浙江省国际大学生创新大赛（2024）获奖新闻。
- 温州大学计算机与人工智能学院浙江省国际大学生创新大赛（2024）获奖新闻。
- 浙江外国语学院教育学院 2025 年国家级大学生创新创业训练计划项目新闻。

说明：Word 文件由 `docs/innovation_project_application_2026.html` 通过 `textutil` 转换生成；后续如需继续改申报书，优先修改 HTML 源稿后再导出 docx。
