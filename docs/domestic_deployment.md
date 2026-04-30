# 国内可靠访问部署方案

本方案用于解决 `.vercel.app` 在国内网络下访问不稳定的问题。目标是保留 Vercel 作为国际演示地址，同时准备一套面向国内用户和评审老师的稳定访问路线。

## 1. 推荐结论

大创展示阶段推荐采用“双线部署”：

```text
国际/备用：Vercel 前端 + Vercel 后端
国内/主推：国内静态托管前端 + 国内云服务器后端
```

国内访问不要继续依赖 `.vercel.app`。当前落地方案选用腾讯云轻量应用服务器，前端和后端先部署在同一台机器上，通过 Nginx 暴露统一入口：

```text
http://服务器公网IP/        -> 前端页面
http://服务器公网IP/api/... -> FastAPI 后端
```

这样用户只需要访问一个地址，也不需要单独开放后端端口。

如果使用中国大陆服务器和正式自定义域名，通常需要完成 ICP 备案。没有备案前，可以先用云服务器公网 IP 做内部测试，但正式展示和长期访问建议使用已备案域名。

## 2. 为什么不只换前端

当前项目分为：

```text
前端：https://zjsutranslationassistantfront.vercel.app/
后端：https://zjsutranslationassistant.vercel.app/
```

如果只把前端迁到国内，但后端仍然请求 Vercel，用户点击翻译时仍可能失败。因此国内可靠访问至少要保证：

1. 页面静态资源能稳定加载。
2. `/api/status`、`/api/translate`、`/api/polish` 能稳定访问。
3. 后端 `ALLOWED_ORIGINS` 放行国内前端域名。
4. 前端构建时的 `VITE_API_BASE_URL` 指向国内后端地址。

## 3. 部署形态

### 3.1 最稳妥方案：前后端分开

```text
国内前端：https://你的前端域名
国内后端：https://api.你的域名
```

前端构建环境变量：

```env
VITE_API_BASE_URL=https://api.你的域名
```

后端环境变量：

```env
APP_ENV=production
AI_PROVIDER=mock
ALLOWED_ORIGINS=["https://你的前端域名"]
OPENAI_MODEL=gpt-5-mini
```

此方案适合后续接入 CDN、HTTPS、备案域名和正式评审展示。

### 3.2 当前实施方案：腾讯云轻量服务器 + Docker

仓库已提供：

```text
backend/Dockerfile
frontend/Dockerfile
deploy/nginx/frontend.conf
deploy/nginx/tencent-gateway.conf
deploy/tencent.env.example
docker-compose.tencent.yml
```

部署结构：

```text
gateway  : Nginx，对外开放 80 端口
frontend : Nginx 静态前端，仅容器内访问
backend  : FastAPI，仅容器内访问
```

前端构建时使用同源 API：

```env
VITE_API_BASE_URL=
```

因此浏览器会请求：

```text
/api/status
/api/translate
/api/polish
```

网关再把 `/api/` 转发给后端容器。

## 4. 腾讯云轻量服务器操作手册

### 4.1 购买建议

建议选择：

```text
地域：离主要试用同学近即可，例如上海、广州、北京
系统：Ubuntu LTS
配置：2 核 2G 起步即可
带宽：轻量测试阶段 3Mbps 起步即可
防火墙：开放 22、80；443 等有 HTTPS 需求再开放
```

没有备案域名前，先用公网 IP 做内部测试。正式对外展示时建议使用已备案域名并配置 HTTPS。

### 4.2 服务器初始化

登录服务器后执行：

```bash
sudo apt update
sudo apt install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo tee /etc/apt/keyrings/docker.asc >/dev/null
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
```

检查 Docker：

```bash
docker --version
docker compose version
```

### 4.3 拉取项目代码

```bash
git clone https://github.com/Han-Xinlong/ZJSUer_Translation_assistant.git
cd ZJSUer_Translation_assistant
```

后续更新代码：

```bash
git pull
```

### 4.4 配置国内部署环境变量

复制模板：

```bash
cp deploy/tencent.env.example deploy/tencent.env
```

编辑：

```bash
nano deploy/tencent.env
```

把 `SERVER_PUBLIC_HOST` 替换成服务器公网 IP，例如：

```env
PUBLIC_ORIGIN=http://1.2.3.4
ALLOWED_ORIGINS=["http://1.2.3.4"]
```

第一阶段建议保持：

```env
AI_PROVIDER=mock
```

这样无需真实模型 Key，评审和同学也能完整体验产品流程。

### 4.5 启动服务

```bash
docker compose -f docker-compose.tencent.yml up --build -d
```

查看运行状态：

```bash
docker compose -f docker-compose.tencent.yml ps
```

查看日志：

```bash
docker compose -f docker-compose.tencent.yml logs -f --tail=100
```

访问：

```text
http://服务器公网IP/
http://服务器公网IP/api/status
```

### 4.6 常见部署问题

#### 4.6.1 Docker Hub 拉取超时

如果启动时看到类似错误：

```text
failed to resolve reference "docker.io/library/nginx:1.27-alpine"
dial tcp ...:443: i/o timeout
```

说明服务器访问 Docker Hub 超时。腾讯云服务器可先配置 Docker 镜像加速：

```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json >/dev/null <<'EOF'
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com"
  ]
}
EOF

sudo systemctl daemon-reload
sudo systemctl restart docker
docker info | grep -A 5 "Registry Mirrors"
```

然后重新拉取和构建：

```bash
docker compose -f docker-compose.tencent.yml pull
docker compose -f docker-compose.tencent.yml up --build -d
```

如果镜像加速仍不可用，可以临时多执行一次 `docker pull nginx:1.27-alpine`、`docker pull python:3.11-slim`、`docker pull node:20-alpine` 观察具体哪个基础镜像超时。

#### 4.6.2 pip 安装依赖过慢或失败

如果后端镜像构建卡在：

```text
RUN pip install --no-cache-dir -r requirements.txt
```

优先确认 `backend/Dockerfile` 中包含腾讯云 PyPI 镜像：

```bash
grep PIP_INDEX_URL backend/Dockerfile
```

应看到：

```text
ARG PIP_INDEX_URL=https://mirrors.cloud.tencent.com/pypi/simple
ENV PIP_INDEX_URL=$PIP_INDEX_URL
```

如果服务器暂时无法 `git pull`，可以临时在服务器上补入：

```bash
sed -i '/ENV PYTHONUNBUFFERED=1/a ARG PIP_INDEX_URL=https://mirrors.cloud.tencent.com/pypi/simple\nENV PIP_INDEX_URL=$PIP_INDEX_URL' backend/Dockerfile
```

然后重新构建后端：

```bash
docker compose -f docker-compose.tencent.yml build --no-cache --progress=plain backend
```

#### 4.6.3 页面能打开但点击翻译报错

先确认后端接口是否正常：

```bash
curl -i http://服务器公网IP/api/health
curl -i http://服务器公网IP/api/status
curl -i http://服务器公网IP/api/translate \
  -H 'Content-Type: application/json' \
  --data '{"text":"你好，世界","target_language":"English","mode":"quick"}'
```

如果 `POST /api/translate` 返回 `200`，但页面按钮仍报错，可能是前端运行在普通 `http://公网IP` 下，浏览器不支持安全上下文限定的 API。项目已用兼容 ID 生成函数替代直接调用 `crypto.randomUUID()`，修复后需要重新构建前端容器：

```bash
docker compose -f docker-compose.tencent.yml up --build -d frontend gateway
```

### 4.7 一键冒烟检查

仓库提供了检查脚本：

```bash
bash scripts/check_domestic_deploy.sh http://服务器公网IP
```

通过时应能看到：

```text
{"status":"ok"}
{"status":"ok","provider":"mock",...}
Domestic deployment smoke check passed.
```

### 4.8 更新部署

以后改完代码并推送后，服务器执行：

```bash
git pull
docker compose -f docker-compose.tencent.yml up --build -d
```

### 4.9 停止服务

```bash
docker compose -f docker-compose.tencent.yml down
```

### 4.10 如果已有域名

备案和解析完成后，把域名 A 记录指向服务器公网 IP，例如：

```text
zjsu-trans.example.com -> 服务器公网IP
```

然后把 `deploy/tencent.env` 改成：

```env
PUBLIC_ORIGIN=http://zjsu-trans.example.com
ALLOWED_ORIGINS=["http://zjsu-trans.example.com"]
```

重新部署：

```bash
docker compose -f docker-compose.tencent.yml up --build -d
```

HTTPS 可以后续再接入，例如使用腾讯云证书、Nginx HTTPS 或反向代理管理器。

## 5. 云服务选择补充

### 方案 A：腾讯云轻量服务器

这是当前实施路线。优点是上手快，前后端都能放在一台机器上，排障简单。建议配置：

```text
系统：Ubuntu LTS
服务：Docker Compose + Nginx 网关容器
开放端口：22、80；后续需要 HTTPS 再开放 443
```

后续有备案域名后，把前端放到 CDN 或 EdgeOne Pages，后端继续留在轻量服务器。

### 方案 B：阿里云 OSS + CDN + ECS

适合更正式的静态站点分发。前端 `npm run build` 后上传 `frontend/dist` 到 OSS，开启静态网站托管和 CDN；后端放 ECS。

### 方案 C：国内 Serverless

理论上可以减少服务器维护，但 FastAPI、环境变量、冷启动、日志和跨域排障会更复杂。当前项目阶段不建议优先选它。

## 6. 上线检查清单

上线后按下面顺序检查：

1. 打开国内前端首页，确认页面能加载。
2. 访问 `http://服务器公网IP/api/health`，确认返回 `{"status":"ok"}`。
3. 访问 `http://服务器公网IP/api/status`，确认 provider 和 model 正常。
4. 打开浏览器开发者工具，确认前端请求的是同源 `/api/...`。
5. 点击“翻译”和“润色”，确认没有 `Failed to fetch`。
6. 检查后端响应头里是否包含正确的 `access-control-allow-origin`。
7. 用手机流量和校园网各测一次。

## 7. 后续切换真实模型

国内部署先保持：

```env
AI_PROVIDER=mock
```

等演示流程稳定后，再把后端切到真实模型：

```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-5-mini
```

如果国内服务器直连 OpenAI 不稳定，可以保留 mock 作为比赛展示兜底，或者后续再接入通义千问、文心千帆等国内模型 Provider。当前仓库已经预留了：

```env
QIANFAN_API_KEY=
DASHSCOPE_API_KEY=
```

## 8. 常见问题

### 页面打不开

先检查腾讯云防火墙和系统防火墙是否开放 80 端口，然后在服务器执行：

```bash
docker compose -f docker-compose.tencent.yml ps
```

### 页面能打开，但翻译失败

检查：

```bash
curl http://127.0.0.1/api/status
docker compose -f docker-compose.tencent.yml logs -f --tail=100 backend
```

如果浏览器控制台显示 CORS 问题，确认 `deploy/tencent.env` 中的 `ALLOWED_ORIGINS` 和用户访问地址完全一致，包括协议和端口。

### 修改环境变量后没生效

重新启动容器：

```bash
docker compose -f docker-compose.tencent.yml up --build -d
```

### 想继续用 8080/8000 分端口测试

可以使用仓库中的 `docker-compose.prod.yml`，但面向用户展示推荐使用 `docker-compose.tencent.yml` 的单入口方案。

## 9. 对外展示话术

可以在答辩中这样解释：

```text
项目采用前后端分离架构。国际演示环境部署在 Vercel，用于快速迭代；考虑到国内网络对海外 Serverless 平台和 vercel.app 域名访问不稳定，我们额外准备了国内镜像部署方案。前端可部署到国内静态托管/CDN，后端 FastAPI 通过 Docker 部署到国内云服务器，从而保证评审和同学在校园网、移动网络下都能稳定访问。
```
