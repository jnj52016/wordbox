# WordBox

WordBox 是一个移动端适配的轻量背单词 Web 应用。当前 MVP 的核心学习闭环已基本完成：匿名进入、选择词书、学习单词、完成测验、更新学习进度、复习错词并查看学习统计。

## 界面预览

![WordBox 界面预览](./docs/screenshots/wordbox-ui-preview.png)

## 已实现功能

- 首次访问自动创建匿名学习者，并保存到浏览器 `localStorage`
- 内置 1 本词书、5 个单元和约 100 个单词
- 每轮默认学习 10 个单词
- 支持“看英文选中文”“看中文选英文”和“英文拼写”三种题型
- 学习卡片展示音标、词性、释义、例句和 Emoji/默认插图
- 支持浏览器语音发音和自动发音设置
- 支持“不认识 / 有印象 / 认识”三档学习反馈
- 支持答题结果、正确率、掌握状态和错词记录
- 支持错词队列、专项复习和手动标记已掌握
- 首页展示每日目标、学习进度、连续学习天数和待复习数量
- 支持每日目标、自动发音、匿名 ID 和学习进度重置
- 支持桌面端侧边导航、移动端底部导航和 375px 手机宽度适配
- 学习数据通过 PostgreSQL 持久化，后端统一判断答案并计算复习间隔

## 技术栈

### 前端

- Vite、React、TypeScript
- React Router、Ant Design、Tailwind CSS
- TanStack Query、Zustand、openapi-fetch
- Vitest、Testing Library

### 后端

- Node.js、NestJS、TypeScript
- Prisma、PostgreSQL
- Swagger / OpenAPI
- Vitest

## 项目结构

```text
WordBox/
├─ apps/
│  ├─ web/                         # Vite + React + TypeScript 前端
│  └─ api/                         # NestJS + Prisma 后端
├─ data/
│  └─ words.json                   # 初始词书数据
├─ docs/
│  └─ screenshots/                 # README 界面预览图
├─ docker-compose.yml              # 本地 PostgreSQL
├─ package.json                    # pnpm workspace 根配置
├─ pnpm-workspace.yaml
├─ pnpm-lock.yaml
├─ .env.example
├─ README.md
└─ TODO.md                         # 后续计划与验收清单
```

## 开发环境

- Node.js 20+
- pnpm 9+
- Docker Desktop（用于运行 PostgreSQL）

## 快速开始

```bash
corepack enable
pnpm install
```

复制环境变量示例并按需修改：

```bash
cp .env.example .env
```

Windows PowerShell 可以使用：

```powershell
Copy-Item .env.example .env
```

初始化数据库：

```bash
docker compose up -d
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

启动前后端：

```bash
pnpm dev
```

也可以分别启动：

```bash
pnpm dev:web
pnpm dev:api
```

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 同时启动前端和后端 |
| `pnpm dev:web` | 仅启动前端 |
| `pnpm dev:api` | 仅启动后端 |
| `pnpm test` | 运行前后端测试 |
| `pnpm build` | 构建前后端 |
| `pnpm lint` | 执行 ESLint 检查 |
| `pnpm format:check` | 检查代码格式 |
| `pnpm db:generate` | 生成 Prisma Client |
| `pnpm db:migrate` | 执行数据库迁移 |
| `pnpm db:seed` | 导入初始词书和单词 |
| `pnpm api:generate` | API 类型生成命令占位 |

## 本地地址

- 前端：http://localhost:5173
- 后端：http://localhost:3000
- 健康检查：http://localhost:3000/api/v1/health
- Swagger UI：http://localhost:3000/api/docs

## 页面和路由

| 路由 | 页面 |
| --- | --- |
| `/` | 首页与学习统计 |
| `/books` | 词书列表 |
| `/books/:bookId` | 词书详情和单元列表 |
| `/units/:unitId/words` | 单元单词列表 |
| `/learn/:unitId` | 单词学习 |
| `/quiz/:sessionId` | 单词测验 |
| `/result/:sessionId` | 学习结果 |
| `/review` | 错词复习 |
| `/settings` | 学习设置 |

## API 能力

后端 API 前缀为 `/api/v1`，目前覆盖以下能力：

- 匿名学习者创建、查询、设置更新和进度重置
- 词书、单元和单词列表查询
- 学习 Session 创建、题目获取、答题提交和完成
- 学习反馈、掌握状态和复习队列
- 首页学习统计
- 健康检查和 Swagger 文档

答案由后端判断，前端不直接获取题目的标准答案；重复提交同一道题不会重复累计统计。

## 当前状态与后续计划

WordBox 已完成 MVP 的主要功能和核心学习闭环，可以作为本地运行的完整背词 Web 应用使用。

后续仍可继续完善：

- 单词搜索和独立的单词详情页
- OpenAPI JSON 和前端类型的自动生成流程
- 更完整的 Controller、页面交互和人工验收测试
- 统一错误响应、环境变量校验和缓存刷新细节
- 生产 Docker Compose、Nginx、HTTPS 和线上部署

以下能力明确不属于首版范围：登录注册、多设备同步、社交和排行榜、会员付费、管理后台、用户上传图片、AI 例句、复杂游戏化系统以及原生 Android/iOS App。

详细执行记录和待办项见 [TODO.md](./TODO.md)。
