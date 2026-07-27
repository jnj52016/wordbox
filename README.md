# WordBox

WordBox 是一个移动端适配的轻量背单词网站，当前处于 MVP 初始化阶段。

## 项目结构

```text
WordBox/
├─ apps/
│  ├─ web/                 # Vite + React + TypeScript
│  └─ api/                 # NestJS + TypeScript
├─ data/                   # 初始单词数据（后续添加）
├─ TODO.md
└─ package.json            # npm workspaces 根配置
```

## 开发环境

- Node.js 20+
- npm 10+
- PostgreSQL（数据库阶段再启用）

## 常用命令

```bash
npm install
npm run dev
npm run dev:web
npm run dev:api
npm run test
npm run build
```

前端默认地址：http://localhost:5173

后端默认地址：http://localhost:3000

健康检查：http://localhost:3000/api/v1/health

Swagger UI：http://localhost:3000/api/docs

## 当前状态

阶段 1 已创建前后端基础工程骨架。数据库、词书数据和学习闭环将在后续阶段实现，详见 [TODO.md](./TODO.md)。
