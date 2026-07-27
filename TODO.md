# WordBox MVP 执行计划

## 一、项目目标

WordBox 是一个移动端适配的轻量背单词网站，核心流程为：

> 匿名进入 → 选择词书 → 学习单词 → 完成测验 → 更新进度 → 复习错词 → 查看统计

首版只实现前后端 Web 项目，不开发 App，也不开发登录、注册、权限、社交、排行榜、会员和复杂任务系统。

## 二、MVP 范围

- [ ] 每个浏览器首次访问时生成匿名 `learnerId`，保存到 `localStorage`
- [ ] 首版提供 1 本词书、5 个单元、约 100 个单词
- [ ] 每个单元约 20 个单词，每轮默认学习 10 个
- [ ] 支持“看英文选中文”“看中文选英文”“英文拼写”三种题型
- [ ] 发音优先使用浏览器 `speechSynthesis`
- [ ] 单词 `imageUrl` 允许为空，前端使用 Emoji 或默认插图兜底
- [ ] 学习记录、错词和统计数据保存到 PostgreSQL
- [ ] 不支持跨浏览器、跨设备同步
- [ ] 清除浏览器数据后会生成新的匿名身份

## 三、技术栈

### 前端

- Vite
- React
- TypeScript
- React Router
- Ant Design
- Tailwind CSS
- TanStack Query
- Zustand
- openapi-typescript
- openapi-fetch
- Vitest

### 后端

- Node.js
- TypeScript
- NestJS
- Prisma
- PostgreSQL
- Swagger / OpenAPI
- Vitest

### 部署

- 前端：Vercel
- 后端：Node.js Docker 容器
- 数据库：PostgreSQL Docker 容器
- 反向代理：Nginx

## 四、项目目录

```text
WordBox/
├─ apps/
│  ├─ web/                 # Vite + React + TypeScript
│  └─ api/                 # NestJS + TypeScript
├─ data/
│  └─ words.json           # 初始单词数据
├─ docker-compose.yml      # 本地 PostgreSQL
├─ package.json            # pnpm workspace
├─ pnpm-workspace.yaml
├─ pnpm-lock.yaml
├─ .env.example
├─ README.md
└─ TODO.md
```

## 五、阶段 1：初始化项目

- [x] 初始化根目录 `package.json`
- [x] 配置 pnpm workspace
- [x] 创建 Vite + React + TypeScript 的 `apps/web`
- [x] 创建 NestJS + TypeScript 的 `apps/api`
- [x] 配置根目录统一启动命令
- [x] 配置 TypeScript
- [ ] 配置 ESLint
- [ ] 配置 Prettier
- [x] 配置 Vitest
- [x] 添加 `.gitignore`
- [x] 添加 `.env.example`
- [x] 提交 `pnpm-lock.yaml`
- [x] 编写基础 `README.md`

计划提供以下根目录命令：

```text
pnpm dev
pnpm dev:web
pnpm dev:api
pnpm test
pnpm build
pnpm db:migrate
pnpm db:seed
```

### 阶段验收

- [x] 执行一次 `pnpm install` 可以安装全部依赖
- [ ] 一个命令可以同时启动前后端
- [ ] 前端可以打开默认页面
- [x] 后端健康检查接口可以访问
- [x] 前后端测试命令可以运行

## 六、阶段 2：配置 PostgreSQL 和 Prisma

- [ ] 编写开发环境 `docker-compose.yml`
- [ ] 使用 Docker 启动 PostgreSQL
- [ ] 在 NestJS 项目中安装 Prisma
- [ ] 初始化 Prisma
- [ ] 配置 `DATABASE_URL`
- [ ] 创建 `PrismaModule`
- [ ] 创建 `PrismaService`
- [ ] 设计 Prisma Schema
- [ ] 生成第一次 migration
- [ ] 检查 Prisma 生成的 SQL
- [ ] 将 migration 提交到 Git
- [ ] 编写数据库 seed 脚本
- [ ] 验证 seed 可以重复执行且不会生成重复数据

## 七、数据库设计

首版使用以下数据表：

| 数据表 | 用途 |
| --- | --- |
| `Learner` | 匿名学习者和每日目标 |
| `WordBook` | 词书 |
| `Unit` | 词书单元 |
| `Word` | 单词、释义、例句和媒体信息 |
| `WordProgress` | 用户对每个单词的掌握情况 |
| `StudySession` | 一次学习或复习记录 |
| `AnswerRecord` | 每一道题的回答结果 |

建议字段：

```text
Learner
- id
- publicId
- dailyGoal
- autoPronounce
- createdAt
- updatedAt

WordBook
- id
- slug
- name
- description
- level
- coverColor
- createdAt
- updatedAt

Unit
- id
- wordBookId
- name
- order

Word
- id
- unitId
- spelling
- phonetic
- meaning
- partOfSpeech
- example
- exampleZh
- imageUrl?
- emoji?
- order

WordProgress
- learnerId
- wordId
- status
- correctStreak
- correctCount
- wrongCount
- lastSeenAt?
- nextReviewAt?
- createdAt
- updatedAt

StudySession
- id
- learnerId
- unitId?
- mode
- totalCount
- correctCount
- startedAt
- completedAt?

AnswerRecord
- id
- sessionId
- wordId
- questionType
- submittedAnswer
- isCorrect
- createdAt
```

枚举建议：

```text
WordStatus:
- NEW
- LEARNING
- MASTERED

StudyMode:
- LEARN
- REVIEW

QuestionType:
- EN_TO_ZH
- ZH_TO_EN
- SPELLING
```

数据库约束：

- [ ] `Learner.publicId` 唯一
- [ ] `WordBook.slug` 唯一
- [ ] `WordProgress(learnerId, wordId)` 联合唯一
- [ ] `Unit(wordBookId, order)` 联合唯一
- [ ] `Word(unitId, order)` 联合唯一
- [ ] 为 `Word.spelling` 添加查询索引
- [ ] 为 `WordProgress.nextReviewAt` 添加查询索引
- [ ] 配置必要的级联删除或限制删除规则

## 八、阶段 3：准备初始单词数据

- [ ] 定义 `data/words.json` 数据格式
- [ ] 准备 1 本默认词书
- [ ] 创建 5 个单元
- [ ] 每个单元准备约 20 个单词
- [ ] 为单词填写英文、音标、词性和中文释义
- [ ] 为单词填写简单英文例句和中文翻译
- [ ] 为常用单词填写 Emoji
- [ ] 图片地址允许为空
- [ ] 编写导入脚本
- [ ] 校验单词拼写不能为空
- [ ] 校验同一单元内单词不重复
- [ ] 输出导入成功、跳过和失败数量

## 九、阶段 4：搭建 NestJS 后端基础

后端模块建议：

```text
apps/api/src/
├─ learners/
├─ word-books/
├─ words/
├─ study/
├─ review/
├─ statistics/
├─ prisma/
└─ common/
```

基础设施 TODO：

- [x] 配置全局 API 前缀 `/api/v1`
- [x] 开启全局 DTO 参数校验
- [x] 开启 DTO 类型转换
- [ ] 配置统一异常响应格式
- [x] 配置 CORS
- [ ] 配置环境变量校验
- [x] 增加 `GET /api/v1/health`
- [x] 配置 Swagger UI
- [x] 提供 OpenAPI JSON 地址
- [ ] 确定分页参数和返回格式

统一错误格式建议：

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "请求参数不正确",
  "details": []
}
```

## 十、后端 API 清单

### 匿名学习者

- [ ] `POST /api/v1/learners`
- [ ] `GET /api/v1/learners/:publicId`
- [ ] `PATCH /api/v1/learners/:publicId/settings`
- [ ] `DELETE /api/v1/learners/:publicId/progress`

### 词书和单元

- [ ] `GET /api/v1/word-books`
- [ ] `GET /api/v1/word-books/:id`
- [ ] `GET /api/v1/word-books/:id/units`
- [ ] `GET /api/v1/units/:id`
- [ ] `GET /api/v1/units/:id/words`

### 单词

- [ ] `GET /api/v1/words/search?q=`
- [ ] `GET /api/v1/words/:id`

### 首页

- [ ] `GET /api/v1/dashboard?learnerId=`

### 学习与答题

- [ ] `POST /api/v1/study-sessions`
- [ ] `GET /api/v1/study-sessions/:id`
- [ ] `GET /api/v1/study-sessions/:id/questions`
- [ ] `POST /api/v1/study-sessions/:id/answers`
- [ ] `POST /api/v1/study-sessions/:id/complete`
- [ ] `POST /api/v1/progress/feedback`

### 复习和统计

- [ ] `GET /api/v1/review-queue?learnerId=`
- [ ] `GET /api/v1/statistics?learnerId=`

### API 验收

- [ ] Swagger 中可以看到全部接口
- [ ] 每个请求 DTO 都有校验
- [ ] 每个响应都有明确的 TypeScript DTO
- [ ] 前端不获取题目的标准答案
- [ ] 答案由后端判断
- [ ] 重复提交答案不会重复累计统计

## 十一、学习和复习规则

首版使用简单间隔规则：

| 学习结果 | 处理方式 |
| --- | --- |
| 答错 | `correctStreak = 0`，次日复习 |
| 连续答对 1 次 | 1 天后复习 |
| 连续答对 2 次 | 3 天后复习 |
| 连续答对 3 次 | 7 天后复习，标记 `MASTERED` |
| 后续答对 | 14 天、30 天后复习 |
| 卡片选择“不认识” | 优先放回本轮末尾 |
| 卡片选择“有印象” | 次日进入复习 |
| 卡片选择“认识” | 进入正常测验 |

规则实现 TODO：

- [ ] 把间隔计算写成后端纯函数
- [ ] 后端统一处理进度状态
- [ ] 前端只发送用户反馈和答案
- [ ] 为间隔计算编写 Vitest 单元测试
- [ ] 为状态切换编写测试
- [ ] 为同一答案重复提交编写测试

## 十二、题目生成

- [ ] 支持英文选中文
- [ ] 支持中文选英文
- [ ] 支持英文拼写
- [ ] 从同一本词书中生成干扰选项
- [ ] 排除当前题目的正确答案
- [ ] 排除重复的释义或拼写
- [ ] 后端随机排列选项
- [ ] 单词数量不足时允许减少选项数量
- [ ] 返回稳定的 `questionId`
- [ ] 后端保存每题作答结果

## 十三、阶段 5：搭建 React 前端基础

状态职责：

- TanStack Query：服务端数据、缓存、加载状态和重新请求
- Zustand：当前学习流程、临时答案和界面状态
- URL：当前词书、单元和 Session ID
- React 组件 State：输入框、弹窗等局部状态
- Ant Design：按钮、输入框、弹窗、进度条和基础控件
- Tailwind CSS：布局、颜色、间距和响应式

前端 TODO：

- [x] 安装并配置 React Router
- [x] 安装并配置 Ant Design
- [ ] 安装并配置 Tailwind CSS
- [x] 安装并配置 TanStack Query
- [ ] 安装并配置 Zustand
- [x] 配置全局主题
- [ ] 建立 Query Key 工厂
- [ ] 建立通用 Loading 组件
- [ ] 建立通用 Empty 组件
- [ ] 建立通用 Error 组件
- [ ] 建立全局错误提示
- [ ] 避免使用 `useEffect` 手工请求接口
- [ ] 不使用 Zustand 重复保存 TanStack Query 中的数据

## 十四、OpenAPI 类型生成

- [ ] 后端生成 Swagger JSON
- [ ] 安装 `openapi-typescript`
- [ ] 从 Swagger JSON 生成前端 TypeScript 类型
- [ ] 把生成文件放到 `apps/web/src/api/schema.d.ts`
- [ ] 使用 `openapi-fetch` 创建 API Client
- [ ] 配置开发和生产 API Base URL
- [ ] 添加 `npm run api:generate`
- [ ] 禁止手工修改生成的类型文件
- [ ] 后端 DTO 变化后重新生成类型
- [ ] 构建流程中检查 API 类型是否过期

## 十五、页面和路由

```text
/                         首页
/books                    词书列表
/books/:bookId            词书和单元详情
/learn/:unitId            单词学习
/quiz/:sessionId          测验
/result/:sessionId        学习结果
/review                   错词复习
/words                    单词搜索
/words/:wordId            单词详情
/settings                 设置
```

## 十六、阶段 6：应用外壳和移动端适配

- [ ] 实现桌面端侧边导航
- [ ] 实现移动端底部导航
- [ ] 配置首页、词书、复习、搜索四个主入口
- [ ] 配置页面标题和返回按钮
- [ ] 控制内容区域最大宽度
- [ ] 处理 `safe-area-inset-bottom`
- [ ] 主要按钮点击区域不小于 44px
- [ ] 学习页面主要按钮在移动端固定到底部
- [ ] 适配 375px 手机宽度
- [ ] 页面禁止出现意外的横向滚动
- [ ] 桌面端保持学习区域居中

## 十七、阶段 7：词书页面

路由：

```text
/books
/books/:bookId
```

- [ ] 展示词书封面、难度和单词总数
- [ ] 展示当前完成度
- [ ] 展示词书单元列表
- [ ] 显示未开始、学习中、已完成状态
- [ ] 显示每个单元的掌握单词数量
- [ ] 点击单元进入学习页面
- [ ] 处理词书为空的情况
- [ ] 处理接口加载失败的情况

## 十八、阶段 8：单词学习页面

路由：

```text
/learn/:unitId
```

- [ ] 每轮获取 10 个待学习单词
- [ ] 展示英文单词
- [ ] 展示音标
- [ ] 展示中文释义
- [ ] 展示词性
- [ ] 展示英文例句和中文翻译
- [ ] 展示图片、Emoji 或默认插图
- [ ] 发音按钮调用浏览器语音功能
- [ ] 支持自动发音设置
- [ ] 实现“不认识 / 有印象 / 认识”
- [ ] 展示当前学习进度
- [ ] “不认识”的单词放回本轮末尾
- [ ] 防止连续快速点击造成重复提交
- [ ] 学完后创建测验 Session
- [ ] 创建成功后进入测验页面

## 十九、阶段 9：测验页面

路由：

```text
/quiz/:sessionId
```

- [ ] 实现看英文选中文
- [ ] 实现看中文选英文
- [ ] 实现英文拼写
- [ ] 展示当前题号和进度
- [ ] 提交答案前允许修改选择
- [ ] 提交后锁定本题
- [ ] 即时显示正确或错误
- [ ] 答错时展示正确答案
- [ ] 拼写答案忽略首尾空格
- [ ] 确定是否忽略英文大小写
- [ ] 防止重复提交同一道题
- [ ] 弱网时展示提交中状态
- [ ] 提交失败时允许重试
- [ ] 完成最后一题后结束 Session
- [ ] 跳转学习结果页面

## 二十、阶段 10：学习结果页面

路由：

```text
/result/:sessionId
```

- [ ] 展示答对数量
- [ ] 展示答错数量
- [ ] 展示正确率
- [ ] 展示掌握、模糊和错误单词
- [ ] 展示每个错词的正确答案
- [ ] 提供“复习错词”按钮
- [ ] 提供“继续下一单元”按钮
- [ ] 提供“返回首页”按钮
- [ ] 返回首页后刷新统计数据
- [ ] 刷新结果页时仍能读取本次结果

## 二十一、阶段 11：复习页面

路由：

```text
/review
```

- [ ] 展示今日待复习单词数量
- [ ] 展示复习单词列表
- [ ] 展示错误次数
- [ ] 展示下次复习时间
- [ ] 支持开始专项复习
- [ ] 支持手动标记为已掌握
- [ ] 复习完成后更新下次复习时间
- [ ] 没有复习内容时显示空状态
- [ ] 从结果页面进入时优先复习本轮错词

## 二十二、阶段 12：首页和统计

路由：

```text
/
```

- [ ] 展示今日已学习数量
- [ ] 展示每日学习目标
- [ ] 展示目标进度条
- [ ] 展示连续学习天数
- [ ] 展示已掌握单词数量
- [ ] 展示当前词书完成度
- [ ] 展示今日待复习数量
- [ ] 提供“开始今日学习”主按钮
- [ ] 有待复习内容时优先提示复习
- [ ] 没有学习记录时展示新手引导

连续学习天数规则：

- [ ] 当天至少完成一次 Session 才算学习一天
- [ ] 根据服务端时区统一计算日期
- [ ] 确定生产环境使用的业务时区
- [ ] 为跨天统计编写测试

## 二十三、阶段 13：搜索、详情和设置

### 单词搜索

- [ ] 支持英文前缀或模糊搜索
- [ ] 支持中文释义搜索
- [ ] 输入防抖
- [ ] 输入为空时不发起无意义请求
- [ ] 显示单词当前掌握状态

### 单词详情

- [ ] 展示单词、音标和词性
- [ ] 展示中文释义
- [ ] 展示例句和翻译
- [ ] 展示图片或兜底插图
- [ ] 支持手动发音
- [ ] 展示正确和错误次数
- [ ] 展示下次复习时间

### 设置

- [ ] 修改每日学习目标
- [ ] 开启或关闭自动发音
- [ ] 展示匿名学习者 ID
- [ ] 重置学习进度前弹出二次确认
- [ ] 重置后刷新全部相关缓存

## 二十四、Vitest 测试

### 后端测试

- [ ] 复习间隔计算测试
- [ ] 学习状态切换测试
- [ ] 题型生成测试
- [ ] 干扰选项去重测试
- [ ] 答案判断测试
- [ ] 重复提交测试
- [ ] Session 完成测试
- [ ] 首页统计测试
- [ ] 连续学习天数测试
- [ ] 主要 Controller 接口测试

### 前端测试

- [ ] 匿名身份初始化测试
- [ ] 单词卡片交互测试
- [ ] 选择题交互测试
- [ ] 拼写题交互测试
- [ ] 答案提交中状态测试
- [ ] 加载状态测试
- [ ] 空数据状态测试
- [ ] 接口错误状态测试
- [ ] Zustand 学习流程测试
- [ ] 默认图片和 Emoji 兜底测试

## 二十五、人工验收

- [ ] 新浏览器可以创建匿名身份
- [ ] 刷新页面后学习进度不会丢失
- [ ] 可以完整完成一次单词学习
- [ ] 可以完整完成三种题型
- [ ] 答案由后端正确判断
- [ ] 错词能够进入复习队列
- [ ] 复习完成后间隔正确变化
- [ ] 首页统计随学习结果更新
- [ ] 单词图片为空时页面正常
- [ ] 浏览器不支持语音时页面正常
- [ ] 弱网情况下不会重复提交答案
- [ ] 后端不可用时有明确提示
- [ ] 375px 宽度下无横向滚动
- [ ] 桌面端布局正常
- [ ] `npm run test` 全部通过
- [ ] `npm run build` 前后端全部通过

## 二十六、阶段 14：部署

- [ ] 为 NestJS 编写生产 Dockerfile
- [ ] 编写生产环境 Docker Compose
- [ ] 配置生产环境变量
- [ ] 配置 PostgreSQL 持久化卷
- [ ] 配置数据库备份方式
- [ ] 配置 Nginx 反向代理
- [ ] 配置 HTTPS
- [ ] 部署 NestJS API
- [ ] 生产环境执行 `prisma migrate deploy`
- [ ] 生产环境执行 seed
- [ ] 将 React 前端部署到 Vercel
- [ ] 在 Vercel 配置 API Base URL
- [ ] 配置生产环境 CORS
- [ ] 验证前端到 API 的网络请求
- [ ] 验证 API 到 PostgreSQL 的连接
- [ ] 验证线上完整学习流程
- [ ] 验证移动端线上页面

## 二十七、开发里程碑

### M1：基础工程可运行

- [ ] 前端启动成功
- [ ] 后端启动成功
- [ ] PostgreSQL 启动成功
- [ ] Prisma 连接成功
- [ ] Swagger 可以访问

### M2：词书可以浏览

- [ ] 数据库包含约 100 个单词
- [ ] 前端可以查看词书
- [ ] 前端可以查看单元
- [ ] 前端可以查看单词

### M3：学习闭环完成

- [ ] 可以学习 10 个单词
- [ ] 可以完成三种题型
- [ ] 可以查看学习结果
- [ ] 可以保存单词进度

### M4：复习与统计完成

- [ ] 错词进入复习队列
- [ ] 复习规则正确执行
- [ ] 首页统计正确更新
- [ ] 连续学习天数正确计算

### M5：移动端和部署完成

- [ ] 移动端体验正常
- [ ] 前端部署完成
- [ ] 后端部署完成
- [ ] 数据库部署完成
- [ ] 线上完整流程验收通过

## 二十八、明确不在首版实现的内容

- 登录和注册
- 第三方账号登录
- 多设备同步
- 好友系统
- 排行榜
- 会员和付费
- 管理后台
- 用户上传图片
- AI 自动生成例句
- 复杂游戏化角色系统
- 完整的艾宾浩斯算法
- 原生 Android 或 iOS App
- 推送通知
