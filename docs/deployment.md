# 线上部署指南

本指南用于把项目先部署到托管平台，满足小范围内部测试需要。当前优先推荐方案是：

- 前端：Vercel
- 后端：Vercel FastAPI
- AI Provider：初期使用 `mock`，测试流程稳定后再切换真实 OpenAI。

这样可以先获得一个可访问的 Web Demo，不需要立刻购买服务器，也不需要维护 Nginx、HTTPS、进程守护和安全组。

> 如果 Render 要求绑定 Visa 卡，可以直接跳过 Render，使用本文的 Vercel 后端方案。
>
> 如果目标用户主要在中国大陆网络环境，`.vercel.app` 访问可能不稳定。面向评审、同学和长期试用时，建议同时准备 [国内可靠访问部署方案](domestic_deployment.md)。

当前已上线的内部测试地址：

```text
前端：https://zjsutranslationassistantfront.vercel.app/
后端：https://zjsutranslationassistant.vercel.app/
```

## 1. 部署顺序

推荐顺序：

1. 先在 Vercel 部署后端项目，拿到后端 API 地址。
2. 再在 Vercel 部署前端项目，把后端地址填入 `VITE_API_BASE_URL`。
3. 拿到 Vercel 前端地址后，回到后端项目设置 `ALLOWED_ORIGINS`。
4. 打开线上前端，确认右侧 AI 服务状态显示正常。

## 2. 后端部署到 Vercel

后端目录已经提供：

```text
backend/server.py
backend/requirements.txt
```

`backend/server.py` 会导出 FastAPI `app`，供 Vercel Python Runtime 识别。

### 2.1 创建服务

在 Vercel 中选择：

```text
Add New -> Project
```

连接 GitHub 仓库：

```text
Han-Xinlong/ZJSUer_Translation_assistant
```

项目设置：

```text
Root Directory: backend
Framework Preset: Other
Install Command: pip install -r requirements.txt
Build Command: 留空
Output Directory: 留空
```

### 2.2 后端启动配置

Vercel 会从 `backend/server.py` 识别 FastAPI `app`。

线上后端地址类似：

```text
https://your-backend-project.vercel.app
```

### 2.3 后端环境变量

初次内部测试推荐使用 mock：

```env
APP_ENV=production
AI_PROVIDER=mock
ALLOWED_ORIGINS=["http://localhost:5173"]
OPENAI_MODEL=gpt-5-mini
```

等前端 Vercel 地址生成后，把后端项目里的 `ALLOWED_ORIGINS` 改成：

```env
ALLOWED_ORIGINS=["https://your-vercel-domain.vercel.app"]
```

如果需要同时允许本地开发和线上前端：

```env
ALLOWED_ORIGINS=["http://localhost:5173","https://your-vercel-domain.vercel.app"]
```

注意：`ALLOWED_ORIGINS` 必须是 JSON 数组字符串。

### 2.4 检查后端

部署完成后访问：

```text
https://your-backend-project.vercel.app/api/health
```

应返回：

```json
{"status":"ok"}
```

再访问：

```text
https://your-backend-project.vercel.app/api/status
```

mock 模式下应看到：

```json
{
  "status": "ok",
  "provider": "mock",
  "model": "mock",
  "configured": true,
  "message": "Mock provider is active. No API key is required."
}
```

## 3. 前端部署到 Vercel

前端目录已经提供：

```text
frontend/vercel.json
frontend/.env.example
```

### 3.1 创建项目

在 Vercel 中选择：

```text
Add New -> Project
```

导入 GitHub 仓库：

```text
Han-Xinlong/ZJSUer_Translation_assistant
```

项目设置：

```text
Root Directory: frontend
Framework Preset: Vite
Install Command: npm ci
Build Command: npm run build
Output Directory: dist
```

### 3.2 配置前端环境变量

在 Vercel 项目环境变量中添加：

```env
VITE_API_BASE_URL=https://your-backend-project.vercel.app
```

注意：

- 不要在末尾加 `/api`。
- 推荐也不要在末尾加 `/`，即使用 `https://your-backend-project.vercel.app`。
- 前端代码会自动请求 `${VITE_API_BASE_URL}/api/...`。
- 当前代码已经会自动去掉末尾 `/`，但环境变量保持干净可以减少部署排障成本。

### 3.3 检查前端

部署完成后打开 Vercel 地址，重点检查：

- 页面是否正常打开。
- 右侧 AI 服务状态是否显示“演示模式”。
- 点击“载入演示数据”，学习档案是否出现趋势图和数据。
- 写作台点击“翻译”，是否能得到 mock 翻译结果。
- 点击“导出报告”，是否能下载 Markdown 学习报告。

## 4. Render 备选方案

如果后续你有 Visa 卡，或者希望使用传统长驻 Web Service，也可以继续使用 Render。

仓库根目录保留：

```text
render.yaml
```

Render 配置：

```text
Root Directory: backend
Plan: free
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
Health Check Path: /api/health
```

Render 的环境变量配置方式与 Vercel 后端相同。

## 5. 切换真实 OpenAI

内部测试第一阶段建议先保持：

```env
AI_PROVIDER=mock
```

当需要测试真实模型时，在 Vercel 后端项目环境变量中设置：

```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-5-mini
```

然后重新部署后端。

如果配置正确，前端右侧 AI 服务状态会从“演示模式”变为“真实模型”。

注意事项：

- `OPENAI_API_KEY` 只配置在后端项目，不能放到前端项目。
- 环境变量修改后需要重新部署后端。
- 先用少量样例测试快速翻译、深度翻译和润色，确认费用、速度和输出质量都可接受。

## 6. 已验证的线上配置

当前线上内部测试配置：

```text
后端项目：zjsutranslationassistant
后端域名：https://zjsutranslationassistant.vercel.app
前端项目：zjsutranslationassistantfront
前端域名：https://zjsutranslationassistantfront.vercel.app
```

后端环境变量：

```env
AI_PROVIDER=mock
ALLOWED_ORIGINS=["http://localhost:5173","https://zjsutranslationassistantfront.vercel.app"]
```

前端环境变量：

```env
VITE_API_BASE_URL=https://zjsutranslationassistant.vercel.app
```

已验证：

```text
GET  https://zjsutranslationassistant.vercel.app/api/status
POST https://zjsutranslationassistant.vercel.app/api/translate
```

浏览器跨域响应中应包含：

```text
access-control-allow-origin: https://zjsutranslationassistantfront.vercel.app
```

### 6.1 `Failed to fetch` 排障记录

曾出现的问题：

```text
前端页面可打开，但 AI 状态不显示，快速翻译报 Failed to fetch。
```

原因：

```text
前端环境变量曾写成 https://zjsutranslationassistant.vercel.app/
旧版前端代码直接拼接 /api/translate，导致请求地址变成 //api/translate。
Vercel 对双斜杠路径返回 308 重定向，浏览器跨域 POST 因此失败。
```

修复：

- 前端环境变量改为不带末尾斜杠。
- 代码中新增 API base URL 归一化逻辑，自动去除末尾 `/`。

对应提交：

```text
c87bec9 fix: normalize frontend api base url
```

## 7. 小范围内部测试建议

第一轮测试目标不是验证模型质量，而是验证产品流程：

- 是否能顺利打开页面。
- 是否能完成翻译和润色。
- 是否能收藏表达。
- 是否能保存错题。
- 是否能查看历史详情。
- 是否能看到学习档案。
- 是否理解右侧 AI 服务状态。
- 是否能导出学习报告。

建议先找 5-10 位同学试用，每人完成 10 分钟任务，然后收集反馈。

推荐测试任务：

1. 打开线上链接。
2. 点击“载入演示数据”。
3. 查看学习档案。
4. 回到写作台输入一段校园生活文本。
5. 分别点击“翻译”和“润色”。
6. 收藏一条表达。
7. 加入一条错题。
8. 查看历史详情。
9. 导出学习报告。
10. 填写反馈表。

## 8. 何时再考虑买服务器

如果出现以下情况，再考虑购买服务器：

- Render/Vercel 访问速度无法满足测试。
- 需要部署在国内网络环境。
- 需要长期稳定运行。
- 需要数据库、账号系统、文件存储和日志分析。
- 需要更严格的数据隐私与访问控制。

在此之前，Vercel + Render 更适合当前项目阶段。

如果已经确定要面向国内网络稳定开放，优先阅读：

- [国内可靠访问部署方案](domestic_deployment.md)
